import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="bg-black text-white px-6 py-4 flex justify-between items-center">
        <div
          className="text-lg font-semibold cursor-pointer"
          onClick={() => navigate('/')}
        >
          📝 ClarityAI
        </div>
        <div className="text-sm flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-300">
                Hello, <strong>{user.username}</strong>
              </span>
              <span>{user.credits ?? 0} credits</span>

              <button
                onClick={() => navigate('/dashboard')}
                className="hover:underline"
              >
                Dashboard
              </button>

              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="hover:underline"
                >
                  Admin Panel
                </button>
              )}

              <button
                onClick={() => {
                  setUser(null);
                  navigate('/login');
                }}
                className="underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="hover:underline"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="hover:underline"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="px-4 py-10">{children}</main>
    </div>
  );
};

export default Layout;
