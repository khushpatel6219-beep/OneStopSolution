// One Stop Solution Sidebar Component

import { store } from '../state.js';

export function renderSidebar(activeRoute = 'dashboard') {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'clients', label: 'Leads & Clients', icon: 'users' },
    { id: 'motor', label: 'Motor Insurance', icon: 'car' },
    { id: 'health', label: 'Health Insurance', icon: 'heart-pulse' },
    { id: 'life', label: 'Life Insurance', icon: 'shield' },
    { id: 'reminders', label: 'Reminders & Renewals', icon: 'bell' },
    { id: 'calendar', label: 'Schedule Calendar', icon: 'calendar' },
    { id: 'vault', label: 'Document Vault', icon: 'folder-lock' },
    { id: 'payments', label: 'Premium Payments', icon: 'receipt' },
    { id: 'reports', label: 'Business Reports', icon: 'file-text' },
    { id: 'analytics', label: 'Sales Analytics', icon: 'line-chart' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return `
    <div class="w-64 h-full bg-white dark:bg-[#0B0F19] border-r border-slate-200 dark:border-[#1E293B] flex flex-col justify-between select-none">
      
      <!-- Brand Logo Header -->
      <div>
        <div class="p-5 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-extrabold text-lg shadow-lg shadow-amber-500/20">
              O
            </div>
            <div>
              <h1 class="font-extrabold text-slate-900 dark:text-white text-sm tracking-wide flex items-center gap-1.5">
                One Stop <span class="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">SOLUTION</span>
              </h1>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Business Operating System</p>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          <span class="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block my-2">CRM Modules</span>
          ${navItems.map(item => {
            const isActive = activeRoute === item.id;
            return `
              <a href="#${item.id}" 
                 class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                   isActive 
                     ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40 shadow-sm' 
                     : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                 }">
                <i data-lucide="${item.icon}" class="w-4 h-4 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}"></i>
                <span>${item.label}</span>
              </a>
            `;
          }).join('')}
        </nav>
      </div>

      <!-- Bottom Profile Badge (Owner Only) -->
      <div class="p-4 border-t border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-slate-950/40">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow">
            O
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-extrabold text-slate-900 dark:text-white truncate">Owner</h4>
            <p class="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <i data-lucide="crown" class="w-3 h-3 text-amber-500 dark:text-amber-400"></i> Verified Account
            </p>
          </div>
        </div>
      </div>

    </div>
  `;
}
