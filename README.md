<div align="center">

# Project Kisaan

### AI-Powered Agricultural Platform for Indian Farmers

---

**Project Kisaan** is an AI-powered platform designed to support Indian farmers with real-time crop price insights, government scheme information, and AI-driven crop disease diagnosis — all accessible through **voice interaction** in regional languages.

</div>

---

## Features

| Feature | Description |
|---------|-------------|
| **Crop Disease Diagnosis** | Upload a leaf image, AI identifies the disease, get treatments, prevention tips & government schemes |
| **Crop Price Trends** | Real-time price scraping from Agmarknet for mandis across Karnataka |
| **Government Schemes** | AI-powered assistant explaining subsidies, eligibility & how to apply |
| **Voice Interaction** | Speak in Kannada/Hindi, speech-to-text + text-to-speech for farmers |
| **Community Chat** | Real-time farmer-to-farmer discussions via Socket.IO |

---

## Tech Stack

<div align="center">



![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socket.io&logoColor=white)

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4-000000?style=for-the-badge&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)

![Google AI Studio](https://img.shields.io/badge/Google%20AI%20Studio-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Gemini 2.0](https://img.shields.io/badge/Gemini-2.0%20Flash-FF6D00?style=for-the-badge&logo=google&logoColor=white)
![Selenium](https://img.shields.io/badge/Selenium-4-43B02A?style=for-the-badge&logo=selenium&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-File%20Upload-000000?style=for-the-badge)

</div>

---

## Project Structure

```
project-kisaan/
├── frontend/               # React + Tailwind frontend
│   └── src/
│       ├── components/     # UI components
│       │   ├── Navbar.jsx
│       │   ├── Diagnoseform.jsx
│       │   ├── VoiceAssistant.jsx
│       │   ├── PriceTrends.jsx
│       │   ├── SchemeExplorer.jsx
│       │   └── CommunityChat.jsx
│       └── pages/          # Route pages
├── backend/                # Node.js + Express backend
│   ├── routes/             # API routes
│   │   ├── diagnosis.js    # Crop disease detection
│   │   ├── scheme.js       # Government schemes
│   │   ├── price.js        # Crop prices
│   │   ├── voice.js        # Speech-to-text
│   │   └── tts.js          # Text-to-speech
│   ├── utils/              # Utilities
│   │   ├── vertex.js       # Google AI + Supabase client
│   │   ├── diseaseLookup.js
│   │   ├── voiceResponse.js
│   │   └── priceScrapper.js
│   ├── data/
│   │   └── diseases.json   # 60 Karnataka crop diseases
│   ├── workers/
│   │   └── schemeWorker.js
│   └── .env                # Environment variables
├── docs/
│   └── ENDPOINTS.md        # API documentation
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **Google AI Studio** API key ([Get one free](https://aistudio.google.com))
- **Supabase** account ([Create project](https://supabase.com))

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/project-kisaan.git
cd project-kisaan
```

**2. Setup Backend**

```bash
cd backend
npm install
```

Create `.env` file:

```env
# Google AI Studio (free API key)
LLM_API_KEY=your-google-ai-studio-key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Server
PORT=5000
```

**3. Setup Frontend**

```bash
cd ../frontend
npm install
```

**4. Run the app**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/diagnose` | Crop disease detection (image upload) |
| `GET` | `/api/schemes` | Fetch government schemes |
| `POST` | `/api/schemes/query` | Ask about schemes |
| `GET` | `/api/prices` | Fetch crop prices |
| `POST` | `/api/voice-to-text` | Convert speech to text |
| `POST` | `/api/text-to-voice` | Convert text to speech |
| `POST` | `/api/chat` | Community chat |

Full API docs: [`docs/ENDPOINTS.md`](docs/ENDPOINTS.md)

---

## Supported Crops

<details>
<summary><strong>Click to expand full list (20+ crops)</strong></summary>

| Category | Crops |
|----------|-------|
| **Cereals** | Rice, Wheat, Maize, Jowar, Ragi, Bajra |
| **Pulses** | Toor Dal, Urad Dal, Moong Dal, Horse Gram, Green Gram |
| **Oilseeds** | Groundnut, Sunflower, Soybean, Sesame |
| **Vegetables** | Tomato, Potato, Onion, Chilli, Brinjal |
| **Fruits** | Mango, Banana, Grapes, Coconut, Areca Nut |
| **Commercial** | Cotton, Sugarcane, Tobacco, Coffee, Turmeric |

</details>

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add your feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---
