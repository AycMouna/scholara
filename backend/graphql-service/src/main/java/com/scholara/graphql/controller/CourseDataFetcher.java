package com.scholara.graphql.controller;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;
import com.scholara.graphql.client.CourseDto;
import com.scholara.graphql.client.CourseServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@DgsComponent
public class CourseDataFetcher {
    
    @Autowired
    private CourseServiceClient courseServiceClient;
    
    @DgsQuery
    public Flux<CourseDto> courses() {
        return courseServiceClient.getAllCourses();
    }
    
    @DgsQuery
    public Mono<CourseDto> course(@InputArgument Long id) {
        return courseServiceClient.getCourseById(id);
    }
    
    @DgsMutation
    public Mono<CourseDto> createCourse(@InputArgument("input") CourseDto courseInput) {
        return courseServiceClient.createCourse(courseInput);
    }
    
    @DgsMutation
    public Mono<CourseDto> updateCourse(@InputArgument Long id, @InputArgument("input") CourseDto courseInput) {
        return courseServiceClient.updateCourse(id, courseInput);
    }
    
    @DgsMutation
    public Mono<Boolean> deleteCourse(@InputArgument Long id) {
        return courseServiceClient.deleteCourse(id).then(Mono.just(true)).onErrorReturn(false);
    }
}