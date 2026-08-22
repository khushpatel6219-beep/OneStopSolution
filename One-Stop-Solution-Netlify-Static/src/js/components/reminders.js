// Reminders & Renewals Center Component

import { store } from '../state.js';

export function renderReminders() {
  const db = store.get();
  const reminders = db.reminders;
  const pendingReminders = reminders.filter(r => r.status === 'Pending');
  const completedReminders = reminders.filter(r => r.status === 'Completed');

  return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-white">Automated Renewal & Reminder Center</h2>
          <p class="text-xs text-slate-400">Automated policy renewal triggers (60d, 30d, 15d, 7d, 3d, Today) & resolved client histories</p>
        </div>
      </div>

      <!-- Pending Reminders Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-zoho-border pb-2">
          <h3 class="font-extrabold text-white text-base flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-zoho-red animate-ping"></span>
            Pending Policy Renewals & Alerts (${pendingReminders.length})
          </h3>
          <span class="text-xs text-zoho-amber font-bold">${pendingReminders.length} Action Items Due</span>
        </div>

        ${pendingReminders.length > 0 ? `
          <div class="space-y-3">
            ${pendingReminders.map(rem => `
              <div class="zoho-card p-4 rounded-xl flex items-center justify-between transition hover:border-slate-700">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-lg font-bold flex items-center justify-center ${
                    rem.priority === 'CRITICAL' ? 'bg-zoho-red/20 text-zoho-red animate-pulse' :
                    rem.priority === 'HIGH' ? 'bg-zoho-amber/20 text-zoho-amber' : 'bg-zoho-blue/20 text-zoho-blue'
                  }">
                    <i data-lucide="${rem.priority === 'CRITICAL' ? 'alert-triangle' : 'bell'}" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <div class="flex items-center gap-3">
                      <h4 class="font-bold text-white text-sm">${rem.title}</h4>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                        rem.priority === 'CRITICAL' ? 'bg-zoho-red/20 text-zoho-red border border-zoho-red/40' :
                        rem.priority === 'HIGH' ? 'bg-zoho-amber/20 text-zoho-amber border border-zoho-amber/40' : 'bg-zoho-blue/20 text-zoho-blue'
                      }">${rem.priority}</span>
                    </div>
                    <p class="text-xs text-slate-300 mt-1">${rem.message}</p>
                    <div class="mt-1 text-[11px] text-slate-400 flex items-center gap-4">
                      <span>Category: <strong class="text-zoho-teal">${rem.category}</strong></span>
                      <span>Due Date: <strong class="text-white">${rem.dueDate}</strong> (${rem.daysLeft} days left)</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button data-complete-reminder="${rem.id}" class="btn-mark-done px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md">
                    <i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Mark Done
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="p-6 rounded-xl bg-slate-900/40 border border-zoho-border text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
            <i data-lucide="check-circle" class="w-5 h-5"></i> All policy renewals and alerts are resolved! No pending warnings.
          </div>
        `}
      </div>

      <!-- Completed / Resolved Reminders History -->
      ${completedReminders.length > 0 ? `
        <div class="space-y-4 pt-6 border-t border-zoho-border">
          <h3 class="font-extrabold text-slate-400 text-sm uppercase tracking-wider">Resolved Renewals & Completed Alerts (${completedReminders.length})</h3>
          <div class="space-y-2">
            ${completedReminders.map(rem => `
              <div class="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between opacity-80 text-xs">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <i data-lucide="check-circle" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-300">${rem.title}</h4>
                    <p class="text-[11px] text-slate-500">${rem.message}</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 text-[10px]">
                  ✓ Resolved & Policy Extended
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  `;
}
