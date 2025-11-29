import { gql } from '@apollo/client';

// ===== STUDENT QUERIES =====
export const GET_ALL_STUDENTS = gql`
  query GetAllStudents($search: String, $universityId: ID, $courseId: ID) {
    students(search: $search, universityId: $universityId, courseId: $courseId) {
      id
      firstName
      lastName
      email
      university {
        id
        name
        location
      }
      courses {
        id
        name
        instructor
        category
      }
    }
  }
`;

export const GET_STUDENT_BY_ID = gql`
  query GetStudentById($id: ID!) {
    student(id: $id) {
      id
      firstName
      lastName
      email
      university {
        id
        name
        location
      }
      courses {
        id
        name
        instructor
        category
        schedule
      }
    }
  }
`;

export const GET_UNIVERSITIES = gql`
  query GetUniversities {
    universities {
      id
      name
      location
    }
  }
`;

// ===== COURSE QUERIES =====
export const GET_ALL_COURSES = gql`
  query GetAllCourses($search: String, $instructor: String, $category: String) {
    courses(search: $search, instructor: $instructor, category: $category) {
      id
      name
      instructor
      category
      schedule
      students {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const GET_COURSE_BY_ID = gql`
  query GetCourseById($id: ID!) {
    course(id: $id) {
      id
      name
      instructor
      category
      schedule
      students {
        id
        firstName
        lastName
        email
        university {
          name
        }
      }
    }
  }
`;

// ===== MUTATIONS =====
export const CREATE_STUDENT = gql`
  mutation CreateStudent($input: StudentInput!) {
    createStudent(input: $input) {
      id
      firstName
      lastName
      email
      university {
        id
        name
      }
    }
  }
`;

export const UPDATE_STUDENT = gql`
  mutation UpdateStudent($id: ID!, $input: StudentInput!) {
    updateStudent(id: $id, input: $input) {
      id
      firstName
      lastName
      email
      university {
        id
        name
      }
    }
  }
`;

export const DELETE_STUDENT = gql`
  mutation DeleteStudent($id: ID!) {
    deleteStudent(id: $id)
  }
`;

export const CREATE_COURSE = gql`
  mutation CreateCourse($input: CourseInput!) {
    createCourse(input: $input) {
      id
      name
      instructor
      category
      schedule
    }
  }
`;

export const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $input: CourseInput!) {
    updateCourse(id: $id, input: $input) {
      id
      name
      instructor
      category
      schedule
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

export const ENROLL_STUDENT = gql`
  mutation EnrollStudent($studentId: ID!, $courseId: ID!) {
    enrollStudent(studentId: $studentId, courseId: $courseId) {
      id
      student {
        id
        firstName
        lastName
      }
      course {
        id
        name
      }
    }
  }
`;

export const UNENROLL_STUDENT = gql`
  mutation UnenrollStudent($studentId: ID!, $courseId: ID!) {
    unenrollStudent(studentId: $studentId, courseId: $courseId)
  }
`;
