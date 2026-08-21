// Business Reports Component with PDF / Excel Exports - One Stop Solution

import { store } from '../state.js';

export function renderReports() {
  const db = store.get();

  const reportTypes = [
    { title: "Monthly Revenue Report", desc: "Detailed breakdown of monthly gross premiums and net business revenue.", icon: "indian-rupee", category: "Financial" },
    { title: "Upcoming Renewals Register", desc: "Motor, Health & Life insurance policies expiring in the next 60 days.", icon: "clock", category: "Insurance" },
    { title: "Commission Payout Ledger", desc: "Commission percentage breakdown by insurer (HDFC, ICICI, Star Health, LIC).", icon: "badge-percent", category: "Commission" },
    { title: "Top Clients & HNI Summary", desc: "High net-worth clients ranked by portfolio size and active policies.", icon: "award", category: "CRM" },
    { title: "Payment Due Ledger", desc: "Pending client invoice balances and unpaid policy renewal amounts.", icon: "receipt", category: "Payments" },
    { title: "All Active Insurance Policies", desc: "Comprehensive master statement of all motor, health, and life covers.", icon: "shield", category: "Master Data" }
  ];

  return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Business Reports Generator</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Generate, view and export instant PDF and Excel reports for financial auditing</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${reportTypes.map((rep) => `
          <div class="zoho-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-amber-500/50 transition">
            <div>
              <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold mb-4">
                <i data-lucide="${rep.icon}" class="w-5 h-5"></i>
              </div>
              <h3 class="font-bold text-slate-900 dark:text-white text-base">${rep.title}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${rep.desc}</p>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700">${rep.category}</span>
              <div class="flex items-center gap-2">
                <button data-export-report="${rep.title}" data-format="pdf" class="btn-export-report px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow">
                  <i data-lucide="file-text" class="w-3.5 h-3.5"></i> PDF
                </button>
                <button data-export-report="${rep.title}" data-format="excel" class="btn-export-report px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow">
                  <i data-lucide="sheet" class="w-3.5 h-3.5"></i> Excel
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function attachReportExportListeners(appInstance) {
  document.querySelectorAll('.btn-export-report').forEach(btn => {
    btn.onclick = () => {
      const title = btn.getAttribute('data-export-report');
      const format = btn.getAttribute('data-format');
      exportReportData(title, format, appInstance);
    };
  });
}

function exportReportData(reportTitle, format, appInstance) {
  const db = store.get();

  let headers = [];
  let rows = [];

  if (reportTitle.includes('Client')) {
    headers = ['Client Name', 'Phone Number', 'Email ID', 'PAN Number', 'City', 'State'];
    rows = (db.clients || []).map(c => [c.name, c.phone, c.email, c.pan, c.city || 'Mumbai', c.state || 'Maharashtra']);
  } else if (reportTitle.includes('Renewal') || reportTitle.includes('Expiring')) {
    headers = ['Client Name', 'Policy Type', 'Insurer / Vehicle', 'Premium (INR)', 'Expiry Date'];
    rows = [
      ...(db.motorPolicies || []).map(m => [m.clientName, 'Motor Insurance', `${m.vehicleModel} (${m.vehicleNumber})`, m.premium, m.expiryDate]),
      ...(db.healthPolicies || []).map(h => [h.clientName, 'Health Insurance', h.company, h.premium, h.expiryDate]),
      ...(db.lifePolicies || []).map(l => [l.clientName, 'Life Insurance', l.company, l.premium, l.dueDate])
    ];
  } else if (reportTitle.includes('Payment') || reportTitle.includes('Due')) {
    headers = ['Invoice #', 'Client Name', 'Policy Type', 'Total Amount', 'Remaining Due', 'Due Date', 'Status'];
    rows = (db.payments || []).map(p => [p.invoiceNumber, p.clientName, p.policyType, p.totalAmount, p.remainingAmount, p.dueDate, p.status]);
  } else {
    // Master Insurance Policies
    headers = ['Client Name', 'Category', 'Insurer / Details', 'Policy #', 'Annual Premium (INR)', 'Expiry / Due Date'];
    rows = [
      ...(db.motorPolicies || []).map(m => [m.clientName, 'Motor', `${m.vehicleModel} (${m.vehicleNumber})`, m.policyNumber, m.premium, m.expiryDate]),
      ...(db.healthPolicies || []).map(h => [h.clientName, 'Health', h.company, h.policyNumber, h.premium, h.expiryDate]),
      ...(db.lifePolicies || []).map(l => [l.clientName, 'Life', l.company, l.policyNumber, l.premium, l.dueDate])
    ];
  }

  if (format === 'excel') {
    // Generate CSV export
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportTitle.replace(/\s+/g, '_')}_One_Stop_Solution.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    appInstance.showToast(`📊 Excel/CSV report downloaded: ${reportTitle}`);
  } else {
    // Generate Printable PDF report window
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Popup blocker prevented opening PDF print preview window. Please allow popups!');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle} - One Stop Solution</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 25px; color: #0F172A; }
          .header { border-bottom: 3px solid #F59E0B; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 24px; font-weight: 800; color: #0F172A; }
          .brand span { color: #F59E0B; }
          .title { font-size: 18px; font-weight: 700; color: #475569; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th, td { border: 1px solid #CBD5E1; padding: 10px; text-align: left; }
          th { background-color: #F8FAFC; color: #0F172A; font-weight: 700; }
          tr:nth-child(even) { background-color: #F1F5F9; }
          .footer { margin-top: 30px; font-size: 10px; color: #94A3B8; text-align: center; border-t: 1px solid #E2E8F0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">One Stop <span>SOLUTION</span></div>
            <div class="title">${reportTitle}</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748B;">
            <div>Generated: ${new Date().toLocaleString('en-IN')}</div>
            <div>Role: Owner</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.length > 0 ? rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" style="text-align:center;">No records available.</td></tr>`}
          </tbody>
        </table>

        <div class="footer">
          One Stop Solution Business Operating System • Confidential Business Audit Report
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
    appInstance.showToast(`📄 PDF report generated: ${reportTitle}`);
  }
}
