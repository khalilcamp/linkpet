FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline || true

COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# O Cloud Run injeta PORT em runtime; server.port=${PORT:8080} no
# application.properties é quem realmente decide a porta.
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
