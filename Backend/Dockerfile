# --- Stage 1: Build ---
# අපි Maven සඳහා Eclipse Temurin පාවිච්චි කරමු (මේක අලුත් එක)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# --- Stage 2: Run ---
# Run කරන්නත් Eclipse Temurin Alpine Version එක ගමු (මේක හරිම පොඩියි සහ වේගවත්)
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]