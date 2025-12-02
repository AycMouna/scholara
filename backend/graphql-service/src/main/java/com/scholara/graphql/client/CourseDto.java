package com.scholara.graphql.client;

public class CourseDto {
    private Long id;
    private String name;
    private String description;
    private Integer credits;

    // Constructors
    public CourseDto() {}

    public CourseDto(Long id, String name, String description, Integer credits) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.credits = credits;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }
}