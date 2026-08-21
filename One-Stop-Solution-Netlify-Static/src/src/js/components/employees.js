// Employee Management & Role Permissions Component

import { store } from '../state.js';

export function renderEmployees() {
  const db = store.get();
  const employees = db.employees;

  return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-white">Employee & User Management</h2>
          <p class="text-xs text-slate-400">Manage team members, department sales targets & role-based permissions</p>
        </div>
        ${store.isAdmin() ? `
          <button id="btn-open-add-emp-modal" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            <span>Add Employee</span>
          </button>
        ` : ''}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${employees.map(emp => `
          <div class="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3">
                <img src="${emp.avatar}" alt="${emp.name}" class="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40" />
                <div>
                  <h3 class="font-bold text-white text-base">${emp.name}</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${emp.role === 'Admin' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}">${emp.role}</span>
                </div>
              </div>
              <div class="mt-4 text-xs space-y-1.5 text-slate-300">
                <p><strong class="text-slate-400">Department:</strong> ${emp.department}</p>
                <p><strong class="text-slate-400">Email:</strong> ${emp.email}</p>
                <p><strong class="text-slate-400">Phone:</strong> ${emp.phone}</p>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span class="text-[10px] text-slate-500 uppercase">Sales This Month</span>
                <p class="font-bold text-indigo-400">₹${(emp.salesThisMonth / 100000).toFixed(2)} Lakhs</p>
              </div>
              <div>
                <span class="text-[10px] text-slate-500 uppercase">Active Clients</span>
                <p class="font-bold text-white">${emp.activeClientsCount} Clients</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Role Permissions Matrix Table -->
      <div class="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 class="font-bold text-white text-base">Role-Based Access Control (RBAC) Matrix</h3>
        <table class="w-full text-left text-xs">
          <thead class="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th class="py-2.5 px-3">Module / Action</th>
              <th class="py-2.5 px-3">Admin Access</th>
              <th class="py-2.5 px-3">Employee Access</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-slate-300">
            <tr><td class="py-2.5 px-3">Add / Edit Clients & Policies</td><td class="py-2.5 px-3 text-emerald-400 font-bold">Full Access</td><td class="py-2.5 px-3 text-emerald-400 font-bold">Full Access</td></tr>
            <tr><td class="py-2.5 px-3">Upload Documents & Schedule Follow-ups</td><td class="py-2.5 px-3 text-emerald-400 font-bold">Full Access</td><td class="py-2.5 px-3 text-emerald-400 font-bold">Full Access</td></tr>
            <tr><td class="py-2.5 px-3">Delete Client & Policy Records</td><td class="py-2.5 px-3 text-emerald-400 font-bold">Allowed</td><td class="py-2.5 px-3 text-rose-400 font-bold">Blocked 🔒</td></tr>
            <tr><td class="py-2.5 px-3">View Financial & Commission Reports</td><td class="py-2.5 px-3 text-emerald-400 font-bold">Allowed</td><td class="py-2.5 px-3 text-rose-400 font-bold">Restricted 🔒</td></tr>
            <tr><td class="py-2.5 px-3">Manage Business Settings & Employees</td><td class="py-2.5 px-3 text-emerald-400 font-bold">Allowed</td><td class="py-2.5 px-3 text-rose-400 font-bold">Restricted 🔒</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
