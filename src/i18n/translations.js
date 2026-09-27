// Complete Multilingual Farmer-First Translations Dictionary for Sahayak AI
// Supports 12 Indian Languages: en, hi, mr, gu, pa, bn, ta, te, kn, ml, or, as

export const TRANSLATIONS = {
  en: {
    langName: "English",
    langNative: "English",
    firstLaunchTitle: "Choose Your Language",
    firstLaunchSub: "Select your preferred language to access all schemes, services, and AI support.",
    confirmLang: "Continue in English",
    headerSwitch: "Language",

    nav: {
      overview: "Overview Dashboard",
      aiAssistant: "Grounded AI Chat",
      schemeFinder: "Smart Scheme Finder",
      pmfby: "PMFBY & 72h Claims",
      pacs: "PACS Hub & Fertilizer",
      cooperative: "Cooperative Laws",
      financial: "KCC & Credit Literacy",
      grievance: "Grievance Redressal",
      voice: "Farmer Voice Assistant",
      admin: "Admin Analytics",
      profile: "Farmer Profile",
      login: "Login with OTP",
      logout: "Log Out"
    },

    common: {
      askAi: "Ask AI Assistant",
      startVoice: "Start Voice",
      stopVoice: "Stop Voice",
      listenAgain: "Listen Again",
      send: "Send",
      search: "Search",
      submit: "Submit",
      next: "Next",
      back: "Back",
      save: "Save Changes",
      cancel: "Cancel",
      download: "Download",
      viewDetails: "View Details",
      getHelp: "Get Helpline Assistance",
      dismiss: "Dismiss",
      clear: "Clear",
      verifiedAnswer: "Verified Grounded Response",
      officialSources: "Official Government Sources",
      loading: "Searching verified circulars...",
      thinking: "Thinking...",
      listening: "Listening... Speak your question",
      speaking: "Speaking answer aloud...",
      success: "Successfully Processed",
      error: "An error occurred. Please try again.",
      noResults: "No official matching guidelines found.",
      topic: "Topic",
      verifyOnPortal: "Verify on Official Portal"
    },

    dashboard: {
      welcome: "Namaste",
      subtitle: "Verified Agricultural, Scheme & PACS Intelligence at your fingertips",
      statCrops: "Registered Crops",
      statAcres: "Landholding (Acres)",
      statPacs: "Assigned PACS",
      quickActions: "Quick Services",
      quickVoiceTitle: "Hands-Free Farmer Voice Assistant",
      quickVoiceDesc: "Speak directly in your native language — Sahayak AI retrieves verified circulars and speaks the answer back.",
      callHelpline: "Kisan Call Center: 1800-180-1551 | PMFBY Helpline: 14447"
    },

    voice: {
      title: "Farmer Voice Assistant",
      sub: "Speak naturally — Sahayak AI automatically detects speech end, searches verified circulars, and responds in voice.",
      micTap: "Tap microphone to speak",
      micListening: "🎙 Listening... Speak naturally (auto-answers when you stop)",
      micThinking: "⏳ Thinking... Searching official circulars...",
      micSpeaking: "🔊 Speaking answer aloud... (Tap mic to interrupt)",
      quickPromptsTitle: "Quick Voice Questions"
    },

    chat: {
      title: "Grounded AI Consultant",
      sub: "Zero Hallucinations • Grounded in Official Government Guidelines",
      greeting: "Namaste! I am Sahayak AI. How may I assist you with PMFBY crop insurance, PM-KISAN, subsidized PACS fertilizer, or KCC loans today?",
      inputPlaceholder: "Ask about crop insurance, Urea price, KCC loan 4% interest rate..."
    },

    schemes: {
      title: "Smart Scheme Recommender",
      sub: "Filter and find verified Government of India & State Agriculture Schemes tailored for your farm.",
      filterState: "State",
      filterCategory: "Category",
      filterLand: "Landholding (Acres)",
      searchPlaceholder: "Search scheme name, crop, or benefit...",
      eligible: "Eligible Criteria",
      benefits: "Benefits Provided",
      howToApply: "How to Apply"
    },

    pmfby: {
      title: "PMFBY Crop Insurance & 72h Claims",
      sub: "Official guidelines for crop loss intimation, premium rates, and claim settlement.",
      alert72hTitle: "CRITICAL: 72-Hour Claim Deadline Rule",
      alert72hDesc: "Intimate localized crop loss (rain, flood, hailstorm) within 72 hours via PMFBY Helpline 14447 or the Crop Insurance App.",
      kharifRate: "Kharif Crops Premium: Max 2.0%",
      rabiRate: "Rabi Crops Premium: Max 1.5%",
      commercialRate: "Commercial/Horticulture Premium: Max 5.0%",
      claimStepsTitle: "How to File a PMFBY Crop Claim",
      step1: "1. Report crop damage within 72 hours.",
      step2: "2. Provide survey number, bank details & photos.",
      step3: "3. Joint inspection by Insurance Co. & Agri Officer.",
      step4: "4. Claim compensation directly credited via DBT."
    },

    pacs: {
      title: "PACS Hub & Fertilizer Guidance",
      sub: "Primary Agricultural Credit Societies membership, subsidized Urea MRP, seeds & custom hiring.",
      ureaMrpTitle: "Subsidized Urea MRP Rule",
      ureaMrpDesc: "Official MRP of 45kg bag Urea is strictly ₹266.50. PACS must issue computer receipt via e-POS biometric verification.",
      kccLoanTitle: "Short-Term PACS Crop Credit",
      kccLoanDesc: "Access crop loans up to ₹3 Lakh at effective 4% interest rate with prompt repayment subvention.",
      customHiringTitle: "Custom Hiring Tool Machinery",
      customHiringDesc: "Rent tractors, harvesters, and seed drills at PACS subsidized community rates."
    },

    cooperative: {
      title: "Cooperative Laws & Member Rights",
      sub: "Multi-State Co-operative Societies (MSCS) Act, PACS Bye-Laws 2023, and governance.",
      voteRight: "Democratic Right: One Member, One Vote",
      agmRight: "Right to Inspect Audited Balance Sheet & AGM Minutes",
      section84: "Section 84 Arbitration for Cooperative Disputes"
    },

    financial: {
      title: "KCC & Credit Literacy",
      sub: "Interest subvention rates, collateral-free credit limits, SHG bank linkage & fraud safety.",
      kccRateTitle: "Kisan Credit Card (KCC) 4% Net Rate",
      kccRateDesc: "Standard interest is 7%. Prompt repayment gives 3% subvention, making effective interest 4% per annum.",
      collateralLimit: "Collateral-Free Limit: ₹1.60 Lakh for KCC crop loans",
      fraudSafetyTitle: "Cyber & OTP Safety",
      fraudSafetyDesc: "Never share OTP, PIN, or bank passwords over phone calls claiming to be bank officers."
    },

    grievance: {
      title: "AI Grievance Assistant",
      sub: "Draft official grievance complaints for PMFBY delay, PACS fertilizer overcharging, or KCC loan issues.",
      selectCategory: "Complaint Category",
      describeIssue: "Describe your grievance in simple words",
      placeholder: "e.g., PACS manager charging ₹320 for Urea bag instead of ₹266.50...",
      generateBtn: "Draft Official Complaint",
      exportEnglish: "Export English Version for Formal CP-GRAMS Submission"
    },

    profile: {
      title: "Farmer & Member Profile",
      sub: "Manage your farm details, state, district, PACS membership, and preferred language.",
      nameLabel: "Full Name",
      phoneLabel: "Phone Number",
      stateLabel: "State",
      districtLabel: "District",
      pacsIdLabel: "PACS ID",
      landLabel: "Landholding (Acres)",
      cropsLabel: "Primary Crops",
      prefLangLabel: "Application UI & Voice Language",
      aiReplyMode: "AI Voice Reply Preference",
      aiReplyModeSelected: "Reply in my selected UI language",
      aiReplyModeQuestion: "Reply in the same language as question"
    }
  },

  hi: {
    langName: "Hindi",
    langNative: "हिंदी",
    firstLaunchTitle: "अपनी भाषा चुनें",
    firstLaunchSub: "योजनाओं, पैक्स सेवाओं, फसल बीमा और एआई सहायता का उपयोग अपनी भाषा में करें।",
    confirmLang: "हिंदी में आगे बढ़ें",
    headerSwitch: "भाषा",

    nav: {
      overview: "मुख्य डैशबोर्ड",
      aiAssistant: "सहायक AI परामर्श",
      schemeFinder: "योजना खोजें",
      pmfby: "फसल बीमा (PMFBY)",
      pacs: "पैक्स एवं खाद केंद्र",
      cooperative: "सहकारी कानून",
      financial: "केसीसी एवं ऋण जानकारी",
      grievance: "शिकायत सहायता",
      voice: "किसान वाणी सहायक",
      admin: "प्रशासनिक विश्लेषिकी",
      profile: "किसान प्रोफाइल",
      login: "ओटीपी से लॉगिन करें",
      logout: "लॉगआउट"
    },

    common: {
      askAi: "AI सहायक से पूछें",
      startVoice: "बोलकर पूछें",
      stopVoice: "आवाज़ रोकें",
      listenAgain: "पुनः सुनें",
      send: "भेजें",
      search: "खोजें",
      submit: "जमा करें",
      next: "आगे",
      back: "पीछे",
      save: "सुरक्षित करें",
      cancel: "रद्द करें",
      download: "डाउनलोड",
      viewDetails: "विवरण देखें",
      getHelp: "हेल्पलाइन सहायता",
      dismiss: "बंद करें",
      clear: "साफ़ करें",
      verifiedAnswer: "सत्यापित प्रमाणिक उत्तर",
      officialSources: "आधिकारिक सरकारी स्रोत",
      loading: "सत्यापित परिपत्रों में खोज रहे हैं...",
      thinking: "सोच रहे हैं...",
      listening: "🎙 सुन रहे हैं... बोलें",
      speaking: "🔊 उत्तर सुनाया जा रहा है...",
      success: "सफलतापूर्वक संपन्न",
      error: "त्रुटि हुई। कृपया पुनः प्रयास करें।",
      noResults: "कोई आधिकारिक नियम नहीं मिला।",
      topic: "विषय",
      verifyOnPortal: "पोर्टल पर पुष्टि करें"
    },

    dashboard: {
      welcome: "नमस्ते",
      subtitle: "सत्यापित कृषि, योजना और पैक्स जानकारी सीधे आपकी भाषा में",
      statCrops: "पंजीकृत फसलें",
      statAcres: "कृषि भूमि (एकड़)",
      statPacs: "संबंधित पैक्स (PACS)",
      quickActions: "त्वरित सेवाएं",
      quickVoiceTitle: "किसान वाणी सहायक (Hands-Free Voice)",
      quickVoiceDesc: "सीधे अपनी भाषा में बोलें — सहायक AI सुनकर उत्तर देगा और बोलकर बताएगा।",
      callHelpline: "किसान कॉल सेंटर: 1800-180-1551 | बीमा हेल्पलाइन: 14447"
    },

    voice: {
      title: "किसान वाणी सहायक",
      sub: "बोलें — रुकते ही सहायक AI उत्तर खोजकर स्वचालित रूप से बोलकर बताएगा।",
      micTap: "बोलने के लिए माइक दबाएं",
      micListening: "🎙 सुन रहे हैं... बोलें (बोलना बंद करते ही उत्तर आएगा)",
      micThinking: "⏳ सोच रहे हैं... प्रमाणिक जानकारी प्राप्त कर रहे हैं...",
      micSpeaking: "🔊 उत्तर सुनाया जा रहा है... (रोकने के लिए माइक दबाएं)",
      quickPromptsTitle: "शीघ्र आवाज़ प्रश्न"
    },

    chat: {
      title: "सहायक AI परामर्शदाता",
      sub: "सरकारी नियमों और परिपत्रों पर आधारित - शून्य भ्रम",
      greeting: "नमस्ते! मैं सहायक AI हूँ। मैं आपकी पीएम फसल बीमा, पीएम-किसान, पैक्स यूरिया खाद या केसीसी ऋण में कैसे मदद कर सकता हूँ?",
      inputPlaceholder: "फसल बीमा, यूरिया खाद भाव, या केसीसी ऋण के बारे में पूछें..."
    },

    schemes: {
      title: "स्मार्ट योजना खोजक",
      sub: "अपनी भूमि और फसल के अनुसार केंद्र व राज्य सरकार की योजनाएं खोजें।",
      filterState: "राज्य",
      filterCategory: "श्रेणी",
      filterLand: "कृषि भूमि (एकड़)",
      searchPlaceholder: "योजना का नाम, फसल या लाभ खोजें...",
      eligible: "पात्रता मापदंड",
      benefits: "प्राप्त लाभ",
      howToApply: "आवेदन कैसे करें"
    },

    pmfby: {
      title: "पीएम फसल बीमा एवं 72 घंटे का दावा",
      sub: "फसल नुकसान की सूचना, प्रीमियम दरें और दावा प्रक्रिया की पूरी जानकारी।",
      alert72hTitle: "महत्वपूर्ण: 72 घंटे के भीतर सूचना नियम",
      alert72hDesc: "बारिश, बाढ़ या ओलावृष्टि से फसल क्षति की सूचना 72 घंटे के भीतर टोल-फ्री 14447 पर दें।",
      kharifRate: "खरीफ फसल प्रीमियम: अधिकतम 2.0%",
      rabiRate: "रबी फसल प्रीमियम: अधिकतम 1.5%",
      commercialRate: "बागवानी/वाणिज्यिक प्रीमियम: अधिकतम 5.0%",
      claimStepsTitle: "फसल क्षति दावा प्रक्रिया",
      step1: "1. नुकसान के 72 घंटे के अंदर सूचना दें।",
      step2: "2. खसरा नंबर, बैंक विवरण और फोटो दें।",
      step3: "3. कृषि अधिकारी और बीमा कंपनी द्वारा सर्वे।",
      step4: "4. क्षतिपूर्ति राशि सीधे बैंक खाते (DBT) में आएगी।"
    },

    pacs: {
      title: "पैक्स (PACS) सेवा केंद्र एवं खाद सब्सिडी",
      sub: "प्राथमिक कृषि साख समिति सदस्यता, यूरिया खाद का सरकारी भाव और कृषि यंत्र।",
      ureaMrpTitle: "यूरिया खाद सरकारी मूल्य नियम",
      ureaMrpDesc: "45 किग्रा यूरिया बोरी का सरकारी भाव strictly ₹266.50 है। ई-पॉश रसीद अवश्य लें।",
      kccLoanTitle: "पैक्स अल्पकालीन फसल ऋण",
      kccLoanDesc: "3 लाख रुपये तक का फसल ऋण 4% की प्रभावी ब्याज दर पर उपलब्ध।",
      customHiringTitle: "कृषि यंत्र किराए पर (Custom Hiring)",
      customHiringDesc: "ट्रैक्टर, थ्रेशर और सीड ड्रिल रियायती दरों पर किराए पर लें।"
    },

    cooperative: {
      title: "सहकारी कानून एवं सदस्य अधिकार",
      sub: "मल्टी-स्टेट कोऑपरेटिव सोसाइटीज एक्ट एवं पैक्स मॉडल उप-नियम 2023।",
      voteRight: "लोकतांत्रिक अधिकार: एक सदस्य, एक मत",
      agmRight: "वार्षिक आमसभा (AGM) एवं ऑडिट रिपोर्ट देखने का अधिकार",
      section84: "धारा 84: सहकारी विवादों का मध्यस्थता निवारण"
    },

    financial: {
      title: "केसीसी (KCC) एवं वित्तीय साक्षरता",
      sub: "किसान क्रेडिट कार्ड 4% ब्याज छूट, बिना गारंटी ऋण और ऑनलाइन धोखाधड़ी से सुरक्षा।",
      kccRateTitle: "किसान क्रेडिट कार्ड (KCC) 4% ब्याज दर",
      kccRateDesc: "सामान्य ब्याज 7% है। समय पर भुगतान करने पर 3% छूट मिलती है, जिससे दर 4% रह जाती है।",
      collateralLimit: "बिना गारंटी ऋण सीमा: ₹1.60 लाख",
      fraudSafetyTitle: "साइबर एवं ओटीपी सुरक्षा",
      fraudSafetyDesc: "फोन कॉल पर बैंक अधिकारी बनकर मांगने वाले को कभी भी ओटीपी या पिन न दें।"
    },

    grievance: {
      title: "AI शिकायत सहायता केंद्र",
      sub: "बीमा देरी, खाद की कालाबाजारी या केसीसी ऋण समस्या के लिए सरकारी शिकायत प्रारूप बनाएं।",
      selectCategory: "शिकायत की श्रेणी",
      describeIssue: "अपनी समस्या सरल शब्दों में लिखें",
      placeholder: "उदाहरण: पैक्स में यूरिया खाद 266.50 रुपये की जगह 320 रुपये में दी जा रही है...",
      generateBtn: "शिकायत पत्र तैयार करें",
      exportEnglish: "CP-GRAMS पोर्टल के लिए अंग्रेजी प्रारूप प्राप्त करें"
    },

    profile: {
      title: "किसान प्रोफाइल विवरण",
      sub: "अपनी भूमि, फसल, राज्य, पैक्स सदस्यता और पसंदीदा भाषा प्रबंधित करें।",
      nameLabel: "पूरा नाम",
      phoneLabel: "फोन नंबर",
      stateLabel: "राज्य",
      districtLabel: "जिला",
      pacsIdLabel: "पैक्स (PACS) आईडी",
      landLabel: "कृषि भूमि (एकड़)",
      cropsLabel: "मुख्य फसलें",
      prefLangLabel: "आवेदन एवं आवाज़ की भाषा",
      aiReplyMode: "AI आवाज़ उत्तर प्राथमिकता",
      aiReplyModeSelected: "मेरी चुनी हुई भाषा में उत्तर दें",
      aiReplyModeQuestion: "जिस भाषा में पूछा जाए उसी में उत्तर दें"
    }
  },

  mr: {
    langName: "Marathi",
    langNative: "मराठी",
    firstLaunchTitle: "आपली भाषा निवडा",
    firstLaunchSub: "शासकीय योजना, पीक विमा व पैक्स सेवांची माहिती आपल्या मराठी भाषेत मिळवा.",
    confirmLang: "मराठीत पुढे जा",
    headerSwitch: "भाषा",

    nav: {
      overview: "मुख्य डॅशबोर्ड",
      aiAssistant: "सहाय्यक AI सल्लागार",
      schemeFinder: "योजना शोधा",
      pmfby: "पीक विमा (PMFBY)",
      pacs: "पैक्स सेवा व खते",
      cooperative: "सहकार कायदे",
      financial: "केसीसी व पत साक्षरता",
      grievance: "तक्रार निवारण",
      voice: "शेतकरी वाणी सहाय्यक",
      admin: "प्रशासकीय विश्लेषण",
      profile: "शेतकरी प्रोफाइल",
      login: "ओटीपीने लॉगिन करा",
      logout: "लॉगआउट"
    },

    common: {
      askAi: "AI ला विचारा",
      startVoice: "बोलून विचारा",
      stopVoice: "आवाज थांबवा",
      listenAgain: "पुन्हा ऐका",
      send: "पाठवा",
      search: "शोधा",
      submit: "सादर करा",
      next: "पुढे",
      back: "मागे",
      save: "जतन करा",
      cancel: "रद्द करा",
      download: "डाउनलोड",
      viewDetails: "तपशील पहा",
      getHelp: "हेल्पलाइन मदत",
      dismiss: "बंद करा",
      clear: "क्लियर करा",
      verifiedAnswer: "सत्यापित माहिती",
      officialSources: "शासकीय अधिकृत स्रोत",
      loading: "माहिती शोधत आहे...",
      thinking: "विचार करत आहे...",
      listening: "🎙 ऐकत आहे... बोला",
      speaking: "🔊 उत्तर ऐकवत आहे...",
      success: "यशस्वी",
      error: "त्रुटी आली. पुन्हा प्रयत्न करा.",
      noResults: "माहिती सापडली नाही.",
      topic: "विषय",
      verifyOnPortal: "पोर्टलवर तपासा"
    },

    dashboard: {
      welcome: "नमस्कार",
      subtitle: "अधिकृत कृषी व सहकार योजनांची माहिती थेट तुमच्या भाषेत",
      statCrops: "नोंदणीकृत पिके",
      statAcres: "शेती जमीन (एकरामध्ये)",
      statPacs: "संबंधित पैक्स (PACS)",
      quickActions: "जलद सेवा",
      quickVoiceTitle: "शेतकरी वाणी सहाय्यक (Hands-Free Voice)",
      quickVoiceDesc: "थेट आपल्या भाषेत बोला — सहाय्यक AI उत्तर शोधून ऐकवेल.",
      callHelpline: "किसान कॉल सेंटर: 1800-180-1551 | पीक विमा: 14447"
    },

    voice: {
      title: "शेतकरी वाणी सहाय्यक",
      sub: "बोला — थांबताच सहाय्यक AI उत्तर शोधून आपोआप ऐकवेल.",
      micTap: "बोलण्यासाठी माइक दाबा",
      micListening: "🎙 ऐकत आहे... बोला (थांबताच उत्तर येईल)",
      micThinking: "⏳ विचार करत आहे... माहिती शोधत आहे...",
      micSpeaking: "🔊 उत्तर ऐकवत आहे...",
      quickPromptsTitle: "त्वरित प्रश्न"
    },

    chat: {
      title: "सहाय्यक AI सल्लागार",
      sub: "शासकीय नियमांवर आधारित - अचूक माहिती",
      greeting: "नमस्कार! मी सहाय्यक AI आहे. पीक विमा, पीएम-किसान किंवा खतांबद्दल मी काय मदत करू?",
      inputPlaceholder: "पीक विमा, खतांचे दर किंवा केसीसी कर्जाबद्दल विचारा..."
    },

    schemes: {
      title: "योजना शोधक",
      sub: "तुमच्या शेतीसाठी योग्य केंद्र व राज्य सरकारच्या योजना शोधा.",
      filterState: "राज्य",
      filterCategory: "प्रवर्ग",
      filterLand: "शेती जमीन (एकर)",
      searchPlaceholder: "योजनेचे नाव किंवा पीक शोधा...",
      eligible: "पात्रता",
      benefits: "मिळणारे लाभ",
      howToApply: "अर्ज कसा करावा"
    },

    pmfby: {
      title: "पीएम पीक विमा व ७२ तासांत भरपाई",
      sub: "पिकाच्या नुकसानीची माहिती ७२ तासांत कळवा.",
      alert72hTitle: "महत्त्वाचे: ७२ तासांच्या आत कळवण्याचा नियम",
      alert72hDesc: "अतिवृष्टी किंवा गारपिटीमुळे नुकसान झाल्यास ७२ तासांत १४४४७ वर तक्रार नोंदवा.",
      kharifRate: "खरीप पीक विमा हप्ता: जास्तीत जास्त २.०%",
      rabiRate: "रब्बी पीक विमा हप्ता: जास्तीत जास्त १.५%",
      commercialRate: "नगदी पिके हप्ता: जास्तीत जास्त ५.०%",
      claimStepsTitle: "नुकसान भरपाई दावा प्रक्रिया",
      step1: "१. नुकसानीच्या ७२ तासांच्या आत सूचना द्या.",
      step2: "२. गट नंबर व बँकेची माहिती द्या.",
      step3: "३. कृषी अधिकारी व विमा प्रतिनिधीद्वारे पाहणी.",
      step4: "४. भरपाईची रक्कम थेट खात्यात (DBT) जमा होईल."
    },

    pacs: {
      title: "पैक्स (PACS) सेवा व खते",
      sub: "युरिया खताचे शासकीय दर आणि कृषी अवजारे.",
      ureaMrpTitle: "युरिया खताचा शासकीय दर",
      ureaMrpDesc: "४५ किलो युरिया पोत्याचा शासकीय दर strictly २६६.५० रुपये आहे.",
      kccLoanTitle: "अल्पमुदत पीक कर्ज",
      kccLoanDesc: "३ लाख रुपयांपर्यंतचे पीक कर्ज प्रभावी ४% व्याजदराने उपलब्ध.",
      customHiringTitle: "कृषी अवजारे भाड्याने",
      customHiringDesc: "ट्रॅक्टर व रोटाव्हेटर सवलतीच्या दरात भाड्याने मिळवा."
    },

    cooperative: {
      title: "सहकार कायदे व सभासद अधिकार",
      sub: "महाराष्ट्र सहकार संस्था कायदा व पैक्स नियमावली.",
      voteRight: "लोकशाही अधिकार: एक सभासद, एक मत",
      agmRight: "वार्षिक सर्वसाधारण सभा व हिशोब तपासणी पाहण्याचा अधिकार",
      section84: "सहकारी वादांवर लवाद निवारण"
    },

    financial: {
      title: "केसीसी (KCC) व पत साक्षरता",
      sub: "किसान क्रेडिट कार्ड ४% व्याजदर व सायबर सुरक्षा.",
      kccRateTitle: "किसान क्रेडिट कार्ड ४% व्याज सवलत",
      kccRateDesc: "वेळेवर परतफेड केल्यास ३% सवलत मिळून निव्वळ व्याज ४% पडते.",
      collateralLimit: "विनातारण कर्ज मर्यादा: १.६० लाख रुपये",
      fraudSafetyTitle: "सायबर सुरक्षा",
      fraudSafetyDesc: "कोणालाही ओटीपी (OTP) किंवा पासवर्ड सांगू नका."
    },

    grievance: {
      title: "तक्रार निवारण सहाय्यक",
      sub: "खतांची जादा दराने विक्री किंवा विम्याचा विलंब यासाठी अर्ज तयार करा.",
      selectCategory: "तक्रारीचा प्रकार",
      describeIssue: "तुमची समस्या सोप्या शब्दांत लिहा",
      placeholder: "उदा. युरिया खतासाठी २६६.५० ऐवजी ३०० रुपये मागितले जात आहेत...",
      generateBtn: "तक्रार अर्ज तयार करा",
      exportEnglish: "CP-GRAMS पोर्टलसाठी इंग्रजी अर्ज मिळवा"
    },

    profile: {
      title: "शेतकरी माहिती",
      sub: "तुमची जमीन, पिके व पसंतीची भाषा बदला.",
      nameLabel: "पूर्ण नाव",
      phoneLabel: "फोन नंबर",
      stateLabel: "राज्य",
      districtLabel: "जिल्हा",
      pacsIdLabel: "पैक्स (PACS) आयडी",
      landLabel: "जमीन (एकर)",
      cropsLabel: "मुख्य पिके",
      prefLangLabel: "भाषेची निवड",
      aiReplyMode: "AI उत्तर भाषा पसंती",
      aiReplyModeSelected: "माझ्या निवडलेल्या भाषेत उत्तर द्या",
      aiReplyModeQuestion: "प्रश्नाच्या भाषेत उत्तर द्या"
    }
  },

  gu: {
    langName: "Gujarati",
    langNative: "ગુજરાતી",
    firstLaunchTitle: "તમારી ભાષા પસંદ કરો",
    firstLaunchSub: "તમામ સરકારી યોજનાઓ અને ખેતી સેવાની માહિતી તમારી માતૃભાષામાં મેળવો.",
    confirmLang: "ગુજરાતીમાં આગળ વધો",
    headerSwitch: "ભાષા",

    nav: {
      overview: "મુખ્ય ડેશબોર્ડ",
      aiAssistant: "સહાયક AI સલાહકાર",
      schemeFinder: "યોજના શોધો",
      pmfby: "પાક વીમો (PMFBY)",
      pacs: "પેક્સ અને ખાતર કેન્દ્ર",
      cooperative: "સહકારી કાયદા",
      financial: "KCC અને ધિરાણ માહિતી",
      grievance: "ફરિયાદ સહાયક",
      voice: "ખેડૂત વાણી સહાયક",
      admin: "એડમિન એનાલિટિક્સ",
      profile: "ખેડૂત પ્રોફાઇલ",
      login: "OTP વડે લોગિન કરો",
      logout: "લોગઆઉટ"
    },

    common: {
      askAi: "AI ને પૂછો",
      startVoice: "બોલીને પૂછો",
      stopVoice: "અવાજ અટકાવો",
      listenAgain: "ફરી સાંભળો",
      send: "મોકલો",
      search: "શોધો",
      submit: "સબમિટ કરો",
      next: "આગળ",
      back: "પાછળ",
      save: "સાચવો",
      cancel: "રદ કરો",
      download: "ડાઉનલોડ",
      viewDetails: "વિગત જુઓ",
      getHelp: "હેલ્પલાઇન મદદ",
      dismiss: "બંધ કરો",
      clear: "ક્લિયર કરો",
      verifiedAnswer: "ચકાસાયેલ જવાબ",
      officialSources: "સત્તાવાર સરકારી સ્ત્રોતો",
      loading: "માહિતી શોધી રહ્યા છીએ...",
      thinking: "વિચારી રહ્યા છીએ...",
      listening: "🎙 સાંભળી રહ્યા છીએ... બોલો",
      speaking: "🔊 જવાબ બોલી રહ્યા છીએ...",
      success: "સફળ",
      error: "ભૂલ થઈ. ફરી પ્રયાસ કરો.",
      noResults: "માહિતી મળી નથી.",
      topic: "વિષય",
      verifyOnPortal: "પોર્ટલ પર ચકાસો"
    },

    dashboard: {
      welcome: "નમસ્તે",
      subtitle: "સત્તાવાર કૃષિ અને સહકારી યોજનાઓની માહિતી તમારી ભાષામાં",
      statCrops: "નોંધાયેલા પાક",
      statAcres: "જમીન (એકરમાં)",
      statPacs: "સંબંધિત પેક્સ (PACS)",
      quickActions: "ઝડપી સેવાઓ",
      quickVoiceTitle: "ખેડૂત વાણી સહાયક (Voice Assistance)",
      quickVoiceDesc: "તમારી ભાષામાં બોલો — સહાયક AI સાંભળીને જવાબ આપશે.",
      callHelpline: "કિસાન કોલ સેન્ટર: 1800-180-1551 | પાક વીમો: 14447"
    },

    voice: {
      title: "ખેડૂત વાણી સહાયક",
      sub: "બોલો — અટકતા જ સહાયક AI આપમેળે જવાબ આપશે.",
      micTap: "બોલવા માટે માઇક દબાવો",
      micListening: "🎙 સાંભળી રહ્યા છીએ... બોલો",
      micThinking: "⏳ વિચારી રહ્યા છીએ...",
      micSpeaking: "🔊 જવાબ બોલી રહ્યા છીએ...",
      quickPromptsTitle: "ઝડપી પ્રશ્નો"
    },

    chat: {
      title: "સહાયક AI સલાહકાર",
      sub: "સરકારી નિયમો પર આધારિત - ચોક્કસ માહિતી",
      greeting: "નમસ્તે! હું સહાયક AI છું. પાક વીમા કે ખાતર વિશે હું શું મદદ કરી શકું?",
      inputPlaceholder: "પાક વીમો, ખાતરના ભાવ કે KCC લોન વિશે પૂછો..."
    },

    schemes: {
      title: "યોજના શોધો",
      sub: "તમારી જમીન અને પાક મુજબ સરકારી યોજનાઓ શોધો.",
      filterState: "રાજ્ય",
      filterCategory: "કેટેગરી",
      filterLand: "જમીન (એકર)",
      searchPlaceholder: "યોજનાનું નામ કે પાક શોધો...",
      eligible: "પાત્રતા",
      benefits: "મળતા લાભો",
      howToApply: "અરજી કેમ કરવી"
    },

    pmfby: {
      title: "PMFBY પાક વીમો અને 72 કલાકમાં દાવો",
      sub: "પાક નુકસાનીની માહિતી 72 કલાકમાં આપો.",
      alert72hTitle: "મહત્વપૂર્ણ: 72 કલાકની મર્યાદા",
      alert72hDesc: "ભારે વરસાદ કે કમોસમી વરસાદથી નુકસાન થાય તો 72 કલાકમાં 14447 પર કૉલ કરો.",
      kharifRate: "ખરીફ પાક પ્રીમિયમ: મહત્તમ 2.0%",
      rabiRate: "રવિ પાક પ્રીમિયમ: મહત્તમ 1.5%",
      commercialRate: "બાગાયતી પાક પ્રીમિયમ: મહત્તમ 5.0%",
      claimStepsTitle: "પાક નુકસાન દાવાની પ્રક્રિયા",
      step1: "1. નુકસાનના 72 કલાકમાં જાણ કરો.",
      step2: "2. સરવે નંબર અને બેંક વિગત આપો.",
      step3: "3. સર્વે અધિકારી દ્વારા તપાસ.",
      step4: "4. રકમ સીધી બેંક ખાતામાં (DBT) જમા થશે."
    },

    pacs: {
      title: "પેક્સ (PACS) સેવાઓ અને ખાતર",
      sub: "યુરિયા ખાતરનો સરકારી ભાવ અને કૃષિ સાધનો.",
      ureaMrpTitle: "યુરિયા ખાતરનો સરકારી ભાવ",
      ureaMrpDesc: "45 કિગ્રા યુરિયા થેલીનો સરકારી ભાવ રૂ. 266.50 છે.",
      kccLoanTitle: "ટૂંકી મુદતનું પાક ધિરાણ",
      kccLoanDesc: "રૂ. 3 લાખ સુધીનું પાક ધિરાણ 4% વ્યાજ દરે ઉપલબ્ધ.",
      customHiringTitle: "કૃષિ સાધનો ભાડેથી",
      customHiringDesc: "ટ્રેક્ટર અને સાધનો રાહત દરે ભાડે મેળવો."
    },

    cooperative: {
      title: "સહકારી કાયદા અને સભાસદના અધિકારો",
      sub: "મલ્ટી-સ્ટેટ સહકારી મંડળી કાયદો અને પેક્સ નિયમો.",
      voteRight: "લોકશાહી અધિકાર: એક સભાસદ, એક મત",
      agmRight: "વાર્ષિક સાધારણ સભા અને ઓડિટ રિપોર્ટ જોવાનો અધિકાર",
      section84: "વિવાદ નિવારણ કાયદો"
    },

    financial: {
      title: "KCC અને નાણાકીય જાગૃતિ",
      sub: "કિસાન ક્રેડિટ કાર્ડ 4% વ્યાજ દર અને સાયબર સુરક્ષા.",
      kccRateTitle: "KCC 4% વ્યાજ રાહત",
      kccRateDesc: "સમયસર ચુકવણી પર 3% વ્યાજ સબસીડી મળે છે.",
      collateralLimit: "વિના ગેરેંટી લોન મર્યાદા: રૂ. 1.60 લાખ",
      fraudSafetyTitle: "સાયબર સુરક્ષા",
      fraudSafetyDesc: "કોઈને પણ OTP કે પિન આપશો નહીં."
    },

    grievance: {
      title: "ફરિયાદ સહાયક",
      sub: "ખાતરના વધુ ભાવ કે વીમામાં વિલંબ માટે અરજી બનાવો.",
      selectCategory: "ફરિયાદનો પ્રકાર",
      describeIssue: "તમારી સમસ્યા સરળ શબ્દોમાં લખો",
      placeholder: "ઉદાહરણ: યુરિયા ખાતરના રૂ. 266.50 ને બદલે રૂ. 300 માંગવામાં આવે છે...",
      generateBtn: "ફરિયાદ પત્ર બનાવો",
      exportEnglish: "અંગ્રેજી પત્ર મેળવો"
    },

    profile: {
      title: "ખેડૂત પ્રોફાઇલ વિગત",
      sub: "તમારી જમીન અને ભાષા પસંદગી બદલો.",
      nameLabel: "પૂરું નામ",
      phoneLabel: "ફોન નંબર",
      stateLabel: "રાજ્ય",
      districtLabel: "જિલ્લો",
      pacsIdLabel: "પેક્સ (PACS) ID",
      landLabel: "જમીન (એકર)",
      cropsLabel: "મુખ્ય પાક",
      prefLangLabel: "ભાષા પસંદગી",
      aiReplyMode: "AI અવાજ જવાબ પસંદગી",
      aiReplyModeSelected: "મારી પસંદ કરેલી ભાષામાં જવાબ આપો",
      aiReplyModeQuestion: "પ્રશ્નની ભાષામાં જવાબ આપો"
    }
  }
};

// Fallback lookup function for Indian languages
export function getTranslation(langCode, keyPath) {
  const lang = TRANSLATIONS[langCode] || TRANSLATIONS.hi || TRANSLATIONS.en;
  const parts = keyPath.split('.');
  let current = lang;
  
  for (const p of parts) {
    if (current && current[p] !== undefined) {
      current = current[p];
    } else {
      // Fallback to Hindi or English if specific key is missing in regional dictionary
      let fallbackCurrent = TRANSLATIONS.hi || TRANSLATIONS.en;
      for (const fp of parts) {
        if (fallbackCurrent && fallbackCurrent[fp] !== undefined) {
          fallbackCurrent = fallbackCurrent[fp];
        } else {
          return keyPath;
        }
      }
      return typeof fallbackCurrent === 'string' ? fallbackCurrent : keyPath;
    }
  }
  
  return typeof current === 'string' ? current : keyPath;
}
