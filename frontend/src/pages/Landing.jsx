import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-green-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="22" r="12" fill="white" stroke="#059669" strokeWidth="1"/>
                  <circle cx="16" cy="18" r="3" fill="#10B981"/>
                  <circle cx="24" cy="18" r="3" fill="#10B981"/>
                  <circle cx="16" cy="18" r="1.5" fill="white"/>
                  <circle cx="24" cy="18" r="1.5" fill="white"/>
                  <path d="M20 22 L18 24 L22 24 Z" fill="#059669"/>
                  <ellipse cx="14" cy="25" rx="2" ry="4" fill="#059669"/>
                  <ellipse cx="26" cy="25" rx="2" ry="4" fill="#059669"/>
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                SCHOLARA
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-medium transition-colors duration-300"
              >
                Connexion
              </Link>
              <Link
                to="/login"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-emerald-400/10 to-teal-400/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-400/20 rounded-full -translate-x-36 -translate-y-36"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full translate-x-48 translate-y-48"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-green-800 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
              La plateforme éducative
              <br />
              <span className="text-4xl lg:text-6xl">intelligente</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Gérez vos étudiants, cours et utilisez l'IA pour révolutionner l'éducation. 
              Une solution complète pour les institutions modernes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
              >
                Démarrer maintenant
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="22" r="12" fill="white" stroke="#059669" strokeWidth="1"/>
                    <circle cx="16" cy="18" r="3" fill="#10B981"/>
                    <circle cx="24" cy="18" r="3" fill="#10B981"/>
                    <circle cx="16" cy="18" r="1.5" fill="white"/>
                    <circle cx="24" cy="18" r="1.5" fill="white"/>
                    <path d="M20 22 L18 24 L22 24 Z" fill="#059669"/>
                    <ellipse cx="14" cy="25" rx="2" ry="4" fill="#059669"/>
                    <ellipse cx="26" cy="25" rx="2" ry="4" fill="#059669"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold">SCHOLARA</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                La plateforme éducative intelligente qui révolutionne la gestion académique avec l'intelligence artificielle.
              </p>
              <div className="flex space-x-4"></div>
            </div>
   
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition-colors">Contactez-nous</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 SCHOLARA. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Conditions</a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
