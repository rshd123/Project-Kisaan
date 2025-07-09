// Language detection and translation service
export class LanguageService {
  // Map Indian states to their primary languages
  static stateLanguageMap = {
    // Hindi Belt
    'uttar pradesh': 'hi',
    'bihar': 'hi',
    'jharkhand': 'hi',
    'madhya pradesh': 'hi',
    'rajasthan': 'hi',
    'haryana': 'hi',
    'himachal pradesh': 'hi',
    'uttarakhand': 'hi',
    'delhi': 'hi',
    'chandigarh': 'hi',
    
    // Regional Languages
    'maharashtra': 'mr', // Marathi
    'gujarat': 'gu', // Gujarati
    'punjab': 'pa', // Punjabi
    'west bengal': 'bn', // Bengali
    'odisha': 'or', // Odia
    'assam': 'as', // Assamese
    'tamil nadu': 'ta', // Tamil
    'kerala': 'ml', // Malayalam
    'karnataka': 'kn', // Kannada
    'andhra pradesh': 'te', // Telugu
    'telangana': 'te', // Telugu
    'tripura': 'bn', // Bengali
    'manipur': 'mni', // Manipuri
    'nagaland': 'en', // English (multiple tribes)
    'mizoram': 'lus', // Mizo
    'meghalaya': 'en', // English
    'arunachal pradesh': 'en', // English
    'sikkim': 'ne', // Nepali
    'goa': 'kok', // Konkani
    'chhattisgarh': 'hi', // Hindi
    'jammu and kashmir': 'ur', // Urdu
    'ladakh': 'bo', // Tibetan
    'andaman and nicobar islands': 'en',
    'lakshadweep': 'ml',
    'puducherry': 'ta',
    'dadra and nagar haveli and daman and diu': 'gu'
  };

  // Language names and their translations
  static languageNames = {
    'en': { native: 'English', translated: 'अंग्रेजी' },
    'hi': { native: 'हिंदी', translated: 'Hindi' },
    'mr': { native: 'मराठी', translated: 'Marathi' },
    'gu': { native: 'ગુજરાતી', translated: 'Gujarati' },
    'pa': { native: 'ਪੰਜਾਬੀ', translated: 'Punjabi' },
    'bn': { native: 'বাংলা', translated: 'Bengali' },
    'or': { native: 'ଓଡ଼ିଆ', translated: 'Odia' },
    'as': { native: 'অসমীয়া', translated: 'Assamese' },
    'ta': { native: 'தமிழ்', translated: 'Tamil' },
    'ml': { native: 'മലയാളം', translated: 'Malayalam' },
    'kn': { native: 'ಕನ್ನಡ', translated: 'Kannada' },
    'te': { native: 'తెలుగు', translated: 'Telugu' },
    'ur': { native: 'اردو', translated: 'Urdu' },
    'ne': { native: 'नेपाली', translated: 'Nepali' },
    'kok': { native: 'कोंकणी', translated: 'Konkani' }
  };

