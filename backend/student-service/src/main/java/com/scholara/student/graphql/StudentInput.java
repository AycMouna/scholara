package com.scholara.student.graphql;

public class StudentInput {
    private String firstName;
    private String lastName;
    private String email;
    private Long universityId;

    // Constructors
    public StudentInput() {}

    public StudentInput(String firstName, String lastName, String email, Long universityId) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.universityId = universityId;
    }

    // Getters and Setters
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getUniversityId() {
        return universityId;
    }

    public void setUniversityId(Long universityId) {
        this.universityId = universityId;
    }
}
