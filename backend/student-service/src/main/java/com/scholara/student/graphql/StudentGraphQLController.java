package com.scholara.student.graphql;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.scholara.student.dto.StudentDTO;
import com.scholara.student.service.StudentService;

@Controller
public class StudentGraphQLController {

    @Autowired
    private StudentService studentService;

    @QueryMapping
    public List<StudentDTO> students() {
        return studentService.getAllStudents();
    }

    @QueryMapping
    public StudentDTO student(@Argument Long id) {
        return studentService.getStudentById(id).orElse(null);
    }

    @QueryMapping
    public List<StudentDTO> studentsByUniversity(@Argument Long universityId) {
        return studentService.getStudentsByUniversity(universityId);
    }

    @QueryMapping
    public List<StudentDTO> searchStudents(@Argument String searchTerm) {
        return studentService.searchStudents(searchTerm);
    }

    @QueryMapping
    public List<StudentDTO> studentsByFilters(@Argument Long universityId, @Argument String searchTerm) {
        return studentService.getStudentsByFilters(universityId, searchTerm);
    }

    @MutationMapping
    public StudentDTO createStudent(@Argument StudentInput input) {
        StudentDTO studentDTO = new StudentDTO();
        studentDTO.setFirstName(input.getFirstName());
        studentDTO.setLastName(input.getLastName());
        studentDTO.setEmail(input.getEmail());
        studentDTO.setUniversityId(input.getUniversityId());
        
        return studentService.createStudent(studentDTO);
    }

    @MutationMapping
    public StudentDTO updateStudent(@Argument Long id, @Argument StudentInput input) {
        StudentDTO studentDTO = new StudentDTO();
        studentDTO.setFirstName(input.getFirstName());
        studentDTO.setLastName(input.getLastName());
        studentDTO.setEmail(input.getEmail());
        studentDTO.setUniversityId(input.getUniversityId());
        
        return studentService.updateStudent(id, studentDTO).orElse(null);
    }

    @MutationMapping
    public Boolean deleteStudent(@Argument Long id) {
        return studentService.deleteStudent(id);
    }
}
