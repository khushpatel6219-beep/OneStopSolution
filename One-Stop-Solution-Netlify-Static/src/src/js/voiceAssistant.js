// One Stop Solution AI Assistant Engine - Interactive Conversational & Voice Assistant

import { store } from './state.js';

class VoiceAssistantEngine {
  constructor() {
    this.isListening = false;
    this.isSpeaking = false;
    this.transcript = '';
    this.lastResponse = '';
    this.messages = [
      { sender: 'ai', text: 'Hello! I am your AI Business Assistant for One Stop Solution. Ask me for client details, today\'s pending updates, or tell me "I want to add motor insurance" to start guided entry!' }
    ];
    
    this.activeFlow = null; // 'add_motor', 'add_health', 'add_client', etc.
    this.flowStep = 0;
    this.flowData = {};

    this.recognition = null;
    this.synthesis = typeof window !== 'undefined' ? (window.speechSynthesis || null) : null;
    this.onStateChange = null;
    
    if (typeof window !== 'undefined') {
      this.initRecognition();
    }
  }

  initRecognition() {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.transcript = 'Listening...';
      this.notifyState();
    };

    this.recognition.onresult = (event) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      this.transcript = currentText;
      this.notifyState();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.notifyState();
      if (this.transcript && this.transcript !== 'Listening...' && this.transcript !== 'Listening for voice command...') {
        this.processQuery(this.transcript);
      }
    };

    this.recognition.onerror = (e) => {
      console.error('Speech Recognition Error:', e);
      this.isListening = false;
      this.notifyState();
    };
  }

  toggleListening() {
    if (this.isSpeaking) {
      if (this.synthesis) this.synthesis.cancel();
      this.isSpeaking = false;
      this.notifyState();
    }

    if (!this.recognition) {
      this.speak("Speech recognition is not supported in this browser. You can type your request directly below!");
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
      } catch (e) {
        console.error('Failed to start speech recognition', e);
      }
    }
  }

  speak(text) {
    if (!this.synthesis) return;
    this.synthesis.cancel();

    // Clean markdown symbols for smooth voice speech synthesis
    const speechText = text.replace(/[*_#`~•⚠️📅💳👥🔔📞✉️🪪🛡️📍]/g, '');

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira')));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notifyState();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notifyState();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.notifyState();
    };

    this.synthesis.speak(utterance);
  }

  processQuery(rawQuery) {
    const text = rawQuery.trim();
    if (!text) return;

    this.messages.push({ sender: 'user', text });
    this.notifyState();

    const q = text.toLowerCase();
    const db = store.get();

    // 1. Check if we are inside a Guided Step-by-Step Flow
    if (this.activeFlow) {
      this.handleFlowStep(text, db);
      return;
    }

    // 2. Intent: "I want to add motor insurance" / "add health policy" / "add lead"
    if (q.includes('add motor') || q.includes('motor insurance') || q.includes('new motor')) {
      this.activeFlow = 'add_motor';
      this.flowStep = 1;
      this.flowData = {};
      const reply = "Sure! Let's add a new Motor Insurance deal step by step. First, what is the **Client Name**?";
      this.replyAndSpeak(reply);
      return;
    }

    if (q.includes('add health') || q.includes('health insurance') || q.includes('new health')) {
      this.activeFlow = 'add_health';
      this.flowStep = 1;
      this.flowData = {};
      const reply = "Sure! Let's add a new Health Insurance deal. First, what is the **Client Name**?";
      this.replyAndSpeak(reply);
      return;
    }

    // 3. Intent: Client Details Request ("heyy give me xxx clients details" or "give me client details for xxx")
    if (q.includes('client') && (q.includes('detail') || q.includes('info') || q.includes('give me') || q.includes('show'))) {
      // Extract client name search phrase
      let searchName = text
        .replace(/heyy|hey|hi|hello|give me|show me|client|clients|details|detail|info|information|for|of|about/gi, '')
        .trim();

      if (!searchName && db.clients.length > 0) {
        searchName = db.clients[0].name;
      }

      const client = db.clients.find(c => c.name.toLowerCase().includes(searchName.toLowerCase()) || searchName.toLowerCase().includes(c.name.toLowerCase()));

      if (client) {
        const clientMotor = db.motorPolicies.filter(m => m.clientId === client.id || m.clientName.toLowerCase() === client.name.toLowerCase());
        const clientHealth = db.healthPolicies.filter(h => h.clientId === client.id || h.clientName.toLowerCase() === client.name.toLowerCase());
        const clientLife = db.lifePolicies.filter(l => l.clientId === client.id || l.clientName.toLowerCase() === client.name.toLowerCase());
        const clientPayments = db.payments.filter(p => (p.clientId === client.id || p.clientName.toLowerCase() === client.name.toLowerCase()) && p.status === 'Pending');

        const totalPending = clientPayments.reduce((sum, p) => sum + Number(p.remainingAmount || p.totalAmount || 0), 0);

        let polDetails = [];
        if (clientMotor.length > 0) polDetails.push(`${clientMotor.length} Motor (${clientMotor.map(m => m.vehicleModel).join(', ')})`);
        if (clientHealth.length > 0) polDetails.push(`${clientHealth.length} Health (${clientHealth.map(h => h.company).join(', ')})`);
        if (clientLife.length > 0) polDetails.push(`${clientLife.length} Life (${clientLife.map(l => l.company).join(', ')})`);

        const reply = `Here are the full details for **${client.name}**:\n` +
          `• 📞 **Mobile**: ${client.phone || 'N/A'}\n` +
          `• ✉️ **Email**: ${client.email || 'N/A'}\n` +
          `• 🪪 **PAN**: ${client.pan || 'N/A'}\n` +
          `• 📍 **Location**: ${client.city || 'Mumbai'}, ${client.state || 'Maharashtra'}\n` +
          `• 🛡️ **Active Policies**: ${polDetails.length > 0 ? polDetails.join(' | ') : 'None'}\n` +
          `• 💳 **Pending Dues**: ₹${totalPending.toLocaleString('en-IN')}`;

        this.replyAndSpeak(reply);
        return;
      } else {
        const reply = `I couldn't find a client matching "${searchName}" in your database. Would you like to add them as a new lead?`;
        this.replyAndSpeak(reply);
        return;
      }
    }

    // 4. Intent: Today's Update / Pending Status Check
    if (q.includes('today') || q.includes('update') || q.includes('pending') || q.includes('expiring') || q.includes('status')) {
      const expiringToday = [
        ...db.motorPolicies.filter(p => p.status === 'Expiring Today' || p.expiryDate === '2026-07-28'),
        ...db.healthPolicies.filter(p => p.status === 'Expiring Today' || p.expiryDate === '2026-07-28'),
        ...db.lifePolicies.filter(p => p.status === 'Expiring Today' || p.dueDate === '2026-07-28')
      ];

      const expiringThisWeek = [
        ...db.motorPolicies.filter(p => p.status.includes('Expiring') || p.expiryDate === '2026-07-28' || (p.expiryDate >= '2026-07-28' && p.expiryDate <= '2026-08-04')),
        ...db.healthPolicies.filter(p => p.status.includes('Expiring') || p.expiryDate === '2026-07-28' || (p.expiryDate >= '2026-07-28' && p.expiryDate <= '2026-08-04')),
        ...db.lifePolicies.filter(p => p.status.includes('Expiring') || p.dueDate === '2026-07-28' || (p.dueDate >= '2026-07-28' && p.dueDate <= '2026-08-04'))
      ];

      const pendingPayments = db.payments.filter(p => p.status === 'Pending');
      const totalPendingAmt = pendingPayments.reduce((sum, p) => sum + Number(p.remainingAmount || p.totalAmount || 0), 0);
      const pendingReminders = db.reminders.filter(r => r.status === 'Pending');

      let reply = `Here is today's Business Update for **One Stop Solution**:\n` +
        `• ⚠️ **Expiring Today**: ${expiringToday.length} policies (${expiringToday.map(p => p.clientName + ' - ' + (p.vehicleModel || p.company)).join(', ') || 'None'})\n` +
        `• 📅 **Expiring This Week**: ${expiringThisWeek.length} policies\n` +
        `• 💳 **Pending Invoices**: ${pendingPayments.length} invoices totaling ₹${totalPendingAmt.toLocaleString('en-IN')}\n` +
        `• 👥 **Total Clients**: ${db.clients.length} active leads & accounts\n` +
        `• 🔔 **Pending Action Alerts**: ${pendingReminders.length} items`;

      this.replyAndSpeak(reply);
      return;
    }

    // 5. Default General Response
    const reply = `I received your request: "${text}". I can help you fetch client details, provide today's pending update, or fill motor/health policy info. What would you like to do?`;
    this.replyAndSpeak(reply);
  }

  // --- Handle Guided Step-by-Step Flow Answers ---
  handleFlowStep(answerText, db) {
    if (this.activeFlow === 'add_motor') {
      if (this.flowStep === 1) {
        this.flowData.clientName = answerText;
        this.flowStep = 2;
        const reply = `Got it! Client: **${answerText}**. Next, what is the **Vehicle Model**? (e.g. Honda City, Swift, BMW 3 Series)`;
        this.replyAndSpeak(reply);
        return;
      }
      if (this.flowStep === 2) {
        this.flowData.vehicleModel = answerText;
        this.flowStep = 3;
        const reply = `Great! Vehicle Model: **${answerText}**. What is the **Vehicle Registration Number**? (e.g. MH 02 EQ 7777)`;
        this.replyAndSpeak(reply);
        return;
      }
      if (this.flowStep === 3) {
        this.flowData.vehicleNumber = answerText.toUpperCase();
        this.flowStep = 4;
        const reply = `Awesome! Registration: **${answerText.toUpperCase()}**. Finally, what is the **Annual Premium** amount in Rupees? (e.g. 45000)`;
        this.replyAndSpeak(reply);
        return;
      }
      if (this.flowStep === 4) {
        const premium = Number(answerText.replace(/[^0-9]/g, '')) || 45000;
        this.flowData.premium = premium;

        let clientObj = db.clients.find(c => c.name.toLowerCase() === this.flowData.clientName.toLowerCase());
        if (!clientObj) {
          clientObj = store.addClient({
            name: this.flowData.clientName,
            phone: '+91 98000 12345',
            email: `${this.flowData.clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            pan: `PAN${Math.floor(10000 + Math.random()*90000)}K`,
            services: ['Motor Insurance'],
            city: 'Mumbai',
            state: 'Maharashtra'
          });
        }

        store.addMotorPolicy({
          clientId: clientObj.id,
          clientName: clientObj.name,
          vehicleModel: this.flowData.vehicleModel,
          vehicleNumber: this.flowData.vehicleNumber,
          company: 'HDFC ERGO',
          policyNumber: `MOT-${Math.floor(10000000 + Math.random()*90000000)}`,
          premium: premium,
          idv: 2500000,
          ncb: 25,
          startDate: '2026-07-27',
          expiryDate: '2027-07-26'
        });

        store.addPayment({
          clientId: clientObj.id,
          clientName: clientObj.name,
          phone: clientObj.phone,
          email: clientObj.email,
          policyType: `Motor: ${this.flowData.vehicleModel}`,
          invoiceNumber: `INV-MOT-${Math.floor(1000 + Math.random()*9000)}`,
          totalAmount: premium,
          paidAmount: 0,
          remainingAmount: premium,
          dueDate: '2027-07-26',
          status: 'Pending'
        });

        const reply = `✅ **Success!** I have created the Motor Insurance deal for **${clientObj.name}**!\n` +
          `• Vehicle: ${this.flowData.vehicleModel} (${this.flowData.vehicleNumber})\n` +
          `• Premium: ₹${premium.toLocaleString('en-IN')}\n` +
          `• Automatic reminders linked!`;

        this.activeFlow = null;
        this.flowStep = 0;
        this.flowData = {};
        this.replyAndSpeak(reply);
        return;
      }
    }

    if (this.activeFlow === 'add_health') {
      if (this.flowStep === 1) {
        this.flowData.clientName = answerText;
        this.flowStep = 2;
        const reply = `Got it! Client: **${answerText}**. Next, what is the **Health Insurer Company**? (e.g. Star Health, Niva Bupa, Care)`;
        this.replyAndSpeak(reply);
        return;
      }
      if (this.flowStep === 2) {
        this.flowData.company = answerText;
        this.flowStep = 3;
        const reply = `Company: **${answerText}**. What is the **Annual Premium** amount in Rupees?`;
        this.replyAndSpeak(reply);
        return;
      }
      if (this.flowStep === 3) {
        const premium = Number(answerText.replace(/[^0-9]/g, '')) || 35000;

        let clientObj = db.clients.find(c => c.name.toLowerCase() === this.flowData.clientName.toLowerCase());
        if (!clientObj) {
          clientObj = store.addClient({
            name: this.flowData.clientName,
            phone: '+91 98000 12345',
            email: `${this.flowData.clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            pan: `PAN${Math.floor(10000 + Math.random()*90000)}K`,
            services: ['Health Insurance'],
            city: 'Mumbai',
            state: 'Maharashtra'
          });
        }

        store.addHealthPolicy({
          clientId: clientObj.id,
          clientName: clientObj.name,
          company: this.flowData.company,
          policyNumber: `HEA-${Math.floor(10000000 + Math.random()*90000000)}`,
          membersCovered: 'Self + Family',
          sumInsured: 2500000,
          premium: premium,
          startDate: '2026-07-27',
          expiryDate: '2027-07-26'
        });

        const reply = `✅ **Success!** Health policy cover created for **${clientObj.name}** (${this.flowData.company}, Premium: ₹${premium.toLocaleString('en-IN')})!`;
        this.activeFlow = null;
        this.flowStep = 0;
        this.flowData = {};
        this.replyAndSpeak(reply);
        return;
      }
    }

    // Default fallback if flow state is unclear
    this.activeFlow = null;
    this.processQuery(answerText);
  }

  replyAndSpeak(replyText) {
    this.messages.push({ sender: 'ai', text: replyText });
    this.lastResponse = replyText;
    this.notifyState();
    this.speak(replyText);
  }

  notifyState() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange({
        isListening: this.isListening,
        isSpeaking: this.isSpeaking,
        transcript: this.transcript,
        lastResponse: this.lastResponse,
        messages: this.messages
      });
    }
  }
}

export const voiceAssistant = new VoiceAssistantEngine();
