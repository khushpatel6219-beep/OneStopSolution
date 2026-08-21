// StarOS Pro - Automated Payment & Collection Center

import { store, formatDateDMY } from '../state.js';


export function renderPaymentsModule(activeTab = 'ledger') {
  const db = store.get();
  const payments = db.payments || [];
  const reminderLogs = db.reminderLogs || [];
  const templates = db.reminderTemplates;

  // 1. KPI Metrics
  const dueToday = payments.filter(p => p.status !== 'Paid' && p.dueDate === '2026-07-28');
  const dueThisWeek = payments.filter(p => p.status !== 'Paid' && p.dueDate >= '2026-07-28' && p.dueDate <= '2026-08-04');
  const overduePayments = payments.filter(p => p.status === 'Overdue' || (p.status !== 'Paid' && p.dueDate < '2026-07-28'));

  const paidPayments = payments.filter(p => p.status === 'Paid');

  const totalOutstanding = payments
    .filter(p => p.status !== 'Paid')
    .reduce((acc, curr) => acc + (curr.remainingAmount || 0), 0);

  const totalCollectedThisMonth = payments
    .reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);

  return `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Header Bar & Actions -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
            <i data-lucide="receipt" class="w-5 h-5 text-amber-400"></i>
            Automatic Payment & Collection Center
          </h2>
          <p class="text-xs text-slate-400">Automated payment reminders (7d, 3d, 1d, Today, Overdue 3d) via WhatsApp, SMS & Email</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-run-auto-reminders-now" class="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow">
            <i data-lucide="zap" class="w-4 h-4 text-amber-400"></i> Run Auto Engine Check
          </button>
          <button id="btn-open-add-payment-modal" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition">
            <i data-lucide="plus-circle" class="w-4 h-4"></i> Create Invoice
          </button>
        </div>
      </div>

      <!-- 6 Dashboard KPI Meter Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        
        <!-- 1. Due Today -->
        <div class="zoho-card p-4 rounded-xl flex flex-col justify-between">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Today</span>
          <div class="mt-2">
            <h3 class="text-xl font-extrabold text-white">${dueToday.length}</h3>
            <p class="text-[10px] text-amber-400 font-bold mt-0.5">Action Needed</p>
          </div>
        </div>

        <!-- 2. Due This Week -->
        <div class="zoho-card p-4 rounded-xl flex flex-col justify-between">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due This Week</span>
          <div class="mt-2">
            <h3 class="text-xl font-extrabold text-cyan-400">${dueThisWeek.length}</h3>
            <p class="text-[10px] text-slate-400 mt-0.5">Upcoming Dues</p>
          </div>
        </div>

        <!-- 3. Overdue Payments -->
        <div class="zoho-card p-4 rounded-xl flex flex-col justify-between">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overdue Payments</span>
          <div class="mt-2">
            <h3 class="text-xl font-extrabold text-rose-400">${overduePayments.length}</h3>
            <p class="text-[10px] text-rose-400 font-bold mt-0.5">Auto Triggers Active</p>
          </div>
        </div>

        <!-- 4. Paid Clients -->
        <div class="zoho-card p-4 rounded-xl flex flex-col justify-between">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Clients</span>
          <div class="mt-2">
            <h3 class="text-xl font-extrabold text-emerald-400">${paidPayments.length}</h3>
            <p class="text-[10px] text-emerald-400 font-bold mt-0.5">Resolved</p>
          </div>
        </div>

        <!-- 5. Total Outstanding -->
        <div class="zoho-card p-4 rounded-xl flex flex-col justify-between">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
          <div class="mt-2">
            <h3 class="text-xl font-extrabold text-amber-400">₹${(totalOutstanding / 1000).toFixed(1)}k</h3>
            <p class="text-[10px] text-slate-400 mt-0.5">Pending Collection</p>
          </div>
        </div>

        <!-- 6. Total Collected -->
        <div class="zoho-card p-4 rounded-xl flex flex-col justify-between">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collected (Month)</span>
          <div class="mt-2">
            <h3 class="text-xl font-extrabold text-emerald-400">₹${(totalCollectedThisMonth / 1000).toFixed(1)}k</h3>
            <p class="text-[10px] text-slate-400 mt-0.5">Gross Received</p>
          </div>
        </div>

      </div>

      <!-- Module Sub-Tabs (Invoices Ledger, Message Templates, Audit Logs, Gateway Config) -->
      <div class="flex items-center gap-2 border-b border-[#1E293B] pb-2 text-xs font-bold">
        <button id="tab-btn-ledger" class="px-4 py-2 rounded-lg transition ${activeTab === 'ledger' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'}">
          <i data-lucide="receipt" class="w-3.5 h-3.5 inline mr-1"></i> Invoices & Payment Ledger
        </button>
        <button id="tab-btn-templates" class="px-4 py-2 rounded-lg transition ${activeTab === 'templates' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'}">
          <i data-lucide="message-square" class="w-3.5 h-3.5 inline mr-1"></i> Message Templates & Triggers
        </button>
        <button id="tab-btn-logs" class="px-4 py-2 rounded-lg transition ${activeTab === 'logs' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'}">
          <i data-lucide="history" class="w-3.5 h-3.5 inline mr-1"></i> Reminder Audit History (${reminderLogs.length})
        </button>
        <button id="tab-btn-gateway" class="px-4 py-2 rounded-lg transition ${activeTab === 'gateway' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900'}">
          <i data-lucide="radio" class="w-3.5 h-3.5 inline mr-1"></i> WhatsApp / SMS API Gateway
        </button>
      </div>

      <!-- Tab 1: Invoices & Payment Ledger -->
      ${activeTab === 'ledger' ? `
        <div class="zoho-card p-6 rounded-xl space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-400">Filter Invoices:</span>
              <button id="btn-filter-pay-all" class="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-bold">All Invoices (${payments.length})</button>
            </div>
            <span class="text-xs text-slate-400">Showing complete client payment & collection ledger</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-slate-400 border-b border-[#1E293B] uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th class="py-3 px-3">Invoice #</th>
                  <th class="py-3 px-3">Client & Contact</th>
                  <th class="py-3 px-3">Policy / Service</th>
                  <th class="py-3 px-3">Total / Paid</th>
                  <th class="py-3 px-3">Remaining Due</th>
                  <th class="py-3 px-3">Due Date</th>
                  <th class="py-3 px-3">Auto Engine</th>
                  <th class="py-3 px-3">Status</th>
                  <th class="py-3 px-3 text-right">Manual Controls</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1E293B]">
                ${payments.map(p => `
                  <tr class="hover:bg-slate-800/40 transition">
                    <td class="py-3.5 px-3 font-mono font-bold text-amber-400">${p.invoiceNumber}</td>
                    <td class="py-3.5 px-3">
                      <div class="font-bold text-white">${p.clientName}</div>
                      <div class="text-[10px] text-slate-400">${p.phone} • ${p.email}</div>
                    </td>
                    <td class="py-3.5 px-3 text-slate-300 font-medium">${p.policyType}</td>
                    <td class="py-3.5 px-3">
                      <div class="font-bold text-white">₹${(p.totalAmount || 0).toLocaleString('en-IN')}</div>
                      <div class="text-[10px] text-emerald-400">Paid: ₹${(p.paidAmount || 0).toLocaleString('en-IN')}</div>
                    </td>
                    <td class="py-3.5 px-3 font-extrabold ${p.remainingAmount > 0 ? 'text-amber-400' : 'text-slate-400'}">
                      ₹${(p.remainingAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td class="py-3.5 px-3 font-mono text-slate-200">
                      ${formatDateDMY(p.dueDate)}
                    </td>

                    <td class="py-3.5 px-3">
                      <button data-toggle-autoreminder="${p.id}" class="px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.autoRemindersPaused 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }">
                        ${p.autoRemindersPaused ? 'Paused' : 'Active (Auto)'}
                      </button>
                    </td>
                    <td class="py-3.5 px-3">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        p.status === 'Overdue' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' :
                        p.status === 'Partially Paid' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }">${p.status}</span>
                    </td>
                    <td class="py-3.5 px-3 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        ${p.status !== 'Paid' ? `
                          <button data-send-reminder-now="${p.id}" class="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-[11px] border border-amber-500/40 transition" title="Send Instant Reminder Now">
                            <i data-lucide="send" class="w-3 h-3 inline mr-1"></i> Send Now
                          </button>
                          <button data-mark-paid="${p.id}" class="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-[11px] border border-emerald-500/40 transition" title="Mark Paid">
                            <i data-lucide="check" class="w-3 h-3 inline mr-1"></i> Mark Paid
                          </button>
                          <button data-reschedule-due="${p.id}" class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700" title="Reschedule Due Date">
                            <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                          </button>
                        ` : `
                          <span class="text-[10px] text-emerald-400 font-bold">✓ Fully Settled</span>
                        `}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Tab 2: Custom Message Templates Manager -->
      ${activeTab === 'templates' ? `
        <div class="zoho-card p-6 rounded-xl space-y-6">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div>
              <h3 class="font-extrabold text-white text-base">Customizable Reminder Message Templates</h3>
              <p class="text-xs text-slate-400">Configure message text for automated WhatsApp, SMS & Email triggers</p>
            </div>
            <button id="btn-save-templates" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition">
              Save All Templates
            </button>
          </div>

          <!-- Variable Reference Helper Box -->
          <div class="p-3.5 rounded-lg bg-slate-900/60 border border-[#1E293B] text-xs space-y-1">
            <span class="font-bold text-amber-400">Available Dynamic Substitution Variables:</span>
            <div class="flex flex-wrap gap-2 text-[11px] font-mono">
              <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{{ClientName}}</span>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{{RemainingAmount}}</span>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{{DueDate}}</span>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{{InvoiceNumber}}</span>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{{CompanyName}}</span>
            </div>
          </div>

          <form id="form-reminder-templates" class="space-y-5 text-xs">
            <!-- WhatsApp Template -->
            <div class="space-y-1.5">
              <label class="font-extrabold text-emerald-400 flex items-center gap-1.5">
                <i data-lucide="message-square" class="w-4 h-4"></i> WhatsApp Business Message Template
              </label>
              <textarea name="whatsapp" rows="6" class="w-full p-3 rounded-lg bg-slate-900 border border-[#1E293B] text-white font-mono text-xs focus:border-amber-400 focus:outline-none">${templates.whatsapp}</textarea>
            </div>

            <!-- SMS Template -->
            <div class="space-y-1.5">
              <label class="font-extrabold text-cyan-400 flex items-center gap-1.5">
                <i data-lucide="phone-call" class="w-4 h-4"></i> Twilio SMS Message Template
              </label>
              <textarea name="sms" rows="3" class="w-full p-3 rounded-lg bg-slate-900 border border-[#1E293B] text-white font-mono text-xs focus:border-amber-400 focus:outline-none">${templates.sms}</textarea>
            </div>

            <!-- Email Subject & Body Template -->
            <div class="space-y-3">
              <label class="font-extrabold text-amber-400 flex items-center gap-1.5">
                <i data-lucide="mail" class="w-4 h-4"></i> Email Notification Template
              </label>
              <input type="text" name="emailSubject" value="${templates.emailSubject}" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white font-mono text-xs focus:border-amber-400 focus:outline-none" placeholder="Email Subject..." />
              <textarea name="emailBody" rows="5" class="w-full p-3 rounded-lg bg-slate-900 border border-[#1E293B] text-white font-mono text-xs focus:border-amber-400 focus:outline-none">${templates.emailBody}</textarea>
            </div>
          </form>
        </div>
      ` : ''}

      <!-- Tab 3: Reminder Audit History Log -->
      ${activeTab === 'logs' ? `
        <div class="zoho-card p-6 rounded-xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Complete Reminder Audit History</h3>
            <span class="text-xs text-amber-400 font-bold">${reminderLogs.length} Logged Deliveries</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-slate-400 border-b border-[#1E293B] uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th class="py-3 px-3">Date & Time</th>
                  <th class="py-3 px-3">Client</th>
                  <th class="py-3 px-3">Invoice #</th>
                  <th class="py-3 px-3">Reminder Trigger Type</th>
                  <th class="py-3 px-3">Channel</th>
                  <th class="py-3 px-3">Status</th>
                  <th class="py-3 px-3">Message Preview</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1E293B]">
                ${reminderLogs.map(log => `
                  <tr class="hover:bg-slate-800/40 transition">
                    <td class="py-3 px-3 font-mono text-slate-400">${log.date}</td>
                    <td class="py-3 px-3 font-bold text-white">${log.clientName}</td>
                    <td class="py-3 px-3 font-mono text-amber-400">${log.invoiceNumber}</td>
                    <td class="py-3 px-3 font-bold text-slate-200">${log.reminderType}</td>
                    <td class="py-3 px-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.channel === 'WhatsApp' ? 'bg-emerald-500/20 text-emerald-400' :
                        log.channel === 'SMS' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'
                      }">${log.channel}</span>
                    </td>
                    <td class="py-3 px-3 text-emerald-400 font-bold text-[11px]">✓ ${log.status}</td>
                    <td class="py-3 px-3 text-slate-300 text-[11px] max-w-xs truncate font-mono">${log.message}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Tab 4: API Gateway Settings -->
      ${activeTab === 'gateway' ? `
        <div class="zoho-card p-6 rounded-xl space-y-6">
          <div class="border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">API Gateway & Channel Adapters Configuration</h3>
            <p class="text-xs text-slate-400">Future-ready API credentials architecture for WhatsApp, Twilio, and Email SMTP</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- MSG91 SMS Gateway -->
            <div class="p-4 rounded-xl bg-slate-900/60 border border-[#1E293B] space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-emerald-400 text-xs flex items-center gap-1.5"><i data-lucide="message-square"></i> MSG91 SMS Gateway</span>
                <span class="px-2 py-0.5 rounded ${db.apiGateway?.msg91AuthKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'} font-bold text-[10px]">${db.apiGateway?.msg91AuthKey ? 'Connected' : 'Setup Needed'}</span>
              </div>
              <p class="text-[11px] text-slate-400">Official India DLT SMS Gateway for automated background text sending.</p>
              <button id="btn-open-msg91-modal" class="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition">
                ⚙️ Configure MSG91 AuthKey
              </button>
            </div>

            <!-- WhatsApp Business -->
            <div class="p-4 rounded-xl bg-slate-900/60 border border-[#1E293B] space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-cyan-400 text-xs flex items-center gap-1.5"><i data-lucide="message-circle"></i> WhatsApp Business Direct</span>
                <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">Connected</span>
              </div>
              <p class="text-[11px] text-slate-400">Direct WhatsApp Web & App template messaging integration.</p>
              <input type="text" value="Direct WhatsApp Web Protocol" disabled class="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[11px]" />
            </div>

            <!-- Email SMTP -->
            <div class="p-4 rounded-xl bg-slate-900/60 border border-[#1E293B] space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-bold text-amber-400 text-xs flex items-center gap-1.5"><i data-lucide="mail"></i> SendGrid / Email Gateway</span>
                <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">Connected</span>
              </div>
              <p class="text-[11px] text-slate-400">SMTP Server / SendGrid API for HTML invoice email delivery.</p>
              <input type="text" value="billing@onestopsolution.com" disabled class="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[11px]" />
            </div>
          </div>
        </div>
      ` : ''}

    </div>
  `;
}
