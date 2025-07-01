// src/components/VoiceChat.jsx - Enhanced Voice-first interaction component
import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const VoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [supportedLanguages, setSupportedLanguages] = useState({});
  const [userContext, setUserContext] = useState({
    location: '',
    season: '',
    crop: '',
    experience: ''
  });
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState('');
  const [systemStatus, setSystemStatus] = useState({ mode: 'unknown', googleCloudAvailable: false });
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Load supported languages on component mount
  useEffect(() => {
    fetchSupportedLanguages();
    checkApiConnection();
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/voice/status`);
      if (response.data.success) {
        setSystemStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error checking system status:', error);
    }
  };

  const fetchSupportedLanguages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/voice/languages`);
      if (response.data.success) {
        setSupportedLanguages(response.data.data.languages);
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      setConnectionStatus('disconnected');
      setError('Cannot connect to voice service. Please check your internet connection.');
    }
  };

  const checkApiConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
      if (response.data.status === 'OK') {
        setConnectionStatus('connected');
        setError('');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setError('Backend server is not responding. Please ensure the server is running.');
    }
  };

  // Audio level monitoring for visual feedback
  const startAudioLevelMonitoring = useCallback((stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    
    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateAudioLevel = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel(Math.min(average / 128 * 100, 100));
      
      if (isRecording) {
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      }
    };
    
    updateAudioLevel();
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = handleRecordingStop;
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start audio level monitoring
      startAudioLevelMonitoring(stream);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Microphone access denied. Please allow microphone permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setAudioLevel(0);
      
      // Stop audio level monitoring
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const handleRecordingStop = async () => {
    if (audioChunksRef.current.length === 0) {
      setError('No audio recorded. Please try again.');
      return;
    }
    
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
    
    // Check if audio is too short
    if (audioBlob.size < 1000) {
      setError('Recording too short. Please speak for at least 2-3 seconds.');
      return;
    }
    
    await processVoiceQuery(audioBlob);
  };

  const processVoiceQuery = async (audioBlob) => {
    setIsProcessing(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', selectedLanguage);
      formData.append('location', userContext.location || 'India');
      formData.append('season', userContext.season || 'Current season');
      formData.append('crop', userContext.crop || 'General farming');
      formData.append('experience', userContext.experience || 'Varied');

      const response = await axios.post(`${API_BASE_URL}/api/voice/query`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 45000 // 45 second timeout
      });

      if (response.data.success) {
        const { userQuery, response: aiResponse, audio, isMock } = response.data.data;
        
        // Add to conversation
        const newMessage = {
          id: Date.now(),
          userQuery,
          aiResponse,
          audio,
          timestamp: new Date().toISOString(),
          language: selectedLanguage,
          context: userContext,
          isDemoMode: isMock || false
        };
        
        setConversation(prev => [...prev, newMessage]);
        
        // Play AI response (in demo mode, this will be silent/placeholder)
        if (audio && !isMock) {
          playAudioResponse(audio);
        } else if (isMock) {
          // Show a message that audio is not available in demo mode
          console.log('Demo mode: Audio playback not available');
        }
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Error processing voice query:', error);
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Audio file too large. Please record a shorter message.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid audio format. Please try recording again.';
      }
      
      setError(errorMessage);
      
      const errorMsg = {
        id: Date.now(),
        userQuery: 'Error occurred',
        aiResponse: errorMessage,
        timestamp: new Date().toISOString(),
        language: selectedLanguage,
        isError: true
      };
      
      setConversation(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioResponse = (base64Audio) => {
    try {
      const audioBlob = new Blob([Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))], {
        type: 'audio/mp3'
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play()
          .then(() => {
            console.log('Audio played successfully');
          })
          .catch(e => {
            console.error('Audio play error:', e);
            setError('Unable to play audio response. Please check your speakers.');
          });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setError('Error playing audio response.');
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setError('');
  };

  const retryConnection = () => {
    setError('');
    checkApiConnection();
    fetchSupportedLanguages();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Demo Mode Alert */}
        {systemStatus.mode === 'demo' && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <span className="mr-2">ℹ️</span>
              <div>
                <strong>Demo Mode Active:</strong> Voice AI is working with sample responses. 
                <a 
                  href="https://console.developers.google.com/apis/api/texttospeech.googleapis.com/overview" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 underline hover:text-blue-900"
                >
                  Enable Google Cloud APIs
                </a> for full functionality.
              </div>
            </div>
          </div>
        )}

        {/* Connection Status Alert */}
        {connectionStatus === 'disconnected' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>Voice service is not available. Please check your connection.</span>
              </div>
              <button
                onClick={retryConnection}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError('')}
                className="text-orange-700 hover:text-orange-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            🎤 FarmMitra - आवाज़ से बात करें
          </h1>
          <p className="text-gray-600 mb-4">
            अपनी आवाज़ में सवाल पूछें, हमारा AI किसान मित्र आपकी मदद करेगा
          </p>
          
          {/* Language Selection */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                disabled={connectionStatus === 'disconnected'}
              >
                {Object.entries(supportedLanguages).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Context Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Location"
              value={userContext.location}
              onChange={(e) => setUserContext(prev => ({ ...prev, location: e.target.value }))}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Season"
              value={userContext.season}
              onChange={(e) => setUserContext(prev => ({ ...prev, season: e.target.value }))}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Crop"
              value={userContext.crop}
              onChange={(e) => setUserContext(prev => ({ ...prev, crop: e.target.value }))}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />
            <select
              value={userContext.experience}
              onChange={(e) => setUserContext(prev => ({ ...prev, experience: e.target.value }))}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="">Experience</option>
              <option value="नया किसान">New Farmer</option>
              <option value="अनुभवी">Experienced</option>
              <option value="विशेषज्ञ">Expert</option>
            </select>
          </div>
        </div>

        {/* Voice Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-center items-center space-x-6">
            {/* Main Recording Button */}
            <div className="relative">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || connectionStatus === 'disconnected'}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all transform hover:scale-105 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-300' 
                    : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-300'
                } ${isProcessing || connectionStatus === 'disconnected' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRecording ? '🛑' : '🎤'}
              </button>
              
              {/* Audio Level Indicator */}
              {isRecording && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-400 transition-all duration-100"
                    style={{ width: `${Math.min(audioLevel, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700">
                {isRecording ? 'Speaking...' : 
                 isProcessing ? 'Processing...' : 
                 connectionStatus === 'disconnected' ? 'Service Unavailable' :
                 'Press mic to speak'}
              </p>
              
              {isProcessing && (
                <div className="flex justify-center mt-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                </div>
              )}
              
              {/* Recording Tips */}
              {!isRecording && !isProcessing && (
                <div className="mt-2 text-sm text-gray-500">
                  <p>💡 Tips: Speak clearly in a quiet environment</p>
                  <p>🔊 Audio will be played automatically after processing</p>
                </div>
              )}
            </div>

            <button
              onClick={clearConversation}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <span>🗑️</span>
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Conversation History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Conversation History
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>🔊</span>
              <span>Click on responses to replay</span>
            </div>
          </div>
          
          {conversation.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="mb-4">
                <span className="text-6xl">🎤</span>
              </div>
              <p className="text-lg">No conversations yet</p>
              <p className="text-sm mt-2">
                Press the mic button to start talking
              </p>
              <div className="mt-4 text-xs text-gray-400">
                <p>✓ 11+ Indian languages supported</p>
                <p>✓ Real-time voice processing</p>
                <p>✓ Agricultural expertise</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversation.map((message, index) => (
                <div key={message.id} className={`p-4 rounded-lg transition-all hover:shadow-md ${
                  message.isError ? 'bg-red-50 border-l-4 border-red-400' : 
                  message.isDemoMode ? 'bg-blue-50 border-l-4 border-blue-400' :
                  index % 2 === 0 ? 'bg-green-50 border-l-4 border-green-400' : 
                  'bg-gray-50 border-l-4 border-gray-400'
                }`}>
                  {/* User Query */}
                  {message.userQuery && message.userQuery !== 'Error occurred' && (
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <span className="text-blue-600 font-medium text-sm flex items-center">
                          👤 You said:
                        </span>
                        <span className="ml-2 text-xs text-gray-400">
                          {supportedLanguages[message.language]}
                        </span>
                      </div>
                      <p className="text-gray-800 bg-white p-2 rounded italic">
                        "{message.userQuery}"
                      </p>
                    </div>
                  )}
                  
                  {/* AI Response */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-green-600 font-medium text-sm flex items-center">
                        🤖 AI Response:
                      </span>
                      {message.audio && !message.isError && !message.isDemoMode && (
                        <button
                          onClick={() => playAudioResponse(message.audio)}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full hover:bg-green-200 transition-colors flex items-center space-x-1"
                        >
                          <span>🔊</span>
                          <span>Play</span>
                        </button>
                      )}
                      {message.isDemoMode && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Demo Mode
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800 bg-white p-3 rounded shadow-sm">
                      {message.aiResponse}
                    </p>
                  </div>
                  
                  {/* Context Info */}
                  {message.context && !message.isError && (
                    <div className="text-xs text-gray-500 mb-2">
                      <span className="font-medium">Context:</span>
                      {message.context.location && <span> 📍 {message.context.location}</span>}
                      {message.context.crop && <span> 🌱 {message.context.crop}</span>}
                      {message.context.season && <span> 🌤️ {message.context.season}</span>}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(message.timestamp).toLocaleString()}</span>
                    {message.isError && (
                      <span className="text-red-500 font-medium">⚠️ Error</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Quick Actions */}
          {conversation.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Total conversations: {conversation.length}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={clearConversation}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      const lastMessage = conversation[conversation.length - 1];
                      if (lastMessage?.audio && !lastMessage.isError) {
                        playAudioResponse(lastMessage.audio);
                      }
                    }}
                    className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                    disabled={conversation.length === 0 || conversation[conversation.length - 1]?.isError}
                  >
                    🔊 Replay Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden audio element for playing responses */}
        <audio 
          ref={audioRef} 
          style={{ display: 'none' }}
          onError={() => setError('Error playing audio. Please check your speakers.')}
        />
      </div>
    </div>
  );
};

export default VoiceChat;
