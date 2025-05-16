import { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const AdminPanelPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user]);

  useEffect(() => {
    fetch('http://134.209.161.6/api/get_disputes.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDisputes(data);
        } else {
          setError(data.error || "Unable to fetch disputes.");
        }
      })
      .catch(err => {
        console.error(err);
        setError("Network error while fetching disputes.");
      });
  }, []);

  const resolveDispute = async (dispute_id, decision) => {
    const res = await fetch('http://134.209.161.6/api/resolve_dispute.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dispute_id, decision }),
    });

    const data = await res.json();

    if (data.message) {
      setDisputes(prev => prev.filter(d => d.id !== dispute_id));
    } else {
      alert(data.error || "Action failed.");
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-4">Admin Panel: Disputes</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {disputes.length === 0 ? (
          <p className="text-gray-600 italic">No pending disputes.</p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">User</th>
                <th className="p-2">Correction Index</th>
                <th className="p-2">Reason</th>
                <th className="p-2">Submitted</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-2">{d.username}</td>
                  <td className="p-2">{d.correction_index}</td>
                  <td className="p-2">{d.reason}</td>
                  <td className="p-2 text-gray-500">{new Date(d.created_at).toLocaleString()}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => resolveDispute(d.id, 'accepted')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                    >
                      Accept (-1)
                    </button>
                    <button
                      onClick={() => resolveDispute(d.id, 'rejected')}
                      className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                    >
                      Reject (-5)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default AdminPanelPage;
