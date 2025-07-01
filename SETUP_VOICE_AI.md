# 🚀 Quick Setup Guide for Voice AI

## ⚠️ Required: Enable Google Cloud APIs

Your error shows that you need to enable the Google Cloud APIs. Follow these steps:

### 1. Enable Required APIs
Visit these links and click "Enable" for your project (867409230358):

1. **Text-to-Speech API**: 
   https://console.developers.google.com/apis/api/texttospeech.googleapis.com/overview?project=867409230358

2. **Speech-to-Text API**: 
   https://console.developers.google.com/apis/api/speech.googleapis.com/overview?project=867409230358

3. **Vertex AI API**: 
   https://console.developers.google.com/apis/api/aiplatform.googleapis.com/overview?project=867409230358

### 2. Wait for Propagation
After enabling the APIs, wait 2-3 minutes for the changes to propagate.

### 3. Test Again
```bash
cd backend
node test-voice.js
```

## 🎯 What You've Built

### Voice-First Features:
- **🎤 Speech-to-Text**: Converts farmer's voice to text in 11+ Indian languages
- **🔊 Text-to-Speech**: Generates voice responses in local dialects
- **🤖 AI Integration**: Uses Vertex AI for intelligent agricultural advice
- **🌍 Multi-language**: Hindi, Bengali, Telugu, Marathi, Tamil, etc.
- **📱 Real-time**: Instant voice processing and responses

### API Endpoints Created:
- `POST /api/voice/query` - Complete voice interaction
- `POST /api/voice/transcribe` - Speech-to-text only
- `POST /api/voice/synthesize` - Text-to-speech only
- `GET /api/voice/languages` - List supported languages
- `GET /api/voice/voices/:language` - Available voices per language

### Frontend Components:
- `VoiceChat.jsx` - Complete voice interface for farmers
- Microphone recording with visual feedback
- Language selection for 11+ Indian languages
- Context form (location, season, crop, experience)
- Conversation history with replay functionality

## 🎪 Demo the System

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend  
```bash
cd frontend
npm run dev
```

### 3. Open Browser
Navigate to: http://localhost:5173

### 4. Test Voice Interaction
1. Click the microphone button 🎤
2. Say something like: "मेरी गेहूं की फसल में कीड़े लग गए हैं, क्या करूं?"
3. AI will respond with agricultural advice in voice

## 🌟 Example Interactions

### Hindi Example:
**Farmer**: "मेरे टमाटर के पौधे पीले हो रहे हैं"  
**AI Response**: "टमाटर के पीले पत्ते कई कारणों से हो सकते हैं। पानी की कमी, नाइट्रोजन की कमी, या बीमारी हो सकती है..."

### English Example:  
**Farmer**: "What is the best time to plant rice in Punjab?"  
**AI Response**: "In Punjab, the best time to plant rice is during the kharif season, typically from June to July..."

## 🛠️ Technical Architecture

```
Frontend (React) → Voice Recording → Backend API
     ↓
Google Cloud Speech-to-Text → Text Processing
     ↓  
Vertex AI (Gemini) → Agricultural AI Response
     ↓
Google Cloud Text-to-Speech → Voice Response
     ↓
Frontend → Audio Playback for Farmer
```

## 🔧 Troubleshooting

### Common Issues:
1. **API Not Enabled**: Follow the links above to enable APIs
2. **Microphone Access**: Allow microphone permissions in browser
3. **Audio Not Playing**: Check browser audio permissions
4. **Language Not Supported**: Use one of the 11 supported Indian languages

## 🎉 Success Indicators

When working correctly, you should see:
- ✅ APIs enabled in Google Cloud Console
- ✅ Backend server running without errors
- ✅ Frontend showing microphone button
- ✅ Voice recording with visual feedback
- ✅ AI responses in farmer's language
- ✅ Audio playback of responses

## 📞 Next Steps

1. **Enable the APIs** (most important!)
2. Test with different languages
3. Try various farming questions
4. Customize AI responses for your region
5. Add more local dialects if needed

Your voice-first agricultural assistant is ready to help farmers overcome literacy barriers! 🌾
