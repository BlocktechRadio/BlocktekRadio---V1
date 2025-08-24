import React, { useState } from 'react';
import axios from 'axios';

const AdminDashboard: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://blocktekradio-v1.onrender.com';

  const handleAddYouTubeLink = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${backendUrl}/api/admin/youtube-stream`,
        { youtubeUrl },
        {
          headers: {
            Authorization: `Bearer admin-authenticated-blocktekradio`,
          },
        }
      );

      setMessage(`YouTube track added: ${response.data.track.title}`);
      setYoutubeUrl('');
    } catch (error: any) {
      console.error('Failed to add YouTube track:', error);
      setMessage(error.response?.data?.error || 'Failed to add YouTube track');
    }
  };

  return (
    <div className="admin-dashboard">
      {/* ...existing admin dashboard code... */}

      <div className="youtube-link-form">
        <h2 className="text-lg font-bold mb-4">Add YouTube Track</h2>
        <form onSubmit={handleAddYouTubeLink}>
          <input
            type="url"
            placeholder="Enter YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="border rounded p-2 w-full mb-2"
            required
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Add YouTube Track
          </button>
        </form>
        {message && <p className="mt-2 text-sm text-green-500">{message}</p>}
      </div>

      {/* ...existing admin dashboard code... */}
    </div>
  );
};

export default AdminDashboard;