import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const DashboardPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetch('http://134.209.161.6/api/get_submissions.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id }),
    })
      .then(async (res) => {
        const text = await res.text();
        console.log("RAW DASHBOARD RESPONSE:", text);

        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            setSubmissions(data);
          } else {
            console.error("Invalid submission data:", data);
          }
        } catch (err) {
          console.error("Failed to parse dashboard JSON:", err);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching submissions:", err);
        setLoading(false);
      });
  }, [user, navigate]);

  return (
    <Layout>
      <>
        <h1 className="text-3xl font-semibold mb-2">Welcome, {user?.username}</h1>
        <p className="text-sm text-gray-600 mb-8">
          You have <span className="font-semibold">{user?.credits ?? 0}</span> credits remaining.
        </p>

        {loading ? (
          <p className="text-gray-500">Loading your submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-gray-500">No submissions yet.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded shadow-sm">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Words</th>
                  <th className="px-4 py-2">Credits Used</th>
                  <th className="px-4 py-2">Bonus</th>
                  <th className="px-4 py-2">Preview</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2 text-xs text-gray-600">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{s.word_count}</td>
                    <td className="px-4 py-2">{s.credits_used}</td>
                    <td className="px-4 py-2">{s.bonus_credits_awarded}</td>
                    <td className="px-4 py-2 text-gray-500 italic truncate max-w-xs">
                      {s.original_text.slice(0, 100) || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    </Layout>
  );
};

export default DashboardPage;
