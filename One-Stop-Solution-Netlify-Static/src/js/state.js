// Helper: Date Formatter to DD/MM/YYYY format
export function formatDateDMY(dateStr) {
  if (!dateStr) return 'N/A';
  const cleanStr = String(dateStr).trim();
  if (cleanStr.includes('/')) return cleanStr;
  const parts = cleanStr.split(' ')[0].split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return cleanStr;
}

export function getLiveCurrentDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


import { seedData } from './seedData.js';

const STORAGE_KEY = 'onestop_solution_v18_restored_demo';








class StateStore {
  constructor() {
    this.listeners = [];
    this.lastSyncTimestamp = 0;
    this.data = this.loadState();
    this.initServerSync();
  }

  async initServerSync() {
    if (typeof window === 'undefined' || !window.fetch) return;

    // 1. Initial Central Cloud Sync Fetch
    try {
      const res = await fetch('https://api.jsonbin.io/v3/b/66b5e526e41b4d34e41f712a/latest', {
        headers: { 'X-Bin-Meta': 'false' }
      }).catch(() => null);

      if (res && res.ok) {
        const remoteData = await res.json();
        if (remoteData && typeof remoteData === 'object' && (Array.isArray(remoteData.clients) || remoteData.isCleared)) {
          this.data = { ...seedData, ...remoteData };
          this.saveLocalOnly();
          this.notify();
          console.log('☁️ Central Cloud State loaded cleanly across devices.');
        }
      }
    } catch (err) {
      console.warn('Central cloud sync fetch info:', err.message);
    }

    // 2. Multi-Device Real-Time Poller (every 4 seconds)
    setInterval(async () => {
      try {
        const res = await fetch('https://api.jsonbin.io/v3/b/66b5e526e41b4d34e41f712a/latest', {
          headers: { 'X-Bin-Meta': 'false' }
        }).catch(() => null);

        if (res && res.ok) {
          const remoteData = await res.json();
          if (remoteData && typeof remoteData === 'object' && (Array.isArray(remoteData.clients) || remoteData.isCleared)) {
            const remoteStr = JSON.stringify(remoteData);
            const localStr = JSON.stringify(this.data);
            if (remoteStr !== localStr) {
              this.data = remoteData;
              this.saveLocalOnly();
              this.notify();
              console.log('🔄 Central Cloud State updated from remote device.');
            }
          }
        }
      } catch (e) {}
    }, 4000);
  }

