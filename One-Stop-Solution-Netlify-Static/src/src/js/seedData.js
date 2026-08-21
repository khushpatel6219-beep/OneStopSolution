// One Stop Solution - Clean Production Seed Data

export const seedData = {
  settings: {
    appName: "One Stop Solution",
    theme: "light",
    currentUserRole: "owner",
    ownerName: "Owner",
    companyName: "One Stop Solution",
    currency: "INR"
  },

  clients: [],
  motorPolicies: [],
  healthPolicies: [],
  lifePolicies: [],
  payments: [],
  reminders: [],
  calendarEvents: [],
  reminderLogs: [],

  reminderTemplates: [
    {
      id: "tpl-001",
      name: "Standard Policy Renewal Alert",
      channel: "SMS & WhatsApp",
      subject: "Policy Renewal Reminder",
      body: "Dear {client_name}, your {policy_type} policy ({policy_no}) is due for renewal on {due_date}. Premium: Rs. {premium_amount}. Please contact us to renew.\n\nThank you,\nOne Stop Solution"
    },
    {
      id: "tpl-002",
      name: "Payment Due Notice",
      channel: "WhatsApp",
      subject: "Payment Reminder",
      body: "Dear {client_name}, payment of Rs. {premium_amount} for invoice #{invoice_no} is due on {due_date}.\n\nThank you,\nOne Stop Solution"
    }
  ],

  apiGateway: {
    smsProvider: "MSG91 Gateway",
    msg91AuthKey: "556820AE979D0Hnh06a70300cP1",
    msg91SenderId: "ONESTP",
    msg91Endpoint: "https://control.msg91.com/api/v5/sms/send",
    msg91FlowId: "",
    textbeeApiKey: "",
    textbeeDeviceId: "",
    msg91WhatsappNumber: "",
    status: "Connected"
  },

  analytics: {
    monthlyGrowth: 0,
    claimRatio: "0%",
    retentionRate: "100%"
  },

  activities: []
};
