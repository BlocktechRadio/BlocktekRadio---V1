import React, { useState, useEffect } from 'react';
import { 
  Music, Upload, List, BarChart3, Settings, Users, 
  Play, Pause, Trash2, Search, Radio, Clock, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLogin from '../components/AdminLogin';

interface Track {
  id: number;
  title: string;
  artist: string;
  filename: string;
  duration: number;
  uploadedAt: string;
}

interface User {
  id: number;
  wallet_address: string;
  username: string;
  email: string;
  tokens_earned: number;
  listening_hours: number;
  nfts_owned: number;
  rank_position: number;
  streak_days: number;
  last_activity: string;
  created_at: string;
}

const Admin = () => {
  const { isAdminAuthenticated, adminToken, logoutAdmin, loading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [backgroundStreamDuration, setBackgroundStreamDuration] = useState(30);
  
  const sidebarItems = [
    { id: 'users', label: 'Connected Users', icon: Users },
    { id: 'upload', label: 'Upload Music', icon: Upload },
    { id: 'playlist', label: 'Manage Playlist', icon: List },
    { id: 'background-stream', label: 'Background Radio', icon: Radio },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadTracks();
      loadUsers();
    }
  }, [isAdminAuthenticated]);

  const loadTracks = async () => {
    try {
      // Remove auth header for reading playlist - it's public data
      const response = await fetch('http://localhost:5001/api/admin/playlist');
      const data = await response.json();
      setTracks(data);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('http://localhost:5001/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        loadTracks();
        (e.target as HTMLFormElement).reset();
        alert('Track uploaded successfully!');
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      alert('Upload failed: ' + error);
    } finally {
      setIsUploading(false);
    }
  };

  const scheduleBackgroundStream = async (trackId: number) => {
    try {
      // Validate duration (minimum 5 minutes, maximum 1440 minutes = 24 hours)
      const validDuration = Math.min(Math.max(backgroundStreamDuration, 5), 1440);
      
      const response = await fetch('http://localhost:5001/api/admin/background-stream/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          trackId,
          duration: validDuration,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Background stream scheduled for ${validDuration} minutes! Track will loop continuously.`);
      } else {
        alert('Failed to schedule background stream: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to schedule background stream:', error);
      alert('Failed to schedule background stream');
    }
  };

  const startContinuousStream = async (trackId: number) => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/background-stream/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          trackId,
          duration: 999999, // Very long duration for continuous play
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Continuous background stream started! Track will loop indefinitely.');
      } else {
        alert('Failed to start continuous stream: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to start continuous stream:', error);
      alert('Failed to start continuous stream');
    }
  };

  const stopBackgroundStream = async () => {
    try {
      await fetch('http://localhost:5001/api/admin/background-stream/stop', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      alert('Background stream stopped!');
    } catch (error) {
      console.error('Failed to stop background stream:', error);
    }
  };

  const playTrack = async (trackId: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/stream/play/${trackId}`, {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        setCurrentTrack(result.track);
      }
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const deleteTrack = async (trackId: number) => {
    if (!confirm('Are you sure you want to delete this track?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/admin/track/${trackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      
      if (response.ok) {
        loadTracks();
        alert('Track deleted successfully!');
      }
    } catch (error) {
      console.error('Failed to delete track:', error);
    }
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex pt-16">
      {/* Sidebar */}
      <div className="w-64 bg-black/50 backdrop-blur-sm border-r border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-purple-400" />
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
          <button
            onClick={logoutAdmin}
            className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-purple-600/20'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <AnimatePresence mode="wait">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Connected Users</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    onClick={loadUsers}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No users found. Users will appear here when they connect their wallets.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Wallet</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Tokens</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Hours</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">NFTs</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Streak</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Last Active</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-white font-medium">
                                  {user.username || 'Anonymous'}
                                </div>
                                {user.email && (
                                  <div className="text-gray-400 text-sm">{user.email}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-300 font-mono text-sm">
                                {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-green-400 font-semibold">
                                {user.tokens_earned.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-blue-400">
                                {user.listening_hours.toFixed(1)}h
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-purple-400">
                                {user.nfts_owned}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-yellow-400">
                                {user.streak_days} days
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-sm">
                              {new Date(user.last_activity).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-purple-400">{users.length}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Tokens</h3>
                  <p className="text-3xl font-bold text-green-400">
                    {users.reduce((sum, user) => sum + user.tokens_earned, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Hours</h3>
                  <p className="text-3xl font-bold text-blue-400">
                    {users.reduce((sum, user) => sum + user.listening_hours, 0).toFixed(1)}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Active Today</h3>
                  <p className="text-3xl font-bold text-cyan-400">
                    {users.filter(user => {
                      const lastActive = new Date(user.last_activity);
                      const today = new Date();
                      return lastActive.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Background Stream Tab */}
          {activeTab === 'background-stream' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Background Radio Control</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stream Controls */}
                <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Stream Controls</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stream Duration (minutes)
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          value={backgroundStreamDuration}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 5;
                            // Limit to reasonable values: 5 minutes to 24 hours
                            const clampedValue = Math.min(Math.max(value, 5), 1440);
                            setBackgroundStreamDuration(clampedValue);
                          }}
                          min="5"
                          max="1440"
                          className="w-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                        />
                        <span className="text-gray-400">minutes (5-1440 max)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum 24 hours. Tracks loop automatically within the duration.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={stopBackgroundStream}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Pause className="h-5 w-5" />
                        <span>Stop Background Stream</span>
                      </button>
                      
                      <div className="text-center text-xs text-gray-400">
                        Stream automatically loops tracks for continuous playback
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Tracks for Background Stream */}
                <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Available Tracks</h3>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium text-sm truncate">{track.title}</div>
                          <div className="text-gray-400 text-xs truncate">{track.artist}</div>
                        </div>
                        <div className="flex space-x-2 ml-3">
                          <button
                            onClick={() => scheduleBackgroundStream(track.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 text-xs"
                          >
                            <Radio className="h-3 w-3" />
                            <span>Timed</span>
                          </button>
                          <button
                            onClick={() => startContinuousStream(track.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 text-xs"
                          >
                            <Play className="h-3 w-3" />
                            <span>Continuous</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {tracks.length === 0 && (
                    <div className="text-center py-8">
                      <Music className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No tracks available. Upload some music first!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Existing tabs remain the same */}
          {activeTab === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl"
            >
              <h2 className="text-3xl font-bold text-white mb-8">Upload Music</h2>
              
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                <form onSubmit={handleUpload} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Track Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter track title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Artist Name
                    </label>
                    <input
                      type="text"
                      name="artist"
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter artist name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Audio File
                    </label>
                    <input
                      type="file"
                      name="audio"
                      accept=".mp3,.wav,.ogg,.m4a,.aac,.flac,.wma,audio/*"
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Supported formats: MP3, WAV, OGG, M4A, AAC, FLAC, WMA (Max: 50MB)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-all"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Track'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'playlist' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Manage Playlist</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search tracks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden">
                {filteredTracks.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No tracks found. Upload some music to get started!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700">
                    {filteredTracks.map((track, index) => (
                      <div
                        key={track.id}
                        className={`p-6 flex items-center justify-between hover:bg-white/5 transition-colors ${
                          currentTrack?.id === track.id ? 'bg-purple-600/20' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-gray-400 font-mono text-sm w-8">
                            #{index + 1}
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{track.title}</h3>
                            <p className="text-gray-400 text-sm">{track.artist}</p>
                            <p className="text-gray-500 text-xs">
                              Uploaded: {new Date(track.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => playTrack(track.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteTrack(track.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Tracks</h3>
                  <p className="text-3xl font-bold text-purple-400">{tracks.length}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Currently Playing</h3>
                  <p className="text-lg text-gray-300">{currentTrack?.title || 'None'}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Artists</h3>
                  <p className="text-3xl font-bold text-cyan-400">
                    {new Set(tracks.map(t => t.artist)).size}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
              <p className="text-gray-400">This feature is under development</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
