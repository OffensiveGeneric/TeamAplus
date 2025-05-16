import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Layout from '../components/Layout';

const LoginPage = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://134.209.161.6/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      const data = JSON.parse(text);

      if (res.ok && data.user) {
        setUser(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect or parse response.");
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-sm rounded p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-4 p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mb-4 p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition"
          >
            Log In
          </button>
        </form>

        {error && <p className="text-red-600 mt-4 text-sm text-center">{error}</p>}
      </div>
    </Layout>
  );
};

export default LoginPage;

