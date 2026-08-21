// Analytics & Financial Insights Component - One Stop Solution

import { store } from '../state.js';

export function renderAnalytics() {
  const db = store.get();

  const motorPremium = (db.motorPolicies || []).reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const healthPremium = (db.healthPolicies || []).reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const lifePremium = (db.lifePolicies || []).reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const totalGrossPremium = motorPremium + healthPremium + lifePremium;
  const netCommissionRevenue = Math.round(totalGrossPremium * 0.15);

  const totalClients = (db.clients || []).length;
  const totalPolicies = (db.motorPolicies || []).length + (db.healthPolicies || []).length + (db.lifePolicies || []).length;

  return `
    <div class="space-y-6 animate-fade-in">
      <div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Financial & Business Sales Analytics</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Deep-dive visual analytics for revenue growth, policy mix & commission performance</p>
      </div>

      <!-- Top KPI Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="zoho-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Gross Premium</span>
          <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">₹${totalGrossPremium.toLocaleString('en-IN')}</h3>
          <p class="text-xs text-emerald-500 font-semibold mt-1">Across ${totalPolicies} active policies</p>
        </div>

        <div class="zoho-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Business Commission</span>
          <h3 class="text-2xl font-extrabold text-emerald-500 mt-2">₹${netCommissionRevenue.toLocaleString('en-IN')}</h3>
          <p class="text-xs text-emerald-500 font-semibold mt-1">15% average commission yield</p>
        </div>

        <div class="zoho-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Client Portfolio</span>
          <h3 class="text-2xl font-extrabold text-amber-500 mt-2">${totalClients} Clients</h3>
          <p class="text-xs text-slate-400 mt-1">High retention rate</p>
        </div>

        <div class="zoho-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Premium / Client</span>
          <h3 class="text-2xl font-extrabold text-cyan-400 mt-2">₹${totalClients > 0 ? Math.round(totalGrossPremium / totalClients).toLocaleString('en-IN') : 0}</h3>
          <p class="text-xs text-cyan-400 mt-1">Per client valuation</p>
        </div>
      </div>

      <!-- Analytics Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Monthly Revenue & Commission Bar Chart -->
        <div class="zoho-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 class="font-bold text-slate-900 dark:text-white text-base mb-1">Revenue vs Commission Trends</h3>
          <p class="text-xs text-slate-400 mb-4">Monthly earnings breakdown in ₹ INR</p>
          <div class="h-64 relative">
            <canvas id="analyticsBarChart"></canvas>
          </div>
        </div>

        <!-- Renewal Success Rate Doughnut Chart -->
        <div class="zoho-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 class="font-bold text-slate-900 dark:text-white text-base mb-1">Policy Renewal Success Rate</h3>
          <p class="text-xs text-slate-400 mb-4">On-time renewal performance metrics</p>
          <div class="h-64 relative flex items-center justify-center">
            <canvas id="renewalRateChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Segment Breakdown Table -->
      <div class="zoho-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 class="font-bold text-slate-900 dark:text-white text-base mb-3">Insurance Segment Performance</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] font-bold">
              <tr>
                <th class="py-2.5 px-3">Segment</th>
                <th class="py-2.5 px-3">Policies Count</th>
                <th class="py-2.5 px-3">Gross Premium</th>
                <th class="py-2.5 px-3">Net Revenue (15%)</th>
                <th class="py-2.5 px-3 text-right">Portfolio Share</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr class="hover:bg-slate-800/40">
                <td class="py-3 px-3 font-bold text-cyan-400 flex items-center gap-1.5"><i data-lucide="car" class="w-4 h-4"></i> Motor Insurance</td>
                <td class="py-3 px-3 font-bold text-slate-900 dark:text-white">${(db.motorPolicies || []).length}</td>
                <td class="py-3 px-3 font-extrabold text-white">₹${motorPremium.toLocaleString('en-IN')}</td>
                <td class="py-3 px-3 font-bold text-emerald-400">₹${Math.round(motorPremium * 0.15).toLocaleString('en-IN')}</td>
                <td class="py-3 px-3 text-right font-mono font-bold text-amber-400">${totalGrossPremium > 0 ? Math.round((motorPremium/totalGrossPremium)*100) : 0}%</td>
              </tr>
              <tr class="hover:bg-slate-800/40">
                <td class="py-3 px-3 font-bold text-emerald-400 flex items-center gap-1.5"><i data-lucide="heart-pulse" class="w-4 h-4"></i> Health Insurance</td>
                <td class="py-3 px-3 font-bold text-slate-900 dark:text-white">${(db.healthPolicies || []).length}</td>
                <td class="py-3 px-3 font-extrabold text-white">₹${healthPremium.toLocaleString('en-IN')}</td>
                <td class="py-3 px-3 font-bold text-emerald-400">₹${Math.round(healthPremium * 0.15).toLocaleString('en-IN')}</td>
                <td class="py-3 px-3 text-right font-mono font-bold text-amber-400">${totalGrossPremium > 0 ? Math.round((healthPremium/totalGrossPremium)*100) : 0}%</td>
              </tr>
              <tr class="hover:bg-slate-800/40">
                <td class="py-3 px-3 font-bold text-amber-400 flex items-center gap-1.5"><i data-lucide="shield" class="w-4 h-4"></i> Life Insurance</td>
                <td class="py-3 px-3 font-bold text-slate-900 dark:text-white">${(db.lifePolicies || []).length}</td>
                <td class="py-3 px-3 font-extrabold text-white">₹${lifePremium.toLocaleString('en-IN')}</td>
                <td class="py-3 px-3 font-bold text-emerald-400">₹${Math.round(lifePremium * 0.15).toLocaleString('en-IN')}</td>
                <td class="py-3 px-3 text-right font-mono font-bold text-amber-400">${totalGrossPremium > 0 ? Math.round((lifePremium/totalGrossPremium)*100) : 0}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function initAnalyticsCharts() {
  if (typeof Chart === 'undefined') {
    setTimeout(initAnalyticsCharts, 100);
    return;
  }

  const db = store.get();

  const motorPremium = (db.motorPolicies || []).reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const healthPremium = (db.healthPolicies || []).reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const lifePremium = (db.lifePolicies || []).reduce((sum, p) => sum + Number(p.premium || 0), 0);
  const totalGrossPremium = motorPremium + healthPremium + lifePremium;

  const revData = (db.analytics && Array.isArray(db.analytics.monthlyRevenue)) ? db.analytics.monthlyRevenue : [
    { month: 'May 2026', revenue: Math.round(totalGrossPremium * 0.75 * 0.15), commission: Math.round(totalGrossPremium * 0.75 * 0.15) },
    { month: 'Jun 2026', revenue: Math.round(totalGrossPremium * 0.9 * 0.15), commission: Math.round(totalGrossPremium * 0.9 * 0.15) },
    { month: 'Jul 2026', revenue: Math.round(totalGrossPremium * 0.15), commission: Math.round(totalGrossPremium * 0.15) }
  ];

  const ctxBar = document.getElementById('analyticsBarChart');
  if (ctxBar) {
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: revData.map(d => d.month),
        datasets: [
          {
            label: 'Net Revenue (₹)',
            data: revData.map(d => d.revenue),
            backgroundColor: '#06B6D4',
            borderRadius: 6
          },
          {
            label: 'Commission Payout (₹)',
            data: revData.map(d => d.commission),
            backgroundColor: '#10B981',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94A3B8' } } },
        scales: {
          x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  const ctxDonut = document.getElementById('renewalRateChart');
  if (ctxDonut) {
    new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: ['Renewed On Time (92%)', 'Grace Period Renewal (5%)', 'Lapsed Policies (3%)'],
        datasets: [{
          data: [92, 5, 3],
          backgroundColor: ['#10B981', '#F59E0B', '#F43F5E'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8' } } },
        cutout: '70%'
      }
    });
  }
}