  // Comprehensive translations for the app
  static translations = {
    'en': {
      // App Title and Description
      appTitle: 'Project Kisan',
      appDescription: 'Your Digital Agriculture Assistant',
      welcomeBack: 'Welcome back',
      logout: 'Logout',
      
      // Navigation Tabs
      voiceChat: 'Voice Chat',
      cropDiagnosis: 'Crop Diagnosis',
      marketPrices: 'Market Prices',
      communityChat: 'Community Chat',
      chatbot: 'AI Assistant',
      weatherForecast: 'Weather Forecast',
      
      // Location Banner
      detectingLocation: 'Detecting your location...',
      locationDetected: 'Location detected',
      isLocationCorrect: 'Is this location correct?',
      yes: 'Yes',
      no: 'No',
      changeLocation: 'Change Location',
      locationError: 'Could not detect location',
      
      // Language Selection
      languageDetected: 'We detected you are in',
      wouldYouLike: 'Would you like to use the app in',
      or: 'or',
      continueInEnglish: 'Continue in English',
      switchToRegionalLanguage: 'Switch to',
      languageChanged: 'Language changed successfully!',
      
      // Loading States
      loading: 'Loading your farming assistant...',
      
      // Common Actions
      retry: 'Retry',
      close: 'Close',
      confirm: 'Confirm',
      cancel: 'Cancel',

      // Voice Chat Component
      voiceChatTitle: 'FarmMitra',
      chooseYour: 'Choose your',
      selectRegionalLanguage: 'Select your regional Language',
      location: 'Location',
      season: 'Season',
      crop: 'Crop',
      experience: 'Experience',
      pressMicToSpeak: 'Press mic to speak',
      speakFreely: 'Speak freely about your farming questions, issues, or concerns',
      listening: 'Listening...',
      processing: 'Processing...',
      clear: 'Clear',
      recordingInProgress: 'Recording in progress...',
      tapToStop: 'Tap to stop recording',
      connectionStatus: 'Connection Status',
      connected: 'Connected',
      disconnected: 'Disconnected',
      googleCloudMode: 'Google Cloud Mode',
      mockMode: 'Mock Mode',
      systemStatus: 'System Status',
      available: 'Available',
      unavailable: 'Unavailable',

      // Experience levels
      beginner: 'Beginner',
      intermediate: 'Intermediate', 
      advanced: 'Advanced',
      expert: 'Expert',

      // Seasons
      kharif: 'Kharif (Monsoon)',
      rabi: 'Rabi (Winter)',
      zaid: 'Zaid (Summer)',
      perennial: 'Perennial',

      // Chatbot Component
      chatbotTitle: 'AI Agricultural Assistant',
      askQuestion: 'Ask me anything about farming',
      typeMessage: 'Type your farming question here...',
      send: 'Send',
      clearChat: 'Clear Chat',
      thinking: 'Thinking...',
      welcomeMessage: 'Hello! I\'m your AI farming assistant. Ask me anything about crops, weather, pest control, or farming techniques.',

      // Market Prices Component
      marketPricesTitle: 'Market Prices',
      selectState: 'Select State',
      selectDistrict: 'Select District',
      selectMarket: 'Select Market',
      getCommodityPrices: 'Get Commodity Prices',
      commodity: 'Commodity',
      minPrice: 'Min Price',
      maxPrice: 'Max Price',
      modalPrice: 'Modal Price',
      pricePerQuintal: 'Price per Quintal (₹)',
      noDataAvailable: 'No price data available',
      fetchingPrices: 'Fetching latest prices...',

      // Weather Component
      weatherTitle: 'Weather Forecast',
      currentWeather: 'Current Weather',
      forecast: '5-Day Forecast',
      temperature: 'Temperature',
      humidity: 'Humidity',
      windSpeed: 'Wind Speed',
      pressure: 'Pressure',
      visibility: 'Visibility',
      feelsLike: 'Feels like',

      // Community Chat Component
      communityTitle: 'Community Chat',
      joinConversation: 'Join the farming community conversation',
      shareExperience: 'Share your farming experience or ask questions',
      writeMessage: 'Write your message...',
      post: 'Post',
      noMessages: 'No messages yet. Start the conversation!',

      // Crop Diagnosis Component
      diagnosisTitle: 'Crop Diagnosis',
      uploadImage: 'Upload Crop Image',
      analyzeImage: 'Analyze Image',
      dragDropImage: 'Drag and drop an image here, or click to select',
      analyzing: 'Analyzing image...',
      diagnosisResult: 'Diagnosis Result',
      confidence: 'Confidence',
      recommendations: 'Recommendations'
    },
    'hi': {
      // App Title and Description
      appTitle: 'प्रोजेक्ट किसान',
      appDescription: 'आपका डिजिटल कृषि सहायक',
      welcomeBack: 'वापस आपका स्वागत है',
      logout: 'लॉग आउट',
      
      // Navigation Tabs
      voiceChat: 'वॉयस चैट',
      cropDiagnosis: 'फसल निदान',
      marketPrices: 'बाजार भाव',
      communityChat: 'सामुदायिक चैट',
      chatbot: 'AI सहायक',
      weatherForecast: 'मौसम पूर्वानुमान',
      
      // Location Banner
      detectingLocation: 'आपका स्थान खोजा जा रहा है...',
      locationDetected: 'स्थान मिल गया',
      isLocationCorrect: 'क्या यह स्थान सही है?',
      yes: 'हाँ',
      no: 'नहीं',
      changeLocation: 'स्थान बदलें',
      locationError: 'स्थान नहीं मिल सका',
      
      // Language Selection
      languageDetected: 'हमने पता लगाया है कि आप यहाँ हैं',
      wouldYouLike: 'क्या आप ऐप का उपयोग करना चाहेंगे',
      or: 'या',
      continueInEnglish: 'अंग्रेजी में जारी रखें',
      switchToRegionalLanguage: 'बदलें',
      languageChanged: 'भाषा सफलतापूर्वक बदल गई!',
      
      // Loading States
      loading: 'आपका कृषि सहायक लोड हो रहा है...',
      
      // Common Actions
      retry: 'पुनः प्रयास',
      close: 'बंद करें',
      confirm: 'पुष्टि करें',
      cancel: 'रद्द करें',

      // Voice Chat Component
      voiceChatTitle: 'फार्म मित्र',
      chooseYour: 'अपना चुनें',
      selectRegionalLanguage: 'अपनी क्षेत्रीय भाषा चुनें',
      location: 'स्थान',
      season: 'मौसम',
      crop: 'फसल',
      experience: 'अनुभव',
      pressMicToSpeak: 'बोलने के लिए माइक दबाएं',
      speakFreely: 'अपने खेती के सवालों, समस्याओं या चिंताओं के बारे में स्वतंत्र रूप से बोलें',
      listening: 'सुन रहे हैं...',
      processing: 'प्रसंस्करण...',
      clear: 'साफ़ करें',
      recordingInProgress: 'रिकॉर्डिंग चल रही है...',
      tapToStop: 'रोकने के लिए टैप करें',
      connectionStatus: 'कनेक्शन स्थिति',
      connected: 'जुड़ा हुआ',
      disconnected: 'डिस्कनेक्ट',
      googleCloudMode: 'गूगल क्लाउड मोड',
      mockMode: 'मॉक मोड',
      systemStatus: 'सिस्टम स्थिति',
      available: 'उपलब्ध',
      unavailable: 'अनुपलब्ध',

      // Experience levels
      beginner: 'शुरुआती',
      intermediate: 'मध्यम',
      advanced: 'उन्नत',
      expert: 'विशेषज्ञ',

      // Seasons
      kharif: 'खरीफ (मानसून)',
      rabi: 'रबी (सर्दी)',
      zaid: 'जायद (गर्मी)',
      perennial: 'बारहमासी',

      // Chatbot Component
      chatbotTitle: 'AI कृषि सहायक',
      askQuestion: 'खेती के बारे में कुछ भी पूछें',
      typeMessage: 'यहाँ अपना खेती का सवाल लिखें...',
      send: 'भेजें',
      clearChat: 'चैट साफ़ करें',
      thinking: 'सोच रहे हैं...',
      welcomeMessage: 'नमस्ते! मैं आपका AI खेती सहायक हूँ। फसल, मौसम, कीट नियंत्रण या खेती की तकनीकों के बारे में कुछ भी पूछें।',

      // Market Prices Component
      marketPricesTitle: 'बाजार भाव',
      selectState: 'राज्य चुनें',
      selectDistrict: 'जिला चुनें',
      selectMarket: 'बाजार चुनें',
      getCommodityPrices: 'वस्तु की कीमतें प्राप्त करें',
      commodity: 'वस्तु',
      minPrice: 'न्यूनतम मूल्य',
      maxPrice: 'अधिकतम मूल्य',
      modalPrice: 'औसत मूल्य',
      pricePerQuintal: 'प्रति क्विंटल मूल्य (₹)',
      noDataAvailable: 'कोई मूल्य डेटा उपलब्ध नहीं',
      fetchingPrices: 'नवीनतम कीमतें प्राप्त कर रहे हैं...',

      // Weather Component
      weatherTitle: 'मौसम पूर्वानुमान',
      currentWeather: 'वर्तमान मौसम',
      forecast: '5-दिन का पूर्वानुमान',
      temperature: 'तापमान',
      humidity: 'आर्द्रता',
      windSpeed: 'हवा की गति',
      pressure: 'दबाव',
      visibility: 'दृश्यता',
      feelsLike: 'महसूस होता है',

      // Community Chat Component
      communityTitle: 'सामुदायिक चैट',
      joinConversation: 'किसान समुदाय की बातचीत में शामिल हों',
      shareExperience: 'अपना खेती का अनुभव साझा करें या सवाल पूछें',
      writeMessage: 'अपना संदेश लिखें...',
      post: 'पोस्ट करें',
      noMessages: 'अभी तक कोई संदेश नहीं। बातचीत शुरू करें!',

      // Crop Diagnosis Component
      diagnosisTitle: 'पीक रोग निदान',
      enterFarmerName: 'किसान का नाम दर्ज करें',
      diagnose: 'निदान करें',
      fetchingDiagnosis: 'निदान प्राप्त कर रहे हैं....',
      diagnosisInKannada: 'कन्नड़ में निदान:',
      enterNameAndImage: 'कृपया किसान का नाम दर्ज करें और एक छवि अपलोड करें।',
      diagnosisError: 'निदान करते समय कुछ गलत हुआ।',
      uploadImage: 'फसल की तस्वीर अपलोड करें',
      analyzeImage: 'तस्वीर का विश्लेषण करें',
      dragDropImage: 'यहाँ तस्वीर खींचें और छोड़ें, या चुनने के लिए क्लिक करें',
      analyzing: 'तस्वीर का विश्लेषण हो रहा है...',
      diagnosisResult: 'निदान परिणाम',
      confidence: 'विश्वास स्तर',
      recommendations: 'सिफारिशें',

      // Market Prices Component (additional)
      scrape: 'खोजें',
      fetchingData: 'डेटा प्राप्त कर रहे हैं...',
      selectBothMarketCommodity: 'कृपया बाजार और वस्तु दोनों चुनें।',
      noDataReturned: 'चयनित विकल्पों के लिए कोई डेटा नहीं मिला।',
      failedToFetchData: 'डेटा प्राप्त करने में विफल।',
      priceDataFor: 'मूल्य डेटा के लिए',
      in: 'में',

      // Weather Widget (additional)
      locationRequired: 'स्थान आवश्यक',
      locationRequiredDesc: 'सटीक मौसम जानकारी और कृषि सुझाव प्रदान करने के लिए हमें आपका स्थान चाहिए।',
      weatherForLocation: 'मौसम के लिए',
      isWeatherCorrect: 'क्या यह मौसम जानकारी आपके स्थान के लिए सही है?',
      enterCorrectLocation: 'सही स्थान दर्ज करें:',
      cityName: 'शहर का नाम',
      update: 'अपडेट करें',
      feelsLike: 'महसूस होता है',
      uvIndex: 'यूवी इंडेक्स',
      weatherAlerts: 'मौसम चेतावनी',
      farmingTips: 'आज के कृषि सुझाव',
      tomorrowFarmingTips: 'कल के कृषि सुझाव',
      dayForecast: '5-दिन का पूर्वानुमान'
    },
    'mr': {
      // App Title and Description
      appTitle: 'प्रोजेक्ट किसान',
      appDescription: 'तुमचा डिजिटल शेती सहायक',
      welcomeBack: 'परत आपले स्वागत',
      logout: 'लॉग आउट',
      
      // Navigation Tabs
      voiceChat: 'व्हॉइस चॅट',
      cropDiagnosis: 'पीक निदान',
      marketPrices: 'बाजार भाव',
      communityChat: 'समुदायिक चॅट',
      chatbot: 'AI सहायक',
      weatherForecast: 'हवामान अंदाज',
      
      // Language Selection
      languageDetected: 'आम्ही शोधले आहे की तुम्ही येथे आहात',
      wouldYouLike: 'तुम्हाला अॅप वापरायचे आहे का',
      or: 'किंवा',
      continueInEnglish: 'इंग्रजीत सुरू ठेवा',
      switchToRegionalLanguage: 'बदला',
      
      // Common terms
      yes: 'होय',
      no: 'नाही',
      loading: 'तुमचा शेती सहायक लोड होत आहे...'
    },
    'gu': {
      // App Title and Description
      appTitle: 'પ્રોજેક્ટ કિસાન',
      appDescription: 'તમારો ડિજિટલ કૃષિ સહાયક',
      welcomeBack: 'પાછા આવવા બદલ સ્વાગત',
      logout: 'લોગ આઉટ',
      
      // Navigation Tabs
      voiceChat: 'વૉઇસ ચૅટ',
      cropDiagnosis: 'પાક નિદાન',
      marketPrices: 'બજાર ભાવ',
      communityChat: 'સમુદાયિક ચૅટ',
      chatbot: 'AI સહાયક',
      weatherForecast: 'હવામાન પૂર્વાનુમાન',
      
      // Language Selection
      languageDetected: 'અમે શોધ્યું છે કે તમે અહીં છો',
      wouldYouLike: 'શું તમે એપ વાપરવા માંગો છો',
      or: 'અથવા',
      continueInEnglish: 'અંગ્રેજીમાં ચાલુ રાખો',
      switchToRegionalLanguage: 'બદલો',
      
      // Common terms
      yes: 'હા',
      no: 'ના',
      loading: 'તમારો કૃષિ સહાયક લોડ થઈ રહ્યો છે...'
    },
    'ta': {
      // App Title and Description
      appTitle: 'ப்ராஜெக்ட் கிசான்',
      appDescription: 'உங்கள் டிஜிட்டல் விவசாய உதவியாளர்',
      welcomeBack: 'மீண்டும் வரவேற்கிறோம்',
      logout: 'வெளியேறு',
      
      // Navigation Tabs
      voiceChat: 'குரல் அரட்டை',
      cropDiagnosis: 'பயிர் நோய் கண்டறிதல்',
      marketPrices: 'சந்தை விலை',
      communityChat: 'சமூக அரட்டை',
      chatbot: 'AI உதவியாளர்',
      weatherForecast: 'வானிலை முன்னறிவிப்பு',
      
      // Location Banner
      detectingLocation: 'உங்கள் இடம் கண்டறியப்படுகிறது...',
      locationDetected: 'இடம் கண்டறியப்பட்டது',
      isLocationCorrect: 'இந்த இடம் சரியானதா?',
      yes: 'ஆம்',
      no: 'இல்லை',
      changeLocation: 'இடத்தை மாற்று',
      locationError: 'இடம் கண்டறிய முடியவில்லை',
      
      // Language Selection
      languageDetected: 'நீங்கள் இங்கே இருக்கிறீர்கள் என்பதைக் கண்டறிந்துள்ளோம்',
      wouldYouLike: 'நீங்கள் ஆப்பைப் பயன்படுத்த விரும்புகிறீர்களா',
      or: 'அல்லது',
      continueInEnglish: 'ஆங்கிலத்தில் தொடரவும்',
      switchToRegionalLanguage: 'மாற்று',
      languageChanged: 'மொழி வெற்றிகரமாக மாற்றப்பட்டது!',
      
      // Loading States
      loading: 'உங்கள் விவசாய உதவியாளர் ஏற்றப்படுகிறது...',
      
      // Common Actions
      retry: 'மீண்டும் முயற்சிக்கவும்',
      close: 'மூடு',
      confirm: 'உறுதிப்படுத்து',
      cancel: 'ரத்து செய்',

      // Voice Chat Component
      voiceChatTitle: 'பண்ணை மித்ரா',
      chooseYour: 'உங்களைத் தேர்ந்தெடுக்கவும்',
      selectRegionalLanguage: 'உங்கள் பிராந்திய மொழியைத் தேர்ந்தெடுக்கவும்',
      location: 'இடம்',
      season: 'பருவம்',
      crop: 'பயிர்',
      experience: 'அனுபவம்',
      pressMicToSpeak: 'பேச மைக்கை அழுத்தவும்',
      speakFreely: 'உங்கள் விவசாய கேள்விகள், பிரச்சினைகள் அல்லது கவலைகளைப் பற்றி தயங்காமல் பேசுங்கள்',
      listening: 'கேட்கிறது...',
      processing: 'செயலாக்கம்...',
      clear: 'அழிக்கவும்',
      recordingInProgress: 'பதிவு நடந்து கொண்டிருக்கிறது...',
      tapToStop: 'நிறுத்த தட்டவும்',
      connectionStatus: 'இணைப்பு நிலை',
      connected: 'இணைக்கப்பட்டுள்ளது',
      disconnected: 'துண்டிக்கப்பட்டது',
      googleCloudMode: 'கூகிள் கிளவுட் பயன்முறை',
      mockMode: 'மாதிரி பயன்முறை',
      systemStatus: 'கணினி நிலை',
      available: 'கிடைக்கிறது',
      unavailable: 'கிடைக்கவில்லை',

      // Experience levels
      beginner: 'தொடக்கநிலை',
      intermediate: 'இடைநிலை',
      advanced: 'மேம்பட்ட',
      expert: 'நிபுணர்',

      // Seasons
      kharif: 'கரீப் (பருவமழை)',
      rabi: 'ரபி (குளிர்காலம்)',
      zaid: 'ஜாயத் (கோடை)',
      perennial: 'வருடமுழுவதும்',

      // Chatbot Component
      chatbotTitle: 'AI விவசாய உதவியாளர்',
      askQuestion: 'விவசாயம் பற்றி எதையும் கேளுங்கள்',
      typeMessage: 'உங்கள் விவசாய கேள்வியை இங்கே தட்டச்சு செய்யுங்கள்...',
      send: 'அனுப்பு',
      clearChat: 'அரட்டையை அழிக்கவும்',
      thinking: 'யோசித்துக்கொண்டிருக்கிறது...',
      welcomeMessage: 'வணக்கம்! நான் உங்கள் AI விவசாய உதவியாளர். பயிர்கள், வானிலை, பூச்சி கட்டுப்பாடு அல்லது விவசாய நுட்பங்களைப் பற்றி எதையும் கேளுங்கள்.',

      // Market Prices Component
      marketPricesTitle: 'சந்தை விலைகள்',
      selectState: 'மாநிலத்தைத் தேர்ந்தெடுக்கவும்',
      selectDistrict: 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்',
      selectMarket: 'சந்தையைத் தேர்ந்தெடுக்கவும்',
      getCommodityPrices: 'பொருள் விலைகளைப் பெறுக',
      commodity: 'பொருள்',
      minPrice: 'குறைந்தபட்ச விலை',
      maxPrice: 'அதிகபட்ச விலை',
      modalPrice: 'சராசரி விலை',
      pricePerQuintal: 'ஒரு குவிண்டாலுக்கு விலை (₹)',
      noDataAvailable: 'விலை தகவல் கிடைக்கவில்லை',
      fetchingPrices: 'சமீபத்திய விலைகளைப் பெறுகிறது...',

      // Weather Component
      weatherTitle: 'வானிலை முன்னறிவிப்பு',
      currentWeather: 'தற்போதைய வானிலை',
      forecast: '5-நாள் முன்னறிவிப்பு',
      temperature: 'வெப்பநிலை',
      humidity: 'ஈரப்பதம்',
      windSpeed: 'காற்றின் வேகம்',
      pressure: 'அழுத்தம்',
      visibility: 'தெரிவுநிலை',
      feelsLike: 'உணர்வு',

      // Community Chat Component
      communityTitle: 'சமூக அரட்டை',
      joinConversation: 'விவசாயிகள் சமூக உரையாடலில் சேருங்கள்',
      shareExperience: 'உங்கள் விவசாய அனுபவத்தைப் பகிருங்கள் அல்லது கேள்விகள் கேளுங்கள்',
      writeMessage: 'உங்கள் செய்தியை எழுதுங்கள்...',
      post: 'இடுகை',
      noMessages: 'இன்னும் செய்திகள் இல்லை. உரையாடலைத் தொடங்குங்கள்!',

      // Crop Diagnosis Component
      diagnosisTitle: 'பயிர் நோய் கண்டறிதல்',
      enterFarmerName: 'விவசாயியின் பெயரை உள்ளிடவும்',
      diagnose: 'கண்டறியவும்',
      fetchingDiagnosis: 'கண்டறிதல் பெறுகிறது....',
      diagnosisInKannada: 'கன்னடத்தில் கண்டறிதல்:',
      enterNameAndImage: 'தயவுசெய்து விவசாயியின் பெயரை உள்ளிட்டு படத்தை பதிவேற்றவும்।',
      diagnosisError: 'கண்டறியும் போது ஏதோ தவறு நடந்தது।',
      uploadImage: 'பயிர் படத்தை பதிவேற்றவும்',
      analyzeImage: 'படத்தை பகுப்பாய்வு செய்யவும்',
      dragDropImage: 'இங்கே படத்தை இழுத்து விடுங்கள், அல்லது தேர்ந்தெடுக்க கிளிக் செய்யுங்கள்',
      analyzing: 'படம் பகுப்பாய்வு செய்யப்படுகிறது...',
      diagnosisResult: 'கண்டறிதல் முடிவு',
      confidence: 'நம்பிக்கை நிலை',
      recommendations: 'பரிந்துரைகள்',

      // Market Prices Component (additional)
      scrape: 'தேடுங்கள்',
      fetchingData: 'தரவை பெறுகிறது...',
      selectBothMarketCommodity: 'தயவுसेयु சந்தை மற்றும் பொருள் இரண்டையும் தேர்ந்தெடுக்கவும்।',
      noDataReturned: 'தேர்ந்தெடுக்கப்பட்ட விருப்பங்களுக்கு தரவு இல்லை।',
      failedToFetchData: 'தரவை பெறுவதில் தோல்வி।',
      priceDataFor: 'விலை தரவு',
      in: 'இல்',

      // Weather Widget (additional)
      locationRequired: 'இடம் தேவै',
      locationRequiredDesc: 'துல்லியமான வானிலை தகவல் மற்றும் விவசாய குறிப்புகளை வழங்க உங்கள் இருப்பிடம் தேவை।',
      weatherForLocation: 'வானிலை',
      isWeatherCorrect: 'உங்கள் இருப்பிடத்திற்கு இந்த வானிலை தகவல் சரியானதா?',
      enterCorrectLocation: 'சரியான இருப்பிடத்தை உள்ளிடவும்:',
      cityName: 'நகர பெயர்',
      update: 'புதுப்பிக்கவும்',
      feelsLike: 'உணர்வது போல்',
      uvIndex: 'UV குறியீடு',
      weatherAlerts: 'வானிலை எச்சரிக்கைகள்',
      farmingTips: 'இன்றைய விவசாய குறிப்புகள்',
      tomorrowFarmingTips: 'நாளைய விவசாய குறிப்புகள்',
      dayForecast: '5-நாள் முன்னறிவிப்பு'
    },
    'bn': {
      // App Title and Description
      appTitle: 'প্রজেক্ট কিসান',
      appDescription: 'আপনার ডিজিটাল কৃষি সহায়ক',
      welcomeBack: 'ফিরে আসার জন্য স্বাগতম',
      logout: 'লগ আউট',
      
      // Navigation Tabs
      voiceChat: 'ভয়েস চ্যাট',
      cropDiagnosis: 'ফসল নির্ণয়',
      marketPrices: 'বাজার দর',
      communityChat: 'কমিউনিটি চ্যাট',
      chatbot: 'AI সহায়ক',
      weatherForecast: 'আবহাওয়ার পূর্বাভাস',
      
      // Language Selection
      languageDetected: 'আমরা জানতে পেরেছি যে আপনি এখানে আছেন',
      wouldYouLike: 'আপনি কি অ্যাপটি ব্যবহার করতে চান',
      or: 'বা',
      continueInEnglish: 'ইংরেজিতে চালিয়ে যান',
      switchToRegionalLanguage: 'পরিবর্তন করুন',
      
      // Common terms
      yes: 'হ্যাঁ',
      no: 'না',
      loading: 'আপনার কৃষি সহায়ক লোড হচ্ছে...'
    }
  };

