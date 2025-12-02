package com.scholara.graphql.controller;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.DgsMutation;
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
    
    @DgsMutation
    public Mono<StudentDto> createStudent(@InputArgument("input") StudentDto studentInput) {
        return studentServiceClient.createStudent(studentInput);
    }
    
    @DgsMutation
    public Mono<StudentDto> updateStudent(@InputArgument Long id, @InputArgument("input") StudentDto studentInput) {
        return studentServiceClient.updateStudent(id, studentInput);
    }
    
    @DgsMutation
    public Mono<Boolean> deleteStudent(@InputArgument Long id) {
        return studentServiceClient.deleteStudent(id).then(Mono.just(true)).onErrorReturn(false);
    }
}