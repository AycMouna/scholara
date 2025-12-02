package com.scholara.graphql.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class StudentServiceClient {
    
    private final WebClient webClient;
    
    public StudentServiceClient(@Value("${student-service.url}") String studentServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(studentServiceUrl)
                .build();
    }
    
    public Flux<StudentDto> getAllStudents() {
        return webClient.get()
                .uri("/api/students")
                .retrieve()
                .bodyToFlux(StudentDto.class);
    }
    
    public Mono<StudentDto> getStudentById(Long id) {
        return webClient.get()
                .uri("/api/students/{id}", id)
                .retrieve()
                .bodyToMono(StudentDto.class);
    }
    
    public Mono<StudentDto> createStudent(StudentDto student) {
        return webClient.post()
                .uri("/api/students")
                .bodyValue(student)
                .retrieve()
                .bodyToMono(StudentDto.class);
    }
    
    public Mono<StudentDto> updateStudent(Long id, StudentDto student) {
        return webClient.put()
                .uri("/api/students/{id}", id)
                .bodyValue(student)
                .retrieve()
                .bodyToMono(StudentDto.class);
    }
    
    public Mono<Void> deleteStudent(Long id) {
        return webClient.delete()
                .uri("/api/students/{id}", id)
                .retrieve()
                .bodyToMono(Void.class);
    }
}