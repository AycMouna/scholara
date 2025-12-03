# Multi-stage build for Student Service
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Production stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/student-service-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE $PORT

# Run the application
ENTRYPOINT ["sh", "-c", "java -Dserver.port=$PORT -jar app.jar"]