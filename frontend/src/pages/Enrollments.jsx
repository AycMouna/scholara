import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { enrollmentApi, studentApi, courseApi } from '../services/apiService';

function Enrollments() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'by-course', 'by-student'
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const studentDropdownRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target)) {
        setShowStudentDropdown(false);
      }
    };

    if (showStudentDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStudentDropdown]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, coursesData, enrollmentsData] = await Promise.all([
        studentApi.getAllStudents(),
        courseApi.getAllCourses(),
        enrollmentApi.getAllEnrollments(),
      ]);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : (coursesData?.results || []));
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData?.results || []));
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Erreur lors du chargement des données: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedStudent) {
      alert('Veuillez sélectionner un cours et un étudiant');
      return;
    }

    try {
      setLoading(true);
      await enrollmentApi.enrollStudent(selectedCourse, selectedStudent);
      await loadData();
      setShowModal(false);
      setSelectedCourse('');
      setSelectedStudent('');
      setStudentSearchTerm('');
      setShowStudentDropdown(false);
      alert('Étudiant inscrit avec succès!');
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert('Erreur lors de l\'inscription: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (courseId, studentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir désinscrire cet étudiant de ce cours ?')) {
      return;
    }

    try {
      setLoading(true);
      await enrollmentApi.unenrollStudent(courseId, studentId);
      await loadData();
      alert('Étudiant désinscrit avec succès!');
    } catch (error) {
      console.error('Error unenrolling student:', error);
      alert('Erreur lors de la désinscription: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get course name by ID
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId || c.id?.toString() === courseId?.toString());
    return course?.name || `Cours #${courseId}`;
  };

  // Get student name by ID
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId || s.id?.toString() === studentId?.toString());
    return student ? `${student.firstName} ${student.lastName}` : `Étudiant #${studentId}`;
  };

  // Get student email by ID
  const getStudentEmail = (studentId) => {
    const student = students.find(s => s.id === studentId || s.id?.toString() === studentId?.toString());
    return student?.email || '';
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    if (searchTerm === '') return true;
    const courseName = getCourseName(enrollment.course || enrollment.course_id);
    const studentName = getStudentName(enrollment.student_id);
    return (
      courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student_id?.toString().includes(searchTerm)
    );
  });

  // Group enrollments by course
  const enrollmentsByCourse = courses.map(course => {
    const courseEnrollments = enrollments.filter(
      e => (e.course === course.id || e.course_id === course.id || e.course?.id === course.id)
    );
    return {
      course,
      enrollments: courseEnrollments,
      count: courseEnrollments.length,
    };
  });

  // Group enrollments by student
  const enrollmentsByStudent = students.map(student => {
    const studentEnrollments = enrollments.filter(
      e => (e.student_id === student.id || e.student_id?.toString() === student.id?.toString())
    );
    return {
      student,
      enrollments: studentEnrollments,
      count: studentEnrollments.length,
    };
  });

  return (
    <Layout title="Gestion des inscriptions">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-800 to-emerald-600 bg-clip-text text-transparent">
              Gestion des inscriptions
            </h1>
            <p className="text-gray-600 mt-2">Affectez les étudiants aux cours</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
          >
            <span className="font-medium">+ Inscrire un étudiant</span>
          </button>
        </div>

        {/* Search and View Mode */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Rechercher par cours ou étudiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vue
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">Toutes les inscriptions</option>
                <option value="by-course">Par cours</option>
                <option value="by-student">Par étudiant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enrollments Display */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
            <p className="text-gray-600 ml-4">Chargement...</p>
          </div>
        ) : viewMode === 'all' ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Étudiant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Cours</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date d'inscription</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        Aucune inscription trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {getStudentName(enrollment.student_id)}
                            </p>
                            <p className="text-sm text-gray-500">{getStudentEmail(enrollment.student_id)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {getCourseName(enrollment.course || enrollment.course_id)}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {enrollment.enrolled_at
                            ? new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleUnenroll(
                              enrollment.course || enrollment.course_id,
                              enrollment.student_id
                            )}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            Désinscrire
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === 'by-course' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollmentsByCourse.map(({ course, enrollments: courseEnrollments, count }) => (
              <div
                key={course.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {count} étudiant{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {courseEnrollments.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucun étudiant inscrit</p>
                  ) : (
                    courseEnrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {getStudentName(enrollment.student_id)}
                          </p>
                          <p className="text-xs text-gray-500">{getStudentEmail(enrollment.student_id)}</p>
                        </div>
                        <button
                          onClick={() => handleUnenroll(course.id, enrollment.student_id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollmentsByStudent.map(({ student, enrollments: studentEnrollments, count }) => (
              <div
                key={student.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {count} cours
                  </span>
                </div>
                <div className="space-y-2">
                  {studentEnrollments.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucun cours inscrit</p>
                  ) : (
                    studentEnrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <p className="font-medium text-gray-900">
                          {getCourseName(enrollment.course || enrollment.course_id)}
                        </p>
                        <button
                          onClick={() => handleUnenroll(
                            enrollment.course || enrollment.course_id,
                            student.id
                          )}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enrollment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Inscrire un étudiant</h3>
              <form onSubmit={handleEnroll} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cours
                  </label>
                  <select
                    required
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un cours</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} - {course.instructor}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Étudiant
                  </label>
                  <div className="relative" ref={studentDropdownRef}>
                    <input
                      type="text"
                      placeholder="Rechercher un étudiant par nom ou email..."
                      value={selectedStudent ? (students.find(s => s.id?.toString() === selectedStudent?.toString()) 
                        ? `${students.find(s => s.id?.toString() === selectedStudent?.toString()).firstName} ${students.find(s => s.id?.toString() === selectedStudent?.toString()).lastName} - ${students.find(s => s.id?.toString() === selectedStudent?.toString()).email}`
                        : '') 
                        : studentSearchTerm}
                      onChange={(e) => {
                        setStudentSearchTerm(e.target.value);
                        setShowStudentDropdown(true);
                        setSelectedStudent('');
                      }}
                      onFocus={() => setShowStudentDropdown(true)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    {showStudentDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                        {students
                          .filter(student => 
                            !studentSearchTerm || 
                            `${student.firstName} ${student.lastName}`.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                            student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
                          )
                          .map((student) => (
                            <div
                              key={student.id}
                              onClick={() => {
                                setSelectedStudent(student.id);
                                setStudentSearchTerm('');
                                setShowStudentDropdown(false);
                              }}
                              className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                              <p className="font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{student.email}</p>
                            </div>
                          ))}
                        {students.filter(student => 
                          !studentSearchTerm || 
                          `${student.firstName} ${student.lastName}`.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-3 text-gray-500 text-sm">
                            Aucun étudiant trouvé
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedStudent && (
                    <input type="hidden" value={selectedStudent} required />
                  )}
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl transition-all duration-300"
                  >
                    Inscrire
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedCourse('');
                      setSelectedStudent('');
                      setStudentSearchTerm('');
                      setShowStudentDropdown(false);
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-all duration-300"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Enrollments;

