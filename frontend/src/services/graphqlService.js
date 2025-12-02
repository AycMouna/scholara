import { getAuthHeaders } from './authService';

// GraphQL endpoint via API Gateway
const GRAPHQL_ENDPOINT = 'http://localhost:8084/graphql';

// Generic GraphQL fetch function
const fetchGraphQL = async (query, variables = {}) => {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors.map(error => error.message).join(', '));
  }
  
  return result.data;
};

// Student GraphQL queries and mutations
export const studentGraphQL = {
  // Get all students
  getAllStudents: async () => {
    const query = `
      query {
        students {
          id
          firstName
          lastName
          email
          dateOfBirth
        }
      }
    `;
    const data = await fetchGraphQL(query);
    return data.students || [];
  },

  // Get student by ID
  getStudentById: async (id) => {
    const query = `
      query($id: ID!) {
        student(id: $id) {
          id
          firstName
          lastName
          email
          dateOfBirth
        }
      }
    `;
    const data = await fetchGraphQL(query, { id });
    return data.student;
  },

  // Create student
  createStudent: async (studentInput) => {
    const mutation = `
      mutation($input: StudentInput!) {
        createStudent(input: $input) {
          id
          firstName
          lastName
          email
          dateOfBirth
        }
      }
    `;
    const data = await fetchGraphQL(mutation, { input: studentInput });
    return data.createStudent;
  },

  // Update student
  updateStudent: async (id, studentInput) => {
    const mutation = `
      mutation($id: ID!, $input: StudentInput!) {
        updateStudent(id: $id, input: $input) {
          id
          firstName
          lastName
          email
          dateOfBirth
        }
      }
    `;
    const data = await fetchGraphQL(mutation, { id, input: studentInput });
    return data.updateStudent;
  },

  // Delete student
  deleteStudent: async (id) => {
    const mutation = `
      mutation($id: ID!) {
        deleteStudent(id: $id)
      }
    `;
    const data = await fetchGraphQL(mutation, { id });
    return data.deleteStudent;
  }
};

// Course GraphQL queries and mutations
export const courseGraphQL = {
  // Get all courses
  getAllCourses: async () => {
    const query = `
      query {
        courses {
          id
          name
          description
          credits
        }
      }
    `;
    const data = await fetchGraphQL(query);
    return data.courses || [];
  },

  // Get course by ID
  getCourseById: async (id) => {
    const query = `
      query($id: ID!) {
        course(id: $id) {
          id
          name
          description
          credits
        }
      }
    `;
    const data = await fetchGraphQL(query, { id });
    return data.course;
  },

  // Create course
  createCourse: async (courseInput) => {
    const mutation = `
      mutation($input: CourseInput!) {
        createCourse(input: $input) {
          id
          name
          description
          credits
        }
      }
    `;
    // Note: You would need to define CourseInput in your schema
    const data = await fetchGraphQL(mutation, { input: courseInput });
    return data.createCourse;
  },

  // Update course
  updateCourse: async (id, courseInput) => {
    const mutation = `
      mutation($id: ID!, $input: CourseInput!) {
        updateCourse(id: $id, input: $input) {
          id
          name
          description
          credits
        }
      }
    `;
    const data = await fetchGraphQL(mutation, { id, input: courseInput });
    return data.updateCourse;
  },

  // Delete course
  deleteCourse: async (id) => {
    const mutation = `
      mutation($id: ID!) {
        deleteCourse(id: $id)
      }
    `;
    const data = await fetchGraphQL(mutation, { id });
    return data.deleteCourse;
  }
};

// Combined queries for student-course relationships
export const enrollmentGraphQL = {
  // Get courses for a student
  getStudentCourses: async (studentId) => {
    const query = `
      query($studentId: ID!) {
        studentCourses(studentId: $studentId) {
          id
          name
          description
          credits
        }
      }
    `;
    const data = await fetchGraphQL(query, { studentId });
    return data.studentCourses || [];
  }
};

export default {
  studentGraphQL,
  courseGraphQL,
  enrollmentGraphQL
};