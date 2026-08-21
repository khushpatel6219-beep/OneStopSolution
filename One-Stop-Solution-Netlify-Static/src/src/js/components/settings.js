// Business Settings & Audit Logs Component - One Stop Solution

import { store } from '../state.js';

export function renderSettings() {
  const db = store.get();
  const settings = db.settings || {};

  return `
    <div class="space-y-6 animate-fade-in">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">System & Suite Settings</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Configure company profile, notification schedules, theme preferences, backup & data controls</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Profile & Branding Settings (7 Cols) -->
        <div class="lg:col-span-7 zoho-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Company Branding & Profile</h3>
            <span class="px-2.5 py-0.5 rounded text-xs font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40">
              <i data-lucide="crown" class="w-3 h-3 inline mr-1"></i> OWNER
            </span>
          </div>
          
          <form id="settings-form" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Company Name</label>
                <input type="text" id="set-company" value="${settings.companyName || 'One Stop Solution'}" required class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Account Role</label>
                <div class="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2">
                  <i data-lucide="shield-check" class="w-4 h-4 text-amber-500"></i> Owner (Verified Workspace)
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Support Email Address</label>
                <input type="email" id="set-email" value="${settings.email || 'info@onestopsolution.com'}" required class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Support Phone Number</label>
                <input type="text" id="set-phone" value="${settings.phone || '+91 98765 43210'}" required class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <div>
              <label class="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Reminder Alert Schedule (Days Before Expiry)</label>
              <input type="text" id="set-reminder-days" value="${(settings.reminderDays || [60, 30, 15, 7, 3, 0]).join(', ')}" class="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:border-amber-400 focus:outline-none" />
              <span class="text-[10px] text-slate-400 mt-1 block">Default interval: 60, 30, 15, 7, 3, 0 days before policy renewal date</span>
            </div>

            <button type="submit" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition">
              Save Profile Changes
            </button>
          </form>
        </div>

        <!-- System Preferences & Backup (5 Cols) -->
        <div class="lg:col-span-5 zoho-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 class="font-bold text-slate-900 dark:text-white text-base border-b border-slate-200 dark:border-slate-800 pb-3">Database Backup & Data Control</h3>
          
          <div class="space-y-3 text-xs">
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <h4 class="font-bold text-slate-900 dark:text-white mb-1">Export Complete Database (JSON)</h4>
              <p class="text-slate-500 dark:text-slate-400 text-[11px] mb-3">Download full backup file of clients, policies, documents & payments.</p>
              <button id="btn-backup-export" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition">
                <i data-lucide="download" class="w-4 h-4 text-amber-400"></i> Export JSON Backup
              </button>
            </div>

            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <h4 class="font-bold text-slate-900 dark:text-white mb-1">Import & Restore Database (JSON)</h4>
              <p class="text-slate-500 dark:text-slate-400 text-[11px] mb-3">Restore database records from a previously downloaded JSON backup file.</p>
              <input type="file" id="json-restore-file" accept=".json" class="hidden" />
              <button id="btn-backup-import" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition">
                <i data-lucide="upload" class="w-4 h-4 text-cyan-400"></i> Import JSON Backup File
              </button>
            </div>

            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <h4 class="font-bold text-slate-900 dark:text-white mb-1">Clear Demo Data & Start Fresh</h4>
              <p class="text-slate-500 dark:text-slate-400 text-[11px] mb-3">Clear sample demo entries and prepare workspace for real firm data.</p>
              <button id="btn-reset-seed" class="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 font-semibold text-xs border border-rose-800/50 flex items-center gap-2 transition">
                <i data-lucide="trash-2" class="w-4 h-4"></i> Clear Demo Data
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function attachSettingsListeners(appInstance) {
  const form = document.getElementById('settings-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const company = document.getElementById('set-company').value.trim();
      const email = document.getElementById('set-email').value.trim();
      const phone = document.getElementById('set-phone').value.trim();
      const reminderDaysStr = document.getElementById('set-reminder-days').value.trim();

      const reminderDays = reminderDaysStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));

      store.set(state => ({
        ...state,
        settings: {
          ...state.settings,
          companyName: company || 'One Stop Solution',
          email,
          phone,
          reminderDays: reminderDays.length > 0 ? reminderDays : [60, 30, 15, 7, 3, 0]
        }
      }));

      appInstance.showToast('✅ Business profile settings saved successfully!');
      appInstance.render();
    };
  }

  const btnExport = document.getElementById('btn-backup-export');
  if (btnExport) {
    btnExport.onclick = () => {
      const data = store.get();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `One_Stop_Solution_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      appInstance.showToast('💾 Database JSON backup file exported successfully!');
    };
  }

  const btnImport = document.getElementById('btn-backup-import');
  const fileInput = document.getElementById('json-restore-file');
  if (btnImport && fileInput) {
    btnImport.onclick = () => fileInput.click();
    fileInput.onchange = () => {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = JSON.parse(e.target.result);
            if (parsed && typeof parsed === 'object') {
              store.set(() => parsed);
              appInstance.showToast('📥 Database successfully restored from JSON backup!');
              appInstance.render();
            }
          } catch (err) {
            alert('Invalid JSON backup file format.');
          }
        };
        reader.readAsText(file);
      }
    };
  }
}
