import { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const SubmitTextPage = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [correctionStatus, setCorrectionStatus] = useState({});
  const [disputeIndex, setDisputeIndex] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to submit text.");
      return;
    }

    try {
      const res = await fetch('http://134.209.161.6/api/submit_text.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, text }),
      });

      const raw = await res.text();
      console.log("RAW SUBMIT RESPONSE:", raw);

      const data = JSON.parse(raw);

      if (res.ok) {
        setResult(data);
        setError('');
        const updatedUser = { ...user, credits: data.new_credit_balance };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        setError(data.error || "Submission failed.");
        setResult(null);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Unable to connect or parse response.");
    }
  };

  const handleCorrectionAction = (index, action) => {
    setCorrectionStatus(prev => ({
      ...prev,
      [index]: action
    }));
  };

  const handleDownload = async () => {
    const acceptedWords = result.original_text.split(/\s+/).map((word, i) => {
      const correction = result.corrections.find(c => c.index === i);
      const status = correctionStatus[i];
      if (correction && status === 'accepted') {
        return correction.corrected;
      }
      return word;
    });

    const correctedOutput = acceptedWords.join(' ');

    // Send action to backend and deduct 5 credits
    const res = await fetch('http://134.209.161.6/api/save_submission_result.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        action: 'download',
        cost: 5,
        result_id: result.id, // optional if you store submission IDs
      }),
    });

    const blob = new Blob([correctedOutput], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'corrected_text.txt';
    link.click();
  };

  const openDisputeModal = (index) => {
    setDisputeIndex(index);
    setDisputeReason('');
  };

  const submitDispute = async () => {
    await fetch('http://134.209.161.6/api/save_submission_result.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        action: 'dispute',
        index: disputeIndex,
        reason: disputeReason,
      }),
    });

    setCorrectionStatus(prev => ({
      ...prev,
      [disputeIndex]: 'disputed'
    }));
    setDisputeIndex(null);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side: Text input */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Text</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="12"
              className="w-full border border-gray-300 rounded p-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
              placeholder="Paste your text here..."
              required
            />
            <button
              type="submit"
              className="mt-4 w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition"
            >
              Submit for Correction
            </button>
          </form>
          {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
        </div>

        {/* Right side: Corrections and result */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Suggested Corrections</h2>

          {result ? (
            <div className="border border-gray-200 rounded p-4 bg-gray-50 text-sm">
              <h3 className="font-semibold mb-2">Corrected Text:</h3>
              <p className="mb-6 whitespace-pre-wrap">{result.corrected_text}</p>

              {Array.isArray(result.corrections) && result.corrections.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-2">Corrections:</h4>
                  <table className="w-full text-sm border-t border-gray-200 mb-4">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="p-2">Word</th>
                        <th className="p-2">Suggestion</th>
                        <th className="p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.corrections.map((corr, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2 font-mono text-gray-700">{corr.original}</td>
                          <td className="p-2 font-mono text-blue-700">{corr.corrected}</td>
                          <td className="p-2 flex space-x-2">
                            <button
                              onClick={() => handleCorrectionAction(corr.index, 'accepted')}
                              className={`px-3 py-1 rounded text-xs ${
                                correctionStatus[corr.index] === 'accepted'
                                  ? 'bg-green-700 text-white'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleCorrectionAction(corr.index, 'rejected')}
                              className={`px-3 py-1 rounded text-xs ${
                                correctionStatus[corr.index] === 'rejected'
                                  ? 'bg-gray-600 text-white'
                                  : 'bg-gray-500 text-white hover:bg-gray-600'
                              }`}
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => openDisputeModal(corr.index)}
                              className={`px-3 py-1 rounded text-xs ${
                                correctionStatus[corr.index] === 'disputed'
                                  ? 'bg-yellow-600 text-white'
                                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
                              }`}
                            >
                              Dispute
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    onClick={handleDownload}
                    className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-900"
                  >
                    Save Corrected Text (Costs 5 Credits)
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 italic">No corrections were suggested.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">Corrections will appear here after submission.</p>
          )}
        </div>
      </div>

      {/* Dispute modal */}
      {disputeIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-semibold mb-2">Dispute Correction</h2>
            <textarea
              rows={4}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="Enter your reasoning..."
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setDisputeIndex(null)}
                className="px-3 py-1 bg-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitDispute}
                className="px-3 py-1 bg-black text-white rounded text-sm"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SubmitTextPage;
