# 🎤 Voice AI Setup Guide for Project Kisan

## Overview
This guide helps you set up voice-first interaction using Google Cloud Vertex AI Speech services, enabling farmers to interact entirely through voice in local dialects.

## Features Implemented
- ✅ **Speech-to-Text**: Convert farmer's voice to text in 11+ Indian languages
- ✅ **Text-to-Speech**: Generate clear voice responses in local dialects  
- ✅ **Multi-language Support**: Hindi, Bengali, Telugu, Marathi, Tamil, and more
- ✅ **Agricultural Context**: AI understands farming-specific queries
- ✅ **Real-time Processing**: Fast voice interactions
- ✅ **Error Handling**: Graceful fallbacks for unclear audio

## Supported Languages
- **Hindi (hi-IN)** - हिंदी
- **English India (en-IN)** - English
- **Bengali (bn-IN)** - বাংলা
- **Telugu (te-IN)** - తెలుగు
- **Marathi (mr-IN)** - मराठी
- **Tamil (ta-IN)** - தமிழ்
- **Gujarati (gu-IN)** - ગુજરાતી
- **Kannada (kn-IN)** - ಕನ್ನಡ
- **Malayalam (ml-IN)** - മലയാളം
- **Punjabi (pa-IN)** - ਪੰਜਾਬੀ
- **Odia (or-IN)** - ଓଡିଆ

## Prerequisites

### 1. Google Cloud Setup
1. Create a Google Cloud Project
2. Enable the following APIs:
   - Speech-to-Text API
   - Text-to-Speech API
   - Vertex AI API
3. Create a Service Account with the following roles:
   - Cloud Speech Client
   - Cloud Text-to-Speech Client
   - Vertex AI User
4. Download the service account key JSON file

### 2. Environment Configuration
1. Copy `.env.example` to `.env`
2. Fill in your Google Cloud project details:
   ```bash
   PROJECT_ID=your-google-cloud-project-id
   LOCATION=us-central1
   ```
3. Place your service account key file as `project-kisan-key.json` in the backend folder

## Installation

### Backend Setup
```bash
cd backend
npm install @google-cloud/speech @google-cloud/text-to-speech
npm install  # Install all dependencies
```

### Frontend Setup
```bash
cd frontend
npm install  # Install frontend dependencies
```

## Usage

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Voice Functionality
```bash
cd backend
node test-voice.js
```

## API Endpoints

### Voice Query Processing
```http
POST /api/voice/query
Content-Type: multipart/form-data

Parameters:
- audio: Audio file (WebM, MP3, WAV)
- language: Language code (e.g., 'hi-IN')
- location: Farmer's location
- season: Current season
- crop: Crop type
- experience: Farmer's experience level
```

### Text-to-Speech
```http
POST /api/voice/synthesize
Content-Type: application/json

{
  "text": "Text to convert",
  "language": "hi-IN",
  "gender": "NEUTRAL"
}
```

### Speech-to-Text Only
```http
POST /api/voice/transcribe
Content-Type: multipart/form-data

Parameters:
- audio: Audio file
- language: Language code
- encoding: Audio encoding
- sampleRate: Sample rate
```

### Get Supported Languages
```http
GET /api/voice/languages
```

## Frontend Component Usage

The `VoiceChat` component provides a complete voice interface:

```jsx
import VoiceChat from './components/VoiceChat.jsx';

function App() {
  return <VoiceChat />;
}
```

## Features for Farmers

### 1. Voice Recording
- Click microphone button to start recording
- Speak naturally in your preferred language
- AI processes speech and provides voice response

### 2. Context Awareness
- Set your location, season, crop type
- AI provides relevant agricultural advice
- Responses tailored to Indian farming conditions

### 3. Multi-language Support
- Switch between 11+ Indian languages
- Voice responses in your selected language
- Automatic language detection fallback

### 4. Conversation History
- View past conversations
- Replay AI responses
- Clear conversation when needed

## Troubleshooting

### Common Issues

#### 1. "Speech recognition failed"
- Check microphone permissions
- Ensure stable internet connection
- Try speaking more clearly
- Check if language is supported

#### 2. "Driver setup failed" (for web scraping)
- Chrome driver is already configured for Windows
- No additional setup needed for voice features

#### 3. "Google Cloud authentication failed"
- Verify service account key file location
- Check PROJECT_ID in .env file
- Ensure APIs are enabled in Google Cloud Console

#### 4. Audio not playing
- Check browser audio permissions
- Verify speakers/headphones are connected
- Try refreshing the page

### Performance Tips

1. **Audio Quality**: Use clear, noise-free audio for best recognition
2. **Internet**: Stable internet required for real-time processing
3. **Browser**: Use modern browsers (Chrome, Firefox, Safari)
4. **Microphone**: Use good quality microphone for better accuracy

## Customization

### Adding New Languages
1. Add language code to `SUPPORTED_LANGUAGES` in `voiceAI.js`
2. Add error messages in `getErrorMessage()` function
3. Test with sample audio

### Modifying AI Responses
Edit the `createAgriculturalPrompt()` function in `voiceAI.js` to customize how the AI responds to farming queries.

### Voice Settings
Adjust voice parameters in the `textToSpeech()` function:
- `speakingRate`: Speech speed (0.25 to 4.0)
- `pitch`: Voice pitch (-20.0 to 20.0)
- `volumeGainDb`: Volume level (-96.0 to 16.0)

## Security Considerations

1. **API Keys**: Keep Google Cloud credentials secure
2. **Audio Data**: Voice recordings are processed but not stored permanently
3. **HTTPS**: Use HTTPS in production for secure audio transmission
4. **Rate Limiting**: Implement rate limiting for production use

## Production Deployment

### Environment Variables
```bash
PROJECT_ID=your-production-project-id
LOCATION=us-central1
NODE_ENV=production
VITE_API_URL=https://your-domain.com
```

### Docker Support (Optional)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Support

For issues or questions:
1. Check console logs for error details
2. Verify Google Cloud API quotas
3. Test with different audio formats
4. Ensure service account has required permissions

## Future Enhancements

- [ ] Offline voice processing
- [ ] Voice authentication
- [ ] Custom wake words
- [ ] Voice shortcuts for common queries
- [ ] Integration with regional agricultural databases
