package com.scholara.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
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
    @Primary
    public DataSource dataSource() {
        String url = env.getProperty("SPRING_DATASOURCE_URL");
        String username = env.getProperty("SPRING_DATASOURCE_USERNAME");
        String password = env.getProperty("SPRING_DATASOURCE_PASSWORD");

        // Handle Render's postgresql:// format
        if (url != null) {
            // Parse the Render URL to extract components
            DatabaseConnectionInfo connectionInfo = parseRenderUrl(url);
            url = connectionInfo.url;
            
            // Use parsed username/password if not provided separately
            if (username == null && connectionInfo.username != null) {
                username = connectionInfo.username;
            }
            if (password == null && connectionInfo.password != null) {
                password = connectionInfo.password;
            }
        } else {
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

    private DatabaseConnectionInfo parseRenderUrl(String renderUrl) {
        String jdbcUrl = "jdbc:postgresql://localhost:5432/scholara_auth";
        String username = null;
        String password = null;
        
        try {
            if (renderUrl.startsWith("postgresql://")) {
                // Remove the postgresql:// prefix
                String withoutPrefix = renderUrl.substring(13); // length of "postgresql://"
                
                if (withoutPrefix.contains("@")) {
                    // Format: user:pass@host:port/dbname
                    String[] parts = withoutPrefix.split("@", 2);
                    String userPass = parts[0];
                    String hostPortDb = parts[1];
                    
                    // Extract username and password
                    if (userPass.contains(":")) {
                        String[] userPassParts = userPass.split(":", 2);
                        username = userPassParts[0];
                        password = userPassParts[1];
                    }
                    
                    // Construct JDBC URL
                    jdbcUrl = "jdbc:postgresql://" + hostPortDb;
                } else {
                    // Format: host:port/dbname
                    jdbcUrl = "jdbc:postgresql://" + withoutPrefix;
                }
            } else if (renderUrl.startsWith("jdbc:postgresql://")) {
                // Already in correct format
                jdbcUrl = renderUrl;
            }
        } catch (Exception e) {
            // Fallback to default if parsing fails
            jdbcUrl = "jdbc:postgresql://localhost:5432/scholara_auth";
        }
        
        return new DatabaseConnectionInfo(jdbcUrl, username, password);
    }
    
    private static class DatabaseConnectionInfo {
        final String url;
        final String username;
        final String password;
        
        DatabaseConnectionInfo(String url, String username, String password) {
            this.url = url;
            this.username = username;
            this.password = password;
        }
    }
}