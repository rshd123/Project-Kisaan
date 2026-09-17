# API Endpoints

Base URL: `http://localhost:5000`

---

## Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check — returns server status and available features |

---

## Crop Diagnosis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/diagnose/` | Upload a plant leaf image + farmer name, returns AI diagnosis in Kannada and English |

---

## Market Prices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prices/?state=&market=&commodity=` | Scrapes live weekly commodity prices from Agmarknet for a given state, market, and crop |

---

## Voice AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/voice/query` | Full voice pipeline — uploads audio, transcribes speech, generates AI response, returns voice reply |
| POST | `/api/voice/transcribe` | Converts uploaded audio to text using Google Speech-to-Text |
| POST | `/api/voice/synthesize` | Converts text to speech audio in the specified language |
| GET | `/api/voice/status` | Checks if Google Cloud APIs are available (production vs demo mode) |
| GET | `/api/voice/languages` | Lists all 11 supported Indian languages |
| GET | `/api/voice/voices/:language` | Returns available TTS voices for a specific language |
| GET | `/api/voice/test` | Tests voice AI with a sample Hindi farming greeting |
| POST | `/api/voice/reset-cache` | Resets the Google Cloud availability cache (for retesting) |
