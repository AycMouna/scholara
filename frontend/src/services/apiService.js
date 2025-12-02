import { getAuthHeaders } from './authService';

// API Gateway URL - Single entry point for all services
const API_GATEWAY_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084';

const fetchWithAuth = (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };
  return fetch(url, { ...options, headers });
};

// Service URLs via API Gateway
const STUDENT_SERVICE_URL = `${API_GATEWAY_URL}/api/students`;
const COURSE_SERVICE_BASE = `${API_GATEWAY_URL}/api`; // Base for courses and enrollments

// ====== STUDENT SERVICE ======
export const studentApi = {
  // Get all students
  getAllStudents: async () => {
    const response = await fetchWithAuth(`${STUDENT_SERVICE_URL}`);
    if (!response.ok) throw new Error(`Failed to fetch students: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  // Get student by ID
  getStudentById: async (id) => {
    const response = await fetchWithAuth(`${STUDENT_SERVICE_URL}/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch student: ${response.status}`);
    return await response.json();
  },

  // Search students
  searchStudents: async (searchTerm) => {
    const response = await fetchWithAuth(`${STUDENT_SERVICE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) throw new Error(`Failed to search students: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  // Create student
  createStudent: async (studentData) => {
    const response = await fetchWithAuth(`${STUDENT_SERVICE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) throw new Error(`Failed to create student: ${response.status}`);
    return await response.json();
  },

  // Update student
  updateStudent: async (id, studentData) => {
    const response = await fetchWithAuth(`${STUDENT_SERVICE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    if (!response.ok) throw new Error(`Failed to update student: ${response.status}`);
    return await response.json();
  },

  // Delete student
  deleteStudent: async (id) => {
    const response = await fetchWithAuth(`${STUDENT_SERVICE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  },
};

// ====== COURSE SERVICE ======
export const courseApi = {
  // Get all courses
  getAllCourses: async () => {
    const response = await fetchWithAuth(`${COURSE_SERVICE_BASE}/courses/`);
    const data = await response.json();
    return data.results; // Django REST Framework returns {count, next, previous, results}
  },

  // Get course by ID
  getCourseById: async (id) => {
    const response = await fetchWithAuth(`${COURSE_SERVICE_BASE}/courses/${id}/`);
    return await response.json();
  },

  // Search courses
  searchCourses: async (searchTerm) => {
    const response = await fetchWithAuth(`${COURSE_SERVICE_BASE}/courses/?search=${encodeURIComponent(searchTerm)}`);
    const data = await response.json();
    return data.results;
  },

  // Create course
  createCourse: async (courseData) => {
    const response = await fetchWithAuth(`${COURSE_SERVICE_BASE}/courses/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });
    return await response.json();
  },

  // Update course
  updateCourse: async (id, courseData) => {
    const response = await fetchWithAuth(`${COURSE_SERVICE_BASE}/courses/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });
    return await response.json();
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await fetchWithAuth(`${COURSE_SERVICE_BASE}/courses/${id}/`, {
      method: 'DELETE',
    });
    return response.ok;
  },
};

// ====== AI CHATBOT SERVICE ======
// Use API Gateway for AI service
// Note: Gateway routes /api/translate/ and /api/summarize/ directly
const AI_SERVICE_URL = `${API_GATEWAY_URL}/api`;

export const aiApi = {
  // Translate text
  translate: async (text, targetLanguage = 'en') => {
    const response = await fetchWithAuth(`${AI_SERVICE_URL}/translate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, target_language: targetLanguage }),
    });
    
    // Parse JSON response
    const data = await response.json();
    
    // If response is not OK, return error (but still parse JSON for error message)
    if (!response.ok) {
      return {
        error: data.error || data.details || `Translation failed with status ${response.status}`,
        details: data.details,
        suggestion: data.suggestion,
        translated_text: null,
      };
    }
    
    return data;
  },

  // Summarize text
  summarize: async (text, maxLength = 150) => {
    const response = await fetchWithAuth(`${AI_SERVICE_URL}/summarize/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, max_length: maxLength }),
    });
    
    // Parse JSON response
    const data = await response.json();
    
    // If response is not OK, return error (but still parse JSON for error message)
    if (!response.ok) {
      return {
        error: data.error || data.details || `Summarization failed with status ${response.status}`,
        details: data.details,
        suggestion: data.suggestion,
        summary: null,
      };
    }
    
    return data;
  },
};

// ====== ENROLLMENT SERVICE ======
export const enrollmentApi = {
  // Get all enrollments
  getAllEnrollments: async () => {
    const response = await fetchWithAuth(`${COURSE_SERVICE_BASE}/enrollments/`);
    if (!response.ok) throw new Error(`Failed to fetch enrollments: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  },

  // Get enrollment by ID
  getEnrollmentById: async (id) => {
    const response = await fetchWithAuth(`${COURSE_SERVICE_BASE}/enrollments/${id}/`);
    if (!response.ok) throw new Error(`Failed to fetch enrollment: ${response.status}`);
    return await response.json();
  },

  // Enroll a student in a course
  enrollStudent: async (courseId, studentId) => {
    const response = await fetchWithAuth(`${COURSE_SERVICE_BASE}/courses/${courseId}/enroll/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ student_id: studentId }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to enroll student' }));
      throw new Error(error.error || `Failed to enroll student: ${response.status}`);
    }
    return await response.json();
  },

  // Unenroll a student from a course
  unenrollStudent: async (courseId, studentId) => {
    const response = await fetchWithAuth(`${COURSE_SERVICE_BASE}/courses/${courseId}/unenroll/?student_id=${studentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to unenroll student' }));
      throw new Error(error.error || `Failed to unenroll student: ${response.status}`);
    }
    return response.status === 204 ? { success: true } : await response.json();
  },

  // Get all students enrolled in a course
  getCourseStudents: async (courseId) => {
    const response = await fetchWithAuth(`${COURSE_SERVICE_BASE}/courses/${courseId}/students/`);
    if (!response.ok) throw new Error(`Failed to fetch course students: ${response.status}`);
    return await response.json();
  },

  // Get all courses for a student
  getStudentCourses: async (studentId) => {
    const response = await fetchWithAuth(`${COURSE_SERVICE_BASE}/students/${studentId}/courses/`);
    if (!response.ok) throw new Error(`Failed to fetch student courses: ${response.status}`);
    return await response.json();
  },
};

