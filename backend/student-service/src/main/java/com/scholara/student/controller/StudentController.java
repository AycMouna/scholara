package com.scholara.student.controller;

import com.scholara.student.dto.StudentDTO;
import com.scholara.student.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        List<StudentDTO> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        Optional<StudentDTO> student = studentService.getStudentById(id);
        return student.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/university/{universityId}")
    public ResponseEntity<List<StudentDTO>> getStudentsByUniversity(@PathVariable Long universityId) {
        List<StudentDTO> students = studentService.getStudentsByUniversity(universityId);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/search")
    public ResponseEntity<List<StudentDTO>> searchStudents(@RequestParam String q) {
        List<StudentDTO> students = studentService.searchStudents(q);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<StudentDTO>> getStudentsByFilters(
            @RequestParam(required = false) Long universityId,
            @RequestParam(required = false) String searchTerm) {
        List<StudentDTO> students = studentService.getStudentsByFilters(universityId, searchTerm);
        return ResponseEntity.ok(students);
    }

    @PostMapping
    public ResponseEntity<StudentDTO> createStudent(@Valid @RequestBody StudentDTO studentDTO) {
        // Check if email already exists
        if (studentService.existsByEmail(studentDTO.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        
        StudentDTO createdStudent = studentService.createStudent(studentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStudent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable Long id, 
                                                   @Valid @RequestBody StudentDTO studentDTO) {
        Optional<StudentDTO> updatedStudent = studentService.updateStudent(id, studentDTO);
        return updatedStudent.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        boolean deleted = studentService.deleteStudent(id);
        return deleted ? ResponseEntity.noContent().build() 
                      : ResponseEntity.notFound().build();
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Student Service is running!");
    }
}
