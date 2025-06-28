import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig } from 'wagmi';
import { config } from './config/wagmi';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import NFTMinting from './pages/NFTMinting';
import Education from './pages/Education';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mint" element={<NFTMinting />} />
              <Route path="/education" element={<Education />} />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1e293b',
                  color: '#f1f5f9',
                  border: '1px solid #475569'
                }
              }}
            />
          </div>
        </Router>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;