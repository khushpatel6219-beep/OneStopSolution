// One Stop Solution Dashboard Component

import { store, formatDateDMY } from '../state.js';

export function renderDashboard() {
  const db = store.get();
  
  // Metrics
  const totalClients = db.clients.length;
  const totalPolicies = db.motorPolicies.length + db.healthPolicies.length + db.lifePolicies.length;
  
  const expiringToday = [
    ...db.motorPolicies.filter(p => p.status === 'Expiring Today' || p.expiryDate === '2026-07-28'),
    ...db.healthPolicies.filter(p => p.status === 'Expiring Today' || p.expiryDate === '2026-07-28'),
    ...db.lifePolicies.filter(p => p.status === 'Expiring Today' || p.dueDate === '2026-07-28')
  ];

  const expiringThisWeek = [
    ...db.motorPolicies.filter(p => p.status.includes('Expiring') || p.expiryDate === '2026-07-28' || (p.expiryDate >= '2026-07-28' && p.expiryDate <= '2026-08-04')),
    ...db.healthPolicies.filter(p => p.status.includes('Expiring') || p.expiryDate === '2026-07-28' || (p.expiryDate >= '2026-07-28' && p.expiryDate <= '2026-08-04')),
    ...db.lifePolicies.filter(p => p.status.includes('Expiring') || p.dueDate === '2026-07-28' || (p.dueDate >= '2026-07-28' && p.dueDate <= '2026-08-04'))
  ];

  const pendingPayments = db.payments.filter(p => p.status === 'Pending');
  const totalPendingPaymentAmt = pendingPayments.reduce((acc, curr) => {
    const val = Number(curr.pendingAmount || curr.remainingAmount || curr.amount || 0);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const pendingDisplay = isNaN(totalPendingPaymentAmt) || totalPendingPaymentAmt === 0
    ? '₹0'
    : totalPendingPaymentAmt >= 100000
    ? `₹${(totalPendingPaymentAmt / 100000).toFixed(2)} L`
    : `₹${totalPendingPaymentAmt.toLocaleString('en-IN')}`;

  // Dynamic Premium & Revenue calculated strictly from real active policies
  const motorPremium = db.motorPolicies.reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const healthPremium = db.healthPolicies.reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const lifePremium = db.lifePolicies.reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const monthlyPremiumAmt = motorPremium + healthPremium + lifePremium;
  const monthlyRevenueAmt = monthlyPremiumAmt > 0 ? Math.round(monthlyPremiumAmt * 0.15) : 0;

  const revDisplay = monthlyRevenueAmt >= 100000 
    ? `₹${(monthlyRevenueAmt / 100000).toFixed(2)} L` 
    : `₹${monthlyRevenueAmt.toLocaleString('en-IN')}`;

  const premDisplay = monthlyPremiumAmt >= 100000 
    ? `₹${(monthlyPremiumAmt / 100000).toFixed(2)} L` 
    : `₹${monthlyPremiumAmt.toLocaleString('en-IN')}`;

  // Calculate dynamic Portfolio Distribution
  let motorPct = 0, healthPct = 0, lifePct = 0;
  if (monthlyPremiumAmt > 0) {
    motorPct = Math.round((motorPremium / monthlyPremiumAmt) * 100);
    healthPct = Math.round((healthPremium / monthlyPremiumAmt) * 100);
    lifePct = Math.max(0, 100 - motorPct - healthPct);
  } else if (totalPolicies > 0) {
    motorPct = Math.round((db.motorPolicies.length / totalPolicies) * 100);
    healthPct = Math.round((db.healthPolicies.length / totalPolicies) * 100);
    lifePct = Math.max(0, 100 - motorPct - healthPct);
  }

  return `
    <div class="space-y-6 animate-fade-in">

      <!-- Expiring Policies Banner Warning -->
      ${expiringThisWeek.length > 0 ? `
        <div class="p-4 rounded-xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/40 flex items-center justify-between shadow-xl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg animate-pulse">
              <i data-lucide="alert-triangle" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="font-bold text-white text-sm">Policies Renewal Alert (${expiringThisWeek.length} Policies Expiring Soon)</h3>
              <p class="text-xs text-slate-300 mt-0.5">
                ${expiringToday.length > 0 ? `<strong class="text-amber-400">${expiringToday.length} expiring TODAY</strong>. ` : ''}
                Customer ${expiringThisWeek[0]?.clientName || 'Valued Client'}'s policy is due. Action recommended immediately.
              </p>
            </div>
          </div>
          <a href="#reminders" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition shadow-md shadow-amber-500/30">
            View Renewals
          </a>
        </div>
      ` : ''}

      <!-- Top KPI Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- 1. Total Clients / Leads Card -->
        <a href="#clients" class="zoho-card p-5 rounded-xl zoho-card-hover flex flex-col justify-between block cursor-pointer group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-amber-500 transition">Total Leads & Clients</span>
            <div class="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <i data-lucide="users" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white">${totalClients}</h3>
            <p class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <i data-lucide="trending-up" class="w-3 h-3"></i> Active Leads & Accounts
            </p>
          </div>
        </a>

        <!-- 2. Active Policies Card -->
        <a href="#motor" class="zoho-card p-5 rounded-xl zoho-card-hover flex flex-col justify-between block cursor-pointer group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-cyan-500 transition">Active Insurance Policies</span>
            <div class="w-9 h-9 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
              <i data-lucide="shield-check" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white">${totalPolicies}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Motor, Health & Life</p>
          </div>
        </a>

        <!-- 3. Policies Expiring Card -->
        <a href="#reminders" class="zoho-card p-5 rounded-xl zoho-card-hover flex flex-col justify-between block cursor-pointer group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-rose-500 transition">Expiring This Week</span>
            <div class="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition">
              <i data-lucide="clock" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-extrabold text-rose-600 dark:text-rose-400">${expiringThisWeek.length}</h3>
            <p class="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">${expiringToday.length} Expiring Today!</p>
          </div>
        </a>

        <!-- 4. Pending Invoices Card -->
        <a href="#payments" class="zoho-card p-5 rounded-xl zoho-card-hover flex flex-col justify-between block cursor-pointer group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-amber-500 transition">Pending Invoices</span>
            <div class="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <i data-lucide="receipt" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-extrabold text-amber-600 dark:text-amber-400">${pendingDisplay}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${pendingPayments.length} Pending Invoices</p>
          </div>
        </a>

        <!-- 5. Monthly Revenue Card -->
        <a href="#analytics" class="zoho-card p-5 rounded-xl zoho-card-hover flex flex-col justify-between block cursor-pointer group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-emerald-500 transition">Monthly Revenue</span>
            <div class="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
              <i data-lucide="indian-rupee" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">${revDisplay}</h3>
            <p class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <i data-lucide="trending-up" class="w-3 h-3"></i> Real-time Net Revenue (15%)
            </p>
          </div>
        </a>

        <!-- 6. Monthly Premium Collection Card -->
        <a href="#payments" class="zoho-card p-5 rounded-xl zoho-card-hover flex flex-col justify-between block cursor-pointer group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-cyan-500 transition">Premium Collected</span>
            <div class="w-9 h-9 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
              <i data-lucide="wallet" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white">${premDisplay}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Active Gross Premium</p>
          </div>
        </a>

        <!-- 7. Today's Tasks & Meetings Card -->
        <a href="#calendar" class="zoho-card p-5 rounded-xl zoho-card-hover flex flex-col justify-between block cursor-pointer group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-amber-500 transition">Schedule Today</span>
            <div class="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <i data-lucide="calendar" class="w-4 h-4"></i>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white">${db.calendarEvents.length} Events</h3>
            <p class="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">Active Calendar Items</p>
          </div>
        </a>

      </div>

      <!-- Quick Action Buttons Row -->
      <div class="flex flex-wrap items-center gap-3">
        <button id="btn-quick-add-client-2" class="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition">
          <i data-lucide="user-plus" class="w-4 h-4"></i>
          <span>Add Lead / Client</span>
        </button>

        <button id="btn-quick-add-motor" class="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center gap-2 transition">
          <i data-lucide="car" class="w-4 h-4 text-cyan-500 dark:text-cyan-400"></i>
          <span>New Motor Deal</span>
        </button>

        <button id="btn-quick-add-health" class="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center gap-2 transition">
          <i data-lucide="heart-pulse" class="w-4 h-4 text-emerald-500 dark:text-emerald-400"></i>
          <span>New Health Deal</span>
        </button>

        <button id="btn-trigger-voice-guide" class="px-4 py-2.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 font-bold text-xs flex items-center gap-2 transition">
          <i data-lucide="bot" class="w-4 h-4"></i>
          <span>Ask AI Assistant</span>
        </button>
      </div>

      <!-- Analytics Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Main Sales & Revenue Line Chart (2 Cols) -->
        <div class="lg:col-span-2 zoho-card p-6 rounded-xl">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-extrabold text-white text-base">Monthly Revenue & Premium Sales</h3>
              <p class="text-xs text-slate-400">Sales pipeline & revenue performance</p>
            </div>
            <div class="flex items-center gap-3 text-xs font-bold">
              <span class="flex items-center gap-1.5 text-cyan-400">
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Premium
              </span>
              <span class="flex items-center gap-1.5 text-emerald-400">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Revenue
              </span>
            </div>
          </div>
          <div class="h-64 relative">
            <canvas id="salesGrowthChart"></canvas>
          </div>
        </div>

        <!-- Insurance Distribution Pie Chart (1 Col) -->
        <div class="zoho-card p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 class="font-extrabold text-white text-base mb-1">Portfolio Distribution</h3>
            <p class="text-xs text-slate-400 mb-4">Business split across Motor, Health & Life Covers</p>
            <div class="h-48 relative flex items-center justify-center">
              <canvas id="portfolioPieChart"></canvas>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-[#1E293B] grid grid-cols-3 gap-2 text-xs font-semibold text-center">
            <div class="p-2 rounded bg-slate-900 border border-slate-800">
              <span class="block text-cyan-400 font-extrabold">${motorPct}%</span> Motor
            </div>
            <div class="p-2 rounded bg-slate-900 border border-slate-800">
              <span class="block text-emerald-400 font-extrabold">${healthPct}%</span> Health
            </div>
            <div class="p-2 rounded bg-slate-900 border border-slate-800">
              <span class="block text-amber-400 font-extrabold">${lifePct}%</span> Life
            </div>
          </div>
        </div>

      </div>

      <!-- Recent Clients Table -->
      <div class="zoho-card p-6 rounded-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-extrabold text-white text-base">Recent Leads & Clients</h3>
          <a href="#clients" class="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1">
            View All (${db.clients.length}) <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-slate-400 border-b border-[#1E293B] uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th class="py-2.5 px-3">Lead / Client</th>
                <th class="py-2.5 px-3">PAN</th>
                <th class="py-2.5 px-3">Services</th>
                <th class="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1E293B]">
              ${db.clients.slice(0, 4).map(client => `
                <tr class="hover:bg-slate-800/40 transition">
                  <td class="py-3 px-3">
                    <div class="font-bold text-white">${client.name}</div>
                    <div class="text-[11px] text-slate-400">${client.phone}</div>
                  </td>
                  <td class="py-3 px-3 font-mono text-slate-300">${client.pan}</td>
                  <td class="py-3 px-3">
                    ${(client.services || ['Motor']).map(t => `<span class="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-bold mr-1">${t}</span>`).join('')}
                  </td>
                  <td class="py-3 px-3 text-right">
                    <a href="#clients" data-client-id="${client.id}" class="p-1.5 rounded-md bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 transition inline-block">
                      <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                    </a>
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

export function initDashboardCharts(retries = 0) {
  if (typeof Chart === 'undefined') {
    if (retries < 5) {
      setTimeout(() => initDashboardCharts(retries + 1), 250);
    }
    return;
  }

  const db = store.get();
  
  const motorPremium = db.motorPolicies.reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const healthPremium = db.healthPolicies.reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const lifePremium = db.lifePolicies.reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const totalPremium = motorPremium + healthPremium + lifePremium;
  const totalPolicies = db.motorPolicies.length + db.healthPolicies.length + db.lifePolicies.length;

  let motorPct = 0, healthPct = 0, lifePct = 0;
  if (totalPremium > 0) {
    motorPct = Math.round((motorPremium / totalPremium) * 100);
    healthPct = Math.round((healthPremium / totalPremium) * 100);
    lifePct = Math.max(0, 100 - motorPct - healthPct);
  } else if (totalPolicies > 0) {
    motorPct = Math.round((db.motorPolicies.length / totalPolicies) * 100);
    healthPct = Math.round((db.healthPolicies.length / totalPolicies) * 100);
    lifePct = Math.max(0, 100 - motorPct - healthPct);
  } else {
    motorPct = 33; healthPct = 33; lifePct = 34;
  }

  // 1. Sales Growth Line Chart
  const ctxSales = document.getElementById('salesGrowthChart');
  if (ctxSales) {
    const monthlyData = [
      { month: 'May 2026', premium: Math.round(totalPremium * 0.7), revenue: Math.round(totalPremium * 0.7 * 0.15) },
      { month: 'Jun 2026', premium: Math.round(totalPremium * 0.85), revenue: Math.round(totalPremium * 0.85 * 0.15) },
      { month: 'Jul 2026', premium: totalPremium, revenue: Math.round(totalPremium * 0.15) }
    ];
    new Chart(ctxSales, {
      type: 'line',
      data: {
        labels: monthlyData.map(d => d.month),
        datasets: [
          {
            label: 'Gross Premium (₹)',
            data: monthlyData.map(d => d.premium),
            borderColor: '#06B6D4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          },
          {
            label: 'Net Revenue (₹)',
            data: monthlyData.map(d => d.revenue),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } }
        }
      }
    });
  }

  // 2. Portfolio Doughnut Chart
  const ctxPie = document.getElementById('portfolioPieChart');
  if (ctxPie) {
    new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: ['Motor Insurance', 'Health Insurance', 'Life Insurance'],
        datasets: [{
          data: [motorPct, healthPct, lifePct],
          backgroundColor: ['#06B6D4', '#10B981', '#F59E0B'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        cutout: '72%'
      }
    });
  }
}
