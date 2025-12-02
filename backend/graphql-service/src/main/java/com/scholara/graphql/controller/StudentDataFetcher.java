package com.scholara.graphql.controller;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.scholara.graphql.client.StudentDto;
import com.scholara.graphql.client.StudentServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@DgsComponent
public class StudentDataFetcher {
    
    @Autowired
    private StudentServiceClient studentServiceClient;
    
    @DgsQuery
    public Flux<StudentDto> students() {
        return studentServiceClient.getAllStudents();
    }
    
    @DgsQuery
    public Mono<StudentDto> student(@InputArgument Long id) {
        return studentServiceClient.getStudentById(id);
    }
}