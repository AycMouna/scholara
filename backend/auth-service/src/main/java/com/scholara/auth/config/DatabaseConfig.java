package com.scholara.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import org.springframework.boot.jdbc.DataSourceBuilder;

@Configuration
public class DatabaseConfig {

    private final Environment env;

    public DatabaseConfig(Environment env) {
        this.env = env;
    }

    @Bean
    public DataSource dataSource() {
        String url = env.getProperty("SPRING_DATASOURCE_URL");
        String username = env.getProperty("SPRING_DATASOURCE_USERNAME");
        String password = env.getProperty("SPRING_DATASOURCE_PASSWORD");

        // Handle Render's postgresql:// format
        if (url != null && url.startsWith("postgresql://")) {
            url = url.replace("postgresql://", "jdbc:postgresql://");
        } else if (url == null) {
            url = "jdbc:postgresql://localhost:5432/scholara_auth";
        }

        if (username == null) {
            username = "postgres";
        }

        if (password == null) {
            password = "postgres";
        }

        return DataSourceBuilder.create()
                .url(url)
                .username(username)
                .password(password)
                .driverClassName("org.postgresql.Driver")
                .build();
    }
}