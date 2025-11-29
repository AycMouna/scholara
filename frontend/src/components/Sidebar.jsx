import { Link, useLocation } from 'react-router-dom';
import { getStoredUser, logout } from '../services/authService';

function Sidebar() {
  const location = useLocation();
  const user = getStoredUser();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📈', roles: ['ADMIN'] },
    { path: '/students', label: 'Students', icon: '👤', roles: ['ADMIN'] },
    { path: '/courses', label: 'Courses', icon: '📖', roles: ['ADMIN'] },
    { path: '/enrollments', label: 'Enrollments', icon: '📝', roles: ['ADMIN'] },
    { path: '/chatbot', label: 'AI Chatbot', icon: '🤖', roles: ['STUDENT'] },
  ];

  const filteredMenu = menuItems.filter((item) =>
    !item.roles || !user?.role ? false : item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-gradient-to-b from-green-900 via-emerald-800 to-green-900 text-white min-h-screen p-6 shadow-2xl border-r border-green-700">
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
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
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              SCHOLARA
            </h2>
            <p className="text-xs text-slate-400">Plateforme éducative</p>
          </div>
        </div>
      </div>
      
      <nav className="space-y-3">
        {filteredMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`group flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              location.pathname === item.path
                ? `bg-white text-green-600 shadow-lg shadow-green-500/25`
                : 'text-green-100 hover:bg-green-700/50 hover:text-white hover:shadow-lg'
            }`}
          >
            <div className={`p-2 rounded-lg transition-all duration-300 ${
              location.pathname === item.path 
                ? 'bg-green-100' 
                : 'bg-green-700/50 group-hover:bg-green-600/50'
            }`}>
              {location.pathname === item.path ? (
                // Icône colorée quand sélectionnée
                <div className="w-6 h-6">
                  {item.path === '/dashboard' && (
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" className="text-green-600"/>
                    </svg>
                  )}
                  {item.path === '/students' && (
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                      <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zm-4 2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-5 7c0-2.21 1.79-4 4-4s4 1.79 4 4v2H7v-2zm8-2c2.21 0 4 1.79 4 4v2h-4v-2c0-1.1-.9-2-2-2s-2 .9-2 2v2h-4v-2c0-2.21 1.79-4 4-4z" fill="currentColor" className="text-green-600"/>
                    </svg>
                  )}
                  {item.path === '/courses' && (
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" className="text-green-600"/>
                    </svg>
                  )}
                  {item.path === '/enrollments' && (
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor" className="text-green-600"/>
                    </svg>
                  )}
                  {item.path === '/chatbot' && (
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="currentColor" className="text-green-600"/>
                    </svg>
                  )}
                </div>
              ) : (
                // Icône outline quand non sélectionnée
                <div className="w-6 h-6">
                  {item.path === '/dashboard' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-green-300">
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                    </svg>
                  )}
                  {item.path === '/students' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-green-300">
                      <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zm-4 2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-5 7c0-2.21 1.79-4 4-4s4 1.79 4 4v2H7v-2zm8-2c2.21 0 4 1.79 4 4v2h-4v-2c0-1.1-.9-2-2-2s-2 .9-2 2v2h-4v-2c0-2.21 1.79-4 4-4z"/>
                    </svg>
                  )}
                  {item.path === '/courses' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-green-300">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                    </svg>
                  )}
                  {item.path === '/enrollments' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-green-300">
                      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  )}
                  {item.path === '/chatbot' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-green-300">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                  )}
                </div>
              )}
            </div>
            <span className="font-medium">{item.label}</span>
            {location.pathname === item.path && (
              <div className="ml-auto w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            )}
          </Link>
        ))}
        
        <div className="pt-4 border-t border-green-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-green-100 hover:bg-white hover:text-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <div className="p-2 rounded-lg bg-green-700/50 hover:bg-gray-100 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-green-100 group-hover:text-gray-600">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
