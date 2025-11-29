import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../services/dashboardService';
import Layout from '../components/Layout';

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalStudents: 0,
    totalCourses: 0,
    aiCalls: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  return (
    <Layout title="Tableau de bord">
      <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-800 to-emerald-600 bg-clip-text text-transparent">
            Tableau de bord
          </h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de votre plateforme SCHOLARA</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
        >
          <span className={`text-lg ${loading ? 'animate-spin' : ''}`}>⟳</span>
          <span className="font-medium">{loading ? 'Chargement...' : 'Actualiser'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Total Students Card */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-8 border border-gray-100/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                  <span className="text-3xl">👥</span>
                </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Étudiants</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent mt-2">
                {data.totalStudents}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600">+12% ce mois</span>
            </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                </div>
          </div>
        </div>

        {/* Total Courses Card */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-8 border border-gray-100/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
              <span className="text-3xl">📚</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Cours</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mt-2">
                {data.totalCourses}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600">+5 nouveaux</span>
            </div>
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100/50">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-800 to-emerald-600 bg-clip-text text-transparent">
            Actions rapides
          </h2>
        </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/students')}
            className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                <span className="text-2xl text-white">➕</span>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">Nouvel étudiant</span>
            </div>
          </button>
          <button 
            onClick={() => navigate('/courses')}
            className="group p-6 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 rounded-2xl hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                <span className="text-2xl text-white">📖</span>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700 transition-colors">Nouveau cours</span>
            </div>
          </button>
          <button 
            onClick={() => navigate('/chatbot')}
            className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                <span className="text-2xl text-white">💬</span>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">Chat IA</span>
            </div>
          </button>
        </div>
      </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
