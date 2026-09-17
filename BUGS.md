# Project Kisaan - Bug Tracker

## Critical Bugs

### 1. Voice Recording Fails Silently on Permission Denial
- **File:** `frontend/src/components/VoiceChat.jsx`
- **Issue:** `navigator.mediaDevices.getUserMedia` may fail if user denies mic permission, but there's no user-facing error message shown. The recording state may get stuck.
- **Impact:** Voice tab becomes unusable with no feedback.

### 2. Mock STT Returns Random Fake Transcription
- **File:** `backend/utils/mockVoiceAI.js`
- **Issue:** When Google Cloud STT is unavailable, the mock returns hardcoded random farming queries (e.g., "What is the price of tomato today?"). The user's actual speech is completely ignored.
- **Impact:** Voice responses are irrelevant to what the farmer actually said. Feels broken.

### 3. Mock TTS Returns Empty Audio Buffer
- **File:** `backend/utils/mockVoiceAI.js`
- **Issue:** `mockTextToSpeech` returns a 44-byte silent WAV header. The frontend tries to play this as audio, resulting in silence or a play error.
- **Impact:** User hears nothing back after asking a question in demo mode.

### 4. Chatbot Calls Gemini API Directly from Browser
- **File:** `frontend/src/components/chatbot/Chatbot.jsx`
- **Issue:** The chatbot sends `VITE_AI_API` key directly from the frontend env variable. This exposes the API key in browser network tab / DevTools.
- **Impact:** Security vulnerability — API key is public to anyone who opens DevTools.

### 5. No Input Validation on Diagnosis Upload
- **File:** `backend/routes/diagnosis.js`
- **Issue:** The route accepts any file as `image` without validating file type or size on the server side. A user could upload a 50MB+ non-image file.
- **Impact:** Potential server memory exhaustion, Vertex AI errors on invalid input.

---

## Backend Bugs

### 6. Express 5 Route Error Handling
- **File:** `backend/index.js`
- **Issue:** Express 5 changed error handling semantics. Async errors in route handlers may not be caught by the existing error middleware if `next(err)` isn't called properly.
- **Impact:** Unhandled promise rejections could crash the server.

### 7. Selenium Driver Never Quits on Error
- **File:** `backend/utils/scrapeAgmarknet.js`
- **Issue:** If the scraping logic throws an error mid-way, `driver.quit()` is never called in a `finally` block. The Chrome process hangs.
- **Impact:** Zombie Chrome processes accumulate, eventually exhausting server memory.

### 8. Firestore Write Has No Error Handling
- **File:** `backend/routes/diagnosis.js`
- **Issue:** `admin.firestore().collection('diagnosis').add(...)` has no `.catch()`. If Firestore is down or permissions are wrong, the error is swallowed silently.
- **Impact:** Diagnosis results may not be saved with no indication to the user.

### 9. Hardcoded Agmarknet Dropdown Values
- **File:** `backend/utils/scrapeAgmarknet.js`
- **Issue:** State, market, and commodity names are hardcoded strings. If Agmarknet renames any dropdown option (e.g., "Bengaluru" vs "BANGALORE"), scraping breaks silently returning empty results.
- **Impact:** Price data stops working with no error message.

### 10. No CORS Restriction
- **File:** `backend/index.js`
- **Issue:** `app.use(cors())` allows requests from any origin. Any website can call the backend APIs.
- **Impact:** APIs can be abused by external sites, consuming GCP quotas.

---

## Frontend Bugs

### 11. Location Detection Fallback Chain Is Fragile
- **File:** `frontend/src/utils/locationService.js`
- **Issue:** Geolocation → BigDataCloud → ipapi.co fallback chain. If Geolocation is denied AND ipapi.co is down or rate-limited, the app shows no location and the weather widget breaks entirely.
- **Impact:** No weather data, no location context for voice AI.

### 12. Weather API Key Exposed in Frontend
- **File:** `frontend/src/utils/weatherService.js`
- **Issue:** `WEATHER_API_KEY` is likely a Vite env variable exposed to the browser bundle.
- **Impact:** API key visible in built JS files.

