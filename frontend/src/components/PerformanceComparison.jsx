import { useState, useEffect } from 'react';

function PerformanceComparison() {
  const [restData, setRestData] = useState(null);
  const [graphqlData, setGraphqlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    restRequests: 0,
    graphqlRequests: 0,
    restTime: 0,
    graphqlTime: 0,
    restDataSize: 0,
    graphqlDataSize: 0
  });

  const testRESTPerformance = async () => {
    const startTime = performance.now();
    const requests = [];
    
    try {
      // Simuler plusieurs requêtes REST
      const studentsResponse = await fetch('http://localhost:8081/api/students');
      const students = await studentsResponse.json();
      
      // Pour chaque étudiant, récupérer ses cours (N+1 problem)
      for (const student of students.slice(0, 5)) {
        const coursesResponse = await fetch(`http://localhost:8082/api/courses`);
        const courses = await coursesResponse.json();
        requests.push(coursesResponse);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      setRestData({
        students: students,
        time: totalTime,
        requests: requests.length + 1,
        dataSize: JSON.stringify(students).length
      });
      
      setMetrics(prev => ({
        ...prev,
        restRequests: requests.length + 1,
        restTime: totalTime,
        restDataSize: JSON.stringify(students).length
      }));
      
    } catch (error) {
      console.error('REST test failed:', error);
    }
  };

  const testGraphQLPerformance = async () => {
    const startTime = performance.now();
    
    try {
      // Une seule requête GraphQL
      const response = await fetch('http://localhost:8081/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetStudentsWithCourses {
              students {
                id
                firstName
                lastName
                email
                courses {
                  id
                  name
                  instructor
                  category
                }
              }
            }
          `
        })
      });
      
      const result = await response.json();
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      setGraphqlData({
        students: result.data.students,
        time: totalTime,
        requests: 1,
        dataSize: JSON.stringify(result.data).length
      });
      
      setMetrics(prev => ({
        ...prev,
        graphqlRequests: 1,
        graphqlTime: totalTime,
        graphqlDataSize: JSON.stringify(result.data).length
      }));
      
    } catch (error) {
      console.error('GraphQL test failed:', error);
    }
  };

  const runComparison = async () => {
    setLoading(true);
    await testRESTPerformance();
    await testGraphQLPerformance();
    setLoading(false);
  };

  useEffect(() => {
    runComparison();
  }, []);

  const performanceImprovement = metrics.restTime > 0 && metrics.graphqlTime > 0 
    ? ((metrics.restTime - metrics.graphqlTime) / metrics.restTime * 100).toFixed(1)
    : 0;

  const dataReduction = metrics.restDataSize > 0 && metrics.graphqlDataSize > 0
    ? ((metrics.restDataSize - metrics.graphqlDataSize) / metrics.restDataSize * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100/50">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-purple-600 bg-clip-text text-transparent">
          Comparaison Performance: REST vs GraphQL
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Test des performances en cours...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* REST Performance */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">R</span>
              </div>
              <h3 className="text-lg font-semibold text-red-800">REST API</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-red-700">Requêtes:</span>
                <span className="font-medium text-red-800">{metrics.restRequests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">Temps:</span>
                <span className="font-medium text-red-800">{metrics.restTime.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">Taille données:</span>
                <span className="font-medium text-red-800">{(metrics.restDataSize / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">Problème N+1:</span>
                <span className="font-medium text-red-800">Oui</span>
              </div>
            </div>
          </div>

          {/* GraphQL Performance */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">G</span>
              </div>
              <h3 className="text-lg font-semibold text-green-800">GraphQL</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-700">Requêtes:</span>
                <span className="font-medium text-green-800">{metrics.graphqlRequests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Temps:</span>
                <span className="font-medium text-green-800">{metrics.graphqlTime.toFixed(2)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Taille données:</span>
                <span className="font-medium text-green-800">{(metrics.graphqlDataSize / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Problème N+1:</span>
                <span className="font-medium text-green-800">Non</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {!loading && metrics.restTime > 0 && metrics.graphqlTime > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Améliorations GraphQL</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {performanceImprovement}%
              </div>
              <div className="text-sm text-gray-600">Amélioration vitesse</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {((metrics.restRequests - metrics.graphqlRequests) / metrics.restRequests * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Réduction requêtes</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {dataReduction}%
              </div>
              <div className="text-sm text-gray-600">Réduction données</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={runComparison}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl transition-all duration-300"
        >
          {loading ? 'Test en cours...' : 'Relancer le test'}
        </button>
      </div>
    </div>
  );
}

export default PerformanceComparison;
