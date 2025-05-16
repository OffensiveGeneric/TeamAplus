// src/components/AdminBannedWordsPanel.js
import { useEffect, useState } from 'react';

const AdminBannedWordsPanel = () => {
  const [banned, setBanned] = useState([]);
  const [newWord, setNewWord] = useState('');

  useEffect(() => {
    fetch('http://134.209.161.6/api/get_banned_words.php')
      .then(res => res.json())
      .then(setBanned);
  }, []);

  const addWord = async () => {
    await fetch('http://134.209.161.6/api/add_banned_word.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: newWord }),
    });
    setBanned(prev => [...prev, newWord]);
    setNewWord('');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Banned Words</h2>
      <div className="mb-4 flex gap-2">
        <input
          className="border px-3 py-1 rounded text-sm"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Add a banned word"
        />
        <button
          onClick={addWord}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Add
        </button>
      </div>
      <ul className="text-sm list-disc pl-5">
        {banned.map((w, i) => <li key={i}>{w}</li>)}
      </ul>
    </div>
  );
};

export default AdminBannedWordsPanel;
