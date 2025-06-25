# ────────────────────────────────
# Stage 1: Build with Maven+JDK
# ────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy only what's needed for a fast rebuild
COPY pom.xml .
COPY src ./src

# Package the application (skip tests to speed up)
RUN mvn clean package -DskipTests

# ────────────────────────────────
# Stage 2: Run with a lightweight JRE
# ────────────────────────────────
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the fat-jar from the builder stage and name it app.jar
COPY --from=builder /app/target/*.jar app.jar

# Expose Spring Boot’s default port
EXPOSE 8080

# Launch your app
ENTRYPOINT ["java","-jar","app.jar"]