### 13. Voice Status Polling Interval Not Cleared
- **File:** `frontend/src/components/VoiceChat.jsx`
- **Issue:** If the component unmounts while a voice query is in progress, the polling `setInterval` or `setTimeout` for status checking may not be properly cleared.
- **Impact:** Memory leak and potential console errors on unmount.

### 14. Tab Navigation State Lost on Refresh
- **File:** `frontend/src/App.jsx`
- **Issue:** Active tab is stored in local state (`useState`). Page refresh resets to default tab. No URL-based routing despite `react-router-dom` being installed.
- **Impact:** Minor UX annoyance.

### 15. Diagnosis Form Doesn't Clear After Submit
- **File:** `frontend/src/components/Diagnoseform.jsx`
- **Issue:** After a successful diagnosis, the form fields (farmer name, image) may not reset, allowing accidental re-submission of the same data.
- **Impact:** Duplicate diagnosis records in Firestore.

### 16. Price Table Doesn't Handle Empty Results
- **File:** `frontend/src/components/Pricescraper.jsx`
- **Issue:** When the scraper returns no rows (Agmarknet changed, or invalid selection), the table renders empty with no "no data" message.
- **Impact:** User sees a blank page with no explanation.

---

## Configuration / Environment Bugs

### 17. Missing .env Files Not Handled Gracefully
- **Files:** `backend/index.js`, `frontend/src/config.js`
- **Issue:** If `.env` is missing or variables are undefined, the app either crashes on startup or falls back to hardcoded defaults that may not work.
- **Impact:** Confusing startup errors for new developers.

### 18. `firebase.json` Is Empty
- **File:** `firebase.json`
- **Issue:** Firebase config is not set up. The `functions/` directory is a placeholder. Deployment to Firebase will fail.
- **Impact:** Cannot deploy the app.

### 19. Service Account Key Path Hardcoded
- **File:** `backend/.env.example`
- **Issue:** `GOOGLE_APPLICATION_CREDENTIALS=./project-kisan-key.json` is relative. If the working directory changes, authentication breaks.
- **Impact:** GCP authentication fails silently in some deployment scenarios.

---

## UX / Interaction Bugs

### 20. Voice Recording Has No Visual Feedback for Duration
- **File:** `frontend/src/components/VoiceChat.jsx`
- **Issue:** There's an audio level visualizer but no timer showing how long the farmer has been speaking. Long recordings may hit file size limits without warning.
- **Impact:** Farmer records a 5-minute speech, upload fails silently.

### 21. No Loading State on Diagnosis Submit
- **File:** `frontend/src/components/Diagnoseform.jsx`
- **Issue:** When the image is uploading and Vertex AI is processing, there may be no loading spinner or disabled button state, allowing double-submission.
- **Impact:** Duplicate API calls, poor UX.

### 22. Conversation History Not Persisted
- **File:** `frontend/src/components/VoiceChat.jsx`
- **Issue:** Voice chat history is in component state only. Navigating away or refreshing loses the entire conversation.
- **Impact:** Farmer can't reference previous AI responses.

### 23. Chatbot Message History Has No Limit
- **File:** `frontend/src/components/chatbot/Chatbot.jsx`
- **Issue:** Messages accumulate in state with no cap. Long conversations may cause performance issues or hit Gemini's context window limit.
- **Impact:** Chatbot becomes slow or errors out on long sessions.

### 24. Weather Tips Not Localized
- **File:** `frontend/src/utils/weatherService.js`
- **Issue:** Farming tips are in English only, but the app targets Kannada-speaking farmers. The voice assistant speaks local languages but weather tips don't.
- **Impact:** Karnataka farmers can't understand weather advice.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 5 |
| Backend | 5 |
| Frontend | 6 |
| Config | 3 |
| UX | 5 |
| **Total** | **24** |

---

*Last updated: 2026-09-17*
