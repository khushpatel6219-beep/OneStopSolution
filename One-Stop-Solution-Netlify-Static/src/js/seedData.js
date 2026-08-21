// One Stop Solution - Production Seed Data with Demo Datasets

export const seedData = {
  settings: {
    appName: "One Stop Solution",
    theme: "light",
    currentUserRole: "owner",
    ownerName: "Owner",
    companyName: "One Stop Solution",
    currency: "INR"
  },

  clients: [
    {
      id: "cli-000",
      name: "khush patel",
      phone: "+91 94087 84562",
      email: "khushpatel6219@gmail.com",
      pan: "HTYT4564J",
      aadhaar: "5566 7788 9900",
      passport: "N/A",
      occupation: "Business Owner",
      city: "Mumbai",
      state: "Maharashtra",
      dob: "1988-05-15",
      status: "Active",
      services: ["Motor Insurance", "Health Insurance"],
      tags: ["Business Owner", "VIP"],
      family: { spouse: "N/A", children: [], nominee: "N/A" },
      emergencyContact: { name: "N/A", relation: "N/A", phone: "N/A" },
      images: []
    },
    {
      id: "cli-001",
      name: "Vikramaditya Singhania",
      phone: "+91 98200 11223",
      email: "vikram@singhania.com",
      pan: "ABCPS1234F",
      aadhaar: "4455 6677 8899",
      passport: "Z9876543",
      occupation: "Industrialist & MD",
      city: "Mumbai",
      state: "Maharashtra",
      dob: "1982-08-14",
      status: "Active",
      services: ["Motor Insurance", "Health Insurance", "Life Insurance"],
      tags: ["VIP", "HNI", "Active"],
      family: { spouse: "Radhika Singhania", children: ["Aryan Singhania (18)", "Ananya Singhania (14)"], nominee: "Radhika Singhania" },
      emergencyContact: { name: "Radhika Singhania", relation: "Spouse", phone: "+91 98200 11224" },
      images: [
        { id: "img-1", title: "PAN Card Document Scan", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop", type: "PAN Card" },
        { id: "img-2", title: "Aadhaar Card Front Photo", url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop", type: "Aadhaar Card" }
      ]
    },
    {
      id: "cli-002",
      name: "Meera Deshmukh",
      phone: "+91 98922 33445",
      email: "meera.d@techlead.in",
      pan: "BEXPD5678K",
      aadhaar: "7788 9900 1122",
      passport: "Y6543210",
      occupation: "VP Engineering",
      city: "Pune",
      state: "Maharashtra",
      dob: "1988-11-20",
      status: "Active",
      services: ["Health Insurance", "Life Insurance"],
      tags: ["Health Insurance", "Life Insurance"],
      family: { spouse: "Amit Deshmukh", children: ["Kavya (6)"], nominee: "Amit Deshmukh" },
      emergencyContact: { name: "Amit Deshmukh", relation: "Spouse", phone: "+91 98922 33446" },
      images: []
    },
    {
      id: "cli-003",
      name: "Rajesh Kumar Mehta",
      phone: "+91 97110 55667",
      email: "rajesh@mehtatraders.com",
      pan: "CPQPM9012L",
      aadhaar: "1122 3344 5566",
      passport: "X1122334",
      occupation: "Textile Businessman",
      city: "Surat",
      state: "Gujarat",
      dob: "1976-03-05",
      status: "Active",
      services: ["Motor Insurance", "Health Insurance"],
      tags: ["Motor Insurance", "VIP"],
      family: { spouse: "Sita Mehta", children: ["Rohan (22)", "Pooja (19)"], nominee: "Sita Mehta" },
      emergencyContact: { name: "Sita Mehta", relation: "Spouse", phone: "+91 97110 55668" },
      images: []
    },
    {
      id: "cli-004",
      name: "Pooja Malhotra",
      phone: "+91 99300 77889",
      email: "pooja.m@designstudio.io",
      pan: "DLCPM3456N",
      aadhaar: "8899 0011 2233",
      passport: "W8877665",
      occupation: "Creative Director",
      city: "Bengaluru",
      state: "Karnataka",
      dob: "1991-09-12",
      status: "Active",
      services: ["Health Insurance", "Life Insurance"],
      tags: ["Health Insurance"],
      family: { spouse: "Karan Malhotra", children: [], nominee: "Karan Malhotra" },
      emergencyContact: { name: "Karan Malhotra", relation: "Spouse", phone: "+91 99300 77890" },
      images: []
    },
    {
      id: "cli-005",
      name: "Dr. Arvind Swaminathan",
      phone: "+91 94440 22334",
      email: "dr.arvind@apollohealth.org",
      pan: "EGPSA8901R",
      aadhaar: "9900 1122 3344",
      passport: "S3344556",
      occupation: "Senior Cardiologist",
      city: "Chennai",
      state: "Tamil Nadu",
      dob: "1972-01-25",
      status: "Active",
      services: ["Motor Insurance", "Health Insurance", "Life Insurance"],
      tags: ["HNI", "Term Life"],
      family: { spouse: "Lakshmi Swaminathan", children: ["Vidya (22)", "Aditya (19)"], nominee: "Lakshmi Swaminathan" },
      emergencyContact: { name: "Lakshmi Swaminathan", relation: "Spouse", phone: "+91 94440 66778" },
      images: []
    }
  ],

  motorPolicies: [
    { id: "mot-000", clientId: "cli-000", clientName: "khush patel", vehicleModel: "BMW", vehicleNumber: "GJ 01 KP 6219", company: "CAR", policyNumber: "MOT-33541222", premium: 50000, idv: 2500000, ncb: 25, startDate: "2025-07-29", expiryDate: "2026-07-28", status: "Expiring Today", claimStatus: "No Claims" },
    { id: "mot-001", clientId: "cli-001", clientName: "Vikramaditya Singhania", vehicleModel: "Mercedes-Benz S-Class", vehicleNumber: "MH 02 FZ 9999", company: "ICICI Lombard", policyNumber: "MOT-2025-98711", premium: 145000, idv: 8500000, ncb: 50, startDate: "2025-07-28", expiryDate: "2026-07-28", status: "Expiring Today", claimStatus: "No Claims" },
    { id: "mot-002", clientId: "cli-003", clientName: "Rajesh Kumar Mehta", vehicleModel: "Toyota Fortuner Legender", vehicleNumber: "GJ 05 CD 4455", company: "HDFC ERGO", policyNumber: "MOT-2025-66120", premium: 68000, idv: 3800000, ncb: 35, startDate: "2025-08-10", expiryDate: "2026-08-09", status: "Active", claimStatus: "No Claims" },
    { id: "mot-003", clientId: "cli-004", clientName: "Pooja Malhotra", vehicleModel: "Kia Seltos GTX+", vehicleNumber: "KA 01 MR 1234", company: "Bajaj Allianz", policyNumber: "MOT-2025-33441", premium: 32000, idv: 1600000, ncb: 20, startDate: "2025-07-30", expiryDate: "2026-07-29", status: "Expiring Soon", claimStatus: "1 Claim Settled" }
  ],

  healthPolicies: [
    { id: "hea-001", clientId: "cli-001", clientName: "Vikramaditya Singhania", company: "Care Health Insurance", policyNumber: "HEA-9900-1122", membersCovered: "Self + Spouse + 2 Kids", sumInsured: 5000000, premium: 85000, startDate: "2025-09-01", expiryDate: "2026-08-31", status: "Active" },
    { id: "hea-002", clientId: "cli-002", clientName: "Meera Deshmukh", company: "Star Health Premier", policyNumber: "HEA-8877-4433", membersCovered: "Self + Spouse + 1 Child", sumInsured: 2500000, premium: 42000, startDate: "2025-08-15", expiryDate: "2026-08-14", status: "Active" },
    { id: "hea-003", clientId: "cli-005", clientName: "Dr. Arvind Swaminathan", company: "Niva Bupa Health Companion", policyNumber: "HEA-5544-7788", membersCovered: "Self + Spouse", sumInsured: 10000000, premium: 120000, startDate: "2025-07-29", expiryDate: "2026-07-28", status: "Expiring Soon" }
  ],

  lifePolicies: [
    { id: "lif-001", clientId: "cli-001", clientName: "Vikramaditya Singhania", company: "HDFC Life Click 2 Protect Ultra", policyNumber: "TERM-9090-88", sumAssured: 50000000, premium: 140000, nominee: "Radhika Singhania", dueDate: "2026-08-15", status: "Active" },
    { id: "lif-002", clientId: "cli-002", clientName: "Meera Deshmukh", company: "Max Life Smart Secure Plus", policyNumber: "TERM-7766-55", sumAssured: 20000000, premium: 36000, nominee: "Amit Deshmukh", dueDate: "2026-09-01", status: "Active" },
    { id: "lif-003", clientId: "cli-005", clientName: "Dr. Arvind Swaminathan", company: "Tata AIA Sampoorna Raksha", policyNumber: "TERM-3322-11", sumAssured: 30000000, premium: 65000, nominee: "Lakshmi Swaminathan", dueDate: "2026-08-05", status: "Active" }
  ],

  payments: [
    { id: "pay-001", invoiceNumber: "INV-2026-9011", clientId: "cli-001", clientName: "Vikramaditya Singhania", phone: "+91 98200 11223", email: "vikram@singhania.com", policyType: "Mercedes S-Class Motor Renewal", totalAmount: 145000, paidAmount: 0, remainingAmount: 145000, dueDate: "2026-07-27", status: "Pending", autoRemindersPaused: false, lastReminderSentDate: "2026-07-27" },
    { id: "pay-002", invoiceNumber: "INV-2026-8842", clientId: "cli-002", clientName: "Meera Deshmukh", phone: "+91 98922 33445", email: "meera.d@techlead.in", policyType: "Star Health Premier Renewal", totalAmount: 42000, paidAmount: 42000, remainingAmount: 0, dueDate: "2026-07-15", status: "Paid", autoRemindersPaused: false, lastReminderSentDate: "2026-07-15" },
    { id: "pay-003", invoiceNumber: "INV-2026-7731", clientId: "cli-005", clientName: "Dr. Arvind Swaminathan", phone: "+91 94440 22334", email: "dr.arvind@apollohealth.org", policyType: "Niva Bupa Health Companion", totalAmount: 120000, paidAmount: 60000, remainingAmount: 60000, dueDate: "2026-07-28", status: "Partially Paid", autoRemindersPaused: false, lastReminderSentDate: "2026-07-28" },
    { id: "pay-004", invoiceNumber: "INV-2026-6610", clientId: "cli-003", clientName: "Rajesh Kumar Mehta", phone: "+91 97110 55667", email: "rajesh@mehtatraders.com", policyType: "Fortuner Motor Insurance", totalAmount: 68000, paidAmount: 0, remainingAmount: 68000, dueDate: "2026-07-20", status: "Overdue", autoRemindersPaused: false, lastReminderSentDate: "2026-07-26" },
    { id: "pay-005", invoiceNumber: "INV-2026-3344", clientId: "cli-004", clientName: "Pooja Malhotra", phone: "+91 99300 77889", email: "pooja.m@designstudio.io", policyType: "Kia Seltos Motor Renewal", totalAmount: 32000, paidAmount: 0, remainingAmount: 32000, dueDate: "2026-08-03", status: "Pending", autoRemindersPaused: false, lastReminderSentDate: "" }
  ],

  reminders: [
    { id: "rem-000", title: "Motor Policy Expiry - khush patel (BMW GJ 01 KP 6219)", clientName: "khush patel", clientId: "cli-000", category: "Motor Insurance", priority: "CRITICAL", dueDate: "2026-07-28", daysLeft: 0, status: "Pending", message: "Policy MOT-33541222 expires TODAY! Client approval pending for CAR renewal premium ₹50,000." },
    { id: "rem-001", title: "Motor Policy Expiry - Vikramaditya Singhania (Mercedes-Benz S-Class)", clientName: "Vikramaditya Singhania", clientId: "cli-001", category: "Motor Insurance", priority: "CRITICAL", dueDate: "2026-07-28", daysLeft: 0, status: "Pending", message: "Policy MOT-2025-98711 expires TODAY! Client approval received for ICICI Lombard renewal." },
    { id: "rem-002", title: "Motor Policy Expiry - Pooja Malhotra (Kia Seltos GTX+)", clientName: "Pooja Malhotra", clientId: "cli-004", category: "Motor Insurance", priority: "HIGH", dueDate: "2026-07-30", daysLeft: 2, status: "Pending", message: "Policy MOT-2025-33441 expires in 2 days! Renewal quote generated for Bajaj Allianz." }
  ],

  calendarEvents: [
    { id: "cal-001", title: "Mercedes S-Class Policy Renewal Meeting", client: "Vikramaditya Singhania", date: "2026-07-27", time: "10:30 AM", type: "Renewal", color: "rose" }
  ],

  reminderLogs: [
    { id: "log-101", date: "2026-07-27 09:30 AM", clientName: "Vikramaditya Singhania", invoiceNumber: "INV-2026-9011", reminderType: "Due Today Reminder", channel: "WhatsApp", status: "Delivered", message: "Dear Vikramaditya Singhania, payment of ₹145,000 for Invoice INV-2026-9011 is due TODAY 2026-07-27." },
    { id: "log-102", date: "2026-07-26 10:00 AM", clientName: "Dr. Arvind Swaminathan", invoiceNumber: "INV-2026-7731", reminderType: "1 Day Before", channel: "Text Message", status: "Delivered", message: "Dear Dr. Arvind Swaminathan, payment of Rs.60,000 for Invoice INV-2026-7731 is due on 2026-07-28." }
  ],

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
    monthlyGrowth: 15.4,
    claimRatio: "4.2%",
    retentionRate: "98.5%",
    monthlyRevenue: [
      { month: "Jan 2026", premium: 4200000, revenue: 680000 },
      { month: "Feb 2026", premium: 4800000, revenue: 750000 },
      { month: "Mar 2026", premium: 5200000, revenue: 820000 },
      { month: "Apr 2026", premium: 4900000, revenue: 790000 },
      { month: "May 2026", premium: 5800000, revenue: 910000 },
      { month: "Jun 2026", premium: 6400000, revenue: 1020000 },
      { month: "Jul 2026", premium: 7830000, revenue: 1170000 }
    ]
  },

  activities: [
    { id: "act-101", clientId: "cli-001", type: "Policy Renewal Alert", title: "Motor Policy Expiry Warning Issued", description: "Automated trigger sent for Mercedes-Benz S-Class policy renewal.", date: "2026-07-27 09:15 AM", user: "Owner" }
  ]
};
