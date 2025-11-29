package com.scholara.student.service;

import com.scholara.student.dto.StudentDTO;
import com.scholara.student.model.Student;
import com.scholara.student.model.StudentCourse;
import com.scholara.student.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<StudentDTO> getStudentById(Long id) {
        return studentRepository.findById(id)
                .map(this::convertToDTO);
    }

    public List<StudentDTO> getStudentsByUniversity(Long universityId) {
        return studentRepository.findByUniversityId(universityId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> searchStudents(String searchTerm) {
        return studentRepository.findBySearchTerm(searchTerm).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> getStudentsByFilters(Long universityId, String searchTerm) {
        return studentRepository.findByFilters(universityId, searchTerm).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StudentDTO createStudent(StudentDTO studentDTO) {
        Student student = new Student(
                studentDTO.getFirstName(),
                studentDTO.getLastName(),
                studentDTO.getEmail(),
                studentDTO.getUniversityId()
        );
        
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }

    public Optional<StudentDTO> updateStudent(Long id, StudentDTO studentDTO) {
        return studentRepository.findById(id)
                .map(existingStudent -> {
                    existingStudent.setFirstName(studentDTO.getFirstName());
                    existingStudent.setLastName(studentDTO.getLastName());
                    existingStudent.setEmail(studentDTO.getEmail());
                    existingStudent.setUniversityId(studentDTO.getUniversityId());
                    existingStudent.preUpdate();
                    
                    Student updatedStudent = studentRepository.save(existingStudent);
                    return convertToDTO(updatedStudent);
                });
    }

    public boolean deleteStudent(Long id) {
        if (studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean existsByEmail(String email) {
        return studentRepository.findByEmail(email).isPresent();
    }

    private StudentDTO convertToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setEmail(student.getEmail());
        dto.setUniversityId(student.getUniversityId());
        dto.setCreatedAt(student.getCreatedAt());
        dto.setUpdatedAt(student.getUpdatedAt());
        
        if (student.getStudentCourses() != null) {
            List<Long> courseIds = student.getStudentCourses().stream()
                    .map(StudentCourse::getCourseId)
                    .collect(Collectors.toList());
            dto.setCourseIds(courseIds);
        }
        
        return dto;
    }
}
