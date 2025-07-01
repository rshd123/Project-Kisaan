// src/components/VoiceChat.jsx - Voice-first interaction component
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const VoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const [supportedLanguages, setSupportedLanguages] = useState({});
  const [userContext, setUserContext] = useState({
    location: '',
    season: '',
    crop: '',
    experience: ''
  });
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Load supported languages on component mount
  useEffect(() => {
    fetchSupportedLanguages();
  }, []);

  const fetchSupportedLanguages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/voice/languages`);
      if (response.data.success) {
        setSupportedLanguages(response.data.data.languages);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
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
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('माइक्रोफोन एक्सेस नहीं मिल सका। कृपया अनुमति दें।');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleRecordingStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
    await processVoiceQuery(audioBlob);
  };

  const processVoiceQuery = async (audioBlob) => {
    setIsProcessing(true);
    
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
        timeout: 30000 // 30 second timeout
      });

      if (response.data.success) {
        const { userQuery, response: aiResponse, audio } = response.data.data;
        
        // Add to conversation
        const newMessage = {
          id: Date.now(),
          userQuery,
          aiResponse,
          audio,
          timestamp: new Date().toISOString(),
          language: selectedLanguage
        };
        
        setConversation(prev => [...prev, newMessage]);
        
        // Play AI response
        if (audio) {
          playAudioResponse(audio);
        }
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Error processing voice query:', error);
      const errorMessage = getErrorMessage(selectedLanguage);
      setConversation(prev => [...prev, {
        id: Date.now(),
        userQuery: 'Error occurred',
        aiResponse: errorMessage,
        timestamp: new Date().toISOString(),
        language: selectedLanguage,
        isError: true
      }]);
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
        audioRef.current.play().catch(e => console.error('Audio play error:', e));
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const getErrorMessage = (languageCode) => {
    const errorMessages = {
      'hi-IN': 'माफ करें, कुछ गलती हुई है। कृपया दोबारा कोशिश करें।',
      'en-IN': 'Sorry, something went wrong. Please try again.',
      'bn-IN': 'দুঃখিত, কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      'te-IN': 'క్షమించండి, ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి।'
    };
    return errorMessages[languageCode] || errorMessages['en-IN'];
  };

  const clearConversation = () => {
    setConversation([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            🎤 आवाज़ से बात करें / Voice Chat
          </h1>
          <p className="text-gray-600 mb-4">
            अपनी आवाज़ में सवाल पूछें, हमारा AI आपकी मदद करेगा
          </p>
          
          {/* Language Selection */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                भाषा चुनें / Select Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
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
              placeholder="आपका स्थान / Location"
              value={userContext.location}
              onChange={(e) => setUserContext(prev => ({ ...prev, location: e.target.value }))}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="मौसम / Season"
              value={userContext.season}
              onChange={(e) => setUserContext(prev => ({ ...prev, season: e.target.value }))}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="फसल / Crop"
              value={userContext.crop}
              onChange={(e) => setUserContext(prev => ({ ...prev, crop: e.target.value }))}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />
            <select
              value={userContext.experience}
              onChange={(e) => setUserContext(prev => ({ ...prev, experience: e.target.value }))}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="">अनुभव / Experience</option>
              <option value="नया किसान">नया किसान / New Farmer</option>
              <option value="अनुभवी">अनुभवी / Experienced</option>
              <option value="विशेषज्ञ">विशेषज्ञ / Expert</option>
            </select>
          </div>
        </div>

        {/* Voice Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all transform hover:scale-105 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-green-500 hover:bg-green-600'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRecording ? '🛑' : '🎤'}
            </button>
            
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700">
                {isRecording ? 'बोल रहे हैं... / Speaking...' : 
                 isProcessing ? 'प्रोसेसिंग... / Processing...' : 
                 'बोलने के लिए माइक दबाएं / Press mic to speak'}
              </p>
              {isProcessing && (
                <div className="flex justify-center mt-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                </div>
              )}
            </div>

            <button
              onClick={clearConversation}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Conversation History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            बातचीत का इतिहास / Conversation History
          </h2>
          
          {conversation.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>अभी तक कोई बातचीत नहीं हुई / No conversations yet</p>
              <p className="text-sm mt-2">
                माइक बटन दबाकर बात शुरू करें / Press the mic button to start talking
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversation.map((message) => (
                <div key={message.id} className={`p-4 rounded-lg ${message.isError ? 'bg-red-50' : 'bg-gray-50'}`}>
                  {message.userQuery && (
                    <div className="mb-2">
                      <p className="text-sm text-blue-600 font-medium">आपने कहा / You said:</p>
                      <p className="text-gray-800">{message.userQuery}</p>
                    </div>
                  )}
                  
                  <div className="mb-2">
                    <p className="text-sm text-green-600 font-medium">AI का जवाब / AI Response:</p>
                    <p className="text-gray-800">{message.aiResponse}</p>
                  </div>
                  
                  {message.audio && (
                    <button
                      onClick={() => playAudioResponse(message.audio)}
                      className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                    >
                      🔊 फिर से सुनें / Play Again
                    </button>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(message.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hidden audio element for playing responses */}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default VoiceChat;