  loadState() {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...seedData,
          ...parsed,
          clients: Array.isArray(parsed.clients) ? parsed.clients : [],
          motorPolicies: Array.isArray(parsed.motorPolicies) ? parsed.motorPolicies : [],
          healthPolicies: Array.isArray(parsed.healthPolicies) ? parsed.healthPolicies : [],
          lifePolicies: Array.isArray(parsed.lifePolicies) ? parsed.lifePolicies : [],
          payments: Array.isArray(parsed.payments) ? parsed.payments : [],
          reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
          calendarEvents: Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : [],
          reminderLogs: Array.isArray(parsed.reminderLogs) ? parsed.reminderLogs : [],
          activities: Array.isArray(parsed.activities) ? parsed.activities : [],
          apiGateway: {
            ...seedData.apiGateway,
            ...(parsed.apiGateway || {}),
            msg91AuthKey: parsed.apiGateway?.msg91AuthKey || "556820AE979D0Hnh06a70300cP1",
            msg91SenderId: parsed.apiGateway?.msg91SenderId || "ONESTP"
          },
          recycleBin: Array.isArray(parsed.recycleBin) ? parsed.recycleBin : []
        };
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    return {
      ...seedData,
      recycleBin: []
    };
  }

  isAuthenticated() {
    if (typeof localStorage === 'undefined') return true;
    return localStorage.getItem('onestop_auth_logged_in') === 'true';
  }

  login(username, password) {
    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '').trim().replace(/\s+/g, '');
    if (cleanUser === 'OneStopSolution' && (cleanPass === '9879614102' || cleanPass === '98796 14102')) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('onestop_auth_logged_in', 'true');
        localStorage.setItem('onestop_auth_user', cleanUser);
      }
      this.notify();
      return true;
    }
    return false;
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('onestop_auth_logged_in');
      localStorage.removeItem('onestop_auth_user');
    }
    this.notify();
  }

  clearAllDemoData() {
    this.data = {
      ...this.data,
      isCleared: true,
      clients: [],
      motorPolicies: [],
      healthPolicies: [],
      lifePolicies: [],
      payments: [],
      reminders: [],
      calendarEvents: [],
      reminderLogs: [],
      activities: []
    };
    this.saveState();
    this.notify();
  }


  saveLocalOnly() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  async saveState() {
    this.saveLocalOnly();
    if (typeof window !== 'undefined' && window.fetch) {
      try {
        await fetch('https://api.jsonbin.io/v3/b/66b5e526e41b4d34e41f712a', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Bin-Meta': 'false'
          },
          body: JSON.stringify(this.data)
        }).catch(() => {});
      } catch (err) {
        console.warn('Backend DB sync post warning:', err.message);
      }
    }
  }


  get() {
    return this.data;
  }

  set(updater) {
    this.data = typeof updater === 'function' ? updater(this.data) : updater;
    this.saveState();
    this.notify();
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.data));
  }

  // --- Client CRUD Helpers ---
  addClient(newClient) {
    const todayStr = getLiveCurrentDateStr();
    const clientObj = {
      id: `cli-${Date.now().toString().slice(-4)}`,
      createdAt: todayStr,
      status: 'Active',
      services: newClient.services || ['Motor Insurance'],
      tags: newClient.tags || ['General'],
      family: newClient.family || { spouse: '', children: [], nominee: '' },
      emergencyContact: newClient.emergencyContact || { name: '', relation: '', phone: '' },
      images: newClient.images || [],
      ...newClient
    };
    this.set(state => ({
      ...state,
      clients: [clientObj, ...state.clients],
      calendarEvents: [
        {
          id: `cal-cli-${Date.now()}`,
          title: `Client Onboarded: ${clientObj.name}`,
          client: clientObj.name,
          date: todayStr,
          time: '10:30 AM',
          type: 'CRM Lead',
          color: 'emerald'
        },
        ...(state.calendarEvents || [])
      ],
      activities: [
        {
          id: `act-${Date.now()}`,
          clientId: clientObj.id,
          type: 'Client Added',
          title: 'New Client Onboarded',
          description: `Client record created for ${clientObj.name}.`,
          date: `${todayStr} 10:30 AM`,
          user: 'Khush Patel (Owner)'
        },
        ...state.activities
      ]
    }));
    return clientObj;
  }

  updateClient(id, updatedFields) {
    this.set(state => ({
      ...state,
      clients: state.clients.map(c => c.id === id ? { ...c, ...updatedFields } : c)
    }));
  }

  deleteClient(id) {
    this.set(state => {
      const target = state.clients.find(c => c.id === id);
      if (!target) return state;

      const targetNameLower = (target.name || '').toLowerCase();
      const linkedMotor = (state.motorPolicies || []).filter(m => m.clientId === id || (m.clientName && m.clientName.toLowerCase() === targetNameLower));
      const linkedHealth = (state.healthPolicies || []).filter(h => h.clientId === id || (h.clientName && h.clientName.toLowerCase() === targetNameLower));
      const linkedLife = (state.lifePolicies || []).filter(l => l.clientId === id || (l.clientName && l.clientName.toLowerCase() === targetNameLower));
      const linkedPayments = (state.payments || []).filter(p => p.clientId === id || (p.clientName && p.clientName.toLowerCase() === targetNameLower));
      const linkedReminders = (state.reminders || []).filter(r => r.clientId === id || (r.clientName && r.clientName.toLowerCase() === targetNameLower));

      const binItem = {
        binId: `bin-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        itemType: 'Client Record',
        title: target.name,
        subtitle: `Phone: ${target.phone || 'N/A'} | PAN: ${target.pan || 'N/A'} (${linkedMotor.length + linkedHealth.length + linkedLife.length} policies)`,
        itemData: target,
        linkedData: {
          motorPolicies: linkedMotor,
          healthPolicies: linkedHealth,
          lifePolicies: linkedLife,
          payments: linkedPayments,
          reminders: linkedReminders
        },
        originalArray: 'clients',
        deletedAt: new Date().toLocaleString('en-IN')
      };

      return {
        ...state,
        clients: state.clients.filter(c => c.id !== id),
        motorPolicies: (state.motorPolicies || []).filter(m => m.clientId !== id && (!m.clientName || m.clientName.toLowerCase() !== targetNameLower)),
        healthPolicies: (state.healthPolicies || []).filter(h => h.clientId !== id && (!h.clientName || h.clientName.toLowerCase() !== targetNameLower)),
        lifePolicies: (state.lifePolicies || []).filter(l => l.clientId !== id && (!l.clientName || l.clientName.toLowerCase() !== targetNameLower)),
        payments: (state.payments || []).filter(p => p.clientId !== id && (!p.clientName || p.clientName.toLowerCase() !== targetNameLower)),
        reminders: (state.reminders || []).filter(r => r.clientId !== id && (!r.clientName || r.clientName.toLowerCase() !== targetNameLower)),
        recycleBin: [binItem, ...(state.recycleBin || [])]
      };
    });
    return true;
  }

  deleteMotorPolicy(id) {
    this.set(state => {
      const target = state.motorPolicies.find(m => m.id === id);
      if (!target) return state;
      const binItem = {
        binId: `bin-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        itemType: 'Motor Policy',
        title: `${target.vehicleModel} (${target.registrationNumber || 'N/A'})`,
        subtitle: `Client: ${target.clientName} | Policy #: ${target.policyNumber || 'N/A'}`,
        itemData: target,
        originalArray: 'motorPolicies',
        deletedAt: new Date().toLocaleString('en-IN')
      };
      return {
        ...state,
        motorPolicies: state.motorPolicies.filter(m => m.id !== id),
        recycleBin: [binItem, ...(state.recycleBin || [])]
      };
    });
    return true;
  }

  deleteHealthPolicy(id) {
    this.set(state => {
      const target = state.healthPolicies.find(h => h.id === id);
      if (!target) return state;
      const binItem = {
        binId: `bin-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        itemType: 'Health Policy',
        title: `${target.planName || target.company} (${target.policyNumber || 'N/A'})`,
        subtitle: `Client: ${target.clientName} | Cover: ₹${(target.sumInsured || 0).toLocaleString('en-IN')}`,
        itemData: target,
        originalArray: 'healthPolicies',
        deletedAt: new Date().toLocaleString('en-IN')
      };
      return {
        ...state,
        healthPolicies: state.healthPolicies.filter(h => h.id !== id),
        recycleBin: [binItem, ...(state.recycleBin || [])]
      };
    });
    return true;
  }

  deleteLifePolicy(id) {
    this.set(state => {
      const target = state.lifePolicies.find(l => l.id === id);
      if (!target) return state;
      const binItem = {
        binId: `bin-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        itemType: 'Life Policy',
        title: `${target.policyType || target.company} (${target.policyNumber || 'N/A'})`,
        subtitle: `Client: ${target.clientName} | Sum Assured: ₹${(target.sumAssured || 0).toLocaleString('en-IN')}`,
        itemData: target,
        originalArray: 'lifePolicies',
        deletedAt: new Date().toLocaleString('en-IN')
      };
      return {
        ...state,
        lifePolicies: state.lifePolicies.filter(l => l.id !== id),
        recycleBin: [binItem, ...(state.recycleBin || [])]
      };
    });
    return true;
  }

  // --- Recycle Bin Controls ---
  restoreFromRecycleBin(binId) {
    this.set(state => {
      const binItem = (state.recycleBin || []).find(b => b.binId === binId);
      if (!binItem) return state;

      const targetArrayName = binItem.originalArray;
      const existingArray = state[targetArrayName] || [];

      let updatedState = {
        ...state,
        [targetArrayName]: [binItem.itemData, ...existingArray],
        recycleBin: (state.recycleBin || []).filter(b => b.binId !== binId)
      };

      if (binItem.linkedData) {
        if (binItem.linkedData.motorPolicies) {
          updatedState.motorPolicies = [...(binItem.linkedData.motorPolicies || []), ...(updatedState.motorPolicies || [])];
        }
        if (binItem.linkedData.healthPolicies) {
          updatedState.healthPolicies = [...(binItem.linkedData.healthPolicies || []), ...(updatedState.healthPolicies || [])];
        }
        if (binItem.linkedData.lifePolicies) {
          updatedState.lifePolicies = [...(binItem.linkedData.lifePolicies || []), ...(updatedState.lifePolicies || [])];
        }
        if (binItem.linkedData.payments) {
          updatedState.payments = [...(binItem.linkedData.payments || []), ...(updatedState.payments || [])];
        }
        if (binItem.linkedData.reminders) {
          updatedState.reminders = [...(binItem.linkedData.reminders || []), ...(updatedState.reminders || [])];
        }
      }

      return updatedState;
    });
  }

  permanentlyDeleteFromRecycleBin(binId) {
    this.set(state => ({
      ...state,
      recycleBin: (state.recycleBin || []).filter(b => b.binId !== binId)
    }));
  }

  emptyRecycleBin() {
    this.set(state => ({
      ...state,
      recycleBin: []
    }));
  }

  addDocument(docObj) {
    this.set(state => ({
      ...state,
      documents: [
        {
          id: `doc-${Date.now()}`,
          uploadDate: getLiveCurrentDateStr(),
          status: 'Verified',
          ...docObj
        },
        ...(state.documents || [])
      ]
    }));
  }

  deleteDocument(docId) {
    this.set(state => ({
      ...state,
      documents: (state.documents || []).filter(d => d.id !== docId)
    }));
  }


  addClientImage(clientId, imageObj) {
    this.set(state => ({
      ...state,
      clients: state.clients.map(c => {
        if (c.id === clientId) {
          const imgs = c.images || [];
          return {
            ...c,
            images: [imageObj, ...imgs]
          };
        }
        return c;
      })
    }));
  }

  // --- Motor Policy CRUD Helpers ---
  addMotorPolicy(policy) {
    const todayStr = getLiveCurrentDateStr();
    const expiry = policy.expiryDate || '2027-07-26';
    const status = expiry === todayStr ? 'Expiring Today' : expiry < todayStr ? 'Expired' : 'Active';
    const newPol = {
      id: `mot-${Date.now().toString().slice(-4)}`,
      status: status,
      claimStatus: 'No Claims',
      ...policy
    };
    this.set(state => ({
      ...state,
      motorPolicies: [newPol, ...state.motorPolicies],
      calendarEvents: [
        {
          id: `cal-mot-${Date.now()}`,
          title: `Motor Renewal: ${newPol.vehicleModel}`,
          client: newPol.clientName,
          date: expiry,
          time: '11:00 AM',
          type: 'Renewal',
          color: expiry === todayStr ? 'rose' : 'amber'
        },
        ...(state.calendarEvents || [])
      ],
      reminders: [
        {
          id: `rem-mot-${Date.now()}`,
          title: `Motor Policy Expiry - ${newPol.clientName} (${newPol.vehicleModel})`,
          clientName: newPol.clientName,
          clientId: newPol.clientId,
          category: 'Motor Insurance',
          priority: expiry === todayStr ? 'CRITICAL' : 'HIGH',
          dueDate: expiry,
          daysLeft: 0,
          status: 'Pending',
          message: `Policy ${newPol.policyNumber} renewal premium ₹${newPol.premium.toLocaleString('en-IN')} due on ${expiry}.`
        },
        ...(state.reminders || [])
      ]
    }));
    return newPol;
  }


  updateMotorPolicy(id, updatedFields) {
    this.set(state => {
      const pol = state.motorPolicies.find(m => m.id === id);
      const newExpiry = updatedFields.expiryDate || pol?.expiryDate;
      let newStatus = pol?.status || 'Active';

      if (newExpiry) {
        newStatus = newExpiry === '2026-07-28' ? 'Expiring Today' : newExpiry < '2026-07-28' ? 'Expired' : 'Active';
      }

      const updatedMotor = state.motorPolicies.map(m => m.id === id ? { ...m, ...updatedFields, status: newStatus } : m);

      // Sync linked payment invoices
      const updatedPayments = state.payments.map(p => {
        if (pol && (p.clientId === pol.clientId || p.clientName === pol.clientName || p.policyType.includes(pol.vehicleModel))) {
          if (newExpiry) return { ...p, dueDate: newExpiry };
        }
        return p;
      });

      return {
        ...state,
        motorPolicies: updatedMotor,
        payments: updatedPayments
      };
    });
  }

  // --- Health Policy CRUD Helpers ---
  addHealthPolicy(policy) {
    const expiry = policy.expiryDate || '2027-07-26';
    const status = expiry === '2026-07-28' ? 'Expiring Today' : expiry < '2026-07-28' ? 'Expired' : 'Active';
    const newPol = {
      id: `hea-${Date.now().toString().slice(-4)}`,
      status: status,
      ...policy
    };
    this.set(state => ({
      ...state,
      healthPolicies: [newPol, ...state.healthPolicies]
    }));
    return newPol;
  }

  updateHealthPolicy(id, updatedFields) {
    this.set(state => {
      const pol = state.healthPolicies.find(h => h.id === id);
      const newExpiry = updatedFields.expiryDate || pol?.expiryDate;
      let newStatus = pol?.status || 'Active';

      if (newExpiry) {
        newStatus = newExpiry === '2026-07-28' ? 'Expiring Today' : newExpiry < '2026-07-28' ? 'Expired' : 'Active';
      }

      const updatedHealth = state.healthPolicies.map(h => h.id === id ? { ...h, ...updatedFields, status: newStatus } : h);

      const updatedPayments = state.payments.map(p => {
        if (pol && (p.clientId === pol.clientId || p.clientName === pol.clientName || p.policyType.includes(pol.company))) {
          if (newExpiry) return { ...p, dueDate: newExpiry };
        }
        return p;
      });

      return {
        ...state,
        healthPolicies: updatedHealth,
        payments: updatedPayments
      };
    });
  }

  // --- Life Policy CRUD Helpers ---
  addLifePolicy(policy) {
    const due = policy.dueDate || '2027-07-26';
    const status = due === '2026-07-28' ? 'Expiring Today' : due < '2026-07-28' ? 'Overdue' : 'Active';
    const newPol = {
      id: `lif-${Date.now().toString().slice(-4)}`,
      status: status,
      ...policy
    };
    this.set(state => ({
      ...state,
      lifePolicies: [newPol, ...state.lifePolicies]
    }));
    return newPol;
  }

  updateLifePolicy(id, updatedFields) {
    this.set(state => {
      const pol = state.lifePolicies.find(l => l.id === id);
      const newDue = updatedFields.dueDate || pol?.dueDate;
      let newStatus = pol?.status || 'Active';

      if (newDue) {
        newStatus = newDue === '2026-07-28' ? 'Expiring Today' : newDue < '2026-07-28' ? 'Overdue' : 'Active';
      }

      const updatedLife = state.lifePolicies.map(l => l.id === id ? { ...l, ...updatedFields, status: newStatus } : l);

      const updatedPayments = state.payments.map(p => {
        if (pol && (p.clientId === pol.clientId || p.clientName === pol.clientName || p.policyType.includes(pol.company))) {
          if (newDue) return { ...p, dueDate: newDue };
        }
        return p;
      });

      return {
        ...state,
        lifePolicies: updatedLife,
        payments: updatedPayments
      };
    });
  }

  // --- Automatic Payment & Collection Helpers ---
  addPayment(payment) {
    const newPay = {
      id: `pay-${Date.now().toString().slice(-4)}`,
      invoiceNumber: payment.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      totalAmount: Number(payment.totalAmount || payment.grossAmount || 0),
      paidAmount: Number(payment.paidAmount || 0),
      remainingAmount: Number(payment.totalAmount || payment.grossAmount || 0) - Number(payment.paidAmount || 0),
      status: payment.paidAmount >= payment.totalAmount ? 'Paid' : 'Pending',
      autoRemindersPaused: false,
      lastReminderSentDate: '',
      ...payment
    };
    this.set(state => ({
      ...state,
      payments: [newPay, ...state.payments]
    }));
    return newPay;
  }

  markPaymentPaid(id, paidAmountInput = null) {
    this.set(state => ({
      ...state,
      payments: state.payments.map(p => {
        if (p.id === id) {
          const newPaid = paidAmountInput !== null ? Number(paidAmountInput) : p.totalAmount;
          const rem = Math.max(0, p.totalAmount - newPaid);
          const newStatus = rem === 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : 'Pending';

          return {
            ...p,
            paidAmount: newPaid,
            remainingAmount: rem,
            status: newStatus
          };
        }
        return p;
      })
    }));
  }

  reschedulePaymentDueDate(id, newDueDate) {
    this.set(state => ({
      ...state,
      payments: state.payments.map(p => {
        if (p.id === id) {
          const isOverdue = new Date(newDueDate) < new Date('2026-07-28');
          return {
            ...p,
            dueDate: newDueDate,
            status: p.status === 'Paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'
          };
        }
        return p;
      })
    }));
  }

  toggleAutoReminders(id) {
    this.set(state => ({
      ...state,
      payments: state.payments.map(p => p.id === id ? { ...p, autoRemindersPaused: !p.autoRemindersPaused } : p)
    }));
  }

  updateReminderTemplates(newTemplates) {
    this.set(state => ({
      ...state,
      reminderTemplates: {
        ...state.reminderTemplates,
        ...newTemplates
      }
    }));
  }

  updateApiGateway(newConfig) {
    this.set(state => ({
      ...state,
      apiGateway: {
        ...state.apiGateway,
        ...newConfig,
        status: newConfig.msg91AuthKey ? 'Active (MSG91 Connected)' : 'Configured'
      }
    }));
  }

  async sendMsg91Sms(phone, message) {
    const config = this.get().apiGateway || {};
    const authKey = config.msg91AuthKey || '556820AE979D0Hnh06a70300cP1';
    const senderId = config.msg91SenderId || 'ONESTP';
    const flowId = config.msg91FlowId;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const mobileWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    try {
      const backendRes = await fetch('/api/send-msg91-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authKey,
          senderId,
          flowId,
          phone: mobileWithCountry,
          message
        })
      });
      if (backendRes.ok) {
        const result = await backendRes.json();
        this.addReminderLog({
          clientName: phone,
          channel: 'MSG91 SMS',
          status: 'Delivered',
          details: `Sent via MSG91 API (Sender: ${senderId})`
        });
        return result;
      }
    } catch (err) {
      console.warn('Backend MSG91 proxy warning, trying direct client request:', err.message);
    }

    // Direct MSG91 Flow/SMS API Request
    const msg91Url = flowId 
      ? 'https://control.msg91.com/api/v5/flow/' 
      : `https://api.msg91.com/api/v2/sendsms`;

    const payload = flowId ? {
      flow_id: flowId,
      sender: senderId,
      recipients: [{ mobiles: mobileWithCountry, message: message }]
    } : {
      sender: senderId,
      route: '4',
      country: '91',
      sms: [{ message: message, to: [mobileWithCountry] }]
    };

    const res = await fetch(msg91Url, {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    this.addReminderLog({
      clientName: phone,
      channel: 'MSG91 SMS',
      status: res.ok ? 'Delivered' : 'Failed',
      details: `MSG91 Direct API Status: ${data.message || res.statusText}`
    });
    return data;
  }

  async sendTextBeeSms(phone, message) {
    const config = this.get().apiGateway || {};
    const apiKey = config.textbeeApiKey;
    const deviceId = config.textbeeDeviceId;
    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    if (!apiKey || !deviceId) {
      throw new Error('TextBee Mobile Gateway API Key or Device ID is missing. Enter them in Settings -> Mobile SIM Gateway.');
    }

    const res = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipients: [cleanPhone],
        message: message
      })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.success || data.status === 'success' || data.id)) {
      this.addReminderLog({
        clientName: phone,
        channel: 'Mobile SIM SMS',
        status: 'Delivered',
        details: `Sent via Mobile SIM Gateway (TextBee Device: ${deviceId})`
      });
      return data;
    } else {
      throw new Error(data.message || data.error || 'Failed to send SMS via Mobile Gateway app');
    }
  }

  addReminderLog(logEntry) {

    const newLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Delivered',
      ...logEntry
    };
    this.set(state => ({
      ...state,
      reminderLogs: [newLog, ...state.reminderLogs]
    }));
    return newLog;
  }


  // --- Document Vault ---
  addDocument(doc) {
    const newDoc = {
      id: `doc-${Date.now().toString().slice(-4)}`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Verified',
      fileUrl: doc.fileUrl || '',
      fileDataUrl: doc.fileDataUrl || doc.fileUrl || '',
      ...doc
    };
    this.set(state => ({
      ...state,
      documents: [newDoc, ...(state.documents || [])]
    }));
    return newDoc;
  }

  // --- Reminders & Calendar ---
  addReminder(reminder) {
    const newRem = {
      id: `rem-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      ...reminder
    };
    this.set(state => ({
      ...state,
      reminders: [newRem, ...state.reminders]
    }));
    return newRem;
  }

  markReminderComplete(id) {
    const rem = this.data.reminders.find(r => r.id === id);
    if (!rem) return;

    this.set(state => {
      const updatedReminders = state.reminders.map(r => r.id === id ? { ...r, status: 'Completed' } : r);

      const updatedMotor = state.motorPolicies.map(m => {
        if (rem.title.includes(m.clientName) || rem.title.includes(m.vehicleModel) || rem.clientName === m.clientName) {
          return { ...m, status: 'Active', expiryDate: '2027-07-27' };
        }
        return m;
      });

      const updatedHealth = state.healthPolicies.map(h => {
        if (rem.title.includes(h.clientName) || rem.title.includes(h.company) || rem.clientName === h.clientName) {
          return { ...h, status: 'Active', expiryDate: '2027-08-01' };
        }
        return h;
      });

      const updatedLife = state.lifePolicies.map(l => {
        if (rem.title.includes(l.clientName) || rem.title.includes(l.company) || rem.clientName === l.clientName) {
          return { ...l, status: 'Active', dueDate: '2027-08-15' };
        }
        return l;
      });

      const newActivity = {
        id: `act-${Date.now()}`,
        clientId: rem.clientId || 'cli-001',
        type: 'Policy Renewal',
        title: `Resolved Renewal: ${rem.clientName || rem.title}`,
        description: `Renewal completed & policy extended to 2027.`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        user: 'Khush Patel (Owner)'
      };

      return {
        ...state,
        reminders: updatedReminders,
        motorPolicies: updatedMotor,
        healthPolicies: updatedHealth,
        lifePolicies: updatedLife,
        activities: [newActivity, ...state.activities]
      };
    });
  }

  // --- Calendar Events CRUD ---
  addCalendarEvent(eventData) {
    const newEvent = {
      id: `cal-${Date.now().toString().slice(-4)}`,
      color: eventData.type === 'Meeting' ? 'emerald' : eventData.type === 'Renewal' ? 'rose' : 'amber',
      ...eventData
    };
    this.set(state => ({
      ...state,
      calendarEvents: [newEvent, ...state.calendarEvents]
    }));
    return newEvent;
  }

  updateCalendarEvent(id, updatedFields) {
    this.set(state => ({
      ...state,
      calendarEvents: state.calendarEvents.map(e => e.id === id ? { ...e, ...updatedFields } : e)
    }));
  }

  deleteCalendarEvent(id) {
    this.set(state => ({
      ...state,
      calendarEvents: state.calendarEvents.filter(e => e.id !== id)
    }));
  }

  async sendMsg91Sms(phone, message) {
    const apiConfig = this.data.apiGateway || {};
    const authKey = apiConfig.msg91AuthKey || '556820AE979D0Hnh06a70300cP1';
    const senderId = apiConfig.msg91SenderId || 'ONESTP';
    const endpoint = apiConfig.msg91Endpoint || 'https://control.msg91.com/api/v5/sms/send';

    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    try {
      const response = await fetch('/api/send-msg91-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          message: message,
          authKey: authKey,
          senderId: senderId
        })
      });
      const data = await response.json();
      if (data.success || data.type === 'success') {
        return data;
      }
    } catch (e) {
      console.warn('Backend proxy /api/send-msg91-sms error, using direct MSG91 request:', e);
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: senderId,
        route: '4',
        country: '91',
        sms: [
          {
            message: message,
            to: [cleanPhone]
          }
        ]
      })
    });
    return await res.json();
  }

  resetToSeedData() {
    this.set(() => seedData);
  }
}

export const store = new StateStore();
export const stateStore = store;
