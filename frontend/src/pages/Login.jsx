import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, loginWithGoogle, getStoredUser } from '../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const user = getStoredUser();
    const token = localStorage.getItem('authToken');
    if (token && user?.role) {
      navigate(user.role === 'STUDENT' ? '/chatbot' : '/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!googleClientId) return;

    const existingScript = document.getElementById('google-client-script');
    if (existingScript) return initializeButton();

    const script = document.createElement('script');
    script.id = 'google-client-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeButton;
    document.body.appendChild(script);

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [googleClientId]);

  const initializeButton = () => {
    if (!window.google || !googleButtonRef.current || !googleClientId) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCallback,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 250,
      text: 'signin_with',
    });
  };

  const handleGoogleCallback = async (response) => {
    try {
      setGoogleError('');
      setLoading(true);
      await loginWithGoogle(response.credential);
      const user = getStoredUser();
      navigate(user?.role === 'STUDENT' ? '/chatbot' : '/dashboard', { replace: true });
    } catch (err) {
      setGoogleError(err.message || 'Impossible de se connecter avec Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGoogleError('');
    setLoading(true);

    try {
      const result = await login(email.trim(), password);
      navigate(result.role === 'STUDENT' ? '/chatbot' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-emerald-400/10 to-teal-400/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-400/20 rounded-full -translate-x-36 -translate-y-36"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full translate-x-48 translate-y-48"></div>
      
      <div className="relative z-10 max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            SCHOLARA
          </h2>
          <p className="mt-3 text-gray-600">
            Plateforme éducative intelligente
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Entrez vos identifiants pour accéder au tableau de bord
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 backdrop-blur-sm"
                  autoComplete="email"
                  placeholder="admin@scholara.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 backdrop-blur-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>

              {googleClientId ? (
                <>
                  {googleError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-xl">
                      {googleError}
                    </div>
                  )}
                  <div className="flex items-center">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400 px-3 uppercase">ou</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <div ref={googleButtonRef} className="flex justify-center" />
                </>
              ) : (
                <p className="text-xs text-center text-gray-500">
                  Ajoutez VITE_GOOGLE_CLIENT_ID pour activer la connexion Google.
                </p>
              )}
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
