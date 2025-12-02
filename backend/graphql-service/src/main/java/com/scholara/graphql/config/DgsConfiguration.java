package com.scholara.graphql.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import com.netflix.graphql.dgs.autoconfig.DgsAutoConfiguration;

@Configuration
@Import(DgsAutoConfiguration.class)
public class DgsConfiguration {
}