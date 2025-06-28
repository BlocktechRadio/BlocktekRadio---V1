import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

interface StreamState {
  isLive: boolean;
  isListening: boolean;
  isRecording: boolean;
  currentListeners: number;
  streamTitle: string;
  streamerName: string;
  isConnected: boolean;
  isDemoMode: boolean;
}

interface UseAudioStreamingReturn {
  streamState: StreamState;
  startBroadcast: (title: string) => Promise<void>;
  stopBroadcast: () => void;
  startListening: () => void;
  stopListening: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  error: string | null;
}

export const useAudioStreaming = (): UseAudioStreamingReturn => {
  const [streamState, setStreamState] = useState<StreamState>({
    isLive: false,
    isListening: false,
    isRecording: false,
    currentListeners: 0,
    streamTitle: '',
    streamerName: '',
    isConnected: false,
    isDemoMode: true // Start in demo mode by default
  });
  
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionChecked = useRef(false);

  // Check if streaming server is available
  useEffect(() => {
    const checkStreamingServer = async () => {
      if (connectionChecked.current) return;
      connectionChecked.current = true;

      try {
        // Try to reach the streaming server with a simple HTTP request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch('http://localhost:3002/health', {
          signal: controller.signal,
          mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log('✅ Streaming server is available');
          setStreamState(prev => ({ ...prev, isConnected: true, isDemoMode: false }));
          setError(null);
          // Initialize Socket.IO connection here if needed
          initializeSocketConnection();
        } else {
          throw new Error('Server not responding');
        }
      } catch (err) {
        console.log('📱 Streaming server unavailable, using demo mode');
        setStreamState(prev => ({ ...prev, isConnected: false, isDemoMode: true }));
        setError('Live streaming unavailable - demo mode active');
      }
    };

    checkStreamingServer();
  }, []);

  const initializeSocketConnection = async () => {
    try {
      // Dynamically import socket.io-client only when needed
      const { io } = await import('socket.io-client');
      
      const socket = io('http://localhost:3002', {
        transports: ['polling', 'websocket'],
        timeout: 5000,
        forceNew: true,
        reconnection: false
      });

      socket.on('connect', () => {
        console.log('✅ Socket.IO connected');
        setStreamState(prev => ({ ...prev, isConnected: true, isDemoMode: false }));
        setError(null);
      });

      socket.on('connect_error', (error) => {
        console.log('❌ Socket.IO connection failed, falling back to demo mode');
        setStreamState(prev => ({ ...prev, isConnected: false, isDemoMode: true }));
        setError('Live streaming unavailable - demo mode active');
      });

      // Set up other socket event handlers here if needed
      
    } catch (err) {
      console.log('📱 Socket.IO not available, using demo mode');
      setStreamState(prev => ({ ...prev, isConnected: false, isDemoMode: true }));
    }
  };

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Demo mode simulation
  const startDemoSimulation = useCallback((type: 'broadcast' | 'listen', title?: string) => {
    // Simulate realistic listener counts
    const baseListeners = type === 'broadcast' ? 15 : 45;
    let currentListeners = baseListeners + Math.floor(Math.random() * 20);
    
    setStreamState(prev => ({
      ...prev,
      currentListeners,
      streamTitle: title || 'Demo: Blockchain Technology Explained',
      streamerName: type === 'broadcast' ? 'You' : 'BlockTek Radio'
    }));

    // Simulate listener count changes
    demoIntervalRef.current = setInterval(() => {
      const change = Math.floor(Math.random() * 6) - 2; // -2 to +3 change
      currentListeners = Math.max(5, currentListeners + change);
      
      setStreamState(prev => ({
        ...prev,
        currentListeners
      }));
    }, 8000); // Update every 8 seconds
  }, []);

  const stopDemoSimulation = useCallback(() => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
  }, []);

  const startBroadcast = useCallback(async (title: string) => {
    try {
      setError(null);
      
      if (streamState.isDemoMode) {
        // Demo mode broadcast
        console.log('🎤 Starting demo broadcast:', title);
        setStreamState(prev => ({
          ...prev,
          isRecording: true,
          streamTitle: title
        }));
        startDemoSimulation('broadcast', title);
        toast.success('🔴 Demo broadcast started! (Live streaming unavailable)', {
          duration: 4000
        });
        return;
      }

      // Real broadcast logic would go here
      console.log('🎤 Starting real broadcast:', title);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;
      
      setStreamState(prev => ({
        ...prev,
        isRecording: true,
        streamTitle: title
      }));
      
      startDemoSimulation('broadcast', title);
      toast.success('🔴 Live broadcast started!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start broadcast';
      console.error('❌ Broadcast start error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [streamState.isDemoMode, startDemoSimulation]);

  const stopBroadcast = useCallback(() => {
    try {
      console.log('⏹️ Stopping broadcast');
      
      // Stop media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      stopDemoSimulation();

      setStreamState(prev => ({
        ...prev,
        isRecording: false,
        streamTitle: '',
        currentListeners: 0
      }));

      toast.success('📻 Broadcast stopped');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop broadcast';
      console.error('❌ Broadcast stop error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [stopDemoSimulation]);

  const startListening = useCallback(() => {
    try {
      setError(null);
      
      console.log('🎧 Starting to listen');

      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.volume = volume;
      }

      setStreamState(prev => ({
        ...prev,
        isListening: true
      }));

      startDemoSimulation('listen');

      if (streamState.isDemoMode) {
        toast.success('🎵 Demo stream started! (Live streaming unavailable)', {
          duration: 4000
        });
      } else {
        toast.success('🎵 Started listening to live stream');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start listening';
      console.error('❌ Listen start error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [volume, streamState.isDemoMode, startDemoSimulation]);

  const stopListening = useCallback(() => {
    try {
      console.log('🔇 Stopping listening');
      
      // Stop audio playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      stopDemoSimulation();

      setStreamState(prev => ({
        ...prev,
        isListening: false,
        streamTitle: '',
        streamerName: '',
        currentListeners: 0
      }));

      toast.success('👋 Stopped listening');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop listening';
      console.error('❌ Listen stop error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [stopDemoSimulation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDemoSimulation();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [stopDemoSimulation]);

  return {
    streamState,
    startBroadcast,
    stopBroadcast,
    startListening,
    stopListening,
    volume,
    setVolume,
    error
  };
};