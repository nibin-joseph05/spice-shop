package com.spiceshop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnvConfig {

    @Value("${FRONTEND_URL}")
    private String frontendUrl;

    @Value("${BACKEND_URL}")
    private String backendUrl;

    @Bean
    public String getFrontendUrl() {
        return frontendUrl;
    }

    @Bean
    public String getBackendUrl() {
        return backendUrl;
    }
}
