// UI Components & Render Functions

const UI = {
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const colors = {
            success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            error: 'bg-red-50 text-red-800 border-red-200',
            info: 'bg-blue-50 text-blue-800 border-blue-200',
            warning: 'bg-yellow-50 text-yellow-800 border-yellow-200'
        };
        
        const icons = {
            success: 'fa-check-circle text-emerald-500',
            error: 'fa-exclamation-circle text-red-500',
            info: 'fa-info-circle text-blue-500',
            warning: 'fa-exclamation-triangle text-yellow-500'
        };

        toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${colors[type]} toast-enter max-w-sm`;
        toast.innerHTML = `
            <i class="fa-solid ${icons[type]} text-lg"></i>
            <p class="text-sm font-medium flex-1">${message}</p>
            <button class="text-slate-400 hover:text-slate-600 focus:outline-none" onclick="this.parentElement.remove()">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            if(toast.parentElement) {
                toast.classList.replace('toast-enter', 'toast-leave');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    },

    createModal(id, title, content, actions = '') {
        const container = document.getElementById('modals-container');
        const modalHtml = `
            <div id="${id}" class="fixed inset-0 z-[100] hidden">
                <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm modal-backdrop" onclick="UI.closeModal('${id}')"></div>
                <div class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto modal-content overflow-hidden">
                        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 class="text-lg font-bold text-slate-800">${title}</h3>
                            <button onclick="UI.closeModal('${id}')" class="text-slate-400 hover:text-red-500 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50">
                                <i class="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                        <div class="p-6 overflow-y-auto custom-scrollbar flex-1">
                            ${content}
                        </div>
                        ${actions ? `
                        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            ${actions}
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        const existing = document.getElementById(id);
        if (existing) existing.remove();
        
        container.insertAdjacentHTML('beforeend', modalHtml);
    },

    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('hidden');
    },

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    renderDashboardCard(title, value, icon, colorClass, trend = '+5%') {
        return `
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
                <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full ${colorClass} opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                <div class="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <p class="text-sm font-medium text-slate-500 mb-1">${title}</p>
                        <h4 class="text-2xl font-bold text-slate-800">${value}</h4>
                    </div>
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} text-white shadow-sm">
                        <i class="fa-solid ${icon}"></i>
                    </div>
                </div>
                <div class="flex items-center text-xs relative z-10">
                    <span class="text-emerald-500 font-medium flex items-center gap-1"><i class="fa-solid fa-arrow-trend-up"></i> ${trend}</span>
                    <span class="text-slate-400 ml-2">vs last month</span>
                </div>
            </div>
        `;
    },

    getBadgeClass(status) {
        const lower = status.toLowerCase();
        if (lower.includes('active') || lower.includes('approved') || lower.includes('completed')) return 'badge-success';
        if (lower.includes('pending') || lower.includes('review') || lower.includes('follow-up')) return 'badge-warning';
        if (lower.includes('expired') || lower.includes('lost') || lower.includes('rejected')) return 'badge-danger';
        if (lower.includes('contacted')) return 'badge-info';
        return 'badge-secondary';
    },

    renderTable(headers, rows, onRowClick = null) {
        let html = `
            <div class="overflow-x-auto">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        rows.forEach((row, i) => {
            // For interactivity, attach data index or row ID
            const clickAttr = onRowClick ? `onclick="${onRowClick}(${i})"` : '';
            html += `<tr ${clickAttr}>`;
            
            row.forEach((cell, j) => {
                // If it looks like a status, wrap in badge
                if (typeof cell === 'string' && (cell.match(/^(Active|Expired|Pending|Approved|Rejected|Under Review|New Lead|Completed|Contacted|Follow-Up)$/i))) {
                    html += `<td><span class="badge ${this.getBadgeClass(cell)}">${cell}</span></td>`;
                } else {
                    html += `<td>${cell}</td>`;
                }
            });
            html += `</tr>`;
        });

        if (rows.length === 0) {
            html += `<tr><td colspan="${headers.length}" class="text-center py-8 text-slate-400">No data available</td></tr>`;
        }

        html += `</tbody></table></div>`;
        return html;
    }
};
