package com.scholara.graphql.controller;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.scholara.graphql.client.CourseDto;
import com.scholara.graphql.client.CourseServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Flux;

@DgsComponent
public class EnrollmentDataFetcher {
    
    @Autowired
    private CourseServiceClient courseServiceClient;
    
    @DgsQuery
    public Flux<CourseDto> studentCourses(@InputArgument Long studentId) {
        return courseServiceClient.getCoursesByStudentId(studentId);
    }
}