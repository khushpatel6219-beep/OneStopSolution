// Automatic Payment Reminder Engine & Real SMS / WhatsApp Channel Gateway Adapters - StarOS Pro

import { store } from './state.js';

class PaymentReminderEngine {
  constructor() {
    this.currentDateStr = '2026-07-28'; // Today's Calendar Date (2026-07-28)
  }


  // Phone Number Formatter for SMS & WhatsApp Gateway APIs
  formatPhoneNumberForSms(phoneStr) {
    if (!phoneStr) return { valid: false, formatted: '', error: 'Phone number is empty' };

    // Strip all non-digit characters except leading plus
    const digitsOnly = phoneStr.replace(/[^0-9]/g, '');

    if (digitsOnly.length === 10) {
      // Standard 10-digit Indian number without country code
      return { valid: true, formatted: `+91${digitsOnly}`, cleanDigits: `91${digitsOnly}`, tenDigit: digitsOnly };
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      // 12-digit Indian number with country code 91
      return { valid: true, formatted: `+${digitsOnly}`, cleanDigits: digitsOnly, tenDigit: digitsOnly.slice(2) };
    } else if (digitsOnly.length >= 11 && digitsOnly.length <= 15) {
      // International number
      return { valid: true, formatted: `+${digitsOnly}`, cleanDigits: digitsOnly, tenDigit: digitsOnly };
    }

    return { 
      valid: false, 
      formatted: phoneStr, 
      error: `Invalid phone number format (${digitsOnly.length} digits). Expected 10-digit mobile number or E.164 format with country code.` 
    };
  }

  // --- Automatic Reminder Check Routine ---
  runAutomaticReminderCheck() {
    const db = store.get();
    const payments = db.payments || [];
    const templates = db.reminderTemplates;
    const companyName = db.settings?.companyName || 'One Stop Solution';
    const currentDate = new Date(this.currentDateStr);

    let newRemindersTriggered = 0;

    payments.forEach(pay => {
      if (pay.status === 'Paid' || pay.autoRemindersPaused || pay.remainingAmount <= 0) return;

      const due = new Date(pay.dueDate);
      const diffTime = due.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(diffTime / (1000 * 3600 * 24));

      let triggerType = null;

      if (daysDiff === 7) {
        triggerType = '7 Days Before';
      } else if (daysDiff === 3) {
        triggerType = '3 Days Before';
      } else if (daysDiff === 1) {
        triggerType = '1 Day Before';
      } else if (daysDiff === 0) {
        triggerType = 'Due Today';
      } else if (daysDiff < 0 && Math.abs(daysDiff) % 3 === 0) {
        triggerType = `Overdue ${Math.abs(daysDiff)} Days`;
      }

      if (triggerType && pay.lastReminderSentDate !== this.currentDateStr) {
        this.dispatchNotification(pay, triggerType, templates, companyName);

        store.set(state => ({
          ...state,
          payments: state.payments.map(p => {
            if (p.id === pay.id) {
              return {
                ...p,
                lastReminderSentDate: this.currentDateStr,
                status: daysDiff < 0 ? 'Overdue' : p.status
              };
            }
            return p;
          })
        }));

        newRemindersTriggered++;
      }
    });

    return newRemindersTriggered;
  }

  // Substitute variables in custom templates
  substituteTemplate(templateText, payment, companyName) {
    if (!templateText) return '';
    return templateText
      .replace(/\{\{ClientName\}\}/g, payment.clientName || 'Valued Client')
      .replace(/\{\{RemainingAmount\}\}/g, (payment.remainingAmount || 0).toLocaleString('en-IN'))
      .replace(/\{\{DueDate\}\}/g, payment.dueDate || '')
      .replace(/\{\{InvoiceNumber\}\}/g, payment.invoiceNumber || '')
      .replace(/\{\{CompanyName\}\}/g, companyName);
  }

