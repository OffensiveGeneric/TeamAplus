import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://134.209.161.6/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const text = await res.text();
      console.log("RAW REGISTER RESPONSE:", text);

      const data = JSON.parse(text);

      if (res.ok) {
        alert("Registration successful! You can now log in.");
        navigate('/login');
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("Unable to connect or parse response.");
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-sm rounded p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>

        <form onSubmit={handleRegister}>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full mb-4 p-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            required
          />

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
            Register
          </button>
        </form>

        {error && <p className="text-red-600 mt-4 text-sm text-center">{error}</p>}
      </div>
    </Layout>
  );
};

export default RegisterPage;
