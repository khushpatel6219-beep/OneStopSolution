// StarOS Pro Clients CRM Component

import { store, formatDateDMY } from '../state.js';


export function renderClients(selectedId = null) {
  const db = store.get();
  const clients = db.clients || [];
  const selectedClient = clients.find(c => c.id === selectedId) || clients[0];

  return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-white">Leads & Account CRM</h2>
          <p class="text-xs text-slate-400">Manage customer records, statutory details, client photos/scans, family tree & timeline</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
            <input type="text" id="client-search-input" placeholder="Search name, phone, PAN..." class="pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white text-xs w-64 focus:border-amber-400 focus:outline-none" />
          </div>
          <button id="btn-open-add-client-modal" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left Side: Client List (4 cols) -->
        <div class="lg:col-span-4 zoho-card p-4 rounded-xl space-y-3 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">All Contacts (${clients.length})</span>
            <span class="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Active CRM</span>
          </div>

          <div class="space-y-2" id="client-list-container">
            ${clients.map(c => `
              <div data-client-id="${c.id}" class="client-card p-3.5 rounded-lg cursor-pointer transition border ${
                selectedClient && selectedClient.id === c.id 
                  ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm' 
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
              }">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-sm text-slate-900 dark:text-white">${c.name}</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded ${c.status === 'Active' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}">${c.status}</span>
                </div>
                <div class="text-xs text-slate-400 mt-1 flex items-center justify-between">
                  <span><i data-lucide="phone" class="w-3 h-3 inline mr-1 text-cyan-400"></i>${c.phone}</span>
                  <span class="font-mono text-[11px] text-amber-500 dark:text-amber-400/90">${c.pan}</span>
                </div>
                <div class="flex flex-wrap gap-1 mt-2">
                  ${(c.services || c.tags || ['General']).map(t => `<span class="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">${t}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right Side: Selected Client Profile Inspector (8 cols) -->
        <div class="lg:col-span-8 zoho-card p-6 rounded-xl space-y-6" id="client-detail-container">
          ${selectedClient ? renderClientDetail(selectedClient, db) : '<p class="text-slate-400">Select a client to view details</p>'}
        </div>

      </div>
    </div>
  `;
}

export function renderClientDetail(client, db) {
  const clientActivities = db.activities.filter(a => a.clientId === client.id);
  const clientMotor = db.motorPolicies.filter(m => m.clientId === client.id);
  const clientHealth = db.healthPolicies.filter(h => h.clientId === client.id);
  const clientLife = db.lifePolicies.filter(l => l.clientId === client.id);

  return `
    <!-- Header info -->
    <div class="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-[#1E293B]">
      <div>
        <div class="flex items-center gap-3">
          <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white">${client.name}</h3>
          <span class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40">${client.occupation || 'Client'}</span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-4">
          <span><i data-lucide="mail" class="w-3.5 h-3.5 inline mr-1 text-amber-500"></i>${client.email}</span>
          <span><i data-lucide="phone" class="w-3.5 h-3.5 inline mr-1 text-cyan-500"></i>${client.phone}</span>
          <span><i data-lucide="map-pin" class="w-3.5 h-3.5 inline mr-1 text-emerald-500"></i>${client.city || 'Mumbai'}, ${client.state || 'Maharashtra'}</span>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button data-send-policy-sms="${client.name}" data-policy-desc="Client Account Update" data-due-date="Active" data-amount="0" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-slate-950 text-xs font-bold border border-amber-500/40 transition flex items-center gap-1.5" title="Send Text Message SMS">
          <i data-lucide="smartphone" class="w-3.5 h-3.5"></i> Text SMS
        </button>
        <a href="https://api.whatsapp.com/send?phone=${(client.phone || '').replace(/[^0-9]/g, '')}&text=${encodeURIComponent('Hello ' + client.name + ',\n\nGreeting from One Stop Solution! How can we assist you with your insurance policies today?\n\nThank you,\nOne Stop Solution')}" target="_blank" class="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white text-xs font-bold border border-emerald-500/40 transition flex items-center gap-1.5" title="Send WhatsApp Message">
          <i data-lucide="message-square" class="w-3.5 h-3.5"></i> WhatsApp
        </a>
        <button data-edit-client="${client.id}" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition flex items-center gap-1.5" title="Edit Record">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit
        </button>
        <button data-delete-client="${client.id}" class="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/30 transition flex items-center gap-1.5">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete
        </button>
      </div>
    </div>

    <!-- Interested / Subscribed Services Tags -->
    <div class="space-y-1.5">
      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subscribed Services</span>
      <div class="flex flex-wrap gap-1.5">
        ${(client.services || client.tags || ['General CRM']).map(serv => `
          <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">${serv}</span>
        `).join('')}
      </div>
    </div>

    <!-- Key Statutory & Identity Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B]">
        <span class="text-[9px] font-bold text-slate-500 uppercase">PAN Number</span>
        <p class="font-mono font-bold text-slate-900 dark:text-amber-400 text-xs mt-0.5">${client.pan || 'NOT SET'}</p>
      </div>
      <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B]">
        <span class="text-[9px] font-bold text-slate-500 uppercase">Aadhaar Number</span>
        <p class="font-mono font-bold text-slate-900 dark:text-white text-xs mt-0.5">${client.aadhaar || '5566 7788 9900'}</p>
      </div>
      <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B]">
        <span class="text-[9px] font-bold text-slate-500 uppercase">Passport</span>
        <p class="font-mono font-bold text-slate-900 dark:text-white text-xs mt-0.5">${client.passport || 'S3344556'}</p>
      </div>
      <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B]">
        <span class="text-[9px] font-bold text-slate-500 uppercase">Date of Birth (DD/MM/YYYY)</span>
        <p class="font-bold text-slate-900 dark:text-white text-xs mt-0.5">${formatDateDMY(client.dob || '1988-05-15')}</p>
      </div>
    </div>

    <!-- Family & Emergency Contact -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B] space-y-1.5 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <i data-lucide="heart" class="w-3.5 h-3.5 text-rose-500"></i> Family Details
          </span>
          <button data-edit-family="${client.id}" class="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline">Edit</button>
        </div>
        <p class="text-slate-600 dark:text-slate-300 text-[11px]">Spouse: <strong class="text-slate-900 dark:text-white">${client.spouseName || 'Lakshmi Swaminathan'}</strong></p>
        <p class="text-slate-600 dark:text-slate-300 text-[11px]">Children: <strong class="text-slate-900 dark:text-white">${client.childrenDetails || 'Vidya (22), Aditya (19)'}</strong></p>
        <p class="text-slate-600 dark:text-slate-300 text-[11px]">Nominee: <strong class="text-emerald-600 dark:text-emerald-400 font-bold">${client.nomineeName || 'Lakshmi Swaminathan'}</strong></p>
      </div>

      <div class="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B] space-y-1.5 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <i data-lucide="phone-call" class="w-3.5 h-3.5 text-cyan-500"></i> Emergency Contact
          </span>
          <button data-edit-emergency="${client.id}" class="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline">Edit</button>
        </div>
        <p class="text-slate-600 dark:text-slate-300 text-[11px]">Name: <strong class="text-slate-900 dark:text-white">${client.emergencyContactName || 'Lakshmi Swaminathan'}</strong></p>
        <p class="text-slate-600 dark:text-slate-300 text-[11px]">Relation: <strong class="text-slate-900 dark:text-white">${client.emergencyContactRelation || 'Spouse'}</strong></p>
        <p class="text-slate-600 dark:text-slate-300 text-[11px]">Phone: <strong class="text-cyan-600 dark:text-cyan-400 font-mono">${client.emergencyContactPhone || '+91 94440 66778'}</strong></p>
      </div>
    </div>

    <!-- Client Photo & Scan Gallery -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <i data-lucide="image" class="w-3.5 h-3.5 text-amber-500"></i> Uploaded Client Photos & Scans (${(client.images || []).length})
        </h4>
        <button data-upload-image="${client.id}" class="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 transition">
          <i data-lucide="upload" class="w-3 h-3"></i> Add Photo/Scan
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        ${(client.images || []).length > 0 ? (client.images.map(img => `
          <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B] group hover:border-amber-500/50 transition">
            <div class="h-28 w-full rounded overflow-hidden bg-slate-200 dark:bg-slate-950 relative cursor-pointer" data-preview-image="${img.url}" data-preview-title="${img.title}">
              <img src="${img.url}" alt="${img.title}" class="w-full h-full object-cover group-hover:scale-105 transition" />
              <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <span class="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-1 rounded border border-slate-700">Preview</span>
              </div>
            </div>
            <div class="flex items-center justify-between mt-1.5">
              <p class="text-[11px] font-bold text-slate-900 dark:text-white truncate">${img.title}</p>
              <a href="${img.url}" download="${(img.title || 'document').replace(/\s+/g, '_')}" class="p-1 text-amber-500 hover:text-amber-400 transition flex-shrink-0" title="Download Document Photo">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
              </a>
            </div>
            <span class="text-[9px] text-amber-600 dark:text-amber-400 font-mono">${img.type || 'Document'}</span>
          </div>

        `).join('')) : `
          <div class="col-span-full p-6 text-center rounded-lg border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 text-xs">
            No document photos uploaded yet. Click <strong>Add Photo/Scan</strong> to upload PAN, Aadhaar, or RC scans.
          </div>
        `}
      </div>
    </div>

    <!-- Associated Policies Summary -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Associated Insurance Policies</h4>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        ${clientMotor.map(m => `
          <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B] space-y-1">
            <span class="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">Motor Insurance</span>
            <p class="font-bold text-slate-900 dark:text-white text-xs">${m.vehicleModel}</p>
            <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400">${m.vehicleNumber} • ${m.company}</p>
          </div>
        `).join('')}
        ${clientHealth.map(h => `
          <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B] space-y-1">
            <span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Health Cover</span>
            <p class="font-bold text-slate-900 dark:text-white text-xs">${h.company}</p>
            <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400">Sum Insured: ₹${(h.sumInsured/100000).toFixed(1)}L</p>
          </div>
        `).join('')}
        ${clientLife.map(l => `
          <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-[#1E293B] space-y-1">
            <span class="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase">Term Policy</span>
            <p class="font-bold text-slate-900 dark:text-white text-xs">${l.company}</p>
            <p class="text-[10px] font-mono text-slate-500 dark:text-slate-400">Cover: ₹${(l.sumAssured/10000000).toFixed(2)}Cr</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
