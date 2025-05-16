// src/pages/AdminPanelPage.js
import { useState } from 'react';
import AdminUsersPanel from '../components/AdminUsersPanel';
import AdminDisputesPanel from '../components/AdminDisputesPanel';
import AdminBannedWordsPanel from '../components/AdminBannedWordsPanel';
import Layout from '../components/Layout';

const AdminPanelPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <Layout>
      <div className="flex max-w-6xl mx-auto">
        <div className="w-1/4 pr-4 border-r">
          <ul className="space-y-2">
            <li>
              <button onClick={() => setActiveTab('users')} className="w-full text-left px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
                Users
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('disputes')} className="w-full text-left px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
                Disputes
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('banned')} className="w-full text-left px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
                Banned Words
              </button>
            </li>
          </ul>
        </div>

        <div className="w-3/4 pl-6">
          {activeTab === 'users' && <AdminUsersPanel />}
          {activeTab === 'disputes' && <AdminDisputesPanel />}
          {activeTab === 'banned' && <AdminBannedWordsPanel />}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanelPage;
