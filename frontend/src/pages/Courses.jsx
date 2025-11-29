import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { courseApi, enrollmentApi } from '../services/apiService';

// Mock data (backup)
const mockCourses = [
  {
    id: '1',
    name: 'Algorithmique Avancée',
    instructor: 'Dr. Smith',
    category: 'Informatique',
    schedule: 'Lundi 9h-11h, Mercredi 14h-16h',
    students: [
      { id: '1', firstName: 'Ahmed', lastName: 'Benali', email: 'ahmed.benali@univ-constantine2.dz' },
      { id: '2', firstName: 'Fatima', lastName: 'Kadri', email: 'fatima.kadri@univ-constantine2.dz' }
    ]
  },
  {
    id: '2',
    name: 'Base de Données',
    instructor: 'Prof. Johnson',
    category: 'Informatique',
    schedule: 'Mardi 10h-12h, Jeudi 15h-17h',
    students: [
      { id: '1', firstName: 'Ahmed', lastName: 'Benali', email: 'ahmed.benali@univ-constantine2.dz' }
    ]
  },
  {
    id: '3',
    name: 'Mathématiques Appliquées',
    instructor: 'Dr. Brown',
    category: 'Mathématiques',
    schedule: 'Lundi 8h-10h, Vendredi 13h-15h',
    students: []
  }
];

function Courses() {
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    instructor: '',
    category: '',
    schedule: ''
  });

  // Load courses and enrich with student count
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Load courses and enrollments in parallel
      const [coursesData, enrollmentsData] = await Promise.all([
        courseApi.getAllCourses(),
        enrollmentApi.getAllEnrollments().catch(() => [])
      ]);
      
      const courses = Array.isArray(coursesData) ? coursesData : (coursesData?.results || []);
      const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData?.results || []);
      
      // Count students for each course
      const enrichedCourses = courses.map(course => {
        const studentCount = enrollments.filter(e => 
          e.course === course.id || e.course_id === course.id || e.course?.id === course.id
        ).length;
        return {
          ...course,
          studentCount
        };
      });
      
      setCourses(enrichedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
      // Fallback to mock data on error
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingCourse) {
        // Mise à jour - Call API
        await courseApi.updateCourse(editingCourse.id, formData);
      } else {
        // Création - Call API
        await courseApi.createCourse(formData);
      }
      
      // Reload courses after create/update
      await loadCourses();
      
      setShowModal(false);
      setEditingCourse(null);
      setFormData({ name: '', instructor: '', category: '', schedule: '' });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'opération: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      instructor: course.instructor,
      category: course.category,
      schedule: course.schedule
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        setLoading(true);
        const success = await courseApi.deleteCourse(id);
        if (success) {
          await loadCourses();
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
    setEditingCourse(null);
    setFormData({ name: '', instructor: '', category: '', schedule: '' });
    setShowModal(true);
  };

  // Filter courses locally
  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchTerm === '' || 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInstructor = selectedInstructor === '' || course.instructor === selectedInstructor;
    const matchesCategory = selectedCategory === '' || course.category === selectedCategory;
    
    return matchesSearch && matchesInstructor && matchesCategory;
  });

  const categories = ['Informatique', 'Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Économie', 'Littérature', 'Histoire'];
  const instructors = ['Dr. Smith', 'Prof. Johnson', 'Dr. Brown', 'Prof. Davis', 'Dr. Wilson', 'Prof. Miller'];

  return (
    <Layout title="Gestion des cours">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-800 to-emerald-600 bg-clip-text text-transparent">
              Gestion des cours
            </h1>
            <p className="text-gray-600 mt-2">Gérez les cours et les inscriptions</p>
          </div>
          <button 
            onClick={openModal}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
          >
            <span className="font-medium">Créer un cours</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Nom du cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instructeur
              </label>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">Tous les instructeurs</option>
                {instructors.map(instructor => (
                  <option key={instructor} value={instructor}>
                    {instructor}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedInstructor('');
                  setSelectedCategory('');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-300"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-600 ml-4">Chargement des cours...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">
                {courses.length === 0 ? 'Aucun cours enregistré' : 'Aucun cours ne correspond aux critères de recherche'}
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-6 border border-gray-100/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(course)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">👨‍🏫</span>
                      <span className="text-sm text-gray-700">{course.instructor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">🏷️</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {course.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">⏰</span>
                      <span className="text-sm text-gray-700">{course.schedule}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">👥</span>
                      <span className="text-sm font-medium text-gray-700">
                        {course.studentCount || 0} étudiants
                      </span>
                    </div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((course.studentCount || 0) * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {editingCourse ? 'Modifier le cours' : 'Nouveau cours'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du cours
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instructeur
                  </label>
                  <select
                    required
                    value={formData.instructor}
                    onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un instructeur</option>
                    {instructors.map(instructor => (
                      <option key={instructor} value={instructor}>
                        {instructor}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Horaire
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lundi 9h-11h, Mercredi 14h-16h"
                    value={formData.schedule}
                    onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl transition-all duration-300"
                  >
                    {editingCourse ? 'Modifier' : 'Créer'}
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

export default Courses;
