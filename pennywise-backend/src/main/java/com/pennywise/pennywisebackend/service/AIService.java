package com.pennywise.pennywisebackend.service;

import com.pennywise.pennywisebackend.dto.DashboardSummaryDTO;
import com.pennywise.pennywisebackend.model.User;
import com.pennywise.pennywisebackend.repository.UserRepository;
import com.pennywise.pennywisebackend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.IOException;
import java.time.LocalDate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final DashboardService dashboardService;

    @Value("${openai.api.key}")
    private String openaiApiKey;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public Map<String, Object> generateAiAdviceForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        int currentCount = user.getAiAdviceCount() == null ? 0 : user.getAiAdviceCount();
        if (currentCount >= 3) {
            return Map.of("error", "AI advice generation limit reached.", "generationsLeft", 0);
        }

        if (!hasSufficientData(userId)) {
            return Map.of("error",
                    "Not enough financial data to generate advice. Please add some income and expense transactions.",
                    "generationsLeft", 3 - currentCount);
        }

        String prompt = constructPromptForUser(userId);

        try {

            if (openaiApiKey == null || openaiApiKey.isEmpty()
                    || openaiApiKey.equals("YOUR_OPENAI_API_KEY_PLACEHOLDER")) {
                System.err.println(
                        "AIService: OpenAI API Key is missing or is a placeholder. Cannot generate AI advice.");
                return Map.of("error", "AI service not configured by administrator (API key missing).",
                        "generationsLeft", 3 - currentCount);
            }

            String requestBody = String.format(
                    "{\"model\": \"gpt-3.5-turbo\", \"messages\": [{\"role\": \"user\", \"content\": \"%s\"}], \"max_tokens\": 200}",
                    escapeJson(prompt));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openaiApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                String responseBody = response.body();
                String adviceFromAI = parseAdviceFromOpenAIResponse(responseBody);

                if (adviceFromAI != null && !adviceFromAI.isEmpty()) {
                    user.setAiAdviceCount(currentCount + 1);
                    userRepository.save(user);
                    return Map.of("advice", adviceFromAI, "generationsLeft", 3 - user.getAiAdviceCount());
                } else {
                    System.err.println("AIService: Failed to parse advice from OpenAI response (body was: "
                            + responseBody.substring(0, Math.min(responseBody.length(), 500))
                            + "...). Count not incremented.");
                    return Map.of("error", "AI could not extract advice at this moment. Please try again later.",
                            "generationsLeft", 3 - currentCount);
                }
            } else {
                System.err.println("OpenAI API Error - Status: " + response.statusCode() + ", Body: "
                        + response.body().substring(0, Math.min(response.body().length(), 500)) + "...");
                return Map.of("error", "Failed to get advice from AI service (Status: " + response.statusCode() + ").",
                        "generationsLeft", 3 - currentCount);
            }

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("AIService: Error calling OpenAI API: " + e.getMessage());
            return Map.of("error", "Error communicating with AI service.", "generationsLeft", 3 - currentCount);
        } catch (Exception e) {
            System.err.println("AIService: Unexpected error during AI advice generation: " + e.getMessage());
            e.printStackTrace();
            return Map.of("error", "An unexpected error occurred while generating advice.", "generationsLeft",
                    3 - currentCount);
        }
    }

    private String escapeJson(String raw) {
        return raw.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String parseAdviceFromOpenAIResponse(String responseBody) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode choicesNode = rootNode.path("choices");
            if (choicesNode.isArray() && !choicesNode.isEmpty()) {
                JsonNode firstChoice = choicesNode.get(0);
                JsonNode messageNode = firstChoice.path("message");
                JsonNode contentNode = messageNode.path("content");
                if (!contentNode.isMissingNode()) {
                    return contentNode.asText();
                }
            }
            System.err.println("AIService: 'content' field not found in the expected path in OpenAI response.");
            return null;
        } catch (IOException e) {
            System.err.println("AIService: IOException while parsing OpenAI response: " + e.getMessage());
            return null;
        }
    }

    private boolean hasSufficientData(Long userId) {
        List<com.pennywise.pennywisebackend.model.Transaction> incomeTransactions = transactionRepository
                .findByUserIdAndType(userId, "income");
        List<com.pennywise.pennywisebackend.model.Transaction> expenseTransactions = transactionRepository
                .findByUserIdAndType(userId, "expense");

        return !incomeTransactions.isEmpty() && !expenseTransactions.isEmpty();
    }

    private String constructPromptForUser(Long userId) {
        DashboardSummaryDTO summary = dashboardService.getDashboardSummary(LocalDate.now());

        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append(
                "You are a financial advisor. Analyze the following specific financial data for a user and provide three distinct, actionable financial advice bullet points. ");
        promptBuilder.append(
                "Each piece of advice MUST directly relate to and reference the provided figures where appropriate. Aim for concrete suggestions.\n\n");

        promptBuilder.append("User's Financial Data (Current Month):\n");
        promptBuilder.append(String.format("- Monthly Income: $%.2f\n", summary.getTotalIncome()));
        promptBuilder.append(String.format("- Monthly Expenses: $%.2f\n", summary.getTotalExpenses()));

        java.math.BigDecimal netMonthlyCashFlow = summary.getTotalIncome().subtract(summary.getTotalExpenses());
        promptBuilder.append(String.format("- Net Monthly Cash Flow: $%.2f\n", netMonthlyCashFlow));

        promptBuilder.append(String.format("- Savings Rate: %.1f%%\n", summary.getSavingsRate()));
        promptBuilder.append(String.format("- Lifetime Net Worth: $%.2f\n", summary.getNetWorth()));
        if (summary.getNetWorthChangePercentage() != null) {
            promptBuilder.append(String.format("- Net Worth Month-over-Month Change: %.1f%%\n",
                    summary.getNetWorthChangePercentage()));
        }

        promptBuilder.append(
                "\nBased *specifically* on these numbers, provide your three bullet points of advice below. For example, if income is $5000 and expenses are $4500 (leaving $500 net cash flow), and savings rate is 10%, you might suggest ways to increase that $500 or reduce specific (if known) expenses. If Net Worth MoM change is negative, address potential reasons or concerns.\n");
        promptBuilder.append("Requested Advice (exactly three bullet points directly referencing the data above):\n");
        promptBuilder.append("- [Advice point 1 related to the user's specific data]\n");
        promptBuilder.append("- [Advice point 2 related to the user's specific data]\n");
        promptBuilder.append("- [Advice point 3 related to the user's specific data]\n");
        promptBuilder.append("\nBe encouraging. Do not ask questions. Focus on data-driven advice.");

        return promptBuilder.toString();
    }
}