  // Detect language based on location
  static detectLanguageFromLocation(location) {
    if (!location?.state) return 'en';
    
    const stateName = location.state.toLowerCase();
    const languageCode = this.stateLanguageMap[stateName];
    
    // Return language code if translation exists, otherwise return English
    return languageCode && this.translations[languageCode] ? languageCode : 'en';
  }

  // Get translation for a key
  static getTranslation(key, language = 'en') {
    const translations = this.translations[language] || this.translations['en'];
    return translations[key] || this.translations['en'][key] || key;
  }

  // Get language name
  static getLanguageName(languageCode) {
    return this.languageNames[languageCode]?.native || 'English';
  }

  // Get all supported languages for a dropdown
  static getSupportedLanguages() {
    return Object.keys(this.translations).map(code => ({
      code,
      name: this.getLanguageName(code),
      translated: this.languageNames[code]?.translated || code
    }));
  }

  // Store language preference
  static setLanguagePreference(languageCode) {
    localStorage.setItem('preferredLanguage', languageCode);
  }

  // Get stored language preference
  static getLanguagePreference() {
    return localStorage.getItem('preferredLanguage') || 'en';
  }

  // Check if language selection was dismissed
  static wasLanguageSelectionDismissed() {
    return localStorage.getItem('languageSelectionDismissed') === 'true';
  }

  // Mark language selection as dismissed
  static dismissLanguageSelection() {
    localStorage.setItem('languageSelectionDismissed', 'true');
  }
}
