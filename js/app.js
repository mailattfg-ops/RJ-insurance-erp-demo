// Core App Logic

const App = {
    modules: {
        'dashboard': { icon: 'fa-chart-pie', label: 'Dashboard', roles: ['Admin', 'CRM Executive', 'Agent', 'Claims Manager', 'Accountant', 'Employee'] },
        'crm': { icon: 'fa-users', label: 'CRM Management', roles: ['Admin', 'CRM Executive', 'Agent'] },
        'policy': { icon: 'fa-file-shield', label: 'Policies', roles: ['Admin', 'Agent', 'CRM Executive'] },
        'claims': { icon: 'fa-truck-medical', label: 'Claims Workflow', roles: ['Admin', 'Claims Manager'] },
        'payments': { icon: 'fa-money-bill-transfer', label: 'Banking & Payments', roles: ['Admin', 'Accountant'] },
        'hr': { icon: 'fa-user-tie', label: 'HR & Employees', roles: ['Admin'] },
        'accounts': { icon: 'fa-file-invoice-dollar', label: 'Accounts', roles: ['Admin', 'Accountant'] },
        'notifications': { icon: 'fa-message', label: 'Communication', roles: ['Admin', 'CRM Executive', 'Agent'] },
        'reports': { icon: 'fa-chart-line', label: 'Reports center', roles: ['Admin', 'Accountant'] },
        'storage': { icon: 'fa-cloud', label: 'Secure Storage', roles: ['Admin', 'CRM Executive', 'Agent', 'Claims Manager', 'Accountant'] }
    },
    
    currentModule: 'dashboard',
    crmTab: 'customers',
    charts: [],

    init() {
        this.setupAuth();
        this.setupGlobalEvents();
    },

    setupAuth() {
        const loginForm = document.getElementById('login-form');
        const togglePwd = document.getElementById('toggle-password');
        
        togglePwd.addEventListener('click', (e) => {
            const pwdInput = document.getElementById('password');
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                togglePwd.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
            } else {
                pwdInput.type = 'password';
                togglePwd.innerHTML = '<i class="fa-regular fa-eye"></i>';
            }
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            
            // Simple mock role resolution based on email
            let role = 'Employee';
            if(email.includes('admin')) role = 'Admin';
            else if(email.includes('crm')) role = 'CRM Executive';
            else if(email.includes('agent')) role = 'Agent';
            else if(email.includes('claims')) role = 'Claims Manager';
            else if(email.includes('accounts')) role = 'Accountant';

            const btn = document.getElementById('login-btn');
            const ogText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
            btn.disabled = true;

            setTimeout(() => {
                DataStore.currentUser = { name: email.split('@')[0].toUpperCase(), email, role };
                this.loadApp();
                btn.innerHTML = ogText;
                btn.disabled = false;
                UI.showToast(`Welcome back, ${role}!`);
            }, 1000);
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            DataStore.currentUser = null;
            document.getElementById('app-screen').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('login-form').reset();
            UI.showToast('Logged out successfully', 'info');
        });
    },

    setupGlobalEvents() {
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('-translate-x-full');
        });

        document.getElementById('notification-btn').addEventListener('click', () => {
            UI.showToast('You have 3 new WhatsApp replies from customers.', 'info');
        });
    },

    loadApp() {
        document.getElementById('login-screen').classList.add('hidden');
        const appScreen = document.getElementById('app-screen');
        appScreen.classList.remove('hidden');
        appScreen.classList.add('fade-in-up');

        // Setup user details
        const initials = DataStore.currentUser.name.substring(0, 2);
        document.getElementById('user-avatar-initials').innerText = initials;
        document.getElementById('user-name-display').innerText = DataStore.currentUser.name;
        document.getElementById('user-role-display').innerText = DataStore.currentUser.role;

        this.renderSidebar();
        this.switchModule('dashboard');
    },

    renderSidebar() {
        const menu = document.getElementById('nav-menu');
        menu.innerHTML = '';
        
        const role = DataStore.currentUser.role;
        
        Object.keys(this.modules).forEach(key => {
            const mod = this.modules[key];
            if (mod.roles.includes(role)) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <button onclick="App.switchModule('${key}')" id="nav-${key}" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-primary/10 hover:text-white transition-all text-sm font-medium group">
                        <i class="fa-solid ${mod.icon} text-lg w-5 text-center group-hover:text-primary transition-colors"></i>
                        <span>${mod.label}</span>
                    </button>
                `;
                menu.appendChild(li);
            }
        });
    },

    switchModule(moduleId) {
        this.currentModule = moduleId;
        
        // Close sidebar on mobile devices automatically
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.add('-translate-x-full');
        }

        // Update nav active state
        document.querySelectorAll('#nav-menu button').forEach(btn => {
            btn.classList.remove('bg-primary/20', 'text-white', 'border-l-2', 'border-primary');
            if(btn.id === `nav-${moduleId}`) {
                btn.classList.add('bg-primary/20', 'text-white', 'border-l-2', 'border-primary');
            }
        });

        const container = document.getElementById('main-container');
        container.innerHTML = `<div class="flex justify-center items-center h-full"><i class="fa-solid fa-circle-notch fa-spin text-4xl text-primary"></i></div>`;
        
        // Clear old charts
        this.charts.forEach(c => c.destroy());
        this.charts = [];

        // Simulate network delay for realistic feel
        setTimeout(() => {
            container.innerHTML = `<div class="module-enter h-full flex flex-col">${this[`render${moduleId.charAt(0).toUpperCase() + moduleId.slice(1)}Module`]()}</div>`;
            
            // Post render logic
            if (moduleId === 'dashboard') this.initDashboardCharts();
            if (moduleId === 'reports') this.initReportCharts();
        }, 300);
    },

    // --- MODULE RENDERING --- //

    renderDashboardModule() {
        const stats = DataStore.getSummaryStats();
        return `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Enterprise Dashboard</h2>
                    <p class="text-slate-500 text-sm">Real-time overview of RJ Insurance operations.</p>
                </div>
                <button class="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                    <i class="fa-solid fa-download"></i> Export Report
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                ${UI.renderDashboardCard('Total Revenue', stats.monthlyRevenue, 'fa-indian-rupee-sign', 'bg-emerald-500')}
                ${UI.renderDashboardCard('Total Customers', stats.totalCustomers, 'fa-users', 'bg-blue-600')}
                ${UI.renderDashboardCard('Active Policies', stats.activePolicies, 'fa-file-shield', 'bg-teal-600')}
                ${UI.renderDashboardCard('Pending Claims', stats.pendingClaims, 'fa-truck-medical', 'bg-red-500', '-2%')}
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 h-auto lg:h-96">
                <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-slate-800 mb-4">Revenue & Policy Growth</h3>
                    <div class="flex-1 relative w-full h-64 lg:h-full">
                        <canvas id="revenueChart"></canvas>
                    </div>
                </div>
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-slate-800 mb-4">Portfolio Split</h3>
                    <div class="flex-1 relative w-full h-64 lg:h-full flex justify-center items-center">
                        <canvas id="portfolioChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-0 overflow-hidden">
                    <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 class="text-lg font-bold text-slate-800">Policies Expiring Soon</h3>
                        <span class="badge badge-warning">${stats.expiringSoon} Pending</span>
                    </div>
                    <div class="p-0">
                        ${UI.renderTable(
                            ['Policy ID', 'Customer', 'Type', 'Expiry', 'Action'],
                            DataStore.policies.filter(p => new Date(p.expiryDate) > new Date() && new Date(p.expiryDate) <= new Date(Date.now() + 30*24*60*60*1000)).slice(0, 5).map(p => [
                                p.id,
                                p.customerName,
                                p.type,
                                `<span class="text-red-600 font-medium">${p.expiryDate}</span>`,
                                `<button onclick="App.actionWhatsApp('${p.customerName}')" class="text-emerald-600 hover:text-emerald-800 p-1 bg-emerald-50 rounded"><i class="fa-brands fa-whatsapp"></i></button>`
                            ])
                        )}
                    </div>
                </div>
                
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-0 overflow-hidden">
                    <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 class="text-lg font-bold text-slate-800">Recent Claims Workflow</h3>
                    </div>
                    <div class="p-0">
                        ${UI.renderTable(
                            ['Claim ID', 'Customer', 'Status', 'Amount'],
                            DataStore.claims.slice(0, 5).map(c => [
                                c.id,
                                c.customerName,
                                c.status,
                                `₹${c.amount.toLocaleString()}`
                            ])
                        )}
                    </div>
                </div>
            </div>
        `;
    },

    renderCrmModule() {
        return `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Customer & Lead Management</h2>
                    <p class="text-slate-500 text-sm">Manage customers, leads, and follow-ups.</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="App.showAddCustomerModal()" class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-md flex items-center gap-2">
                        <i class="fa-solid fa-user-plus"></i> New Customer
                    </button>
                    <button onclick="App.showAddLeadModal()" class="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-md flex items-center gap-2">
                        <i class="fa-solid fa-plus"></i> New Lead
                    </button>
                </div>
            </div>

            <div class="flex gap-4 mb-4 border-b border-slate-200">
                <button onclick="App.switchCrmTab('customers')" class="pb-2 px-4 text-sm font-bold border-b-2 transition ${this.crmTab === 'customers' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}">Customers (${DataStore.customers.length})</button>
                <button onclick="App.switchCrmTab('leads')" class="pb-2 px-4 text-sm font-bold border-b-2 transition ${this.crmTab === 'leads' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}">Leads & Enquiries (${DataStore.leads.length})</button>
            </div>
            
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
                <div class="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
                    <div class="relative flex-1 max-w-md">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input type="text" placeholder="Search by name, phone, or PAN..." class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    </div>
                </div>
                <div class="flex-1 overflow-auto custom-scrollbar">
                    ${this.crmTab === 'customers' ? 
                        UI.renderTable(
                            ['ID', 'Name', 'Mobile', 'Email', 'Agent Assigned', 'Policies', 'Status'],
                            DataStore.customers.map((c, i) => [
                                `<span class="font-mono text-xs text-slate-500">${c.id}</span>`,
                                `<div class="font-medium text-slate-800">${c.name}</div>`,
                                c.mobile,
                                `<span class="text-slate-500 text-xs">${c.email}</span>`,
                                c.agentAssigned,
                                `<span class="bg-slate-100 px-2 py-1 rounded text-xs font-bold">${c.totalPolicies}</span>`,
                                c.status
                            ]),
                            'App.openCustomerDetails',
                            DataStore.customers.map(c => c.id)
                        ) :
                        UI.renderTable(
                            ['Lead ID', 'Name', 'Mobile', 'Type', 'Stage', 'Owner', 'Demo Scheduled', 'Date'],
                            DataStore.leads.map((l, i) => [
                                `<span class="font-mono text-xs text-slate-500">${l.id}</span>`,
                                `<div class="font-medium text-slate-800">${l.name}</div>`,
                                l.mobile,
                                l.insuranceType,
                                `<span class="px-2 py-0.5 rounded text-xs font-bold ${l.stage === 'Interested' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}">${l.stage}</span>`,
                                l.assignedTo,
                                l.demoScheduled ? `<span class="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-bold"><i class="fa-solid fa-calendar-day mr-1"></i>${l.demoScheduled}</span>` : 'None',
                                l.date
                            ]),
                            'App.openLeadDetails',
                            DataStore.leads.map(l => l.id)
                        )
                    }
                </div>
                <div class="p-4 border-t border-slate-100 bg-slate-50 text-sm text-slate-500 flex justify-between items-center">
                    <span>Showing 1 to ${this.crmTab === 'customers' ? DataStore.customers.length : DataStore.leads.length} entries</span>
                </div>
            </div>
        `;
    },

    switchCrmTab(tab) {
        this.crmTab = tab;
        const container = document.getElementById('main-container');
        if (container) {
            container.innerHTML = `<div class="module-enter h-full flex flex-col">${this.renderCrmModule()}</div>`;
        }
    },

    renderPolicyModule() {
        return `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Policy Management</h2>
                    <p class="text-slate-500 text-sm">Track renewals, issue new policies, and view history.</p>
                </div>
                <button onclick="App.showIssuePolicyModal()" class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-md flex items-center gap-2">
                    <i class="fa-solid fa-file-contract"></i> Issue Policy
                </button>
            </div>
            
            <!-- Cards for fast filter -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 cursor-pointer hover:bg-slate-50">
                    <p class="text-slate-500 text-xs font-bold uppercase mb-1">Total Policies</p>
                    <p class="text-xl font-bold text-slate-800">${DataStore.policies.length}</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500 cursor-pointer hover:bg-slate-50">
                    <p class="text-slate-500 text-xs font-bold uppercase mb-1">Active</p>
                    <p class="text-xl font-bold text-slate-800">${DataStore.policies.filter(p=>p.status==='Active').length}</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500 cursor-pointer hover:bg-slate-50">
                    <p class="text-slate-500 text-xs font-bold uppercase mb-1">Renewal Due (30D)</p>
                    <p class="text-xl font-bold text-slate-800">${DataStore.getSummaryStats().expiringSoon}</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 cursor-pointer hover:bg-slate-50">
                    <p class="text-slate-500 text-xs font-bold uppercase mb-1">Expired</p>
                    <p class="text-xl font-bold text-slate-800">${DataStore.policies.filter(p=>p.status==='Expired').length}</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
                <div class="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
                    <div class="relative flex-1 max-w-md">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input type="text" id="policy-search-input" oninput="App.searchPolicies(this.value)" placeholder="Search by Policy ID, Company, or Customer..." class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    </div>
                </div>
                <div id="policy-table-container" class="flex-1 overflow-auto custom-scrollbar">
                    ${UI.renderTable(
                        ['Policy No', 'Company', 'Customer', 'Type', 'Premium', 'Expiry', 'Status'],
                        DataStore.policies.map((p, i) => [
                            `<span class="font-mono text-xs text-primary font-bold cursor-pointer hover:underline">${p.id}</span>`,
                            `<div class="flex items-center gap-2"><div class="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs"><i class="fa-solid fa-building"></i></div> <span class="text-sm font-medium">${p.company}</span></div>`,
                            p.customerName,
                            p.type,
                            `₹${p.premium.toLocaleString()}`,
                            p.expiryDate,
                            p.status
                        ]),
                        'App.openPolicyDetails',
                        DataStore.policies.map(p => p.id)
                    )}
                </div>
            </div>
        `;
    },

    renderClaimsModule() {
        return `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Claim Workflows</h2>
                    <p class="text-slate-500 text-sm">Register and process insurance claims.</p>
                </div>
                <button onclick="App.showRegisterClaimModal()" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-md flex items-center gap-2">
                    <i class="fa-solid fa-plus"></i> Register Claim
                </button>
            </div>
            
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
                <div class="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
                    <div class="relative flex-1 max-w-md">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input type="text" id="claims-search-input" oninput="App.searchClaims(this.value)" placeholder="Search by Claim ID, Customer, or Status..." class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    </div>
                </div>
                <div id="claims-table-container" class="flex-1 overflow-auto custom-scrollbar">
                    ${UI.renderTable(
                        ['Claim ID', 'Policy ID', 'Customer', 'Type', 'Date', 'Amount', 'Status'],
                        DataStore.claims.map((c, i) => [
                            `<span class="font-mono text-xs font-bold">${c.id}</span>`,
                            `<span class="font-mono text-xs text-slate-500">${c.policyId}</span>`,
                            c.customerName,
                            c.type,
                            c.date,
                            `₹${c.amount.toLocaleString()}`,
                            c.status
                        ]),
                        'App.openClaimDetails',
                        DataStore.claims.map(c => c.id)
                    )}
                </div>
            </div>
        `;
    },

    renderPaymentsModule() {
        return `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Payments & Banking</h2>
                    <p class="text-slate-500 text-sm">Manage premium collections and commissions.</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="App.showFundTransferModal()" class="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                        <i class="fa-solid fa-building-columns text-primary"></i> Fund Transfer
                    </button>
                    <button onclick="App.showAddEntryModal()" class="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-md">
                        <i class="fa-solid fa-indian-rupee-sign"></i> Receive Payment
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
                <div class="flex-1 overflow-auto custom-scrollbar">
                    ${UI.renderTable(
                        ['Txn ID', 'Date', 'Category', 'Mode', 'Type', 'Amount', 'Status'],
                        DataStore.transactions.map((t, i) => [
                            `<span class="font-mono text-xs">${t.id}</span>`,
                            t.date,
                            t.category,
                            `<span class="px-2 py-1 bg-slate-100 rounded text-xs">${t.mode}</span>`,
                            t.type === 'Credit' ? `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-arrow-down mr-1"></i>IN</span>` : `<span class="text-red-600 font-bold"><i class="fa-solid fa-arrow-up mr-1"></i>OUT</span>`,
                            `<span class="font-mono font-medium">₹${t.amount.toLocaleString()}</span>`,
                            t.status
                        ])
                    )}
                </div>
            </div>
        `;
    },

    renderHrModule() {
        return `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Employee Management</h2>
                    <p class="text-slate-500 text-sm">HR, Salary, and Performance tracking.</p>
                </div>
                <button onclick="App.showAddEmployeeModal()" class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-md flex items-center gap-2">
                    <i class="fa-solid fa-user-plus"></i> Add Employee
                </button>
            </div>
            
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
                <div class="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
                    <div class="relative flex-1 max-w-md">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input type="text" id="hr-search-input" oninput="App.searchHr(this.value)" placeholder="Search by name, role, or ID..." class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    </div>
                </div>
                <div id="hr-table-container" class="flex-1 overflow-auto custom-scrollbar">
                    ${UI.renderTable(
                        ['EMP ID', 'Name', 'Role', 'Mobile', 'Base Salary', 'Performance', 'Status'],
                        DataStore.employees.map((e, i) => [
                            `<span class="font-mono text-xs">${e.id}</span>`,
                            `<div class="font-medium">${e.name}</div><div class="text-xs text-slate-400">${e.email}</div>`,
                            e.role,
                            e.mobile,
                            `₹${e.salary.toLocaleString()}`,
                            `<div class="w-full bg-slate-100 rounded-full h-2.5 mt-2"><div class="bg-primary h-2.5 rounded-full" style="width: ${e.performance}%"></div></div>`,
                            e.status
                        ]),
                        'App.openEmployeeDetails',
                        DataStore.employees.map(e => e.id)
                    )}
                </div>
            </div>
        `;
    },

    renderAccountsModule() {
        return `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Accounts Dashboard</h2>
                    <p class="text-slate-500 text-sm">Manage cash flow, income, expenses, and ledger.</p>
                </div>
                <button onclick="App.showAddEntryModal()" class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-md flex items-center gap-2">
                    <i class="fa-solid fa-plus"></i> Record Entry
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                ${UI.renderDashboardCard('Total Income', '₹' + (DataStore.transactions.filter(t=>t.type==='Credit').reduce((a,b)=>a+b.amount,0)).toLocaleString(), 'fa-arrow-trend-up', 'bg-emerald-500', '+12%')}
                ${UI.renderDashboardCard('Total Expense', '₹' + (DataStore.transactions.filter(t=>t.type==='Debit').reduce((a,b)=>a+b.amount,0)).toLocaleString(), 'fa-arrow-trend-down', 'bg-red-500', '-3%')}
                ${UI.renderDashboardCard('Net Profit', '₹' + (DataStore.transactions.filter(t=>t.type==='Credit').reduce((a,b)=>a+b.amount,0) - DataStore.transactions.filter(t=>t.type==='Debit').reduce((a,b)=>a+b.amount,0)).toLocaleString(), 'fa-vault', 'bg-blue-600', '+8%')}
            </div>
            
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col mt-6">
                <div class="p-4 border-b border-slate-100 bg-slate-50 flex gap-4 items-center justify-between">
                    <span class="font-bold text-slate-800">Recent Ledger Entries</span>
                    <div class="relative w-64">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input type="text" id="txn-search-input" oninput="App.searchTxn(this.value)" placeholder="Search ledger category or mode..." class="w-full pl-8 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-primary outline-none">
                    </div>
                </div>
                <div id="txn-table-container" class="flex-1 overflow-auto custom-scrollbar">
                    ${UI.renderTable(
                        ['Txn ID', 'Date', 'Category', 'Mode', 'Type', 'Amount', 'Status'],
                        DataStore.transactions.slice(0, 15).map((t, i) => [
                            `<span class="font-mono text-xs">${t.id}</span>`,
                            t.date,
                            t.category,
                            `<span class="px-2 py-1 bg-slate-100 rounded text-xs">${t.mode}</span>`,
                            t.type === 'Credit' ? `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-arrow-down mr-1"></i>IN</span>` : `<span class="text-red-600 font-bold"><i class="fa-solid fa-arrow-up mr-1"></i>OUT</span>`,
                            `<span class="font-mono font-medium">₹${t.amount.toLocaleString()}</span>`,
                            t.status
                        ]),
                        null,
                        DataStore.transactions.slice(0, 15).map(t => t.id)
                    )}
                </div>
            </div>
        `;
    },

    renderNotificationsModule() {
        return `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Communication Center</h2>
                    <p class="text-slate-500 text-sm">WhatsApp, SMS, and Email integrations.</p>
                </div>
                <button class="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-md flex items-center gap-2">
                    <i class="fa-brands fa-whatsapp"></i> Broadcast Message
                </button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-12rem)]">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                    <div class="p-4 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center">
                        Recent Chats <span class="badge badge-success">3 New</span>
                    </div>
                    <div class="flex-1 overflow-auto custom-scrollbar">
                        ${DataStore.customers.slice(0, 8).map((c, i) => `
                            <div class="p-4 border-b border-slate-50 flex gap-3 hover:bg-slate-50 cursor-pointer ${i < 3 ? 'bg-blue-50/50' : ''}">
                                <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">${c.name.substring(0,1)}</div>
                                <div class="flex-1 overflow-hidden">
                                    <div class="flex justify-between items-start">
                                        <p class="text-sm font-bold text-slate-800 truncate">${c.name}</p>
                                        <p class="text-xs text-slate-400">10:30 AM</p>
                                    </div>
                                    <p class="text-xs text-slate-500 truncate">Sir, when is my renewal due?</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="col-span-1 lg:col-span-2 bg-slate-50 rounded-2xl shadow-inner border border-slate-200 flex flex-col overflow-hidden relative">
                    <div class="absolute inset-0 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')] opacity-5"></div>
                    <div class="p-4 bg-white border-b border-slate-200 flex items-center gap-3 relative z-10">
                        <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">${DataStore.customers[0].name.substring(0,1)}</div>
                        <div>
                            <p class="font-bold text-slate-800">${DataStore.customers[0].name}</p>
                            <p class="text-xs text-emerald-500">Online</p>
                        </div>
                    </div>
                    
                    <div class="flex-1 p-6 overflow-auto relative z-10 flex flex-col gap-4">
                        <div class="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-md self-start text-sm text-slate-700">
                            Sir, when is my renewal due?
                            <p class="text-[10px] text-slate-400 text-right mt-1">10:30 AM</p>
                        </div>
                        <div class="bg-[#dcf8c6] p-3 rounded-lg rounded-tr-none shadow-sm max-w-md self-end text-sm text-slate-700">
                            Hello ${DataStore.customers[0].name.split(' ')[0]}, your Motor policy renewal is due on 15th next month. Shall I send the payment link?
                            <p class="text-[10px] text-slate-500 text-right mt-1">10:35 AM <i class="fa-solid fa-check-double text-blue-500"></i></p>
                        </div>
                    </div>
                    
                    <div class="px-4 py-2 bg-slate-100 flex gap-2 border-t border-slate-200 relative z-10 flex-wrap">
                        <button onclick="App.autofillWhatsAppMsg('Dear Client, your policy is expiring on 15th next month. Please renew here: https://rjins.in/pay')" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium"><i class="fa-solid fa-clock-rotate-left mr-1"></i> Renewal Template</button>
                        <button onclick="App.autofillWhatsAppMsg('Dear Client, your premium payment is pending. Avoid policy lapse. Pay now: https://rjins.in/pay')" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium"><i class="fa-solid fa-bell mr-1"></i> Payment Template</button>
                        <button onclick="App.autofillWhatsAppMsg('Hello Roy, a demo slot has been confirmed for Tuesday. See you then!')" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium"><i class="fa-solid fa-calendar mr-1"></i> Tuesday Demo Template</button>
                    </div>
                    
                    <div class="p-4 bg-white relative z-10 flex gap-2">
                        <input type="text" id="whatsapp-input-msg" placeholder="Type a message..." class="flex-1 border border-slate-200 rounded-full px-4 py-2 outline-none focus:border-primary text-sm">
                        <button onclick="App.sendWhatsAppMsg()" class="w-10 h-10 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center"><i class="fa-solid fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        `;
    },

    renderReportsModule() {
        return `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Analytics & Reports</h2>
                    <p class="text-slate-500 text-sm">Generate and export business intelligence reports.</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <h3 class="font-bold text-slate-800 text-lg mb-4">Revenue Trend (YTD)</h3>
                    <div class="flex-1 relative w-full h-48">
                        <canvas id="reportRevenueChart"></canvas>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <h3 class="font-bold text-slate-800 text-lg mb-4">Claims Settlement Ratio</h3>
                    <div class="flex-1 relative w-full h-48 flex justify-center items-center">
                        <canvas id="reportClaimsChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                    <div class="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center text-xl mb-4"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                    <h3 class="font-bold text-slate-800 text-md mb-2">Financial Report</h3>
                    <button onclick="UI.showToast('Generating Financial Report PDF...', 'info'); setTimeout(()=>UI.showToast('Financial_Report_YTD.pdf downloaded successfully!', 'success'), 1500);" class="text-primary font-medium text-sm hover:underline"><i class="fa-solid fa-download mr-1"></i> Download PDF</button>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                    <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl mb-4"><i class="fa-solid fa-file-shield"></i></div>
                    <h3 class="font-bold text-slate-800 text-md mb-2">Policy Renewal Report</h3>
                    <button onclick="UI.showToast('Exporting Policy Renewal Report to Excel...', 'info'); setTimeout(()=>UI.showToast('Policy_Renewal_Report_2026.xlsx exported successfully!', 'success'), 1500);" class="text-emerald-600 font-medium text-sm hover:underline"><i class="fa-solid fa-file-excel mr-1"></i> Export Excel</button>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                    <div class="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-xl mb-4"><i class="fa-solid fa-truck-medical"></i></div>
                    <h3 class="font-bold text-slate-800 text-md mb-2">Claims Status Report</h3>
                    <button onclick="UI.showToast('Generating Claims Status Report...', 'info'); setTimeout(()=>UI.showToast('Claims_Status_YTD.pdf downloaded successfully!', 'success'), 1500);" class="text-red-600 font-medium text-sm hover:underline"><i class="fa-solid fa-download mr-1"></i> Download PDF</button>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                    <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl mb-4"><i class="fa-solid fa-user-tie"></i></div>
                    <h3 class="font-bold text-slate-800 text-md mb-2">Employee Performance</h3>
                    <button onclick="UI.showToast('Exporting Employee Performance metrics...', 'info'); setTimeout(()=>UI.showToast('Employee_Performance_Metrics.xlsx exported successfully!', 'success'), 1500);" class="text-purple-600 font-medium text-sm hover:underline"><i class="fa-solid fa-file-excel mr-1"></i> Export Excel</button>
                </div>
            </div>
        `;
    },

    renderStorageModule() {
        return `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Secure Document Vault</h2>
                    <p class="text-slate-500 text-sm">Cloud storage for KYC, policies, and claims documents.</p>
                </div>
                <button onclick="App.showUploadDocModal()" class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-md flex items-center gap-2">
                    <i class="fa-solid fa-cloud-arrow-up"></i> Upload Document
                </button>
            </div>
            
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 flex flex-col">
                <div class="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
                    <div class="relative flex-1 max-w-md">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input type="text" placeholder="Search documents..." class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    </div>
                </div>
                <div class="overflow-auto custom-scrollbar p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    ${[1,2,3,4,5,6,7,8].map(i => `
                        <div class="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md hover:border-primary cursor-pointer transition group">
                            <i class="fa-solid fa-file-pdf text-red-500 text-5xl mb-3 group-hover:scale-110 transition-transform"></i>
                            <p class="text-sm font-bold text-slate-800 truncate w-full">KYC_Document_00${i}.pdf</p>
                            <p class="text-xs text-slate-400 mt-1">1.${i} MB • 2 days ago</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Backup & Data Security Panel -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl"><i class="fa-solid fa-shield-halved"></i></div>
                    <div>
                        <h3 class="font-bold text-slate-800 text-md">Backup & Data Security Status</h3>
                        <p class="text-xs text-slate-500">Local and cloud backup systems are fully active and synchronized.</p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-4 text-xs font-semibold">
                    <span class="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full flex items-center gap-1.5"><i class="fa-solid fa-circle-check"></i> AES-256 Encrypted</span>
                    <span class="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-1.5"><i class="fa-solid fa-cloud-arrow-up"></i> Cloud Sync Active</span>
                    <span class="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full flex items-center gap-1.5"><i class="fa-solid fa-clock-rotate-left"></i> Daily Backup Done</span>
                </div>
            </div>
        `;
    },

    // --- INTERACTIVE ACTIONS & MODALS --- //
    
    initDashboardCharts() {
        const revCtx = document.getElementById('revenueChart');
        const portCtx = document.getElementById('portfolioChart');
        if(!revCtx || !portCtx) return;

        this.charts.push(new Chart(revCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [120000, 190000, 150000, 220000, 280000, 310000],
                    borderColor: '#1D4ED8',
                    backgroundColor: 'rgba(29, 78, 216, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        }));

        this.charts.push(new Chart(portCtx, {
            type: 'doughnut',
            data: {
                labels: ['Motor', 'Health', 'Life', 'Home'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#1D4ED8', '#0F766E', '#10B981', '#F59E0B'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
        }));
    },

    initReportCharts() {
        const revCtx = document.getElementById('reportRevenueChart');
        const claimsCtx = document.getElementById('reportClaimsChart');
        if(!revCtx || !claimsCtx) return;

        this.charts.push(new Chart(revCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Income (₹)',
                    data: [150000, 210000, 180000, 240000, 300000, 330000],
                    backgroundColor: '#10B981',
                    borderRadius: 4
                }, {
                    label: 'Expenses (₹)',
                    data: [80000, 95000, 85000, 110000, 105000, 120000],
                    backgroundColor: '#EF4444',
                    borderRadius: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        }));

        this.charts.push(new Chart(claimsCtx, {
            type: 'pie',
            data: {
                labels: ['Settled', 'Rejected', 'Under Review'],
                datasets: [{
                    data: [65, 10, 25],
                    backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        }));
    },

    showAddEntryModal() {
        const content = `
            <form class="space-y-4" onsubmit="event.preventDefault(); UI.closeModal('add-entry'); UI.showToast('Ledger entry recorded successfully!'); App.switchModule(App.currentModule);">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Entry Type</label>
                        <select required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="Credit">Credit (Income)</option>
                            <option value="Debit">Debit (Expense)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                        <input type="number" required min="1" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="Premium Collection">Premium Collection</option>
                            <option value="Commission">Commission</option>
                            <option value="Salary">Salary</option>
                            <option value="Office Expense">Office Expense</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                        <select required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="UPI">UPI</option>
                            <option value="Cash">Cash</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Remarks / Reference Number</label>
                        <input type="text" placeholder="e.g. UPI Ref: 123456789" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                </div>
                <button type="submit" class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition mt-4">Save Entry</button>
            </form>
        `;
        UI.createModal('add-entry', 'New Ledger Entry', content);
        UI.openModal('add-entry');
    },

    showAddEmployeeModal() {
        const content = `
            <form class="space-y-4" onsubmit="event.preventDefault(); UI.closeModal('add-employee'); UI.showToast('Employee added successfully!'); App.switchModule('hr');">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
                        <input type="tel" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="Admin">Admin</option>
                            <option value="CRM Executive">CRM Executive</option>
                            <option value="Agent">Agent</option>
                            <option value="Claims Manager">Claims Manager</option>
                            <option value="Accountant">Accountant</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Base Salary (₹)</label>
                        <input type="number" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                </div>
                <button type="submit" class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition mt-4">Add Employee</button>
            </form>
        `;
        UI.createModal('add-employee', 'Add New Employee', content);
        UI.openModal('add-employee');
    },

    showAddCustomerModal() {
        const agents = DataStore.employees.filter(e => e.role === 'Agent' || e.role === 'CRM Executive');
        const agentOptions = agents.map(a => `<option value="${a.name}">${a.name} (${a.role})</option>`).join('');
        
        const content = `
            <form class="space-y-4" onsubmit="event.preventDefault(); UI.closeModal('add-customer'); UI.showToast('Customer created successfully!'); App.switchModule('crm');">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
                        <input type="tel" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                        <input type="text" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none uppercase">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Assign Agent / Executive</label>
                        <select required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="">-- Select Agent --</option>
                            ${agentOptions}
                        </select>
                    </div>
                </div>
                <button type="submit" class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition mt-4">Save Customer</button>
            </form>
        `;
        UI.createModal('add-customer', 'Register New Customer', content);
        UI.openModal('add-customer');
    },

    openCustomerDetails(idOrIndex) {
        const cust = (typeof idOrIndex === 'string' || isNaN(idOrIndex))
            ? DataStore.customers.find(c => c.id == idOrIndex)
            : DataStore.customers[idOrIndex];
        const index = DataStore.customers.indexOf(cust);
        const content = `
            <div class="flex items-start gap-6">
                <div class="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold">
                    ${cust.name.substring(0,2).toUpperCase()}
                </div>
                <div class="flex-1">
                    <h2 class="text-2xl font-bold text-slate-800">${cust.name}</h2>
                    <div class="flex gap-4 mt-2 text-sm text-slate-600">
                        <span class="flex items-center gap-1"><i class="fa-solid fa-phone"></i> ${cust.mobile}</span>
                        <span class="flex items-center gap-1"><i class="fa-solid fa-envelope"></i> ${cust.email}</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p class="text-xs text-slate-500 uppercase font-bold">PAN</p>
                            <p class="font-mono text-sm">${cust.pan}</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p class="text-xs text-slate-500 uppercase font-bold">DOB</p>
                            <p class="font-medium text-sm">${cust.dob}</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p class="text-xs text-slate-500 uppercase font-bold">Agent</p>
                            <p class="font-medium text-sm">${cust.agentAssigned}</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p class="text-xs text-slate-500 uppercase font-bold mb-1">Status</p>
                            <select onchange="App.updateCustomerStatus(${index}, this.value)" class="w-full text-xs border border-slate-200 rounded px-2 py-1 outline-none focus:border-primary font-medium text-slate-700">
                                <option value="Active" ${cust.status === 'Active' ? 'selected' : ''}>Active</option>
                                <option value="Inactive" ${cust.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                <option value="Lead" ${cust.status === 'Lead' ? 'selected' : ''}>Lead</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-between items-end mt-8 mb-4 border-b pb-2">
                <h4 class="font-bold text-slate-800">Communication History</h4>
            </div>
            
            <form onsubmit="event.preventDefault(); App.addCommunicationHistory(${index});" class="mb-8 flex gap-2">
                <select id="new-comm-type" class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none bg-slate-50 font-medium">
                    <option value="phone">Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="envelope">Email</option>
                    <option value="note-sticky">Note</option>
                </select>
                <input type="text" id="new-comm-text" required placeholder="Log a call, message, or note..." class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                <button type="submit" class="bg-primary text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-800 transition shadow-sm"><i class="fa-solid fa-plus mr-1"></i> Log</button>
            </form>

            <div id="customer-history-container" class="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent pl-8 md:pl-0">
                ${cust.history.map(h => `
                <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active fade-in-up">
                    <div class="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 text-slate-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute left-0 md:left-1/2 -translate-x-1/2">
                        <i class="fa-${h.type === 'whatsapp' ? 'brands fa-whatsapp text-emerald-500' : `solid fa-${h.type} text-primary`}"></i>
                    </div>
                    <div class="w-full md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow-sm border border-slate-100 md:group-odd:text-right hover:shadow-md transition">
                        <div class="text-xs text-slate-400 mb-1">${h.time}</div>
                        <p class="text-sm font-medium text-slate-700">${h.text}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        `;
        
        const actions = `
            <button onclick="UI.showToast('Profile details updated successfully!'); UI.closeModal('view-customer'); App.switchModule('crm');" class="border border-slate-200 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50"><i class="fa-solid fa-pen mr-2"></i>Edit Profile</button>
            <button onclick="App.actionWhatsApp('${cust.name}')" class="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600"><i class="fa-brands fa-whatsapp mr-2"></i>WhatsApp</button>
            <button onclick="UI.closeModal('view-customer'); App.switchModule('policy');" class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"><i class="fa-solid fa-file-contract mr-2"></i>View Policies</button>
        `;
        
        UI.createModal('view-customer', 'Customer Profile 360°', content, actions);
        UI.openModal('view-customer');
    },

    updateCustomerStatus(index, newStatus) {
        DataStore.customers[index].status = newStatus;
        UI.showToast(`Customer status updated to ${newStatus}`);
        
        if (App.currentModule === 'crm') {
            App.switchCrmTab('customers');
        }
        App.openCustomerDetails(index);
    },

    addCommunicationHistory(index) {
        const type = document.getElementById('new-comm-type').value;
        const text = document.getElementById('new-comm-text').value;
        const now = new Date();
        const timeStr = `Today, ${now.getHours() > 12 ? now.getHours() - 12 : now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
        
        // Add to front of history
        DataStore.customers[index].history.unshift({
            type, text, time: timeStr
        });
        
        UI.showToast('Communication logged successfully');
        // Refresh modal to show new entry
        this.openCustomerDetails(index);
    },

    openPolicyDetails(idOrIndex) {
        const p = (typeof idOrIndex === 'string' || isNaN(idOrIndex))
            ? DataStore.policies.find(pol => pol.id == idOrIndex)
            : DataStore.policies[idOrIndex];
        const index = DataStore.policies.indexOf(p);
        const content = `
            <div class="bg-slate-50 rounded-xl p-6 border border-slate-100 relative overflow-hidden">
                <i class="fa-solid fa-shield absolute -right-4 -bottom-4 text-9xl text-slate-200 opacity-50"></i>
                <div class="relative z-10">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-3xl font-bold text-slate-800 mb-1">${p.company}</h2>
                            <p class="text-primary font-mono font-bold">${p.id}</p>
                        </div>
                        <span class="badge ${UI.getBadgeClass(p.status)} text-sm px-3 py-1">${p.status}</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-6 mt-8">
                        <div>
                            <p class="text-sm text-slate-500 mb-1">Insured Name</p>
                            <p class="font-bold text-lg">${p.customerName}</p>
                        </div>
                        <div>
                            <p class="text-sm text-slate-500 mb-1">Policy Type</p>
                            <p class="font-bold text-lg">${p.type} Insurance</p>
                        </div>
                        <div>
                            <p class="text-sm text-slate-500 mb-1">Validity</p>
                            <p class="font-medium">${p.startDate} to <span class="${new Date(p.expiryDate) < new Date() ? 'text-red-500' : 'text-slate-800'}">${p.expiryDate}</span></p>
                        </div>
                        <div>
                            <p class="text-sm text-slate-500 mb-1">Premium Amount</p>
                            <p class="font-bold text-xl text-emerald-600">₹${p.premium.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 border border-slate-100 rounded-xl overflow-hidden">
                <div class="bg-slate-50 px-4 py-3 border-b border-slate-100 font-bold text-slate-700 text-sm">Policy Documents</div>
                <div class="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
                    <div class="flex items-center gap-3">
                        <i class="fa-solid fa-file-pdf text-red-500 text-2xl"></i>
                        <div>
                            <p class="text-sm font-medium text-slate-800">Policy_Schedule_${p.id}.pdf</p>
                            <p class="text-xs text-slate-400">1.2 MB</p>
                        </div>
                    </div>
                    <button class="text-primary hover:text-blue-800"><i class="fa-solid fa-download"></i></button>
                </div>
            </div>
        `;
        
        const actions = `
            <button onclick="UI.showToast('Policy details updated successfully!'); UI.closeModal('view-policy');" class="border border-slate-200 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50"><i class="fa-solid fa-pen mr-2"></i>Edit</button>
            ${p.status === 'Active' ? `<button onclick="App.renewPolicy(${index})" class="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600"><i class="fa-solid fa-rotate mr-2"></i>Renew Policy</button>` : ''}
        `;

        UI.createModal('view-policy', 'Policy Overview', content, actions);
        UI.openModal('view-policy');
    },

    openClaimDetails(idOrIndex) {
        const c = (typeof idOrIndex === 'string' || isNaN(idOrIndex))
            ? DataStore.claims.find(cl => cl.id == idOrIndex)
            : DataStore.claims[idOrIndex];
        const index = DataStore.claims.indexOf(c);
        const content = `
            <div class="p-4 bg-red-50 rounded-lg border border-red-100 mb-6 flex justify-between items-center">
                <div>
                    <p class="text-xs text-red-600 font-bold uppercase mb-1">Claim Status</p>
                    <p class="text-lg font-bold text-red-900">${c.status}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-red-600 font-bold uppercase mb-1">Claim Amount</p>
                    <p class="text-2xl font-black text-red-600">₹${c.amount.toLocaleString()}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 text-sm">
                <div>
                    <span class="text-slate-500 block mb-1">Claim ID</span>
                    <span class="font-mono font-medium">${c.id}</span>
                </div>
                <div>
                    <span class="text-slate-500 block mb-1">Policy ID</span>
                    <span class="font-mono font-medium">${c.policyId}</span>
                </div>
                <div>
                    <span class="text-slate-500 block mb-1">Customer Name</span>
                    <span class="font-medium">${c.customerName}</span>
                </div>
                <div>
                    <span class="text-slate-500 block mb-1">Incident Date</span>
                    <span class="font-medium">${c.date}</span>
                </div>
            </div>
            
            <h4 class="font-bold text-slate-800 mb-4 border-b pb-2">Claim Timeline Workflow</h4>
            <div class="relative pl-6 border-l-2 border-slate-200 space-y-8 mt-4">
                <!-- Step 1 -->
                <div class="relative">
                    <div class="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm"></div>
                    <div>
                        <p class="text-sm font-bold text-slate-800">Claim Registered</p>
                        <p class="text-xs text-slate-500">Incident reported on ${c.date}</p>
                    </div>
                </div>
                
                <!-- Step 2 -->
                <div class="relative">
                    <div class="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full ${c.status === 'Under Review' ? 'bg-primary animate-pulse border-4 border-white shadow-sm' : (['Document Verification', 'Approved', 'Settlement Completed'].includes(c.status) ? 'bg-emerald-500 border-4 border-white shadow-sm' : 'bg-slate-300 border-4 border-white shadow-sm')}"></div>
                    <div>
                        <p class="text-sm font-bold text-slate-800">Surveyor Assessment & Document Verification</p>
                        <p class="text-xs text-slate-500">${c.status === 'Under Review' ? 'Awaiting surveyor report' : 'Documents verified & approved'}</p>
                    </div>
                </div>
                
                <!-- Step 3 -->
                <div class="relative">
                    <div class="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full ${c.status === 'Document Verification' ? 'bg-primary animate-pulse border-4 border-white shadow-sm' : (['Approved', 'Settlement Completed'].includes(c.status) ? 'bg-emerald-500 border-4 border-white shadow-sm' : (c.status === 'Rejected' ? 'bg-red-500 border-4 border-white shadow-sm' : 'bg-slate-300 border-4 border-white shadow-sm'))}"></div>
                    <div>
                        <p class="text-sm font-bold text-slate-800">Underwriting Approval</p>
                        <p class="text-xs text-slate-500">${c.status === 'Rejected' ? 'Claim rejected by underwriting' : (['Approved', 'Settlement Completed'].includes(c.status) ? 'Claim approved' : 'Approval pending')}</p>
                    </div>
                </div>

                <!-- Step 4 -->
                <div class="relative">
                    <div class="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full ${c.status === 'Approved' ? 'bg-primary animate-pulse border-4 border-white shadow-sm' : (c.status === 'Settlement Completed' ? 'bg-emerald-500 border-4 border-white shadow-sm' : 'bg-slate-300 border-4 border-white shadow-sm')}"></div>
                    <div>
                        <p class="text-sm font-bold text-slate-800">Fund Settlement</p>
                        <p class="text-xs text-slate-500">${c.status === 'Settlement Completed' ? 'Funds disbursed to bank account' : 'Settlement pending'}</p>
                    </div>
                </div>
            </div>
        `;
        
        const actions = `
            <button onclick="App.showUpdateClaimStatusModal(${index})" class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">Update Status</button>
        `;
        
        UI.createModal('view-claim', 'Claim Details Tracker', content, actions);
        UI.openModal('view-claim');
    },

    openEmployeeDetails(idOrIndex) {
        const e = (typeof idOrIndex === 'string' || isNaN(idOrIndex))
            ? DataStore.employees.find(emp => emp.id == idOrIndex || emp.name == idOrIndex)
            : DataStore.employees[idOrIndex];
        const index = DataStore.employees.indexOf(e);
        const content = `
            <div class="text-center mb-6">
                <div class="w-20 h-20 bg-primary text-white rounded-full mx-auto flex items-center justify-center text-3xl font-bold shadow-lg mb-3">
                    ${e.name.substring(0,1)}
                </div>
                <h2 class="text-2xl font-bold text-slate-800">${e.name}</h2>
                <p class="text-primary font-medium">${e.role}</p>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <p class="text-xs text-slate-500 font-bold uppercase mb-1">Monthly Target</p>
                    <div class="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center mx-auto mt-2">
                        <span class="font-bold text-slate-800 text-sm">${e.performance}%</span>
                    </div>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center flex flex-col justify-center">
                    <p class="text-xs text-slate-500 font-bold uppercase mb-1">Attendance</p>
                    <p class="text-lg font-bold text-slate-800 mt-2">22 / 24 Days</p>
                    <p class="text-xs text-slate-400">91.6% Present</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center flex flex-col justify-center col-span-2 sm:col-span-1">
                    <p class="text-xs text-slate-500 font-bold uppercase mb-1">Base Salary</p>
                    <p class="text-lg font-bold text-slate-800 mt-1">₹${e.salary.toLocaleString()}</p>
                    <p class="text-[10px] text-emerald-600 mt-0.5">+ ₹${Math.floor(e.salary * 0.15).toLocaleString()} Incentive</p>
                </div>
            </div>
        `;
        
        UI.createModal('view-employee', 'Employee Dashboard', content);
        UI.openModal('view-employee');
    },

    actionWhatsApp(name) {
        UI.showToast(`Opening WhatsApp Web for ${name}...`, 'success');
    },

    openLeadDetails(idOrIndex) {
        const lead = (typeof idOrIndex === 'string' || isNaN(idOrIndex))
            ? DataStore.leads.find(l => l.id == idOrIndex)
            : DataStore.leads[idOrIndex];
        const index = DataStore.leads.indexOf(lead);
        const content = `
            <div class="space-y-4">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                        ${lead.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">${lead.name}</h3>
                        <p class="text-sm text-slate-500">Lead ID: <span class="font-mono">${lead.id}</span></p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                        <p class="text-xs text-slate-400 uppercase font-bold">Mobile</p>
                        <p class="text-sm font-medium text-slate-700">${lead.mobile}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-400 uppercase font-bold">Insurance Type</p>
                        <p class="text-sm font-medium text-slate-700">${lead.insuranceType}</p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-400 uppercase font-bold">Current Stage</p>
                        <select onchange="App.updateLeadStage(${index}, this.value)" class="text-sm border border-slate-200 rounded px-2 py-1 focus:border-primary outline-none bg-white font-medium text-slate-700">
                            <option value="New Lead" ${lead.stage === 'New Lead' ? 'selected' : ''}>New Lead</option>
                            <option value="Contacted" ${lead.stage === 'Contacted' ? 'selected' : ''}>Contacted</option>
                            <option value="Follow-Up" ${lead.stage === 'Follow-Up' ? 'selected' : ''}>Follow-Up</option>
                            <option value="Quote Shared" ${lead.stage === 'Quote Shared' ? 'selected' : ''}>Quote Shared</option>
                            <option value="Interested" ${lead.stage === 'Interested' ? 'selected' : ''}>Interested</option>
                            <option value="Negotiation" ${lead.stage === 'Negotiation' ? 'selected' : ''}>Negotiation</option>
                        </select>
                    </div>
                    <div>
                        <p class="text-xs text-slate-400 uppercase font-bold">Assigned Owner</p>
                        <p class="text-sm font-medium text-slate-700">${lead.assignedTo}</p>
                    </div>
                    ${lead.demoScheduled ? `
                    <div class="col-span-2 bg-purple-50 p-3 rounded-lg border border-purple-100 flex items-center justify-between">
                        <div>
                            <p class="text-xs text-purple-700 font-bold uppercase"><i class="fa-solid fa-calendar-check mr-1"></i> Demo Scheduled</p>
                            <p class="text-sm font-medium text-purple-900 mt-0.5">${lead.demoScheduled}</p>
                        </div>
                        <span class="text-[10px] bg-purple-200 text-purple-800 font-bold px-2 py-0.5 rounded uppercase">Upcoming</span>
                    </div>
                    ` : ''}
                    ${lead.requirementSummary ? `
                    <div class="col-span-2">
                        <p class="text-xs text-slate-400 uppercase font-bold">Requirement Summary</p>
                        <p class="text-sm text-slate-600 mt-1">${lead.requirementSummary}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        const actions = `
            <button onclick="App.actionWhatsApp('${lead.name}')" class="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600"><i class="fa-brands fa-whatsapp mr-2"></i>Send WhatsApp Demo link</button>
            <button onclick="UI.showToast('Lead converted to Customer successfully!'); UI.closeModal('view-lead');" class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"><i class="fa-solid fa-check mr-1"></i> Convert to Customer</button>
        `;
        
        UI.createModal('view-lead', 'Lead Information & Tracking', content, actions);
        UI.openModal('view-lead');
    },

    updateLeadStage(index, newStage) {
        DataStore.leads[index].stage = newStage;
        UI.showToast(`Lead stage updated to ${newStage}`);
        if (App.currentModule === 'crm') {
            App.switchCrmTab('leads');
        }
        App.openLeadDetails(index);
    },

    showAddLeadModal() {
        const content = `
            <form class="space-y-4" onsubmit="event.preventDefault(); UI.closeModal('add-lead'); UI.showToast('New lead added successfully!'); App.switchCrmTab('leads');">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Lead Name</label>
                        <input type="text" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
                        <input type="tel" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Insurance Requirement</label>
                        <select class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="Motor">Motor Insurance</option>
                            <option value="Health">Health Insurance</option>
                            <option value="Life">Life Insurance</option>
                            <option value="Home">Home Insurance</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Assigned Executive</label>
                        <input type="text" value="CRM Executive 1" disabled class="w-full border border-slate-200 bg-slate-100 rounded-lg px-3 py-2 text-sm outline-none">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Demo Date/Schedule (Optional)</label>
                        <input type="text" placeholder="e.g. Tuesday" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                </div>
                <button type="submit" class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition mt-4">Save Lead</button>
            </form>
        `;
        UI.createModal('add-lead', 'Create New Lead / Enquiry', content);
        UI.openModal('add-lead');
    },

    showRegisterClaimModal() {
        const content = `
            <form class="space-y-4" onsubmit="event.preventDefault(); UI.closeModal('register-claim'); UI.showToast('Claim registered successfully!'); App.switchModule('claims');">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Policy ID</label>
                        <input type="text" required placeholder="e.g. POL-100234" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Claimant Name</label>
                        <input type="text" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Estimated Claim Amount (₹)</label>
                        <input type="number" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Loss Category</label>
                        <select class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="Accident">Accident</option>
                            <option value="Theft">Theft</option>
                            <option value="Medical Admission">Medical Admission</option>
                            <option value="Property Damage">Property Damage</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Supporting Claim Documents (KYC/FIR/Bills)</label>
                        <input type="file" class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200">
                    </div>
                </div>
                <button type="submit" class="w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition mt-4">Submit Registration</button>
            </form>
        `;
        UI.createModal('register-claim', 'Register New Claim Process', content);
        UI.openModal('register-claim');
    },

    showUpdateClaimStatusModal(index) {
        const c = DataStore.claims[index];
        const content = `
            <form class="space-y-4" onsubmit="event.preventDefault(); App.updateClaimStatus(${index}, document.getElementById('update-claim-status-val').value);">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Set Status</label>
                    <select id="update-claim-status-val" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                        <option value="Under Review" ${c.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                        <option value="Document Verification" ${c.status === 'Document Verification' ? 'selected' : ''}>Document Verification</option>
                        <option value="Approved" ${c.status === 'Approved' ? 'selected' : ''}>Approved</option>
                        <option value="Rejected" ${c.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        <option value="Settlement Completed" ${c.status === 'Settlement Completed' ? 'selected' : ''}>Settlement Completed</option>
                    </select>
                </div>
                <button type="submit" class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition">Update Workflow</button>
            </form>
        `;
        UI.createModal('update-claim', 'Update Claim Workflow Status', content);
        UI.openModal('update-claim');
    },

    updateClaimStatus(index, newStatus) {
        DataStore.claims[index].status = newStatus;
        UI.closeModal('update-claim');
        UI.showToast(`Claim status changed to ${newStatus}`);
        
        if (App.currentModule === 'claims') {
            const container = document.getElementById('main-container');
            container.innerHTML = `<div class="module-enter h-full flex flex-col">${App.renderClaimsModule()}</div>`;
        }
        App.openClaimDetails(index);
    },

    showFundTransferModal() {
        const content = `
            <form class="space-y-4" onsubmit="event.preventDefault(); UI.closeModal('fund-transfer'); UI.showToast('Fund transfer recorded successfully!'); App.switchModule('payments');">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">From Bank / Source</label>
                        <select required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="HDFC Bank Current A/c">HDFC Bank Current A/c</option>
                            <option value="SBI Operating A/c">SBI Operating A/c</option>
                            <option value="ICICI Reserves">ICICI Reserves</option>
                            <option value="Cash Vault">Cash Vault</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">To Account / Destination</label>
                        <select required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="SBI Operating A/c">SBI Operating A/c</option>
                            <option value="HDFC Bank Current A/c">HDFC Bank Current A/c</option>
                            <option value="ICICI Reserves">ICICI Reserves</option>
                            <option value="Vendor / Partner Account">Vendor / Partner Account</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Transfer Amount (₹)</label>
                        <input type="number" required min="1" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Remarks / Transaction Ref</label>
                        <input type="text" placeholder="e.g. NEFT Reference, IMPS No" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                </div>
                <button type="submit" class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition mt-4">Initiate Transfer</button>
            </form>
        `;
        UI.createModal('fund-transfer', 'Inter-Bank Fund Transfer', content);
        UI.openModal('fund-transfer');
    },

    showUploadDocModal() {
        const content = `
            <form class="space-y-4" onsubmit="event.preventDefault(); UI.closeModal('upload-doc'); UI.showToast('Document uploaded and encrypted successfully!'); App.switchModule('storage');">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Select File</label>
                    <input type="file" required class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Document Category</label>
                    <select required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                        <option value="KYC">KYC Document</option>
                        <option value="Policy">Policy Copy</option>
                        <option value="Claim">Claim Supporting Bill / Photo</option>
                        <option value="Internal">Internal HR / Account Document</option>
                    </select>
                </div>
                <button type="submit" class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition">Upload to Secure Cloud</button>
            </form>
        `;
        UI.createModal('upload-doc', 'Secure Document Upload', content);
        UI.openModal('upload-doc');
    },

    searchCrm(query) {
        const q = query.toLowerCase();
        const container = document.getElementById('crm-table-container');
        if(!container) return;
        
        if (this.crmTab === 'customers') {
            const filtered = DataStore.customers.filter(c => 
                c.name.toLowerCase().includes(q) || 
                c.mobile.includes(q) || 
                c.email.toLowerCase().includes(q)
            );
            container.innerHTML = UI.renderTable(
                ['ID', 'Name', 'Mobile', 'Email', 'Agent Assigned', 'Policies', 'Status'],
                filtered.map((c, i) => [
                    `<span class="font-mono text-xs text-slate-500">${c.id}</span>`,
                    `<div class="font-medium text-slate-800">${c.name}</div>`,
                    c.mobile,
                    `<span class="text-slate-500 text-xs">${c.email}</span>`,
                    c.agentAssigned,
                    `<span class="bg-slate-100 px-2 py-1 rounded text-xs font-bold">${c.totalPolicies}</span>`,
                    c.status
                ]),
                'App.openCustomerDetails',
                filtered.map(c => c.id)
            );
        } else {
            const filtered = DataStore.leads.filter(l => 
                l.name.toLowerCase().includes(q) || 
                l.mobile.includes(q) || 
                l.insuranceType.toLowerCase().includes(q) ||
                l.stage.toLowerCase().includes(q)
            );
            container.innerHTML = UI.renderTable(
                ['Lead ID', 'Name', 'Mobile', 'Type', 'Stage', 'Owner', 'Demo Scheduled', 'Date'],
                filtered.map((l, i) => [
                    `<span class="font-mono text-xs text-slate-500">${l.id}</span>`,
                    `<div class="font-medium text-slate-800">${l.name}</div>`,
                    l.mobile,
                    l.insuranceType,
                    `<span class="px-2 py-0.5 rounded text-xs font-bold ${l.stage === 'Interested' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}">${l.stage}</span>`,
                    l.assignedTo,
                    l.demoScheduled ? `<span class="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-bold"><i class="fa-solid fa-calendar-day mr-1"></i>${l.demoScheduled}</span>` : 'None',
                    l.date
                ]),
                'App.openLeadDetails',
                filtered.map(l => l.id)
            );
        }
    },

    searchPolicies(query) {
        const q = query.toLowerCase();
        const container = document.getElementById('policy-table-container');
        if(!container) return;
        
        const filtered = DataStore.policies.filter(p => 
            p.id.toLowerCase().includes(q) || 
            p.company.toLowerCase().includes(q) || 
            p.customerName.toLowerCase().includes(q) ||
            p.type.toLowerCase().includes(q)
        );
        container.innerHTML = UI.renderTable(
            ['Policy No', 'Company', 'Customer', 'Type', 'Premium', 'Expiry', 'Status'],
            filtered.map((p, i) => [
                `<span class="font-mono text-xs text-primary font-bold cursor-pointer hover:underline">${p.id}</span>`,
                `<div class="flex items-center gap-2"><div class="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs"><i class="fa-solid fa-building"></i></div> <span class="text-sm font-medium">${p.company}</span></div>`,
                p.customerName,
                p.type,
                `₹${p.premium.toLocaleString()}`,
                p.expiryDate,
                p.status
            ]),
            'App.openPolicyDetails',
            filtered.map(p => p.id)
        );
    },

    searchClaims(query) {
        const q = query.toLowerCase();
        const container = document.getElementById('claims-table-container');
        if(!container) return;
        
        const filtered = DataStore.claims.filter(c => 
            c.id.toLowerCase().includes(q) || 
            c.customerName.toLowerCase().includes(q) || 
            c.status.toLowerCase().includes(q) ||
            c.policyId.toLowerCase().includes(q)
        );
        container.innerHTML = UI.renderTable(
            ['Claim ID', 'Policy ID', 'Customer', 'Type', 'Date', 'Amount', 'Status'],
            filtered.map((c, i) => [
                `<span class="font-mono text-xs font-bold">${c.id}</span>`,
                `<span class="font-mono text-xs text-slate-500">${c.policyId}</span>`,
                c.customerName,
                c.type,
                c.date,
                `₹${c.amount.toLocaleString()}`,
                c.status
            ]),
            'App.openClaimDetails',
            filtered.map(c => c.id)
        );
    },

    searchHr(query) {
        const q = query.toLowerCase();
        const container = document.getElementById('hr-table-container');
        if(!container) return;
        
        const filtered = DataStore.employees.filter(e => 
            e.name.toLowerCase().includes(q) || 
            e.role.toLowerCase().includes(q) || 
            e.id.toLowerCase().includes(q)
        );
        container.innerHTML = UI.renderTable(
            ['EMP ID', 'Name', 'Role', 'Mobile', 'Base Salary', 'Performance', 'Status'],
            filtered.map((e, i) => [
                `<span class="font-mono text-xs">${e.id}</span>`,
                `<div class="font-medium">${e.name}</div><div class="text-xs text-slate-400">${e.email}</div>`,
                e.role,
                e.mobile,
                `₹${e.salary.toLocaleString()}`,
                `<div class="w-full bg-slate-100 rounded-full h-2.5 mt-2"><div class="bg-primary h-2.5 rounded-full" style="width: ${e.performance}%"></div></div>`,
                e.status
            ]),
            'App.openEmployeeDetails',
            filtered.map(e => e.id)
        );
    },

    searchTxn(query) {
        const q = query.toLowerCase();
        const container = document.getElementById('txn-table-container');
        if(!container) return;
        
        const filtered = DataStore.transactions.filter(t => 
            t.category.toLowerCase().includes(q) || 
            t.mode.toLowerCase().includes(q) || 
            t.id.toLowerCase().includes(q)
        );
        container.innerHTML = UI.renderTable(
            ['Txn ID', 'Date', 'Category', 'Mode', 'Type', 'Amount', 'Status'],
            filtered.slice(0, 15).map((t, i) => [
                `<span class="font-mono text-xs">${t.id}</span>`,
                t.date,
                t.category,
                `<span class="px-2 py-1 bg-slate-100 rounded text-xs">${t.mode}</span>`,
                t.type === 'Credit' ? `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-arrow-down mr-1"></i>IN</span>` : `<span class="text-red-600 font-bold"><i class="fa-solid fa-arrow-up mr-1"></i>OUT</span>`,
                `<span class="font-mono font-medium">₹${t.amount.toLocaleString()}</span>`,
                t.status
            ]),
            null,
            filtered.slice(0, 15).map(t => t.id)
        );
    },

    renewPolicy(index) {
        const p = DataStore.policies[index];
        p.status = 'Active';
        
        const expDate = new Date(p.expiryDate);
        expDate.setFullYear(expDate.getFullYear() + 1);
        p.expiryDate = expDate.toISOString().split('T')[0];
        
        UI.closeModal('view-policy');
        UI.showToast(`Policy ${p.id} successfully renewed for 1 full year!`, 'success');
        if (App.currentModule === 'policy') {
            App.switchModule('policy');
        }
    },

    showIssuePolicyModal() {
        const content = `
            <form class="space-y-4" onsubmit="event.preventDefault(); App.issuePolicy();">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                        <input type="text" id="issue-policy-cust" required placeholder="e.g. Roy" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Company / Carrier</label>
                        <select id="issue-policy-comp" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="HDFC Ergo">HDFC Ergo</option>
                            <option value="ICICI Lombard">ICICI Lombard</option>
                            <option value="Tata AIG">Tata AIG</option>
                            <option value="LIC India">LIC India</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Policy Type</label>
                        <select id="issue-policy-type" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="Motor">Motor Insurance</option>
                            <option value="Health">Health Insurance</option>
                            <option value="Life">Life Insurance</option>
                            <option value="Home">Home Insurance</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Premium (₹)</label>
                        <input type="number" id="issue-policy-prem" required min="1000" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                        <input type="date" id="issue-policy-start" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                        <input type="date" id="issue-policy-expiry" required class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                </div>
                <button type="submit" class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition mt-4">Issue Policy Copy</button>
            </form>
        `;
        UI.createModal('issue-policy-modal', 'Issue New Insurance Policy', content);
        UI.openModal('issue-policy-modal');
    },

    issuePolicy() {
        const custName = document.getElementById('issue-policy-cust').value;
        const company = document.getElementById('issue-policy-comp').value;
        const type = document.getElementById('issue-policy-type').value;
        const premium = parseFloat(document.getElementById('issue-policy-prem').value);
        const start = document.getElementById('issue-policy-start').value;
        const expiry = document.getElementById('issue-policy-expiry').value;

        const newPol = {
            id: `POL-${Math.floor(100000 + Math.random() * 900000)}`,
            company,
            customerName: custName,
            type,
            premium,
            startDate: start,
            expiryDate: expiry,
            status: 'Active'
        };

        DataStore.policies.unshift(newPol);
        UI.closeModal('issue-policy-modal');
        UI.showToast('Policy issued successfully! Secure PDF generated in background.', 'success');
        if (App.currentModule === 'policy') {
            App.switchModule('policy');
        }
    },

    autofillWhatsAppMsg(msg) {
        document.getElementById('whatsapp-input-msg').value = msg;
    },

    sendWhatsAppMsg() {
        const input = document.getElementById('whatsapp-input-msg');
        if(!input || !input.value.trim()) return;
        UI.showToast('WhatsApp Message Sent successfully!', 'success');
        input.value = '';
    }
};

// Global Exposure for HTML onclicks
window.autofillLogin = (email, pwd) => {
    document.getElementById('email').value = email;
    document.getElementById('password').value = pwd;
    // visual feedback
    const btn = document.getElementById('login-btn');
    btn.classList.add('scale-105');
    setTimeout(() => btn.classList.remove('scale-105'), 200);
};

// Boot App
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
