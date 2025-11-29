import { getStoredUser } from '../services/authService';

function Navbar({ title }) {
  const user = getStoredUser();
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '??';

  return (
    <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-800 to-emerald-600 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">En ligne</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {user?.fullName || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500">{user?.role || 'Role inconnu'}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <span className="text-white text-lg font-bold">{initials}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
