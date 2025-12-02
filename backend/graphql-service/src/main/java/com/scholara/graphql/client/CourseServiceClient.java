package com.scholara.graphql.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class CourseServiceClient {
    
    private final WebClient webClient;
    
    public CourseServiceClient(@Value("${course-service.url}") String courseServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(courseServiceUrl)
                .build();
    }
    
    public Flux<CourseDto> getAllCourses() {
        return webClient.get()
                .uri("/api/courses")
                .retrieve()
                .bodyToFlux(CourseDto.class);
    }
    
    public Mono<CourseDto> getCourseById(Long id) {
        return webClient.get()
                .uri("/api/courses/{id}", id)
                .retrieve()
                .bodyToMono(CourseDto.class);
    }
    
    public Mono<CourseDto> createCourse(CourseDto course) {
        return webClient.post()
                .uri("/api/courses")
                .bodyValue(course)
                .retrieve()
                .bodyToMono(CourseDto.class);
    }
    
    public Mono<CourseDto> updateCourse(Long id, CourseDto course) {
        return webClient.put()
                .uri("/api/courses/{id}", id)
                .bodyValue(course)
                .retrieve()
                .bodyToMono(CourseDto.class);
    }
    
    public Mono<Void> deleteCourse(Long id) {
        return webClient.delete()
                .uri("/api/courses/{id}", id)
                .retrieve()
                .bodyToMono(Void.class);
    }
}