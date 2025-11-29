import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { studentApi, enrollmentApi } from '../services/apiService';

// Mock data (backup)
const mockStudents = [
  {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Benali',
    email: 'ahmed.benali@univ-constantine2.dz',
    university: { id: '1', name: 'Université Constantine 2', location: 'Constantine' },
    courses: [
      { id: '1', name: 'Algorithmique', instructor: 'Dr. Smith', category: 'Informatique' },
      { id: '2', name: 'Base de données', instructor: 'Prof. Johnson', category: 'Informatique' }
    ]
  },
  {
    id: '2',
    firstName: 'Fatima',
    lastName: 'Kadri',
    email: 'fatima.kadri@univ-constantine2.dz',
    university: { id: '1', name: 'Université Constantine 2', location: 'Constantine' },
    courses: [
      { id: '1', name: 'Algorithmique', instructor: 'Dr. Smith', category: 'Informatique' }
    ]
  },
  {
    id: '3',
    firstName: 'Mohamed',
    lastName: 'Taleb',
    email: 'mohamed.taleb@univ-constantine2.dz',
    university: { id: '2', name: 'Université Mentouri', location: 'Constantine' },
    courses: []
  }
];

const mockUniversities = [
  { id: '1', name: 'Université Constantine 2', location: 'Constantine' },
  { id: '2', name: 'Université Mentouri', location: 'Constantine' },
  { id: '3', name: 'Université Alger', location: 'Alger' }
];

function Students() {
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    universityId: ''
  });

  const universities = mockUniversities;

  // Load students and their enrollments from API on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const [studentsData, enrollmentsData] = await Promise.all([
        studentApi.getAllStudents(),
        enrollmentApi.getAllEnrollments().catch(() => [])
      ]);
      
      const students = Array.isArray(studentsData) ? studentsData : [];
      const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData?.results || []);
      
      // Count courses for each student
      const studentsWithCourseCount = students.map(student => {
        const courseCount = enrollments.filter(e => 
          e.student_id === student.id || e.student_id?.toString() === student.id?.toString()
        ).length;
        return {
          ...student,
          courseCount
        };
      });
      
      setStudents(studentsWithCourseCount);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  // Filter students locally
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toString().includes(searchTerm);
    
    const matchesUniversity = selectedUniversity === '' || 
      student.universityId?.toString() === selectedUniversity;
    
    return matchesSearch && matchesUniversity;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingStudent) {
        // Mise à jour - Call API
        await studentApi.updateStudent(editingStudent.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          universityId: parseInt(formData.universityId)
        });
      } else {
        // Création - Call API
        await studentApi.createStudent({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          universityId: parseInt(formData.universityId)
        });
      }
      
      // Reload students after create/update
      await loadStudents();
      
      setShowModal(false);
      setEditingStudent(null);
      setFormData({ firstName: '', lastName: '', email: '', universityId: '' });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'opération: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      universityId: student.universityId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        setLoading(true);
        const success = await studentApi.deleteStudent(id);
        if (success) {
          await loadStudents();
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression: ' + (error.message || 'Erreur inconnue'));
      } finally {
        setLoading(false);
      }
    }
  };

  const openModal = () => {
    setEditingStudent(null);
    setFormData({ firstName: '', lastName: '', email: '', universityId: '' });
    setShowModal(true);
  };

  return (
    <Layout title="Gestion des étudiants">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-800 to-emerald-600 bg-clip-text text-transparent">
              Gestion des étudiants
            </h1>
            <p className="text-gray-600 mt-2">Gérez les étudiants et leurs inscriptions</p>
          </div>
          <button 
            onClick={openModal}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M12 5v14m-7-7h14"/>
            </svg>
            <span className="font-medium">Ajouter un étudiant</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Nom, email, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Université
              </label>
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">Toutes les universités</option>
                {universities.map(uni => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name} - {uni.location}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedUniversity('');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-300"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Liste des étudiants ({filteredStudents.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4">Chargement des étudiants...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                {students.length === 0 ? 'Aucun étudiant enregistré' : 'Aucun étudiant ne correspond aux critères de recherche'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Étudiant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Université</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cours</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-sm text-gray-500">ID: {student.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{student.email}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          Université #{student.universityId || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {student.courseCount || 0} cours
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {editingStudent ? 'Modifier l\'étudiant' : 'Nouvel étudiant'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Université
                  </label>
                  <select
                    required
                    value={formData.universityId}
                    onChange={(e) => setFormData({...formData, universityId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une université</option>
                    {universities.map(uni => (
                      <option key={uni.id} value={uni.id}>
                        {uni.name} - {uni.location}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl transition-all duration-300"
                  >
                    {editingStudent ? 'Modifier' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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

export default Students;
