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
import java.util.List; // For checking transaction list size
import java.util.Map; // For structured response

@Service
@RequiredArgsConstructor
public class AIService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final DashboardService dashboardService; // For fetching financial summary

    @Value("${openai.api.key}")
    private String openaiApiKey;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Transactional
    public Map<String, Object> generateAiAdviceForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        int currentCount = user.getAiAdviceCount() == null ? 0 : user.getAiAdviceCount();
        if (currentCount >= 3) {
            return Map.of("error", "AI advice generation limit reached.", "generationsLeft", 0);
        }

        if (!hasSufficientData(userId)) {
            return Map.of("error", "Not enough financial data to generate advice. Please add some income and expense transactions.",
                          "generationsLeft", 3 - currentCount);
        }

        // TODO:
        // 4. Construct prompt for OpenAI
        // String prompt = constructPrompt(userId /* or user summary data */);
        String prompt = constructPromptForUser(userId);

        try {
            // Replace this with your actual API key when prompted
            if (openaiApiKey == null || openaiApiKey.equals("YOUR_OPENAI_API_KEY_PLACEHOLDER") || openaiApiKey.isEmpty()) {
                 // Ask user for API key - this part is tricky in automated flow.
                 // For now, let's return a message to set it up.
                 System.err.println("OpenAI API Key is not configured. Please set it in application.properties or environment variables.");
                 return Map.of("error", "AI service not configured by administrator (API key missing).", "generationsLeft", 3 - currentCount);
            }

            String requestBody = String.format("{\"model\": \"gpt-3.5-turbo\", \"messages\": [{\"role\": \"user\", \"content\": \"%s\"}], \"max_tokens\": 200}", escapeJson(prompt));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openaiApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                // Basic parsing for now, assuming response is like: {"choices": [{"message": {"content": "advice"}}]}
                // A proper JSON library would be much better here.
                String responseBody = response.body();
                String adviceFromAI = parseAdviceFromOpenAIResponse(responseBody);

                if (adviceFromAI == null || adviceFromAI.isEmpty()) {
                    adviceFromAI = "AI could not generate advice at this moment. Please try again later.";
                }

                user.setAiAdviceCount(currentCount + 1);
                userRepository.save(user);
                return Map.of("advice", adviceFromAI, "generationsLeft", 3 - user.getAiAdviceCount());
            } else {
                System.err.println("OpenAI API Error - Status: " + response.statusCode() + ", Body: " + response.body());
                return Map.of("error", "Failed to get advice from AI service. Status: " + response.statusCode(), "generationsLeft", 3 - currentCount);
            }

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt(); // Restore interrupt status
            System.err.println("Error calling OpenAI API: " + e.getMessage());
            return Map.of("error", "Error communicating with AI service.", "generationsLeft", 3 - currentCount);
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
        // Extremely basic and fragile JSON parsing. Replace with a library in a real app.
        try {
            // Example: {"choices":[{"message":{"role":"assistant","content":"This is your advice."}}]}
            int contentStart = responseBody.indexOf("\"content\":\"");
            if (contentStart == -1) return null;
            contentStart += 11; // length of "\"content\":\""
            int contentEnd = responseBody.indexOf("\"", contentStart);
            if (contentEnd == -1) return null;

            String advice = responseBody.substring(contentStart, contentEnd);
            // Unescape common sequences that might be in the advice
            return advice.replace("\\n", "\n").replace("\\\"", "\"").replace("\\\\", "\\");
        } catch (Exception e) {
            System.err.println("Error parsing OpenAI response: " + e.getMessage());
            return null;
        }
    }


    private boolean hasSufficientData(Long userId) {
        // Check if user has at least 1 income and 1 expense transaction
        // Note: findByUserIdAndType returns List<Transaction>. We check if the list is not empty.
        List<com.pennywise.pennywisebackend.model.Transaction> incomeTransactions = transactionRepository.findByUserIdAndType(userId, "income");
        List<com.pennywise.pennywisebackend.model.Transaction> expenseTransactions = transactionRepository.findByUserIdAndType(userId, "expense");

        return !incomeTransactions.isEmpty() && !expenseTransactions.isEmpty();
    }

    private String constructPromptForUser(Long userId) {
        // Fetch a summary of the user's financial data for the current month
        // The getDashboardSummary now returns monthly income/expenses and other relevant data.
        DashboardSummaryDTO summary = dashboardService.getDashboardSummary(LocalDate.now()); // Pass current user via security context in dashboardService

        // Construct a detailed prompt
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Provide concise financial advice (1-2 short paragraphs) for a user with the following financial summary for the current month:\n");
        promptBuilder.append(String.format("- Monthly Income: $%.2f\n", summary.getTotalIncome()));
        promptBuilder.append(String.format("- Monthly Expenses: $%.2f\n", summary.getTotalExpenses()));
        promptBuilder.append(String.format("- Savings Rate: %.1f%%\n", summary.getSavingsRate()));
        promptBuilder.append(String.format("- Net Worth (Lifetime): $%.2f\n", summary.getNetWorth()));
        if (summary.getNetWorthChangePercentage() != null) {
             promptBuilder.append(String.format("- Net Worth Month-over-Month Change: %.1f%%\n", summary.getNetWorthChangePercentage()));
        }
        // Consider adding recent spending categories or trends if available and simple to fetch
        promptBuilder.append("\nFocus on actionable steps or observations. Do not ask questions back. Be encouraging.");

        return promptBuilder.toString();
    }
}
