// One Stop Solution Navbar Component

import { store } from '../state.js';
import { voiceAssistant } from '../voiceAssistant.js';

export function renderNavbar(activeRoute = 'dashboard') {
  const db = store.get();
  const isDark = typeof document !== 'undefined' ? !document.documentElement.classList.contains('light') : true;

  const pendingReminders = db.reminders ? db.reminders.filter(r => r.status === 'Pending') : [];
  const remindersCount = pendingReminders.length;

  const routeTitles = {
    dashboard: 'Business Overview Dashboard',
    clients: 'Leads & Accounts CRM',
    motor: 'Motor Insurance Deals',
    health: 'Health Insurance Policies',
    life: 'Life Insurance & Term Dues',
    payments: 'Premium Payments Ledger',
    calendar: 'Schedule & Renewal Calendar',
    reminders: 'Automated Renewal Center',
    vault: 'Document Vault & Compliance',
    reports: 'Business Intelligence Reports',
    analytics: 'Financial Sales Analytics',
    settings: 'System & Suite Settings'
  };

  const title = routeTitles[activeRoute] || 'One Stop Solution';

  return `
    <div class="flex items-center justify-between w-full relative px-1 md:px-0">
      <!-- Left Page Title with Mobile Menu Button -->
      <div class="flex items-center gap-2 md:gap-3 min-w-0">
        <button id="btn-toggle-mobile-menu" class="md:hidden p-1.5 rounded-lg bg-slate-800 text-amber-400 border border-slate-700 hover:bg-slate-700 transition flex-shrink-0" title="Toggle Navigation Menu">
          <i data-lucide="menu" class="w-5 h-5"></i>
        </button>
        <h2 class="text-sm md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate flex items-center gap-2">
          <span class="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-amber-400 flex-shrink-0"></span>
          <span class="truncate">${title}</span>
        </h2>
        <!-- Role Badge -->
        <span class="hidden sm:inline-block px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex-shrink-0">
          <i data-lucide="crown" class="w-3 h-3 inline mr-1"></i>
          OWNER
        </span>
      </div>

      <!-- Right Actions: Search, Voice/AI, Notifications, Theme, Actions -->
      <div class="flex items-center gap-2.5">
        <!-- Global Command Palette Trigger (Ctrl + K) -->
        <button id="trigger-search-modal" 
                class="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-300 dark:border-[#1E293B] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition text-xs font-medium">
          <i data-lucide="search" class="w-3.5 h-3.5 text-amber-500"></i>
          <span>Search CRM records, client name, PAN, policy #...</span>
          <kbd class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">Ctrl K</kbd>
        </button>

        <!-- AI Voice & Text Assistant Button -->
        <button id="btn-toggle-voice" 
                class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all duration-200 text-xs font-bold ${
                  voiceAssistant.isListening 
                    ? 'bg-amber-500 text-slate-950 zia-active shadow-lg shadow-amber-500/30' 
                    : voiceAssistant.isSpeaking
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                }">
          <i data-lucide="${voiceAssistant.isListening ? 'mic' : voiceAssistant.isSpeaking ? 'volume-2' : 'bot'}" 
             class="w-4 h-4 ${voiceAssistant.isListening ? 'animate-bounce' : ''}"></i>
          <span class="hidden sm:inline">${voiceAssistant.isListening ? 'AI Listening...' : voiceAssistant.isSpeaking ? 'AI Speaking...' : 'AI Assistant'}</span>
        </button>

        <!-- Logout Button -->
        <button id="btn-logout-user" title="Sign Out of One Stop Solution"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold transition">
          <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
          <span class="hidden xl:inline">Logout</span>
        </button>

        <!-- Recycle Bin Button -->
        <button id="btn-open-recycle-bin" title="Open Recycle Bin (Trash Vault)"
                class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold transition">
          <i data-lucide="archive" class="w-3.5 h-3.5"></i>
          <span class="hidden sm:inline">Recycle Bin</span>
        </button>

        <!-- Notifications Bell & Dropdown Drawer -->
        <div class="relative">
          <button id="btn-notifications" class="p-2 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-300 dark:border-[#1E293B] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition relative">
            <i data-lucide="bell" class="w-4 h-4"></i>
            ${remindersCount > 0 ? `
              <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold flex items-center justify-center animate-pulse">
                ${remindersCount}
              </span>
            ` : ''}
          </button>

          <!-- Notification Dropdown Panel -->
          <div id="notification-panel" class="notification-dropdown hidden p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-[#1E293B] pb-2">
              <h4 class="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <i data-lucide="bell" class="w-3.5 h-3.5 text-amber-500"></i> Notifications
              </h4>
              <a href="#reminders" class="text-[10px] text-amber-600 dark:text-amber-400 hover:underline font-bold">View All</a>
            </div>

            <div class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              ${pendingReminders.length > 0 ? pendingReminders.map(rem => `
                <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-[#1E293B] flex items-start justify-between text-xs gap-2">
                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-[11px]">${rem.title}</h5>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">${rem.message}</p>
                  </div>
                  <button data-complete-reminder="${rem.id}" class="p-1 rounded hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white transition flex-shrink-0" title="Resolve">
                    <i data-lucide="check" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              `).join('') : '<p class="text-xs text-slate-500 dark:text-slate-400 text-center py-3">No pending notifications.</p>'}
            </div>
          </div>
        </div>

        <!-- Light / Dark Theme Switcher -->
        <button id="btn-toggle-theme" title="Toggle Light / Dark Theme" class="p-2 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-300 dark:border-[#1E293B] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
          <i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-4 h-4 text-amber-500"></i>
        </button>

        <!-- New Lead Action Button -->
        <button id="btn-quick-add-client" class="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition">
          <i data-lucide="plus" class="w-4 h-4"></i>
          <span>New Lead</span>
        </button>
      </div>
    </div>
  `;
}
