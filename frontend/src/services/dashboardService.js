import { studentApi, courseApi } from './apiService';

export const getDashboardData = async () => {
  const [students, courses] = await Promise.all([
    studentApi.getAllStudents().catch(() => []),
    courseApi.getAllCourses().catch(() => []),
  ]);

  let aiCalls = 0;
  try {
    aiCalls = parseInt(localStorage.getItem('aiCallsCount') || '0', 10) || 0;
  } catch {
    aiCalls = 0;
  }

  return {
    totalStudents: Array.isArray(students) ? students.length : 0,
    totalCourses: Array.isArray(courses) ? courses.length : 0,
    aiCalls,
  };
};

export const getStudentStats = async () => {
  const students = await studentApi.getAllStudents().catch(() => []);
  const total = Array.isArray(students) ? students.length : 0;
  return { active: total, inactive: 0, graduated: 0 };
};

export const getCourseStats = async () => {
  const courses = await courseApi.getAllCourses().catch(() => []);
  return { published: Array.isArray(courses) ? courses.length : 0, draft: 0, archived: 0 };
};
