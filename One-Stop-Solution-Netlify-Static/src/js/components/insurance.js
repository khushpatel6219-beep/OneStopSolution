// StarOS Pro Insurance Modules Component (Motor, Health, Life)

import { store, formatDateDMY } from '../state.js';

export function renderInsuranceModule(subType = 'motor') {
  const db = store.get();
  if (subType === 'health') return renderHealthModule(db);
  if (subType === 'life') return renderLifeModule(db);
  return renderMotorModule(db);
}

// 1. Motor Insurance View with Edit Policy & Send SMS Controls
function renderMotorModule(db) {
  const policies = db.motorPolicies;

  return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
            <i data-lucide="car" class="w-5 h-5 text-amber-400"></i>
            Motor Insurance Deals
          </h2>
          <p class="text-xs text-slate-400">Track vehicle policy deals, IDV valuations, NCB bonus, policy dates & send text SMS reminders</p>
        </div>
        <button id="btn-open-add-motor-modal" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>New Motor Deal</span>
        </button>
      </div>

      <div class="zoho-card p-6 rounded-xl space-y-4">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-slate-400 border-b border-[#1E293B] uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th class="py-3 px-4">Vehicle & Reg #</th>
                <th class="py-3 px-4">Client Profile (Click for Photos/Details)</th>
                <th class="py-3 px-4">Insurer & Policy #</th>
                <th class="py-3 px-4">IDV / NCB</th>
                <th class="py-3 px-4">Premium</th>
                <th class="py-3 px-4">Start / Expiry Date (DD/MM/YYYY)</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1E293B]">
              ${policies.map(p => `
                <tr class="hover:bg-slate-800/40 transition">
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-white">${p.vehicleModel}</div>
                    <div class="text-[11px] font-mono text-amber-400">${p.vehicleNumber}</div>
                  </td>
                  <td class="py-3.5 px-4">
                    <a href="#clients" data-client-id="${p.clientId}" class="font-bold text-cyan-400 hover:underline flex items-center gap-1.5" title="Click to open full client profile & document photos">
                      <i data-lucide="user" class="w-3.5 h-3.5 text-amber-400"></i> ${p.clientName}
                    </a>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-white">${p.company}</div>
                    <div class="text-[10px] font-mono text-slate-400">${p.policyNumber}</div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-200">₹${(p.idv/100000).toFixed(2)} Lakhs</div>
                    <div class="text-[10px] text-emerald-400 font-bold">${p.ncb}% NCB</div>
                  </td>
                  <td class="py-3.5 px-4 font-extrabold text-white">₹${p.premium.toLocaleString('en-IN')}</td>
                  <td class="py-3.5 px-4">
                    <div class="font-mono text-slate-300 text-[11px]">${formatDateDMY(p.startDate || '2025-07-28')} → <strong class="text-white">${formatDateDMY(p.expiryDate)}</strong></div>
                    <span class="px-2 py-0.5 rounded text-[9px] font-bold ${
                      p.status.includes('Expiring Today') || p.expiryDate === '2026-07-28' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' :
                      p.status.includes('Expiring') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/10 text-emerald-400'
                    }">${p.expiryDate === '2026-07-28' || p.status === 'Expiring Today' ? 'Expiring Today' : p.status}</span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button data-send-policy-sms="${p.clientName}" data-policy-desc="${p.vehicleModel} (${p.vehicleNumber})" data-due-date="${formatDateDMY(p.expiryDate)}" data-amount="${p.premium}" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs border border-emerald-500/40 transition flex items-center gap-1" title="Send SMS Text Reminder to Mobile Number">
                        <i data-lucide="send" class="w-3.5 h-3.5"></i> Send SMS
                      </button>
                      <button data-edit-motor="${p.id}" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 text-xs font-bold border border-slate-700 transition flex items-center gap-1">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// 2. Health Insurance View with Edit Policy & Send SMS Controls
function renderHealthModule(db) {
  const policies = db.healthPolicies;

  return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
            <i data-lucide="heart-pulse" class="w-5 h-5 text-emerald-400"></i>
            Health Insurance Policies
          </h2>
          <p class="text-xs text-slate-400">Manage family floater covers, sum insured, renewal dates & send text SMS reminders</p>
        </div>
        <button id="btn-open-add-health-modal" class="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>New Health Deal</span>
        </button>
      </div>

      <div class="zoho-card p-6 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-slate-400 border-b border-[#1E293B] uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th class="py-3 px-4">Insurance Company</th>
                <th class="py-3 px-4">Client Profile (Click for Photos/Details)</th>
                <th class="py-3 px-4">Members Covered</th>
                <th class="py-3 px-4">Sum Insured</th>
                <th class="py-3 px-4">Annual Premium</th>
                <th class="py-3 px-4">Renewal Expiry (DD/MM/YYYY)</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1E293B]">
              ${policies.map(p => `
                <tr class="hover:bg-slate-800/40 transition">
                  <td class="py-3.5 px-4 font-extrabold text-white">${p.company}</td>
                  <td class="py-3.5 px-4">
                    <a href="#clients" data-client-id="${p.clientId}" class="font-bold text-cyan-400 hover:underline flex items-center gap-1.5" title="Click to open full client profile & document photos">
                      <i data-lucide="user" class="w-3.5 h-3.5 text-amber-400"></i> ${p.clientName}
                    </a>
                  </td>
                  <td class="py-3.5 px-4 text-slate-300 font-medium">${p.membersCovered}</td>
                  <td class="py-3.5 px-4 font-extrabold text-emerald-400">₹${(p.sumInsured/100000).toFixed(1)} Lakhs</td>
                  <td class="py-3.5 px-4 font-extrabold text-white">₹${p.premium.toLocaleString('en-IN')}</td>
                  <td class="py-3.5 px-4 text-slate-300 font-mono">${formatDateDMY(p.expiryDate)}</td>
                  <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button data-send-policy-sms="${p.clientName}" data-policy-desc="Health Cover (${p.company})" data-due-date="${formatDateDMY(p.expiryDate)}" data-amount="${p.premium}" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs border border-emerald-500/40 transition flex items-center gap-1" title="Send SMS Text Reminder to Mobile Number">
                        <i data-lucide="send" class="w-3.5 h-3.5"></i> Send SMS
                      </button>
                      <button data-edit-health="${p.id}" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 text-xs font-bold border border-slate-700 transition flex items-center gap-1">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// 3. Life Insurance View with Edit Policy & Send SMS Controls
function renderLifeModule(db) {
  const policies = db.lifePolicies;

  return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
            <i data-lucide="shield" class="w-5 h-5 text-amber-400"></i>
            Life Insurance & Term Dues
          </h2>
          <p class="text-xs text-slate-400">Track high-value term cover, sum assured, nominees & send text SMS reminders</p>
        </div>
        <button id="btn-open-add-life-modal" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>New Term Policy</span>
        </button>
      </div>

      <div class="zoho-card p-6 rounded-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-slate-400 border-b border-[#1E293B] uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th class="py-3 px-4">Life Insurer</th>
                <th class="py-3 px-4">Client Profile (Click for Photos/Details)</th>
                <th class="py-3 px-4">Policy #</th>
                <th class="py-3 px-4">Sum Assured</th>
                <th class="py-3 px-4">Premium</th>
                <th class="py-3 px-4">Nominee</th>
                <th class="py-3 px-4">Due Date (DD/MM/YYYY)</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1E293B]">
              ${policies.map(p => `
                <tr class="hover:bg-slate-800/40 transition">
                  <td class="py-3.5 px-4 font-extrabold text-white">${p.company}</td>
                  <td class="py-3.5 px-4">
                    <a href="#clients" data-client-id="${p.clientId}" class="font-bold text-cyan-400 hover:underline flex items-center gap-1.5" title="Click to open full client profile & document photos">
                      <i data-lucide="user" class="w-3.5 h-3.5 text-amber-400"></i> ${p.clientName}
                    </a>
                  </td>
                  <td class="py-3.5 px-4 font-mono text-slate-400">${p.policyNumber}</td>
                  <td class="py-3.5 px-4 font-extrabold text-amber-400">₹${(p.sumAssured/10000000).toFixed(2)} Cr</td>
                  <td class="py-3.5 px-4 font-extrabold text-white">₹${p.premium.toLocaleString('en-IN')}</td>
                  <td class="py-3.5 px-4 text-slate-300">${p.nominee}</td>
                  <td class="py-3.5 px-4 text-slate-300 font-mono">${formatDateDMY(p.dueDate)}</td>
                  <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button data-send-policy-sms="${p.clientName}" data-policy-desc="Term Life (${p.company})" data-due-date="${formatDateDMY(p.dueDate)}" data-amount="${p.premium}" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs border border-emerald-500/40 transition flex items-center gap-1" title="Send SMS Text Reminder to Mobile Number">
                        <i data-lucide="send" class="w-3.5 h-3.5"></i> Send SMS
                      </button>
                      <button data-edit-life="${p.id}" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 text-xs font-bold border border-slate-700 transition flex items-center gap-1">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