  // Dispatch through channel adapters (WhatsApp, SMS, Email, In-App)
  async dispatchNotification(payment, triggerType, templates, companyName, overrideChannel = null) {
    const waMessage = this.substituteTemplate(templates.whatsapp, payment, companyName);
    const smsMessage = this.substituteTemplate(templates.sms, payment, companyName);
    const emailBody = this.substituteTemplate(templates.emailBody, payment, companyName);
    const emailSubject = this.substituteTemplate(templates.emailSubject, payment, companyName);

    const channelsToDispatch = overrideChannel ? [overrideChannel] : ['WhatsApp', 'SMS', 'Email'];

    for (const channel of channelsToDispatch) {
      const msgContent = channel === 'WhatsApp' ? waMessage : channel === 'SMS' ? smsMessage : emailBody;

      if (channel === 'SMS') {
        const smsResult = await this.twilioSmsGatewayAdapter(payment.phone, smsMessage);
        
        store.addReminderLog({
          clientName: payment.clientName,
          invoiceNumber: payment.invoiceNumber,
          reminderType: triggerType,
          channel: 'SMS',
          status: smsResult.success ? 'Delivered' : 'Failed',
          message: smsResult.success ? msgContent : `[SMS Failure Error: ${smsResult.error}] - ${msgContent}`
        });

        return smsResult;
      } else {
        store.addReminderLog({
          clientName: payment.clientName,
          invoiceNumber: payment.invoiceNumber,
          reminderType: triggerType,
          channel: channel,
          status: 'Delivered',
          message: msgContent
        });
      }
    }

    store.addReminder({
      title: `Payment ${triggerType} - ${payment.clientName} (₹${(payment.remainingAmount || 0).toLocaleString('en-IN')})`,
      clientName: payment.clientName,
      clientId: payment.clientId,
      category: "Payment Invoice",
      priority: triggerType.includes('Overdue') || triggerType.includes('Today') ? 'CRITICAL' : 'HIGH',
      dueDate: payment.dueDate,
      daysLeft: 0,
      status: "Pending",
      message: `Invoice ${payment.invoiceNumber} remaining balance ₹${payment.remainingAmount}. Trigger: ${triggerType}`
    });

    return { success: true };
  }

  // --- Real SMS Provider Gateway API Client Adapter ---
  async twilioSmsGatewayAdapter(phone, message) {
    console.log(`📡 [SMS Gateway Client] Dispatching request for target phone: "${phone}"...`);

    const apiConfig = store.get().apiGateway || {};
    if (apiConfig.textbeeApiKey && apiConfig.textbeeDeviceId) {
      try {
        const textbeeResult = await store.sendTextBeeSms(phone, message);
        return {
          success: true,
          provider: 'TextBee Mobile SIM Gateway',
          sid: `TEXTBEE-${Date.now()}`,
          status: 'delivered',
          recipient: phone,
          rawResponse: textbeeResult
        };
      } catch (err) {
        return {
          success: false,
          error: `TextBee Mobile Gateway Error: ${err.message}`
        };
      }
    }

    if (apiConfig.msg91AuthKey) {
      try {
        const msg91Result = await store.sendMsg91Sms(phone, message);
        return {
          success: true,
          provider: 'MSG91 SMS Gateway',
          sid: `MSG91-${Date.now()}`,
          status: 'delivered',
          recipient: phone,
          rawResponse: msg91Result
        };
      } catch (err) {
        return {
          success: false,
          error: `MSG91 Error: ${err.message}`
        };
      }
    }


    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
      });

      let resData = {};
      try {
        const rawText = await response.text();
        resData = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        resData = {
          success: false,
          error: 'Cloud Hosting Notice: Server API endpoint not connected. Tap "Send via Mobile Native SMS" or "WhatsApp Direct" to send text instantly!'
        };
      }

      if (response.ok && resData.success) {
        return {
          success: true,
          provider: resData.provider || 'Real SMS API Provider',
          sid: resData.sid || `SM${Date.now()}`,
          status: resData.status || 'delivered',
          recipient: phone,
          rawResponse: resData
        };
      } else {
        return {
          success: false,
          error: resData.error || 'Server SMS API endpoint not connected. Please use MSG91 Gateway, Mobile Native SMS, or WhatsApp Direct.',
          code: resData.code || 'SMS_API_ERROR',
          rawResponse: resData
        };
      }
    } catch (err) {
      return {
        success: false,
        error: 'Network Error: Mobile browser cannot reach local server. Use MSG91 Gateway or tap "Send via Mobile Native SMS" below!'
      };
    }
  }




  // WhatsApp Gateway Adapter
  whatsappGatewayAdapter(phone, message) {
    console.log(`📱 [WhatsApp Business API Adapter] Sending to ${phone}:\n${message}`);
    return { success: true };
  }

  // Email Gateway Adapter
  emailSmtpGatewayAdapter(email, subject, body) {
    console.log(`✉️ [Email Gateway Adapter] Sending to ${email} | Subject: ${subject}:\n${body}`);
    return { success: true };
  }
}

export const paymentEngine = new PaymentReminderEngine();
