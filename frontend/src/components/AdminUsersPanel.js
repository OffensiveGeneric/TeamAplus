// src/components/AdminUsersPanel.js
import { useEffect, useState } from 'react';

const AdminUsersPanel = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://134.209.161.6/api/get_users.php')
      .then(res => res.json())
      .then(setUsers);
  }, []);

  const promoteUser = async (id) => {
    await fetch('http://134.209.161.6/api/promote_user.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: id }),
    });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'admin' } : u));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Username</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">
                {u.role !== 'admin' && (
                  <button
                    onClick={() => promoteUser(u.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    Promote to Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersPanel;
