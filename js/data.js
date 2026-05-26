// Simulated Backend Data Generation & Storage

const DataStore = {
    customers: [],
    leads: [],
    policies: [],
    claims: [],
    employees: [],
    transactions: [],
    currentUser: null,

    init() {
        // Only generate if not exists in localStorage or for demo purposes we regenerate to ensure fresh data
        this.generateMockData();
    },

    generateMockData() {
        console.log("Generating mock data...");
        
        // Generate Employees
        const roles = ['Admin', 'CRM Executive', 'Agent', 'Claims Manager', 'Accountant'];
        for(let i=1; i<=20; i++) {
            this.employees.push({
                id: `EMP-${1000+i}`,
                name: `Employee ${i}`,
                role: roles[Math.floor(Math.random() * roles.length)],
                mobile: `98765${Math.floor(10000 + Math.random() * 90000)}`,
                email: `emp${i}@rjinsurance.com`,
                salary: 25000 + Math.floor(Math.random() * 50000),
                performance: Math.floor(Math.random() * 100),
                status: Math.random() > 0.1 ? 'Active' : 'On Leave'
            });
        }

        // Generate Customers
        const firstNames = ['Rajesh', 'Amit', 'Priya', 'Sneha', 'Vikram', 'Anjali', 'Rahul', 'Kavita', 'Suresh', 'Neha', 'Arun', 'Pooja', 'Deepak', 'Swati', 'Manoj'];
        const lastNames = ['Kumar', 'Sharma', 'Singh', 'Patel', 'Gupta', 'Verma', 'Reddy', 'Desai', 'Jain', 'Mehta'];
        
        for(let i=1; i<=500; i++) {
            const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
            this.customers.push({
                id: `CUST-${10000+i}`,
                name: `${fname} ${lname}`,
                mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
                email: `${fname.toLowerCase()}.${lname.toLowerCase()}@example.com`,
                dob: `19${Math.floor(50 + Math.random() * 40)}-0${Math.floor(1+Math.random()*9)}-1${Math.floor(1+Math.random()*8)}`,
                pan: `ABCDE${Math.floor(1000+Math.random()*9000)}F`,
                agentAssigned: this.employees.filter(e => e.role === 'Agent' || e.role === 'CRM Executive')[Math.floor(Math.random() * 5)]?.name || 'Unassigned',
                status: 'Active',
                totalPolicies: Math.floor(1 + Math.random() * 4),
                history: [
                    { time: 'Today, 10:30 AM', type: 'whatsapp', text: 'Sent policy renewal reminder via WhatsApp.' }
                ]
            });
        }

        // Generate Leads
        const leadStages = ['New Lead', 'Contacted', 'Follow-Up', 'Quote Shared', 'Interested', 'Negotiation'];
        for(let i=1; i<=200; i++) {
            const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
            this.leads.push({
                id: `LD-${5000+i}`,
                name: `${fname} Lead`,
                mobile: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
                insuranceType: ['Motor', 'Health', 'Life', 'Home'][Math.floor(Math.random() * 4)],
                stage: leadStages[Math.floor(Math.random() * leadStages.length)],
                assignedTo: this.employees.filter(e => e.role === 'CRM Executive')[0]?.name || 'Unassigned',
                date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
            });
        }

        // Generate Policies
        const companies = ['HDFC Ergo', 'ICICI Lombard', 'Star Health', 'LIC', 'Bajaj Allianz', 'SBI General'];
        const types = ['Motor', 'Health', 'Life', 'Home', 'Travel', 'Commercial'];
        
        for(let i=1; i<=1000; i++) {
            const customer = this.customers[Math.floor(Math.random() * this.customers.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            const start = new Date(Date.now() - Math.random() * 31536000000); // Past year
            const end = new Date(start.getTime() + 31536000000); // +1 year
            
            // Generate some expiring soon
            if (i < 50) {
                end.setTime(Date.now() + Math.random() * 15 * 24 * 60 * 60 * 1000); // Next 15 days
            }

            this.policies.push({
                id: `POL-${100000+i}`,
                customerId: customer.id,
                customerName: customer.name,
                company: companies[Math.floor(Math.random() * companies.length)],
                type: type,
                premium: type === 'Motor' ? 15000 + Math.floor(Math.random()*20000) : (type === 'Health' ? 25000 : 50000),
                startDate: start.toISOString().split('T')[0],
                expiryDate: end.toISOString().split('T')[0],
                status: end > new Date() ? 'Active' : 'Expired',
                vehicleNo: type === 'Motor' ? `MH-12-AB-${Math.floor(1000+Math.random()*9000)}` : 'N/A'
            });
        }

        // Generate Claims
        const claimStatus = ['Under Review', 'Document Verification', 'Approved', 'Rejected', 'Settlement Completed'];
        for(let i=1; i<=150; i++) {
            const policy = this.policies[Math.floor(Math.random() * this.policies.length)];
            this.claims.push({
                id: `CLM-${20000+i}`,
                policyId: policy.id,
                customerName: policy.customerName,
                type: policy.type,
                amount: Math.floor(policy.premium * (1 + Math.random() * 5)),
                date: new Date(Date.now() - Math.random() * 5000000000).toISOString().split('T')[0],
                status: claimStatus[Math.floor(Math.random() * claimStatus.length)]
            });
        }

        // Generate Transactions
        for(let i=1; i<=300; i++) {
            this.transactions.push({
                id: `TXN-${80000+i}`,
                date: new Date(Date.now() - Math.random() * 5000000000).toISOString().split('T')[0],
                amount: 5000 + Math.floor(Math.random()*50000),
                type: Math.random() > 0.3 ? 'Credit' : 'Debit',
                category: ['Premium Collection', 'Commission', 'Salary', 'Office Expense'][Math.floor(Math.random()*4)],
                mode: ['UPI', 'Bank Transfer', 'Cash', 'Cheque'][Math.floor(Math.random()*4)],
                status: 'Completed'
            });
        }
    },

    getSummaryStats() {
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        return {
            totalCustomers: this.customers.length,
            activePolicies: this.policies.filter(p => p.status === 'Active').length,
            expiringSoon: this.policies.filter(p => {
                const exp = new Date(p.expiryDate);
                return exp > today && exp <= thirtyDaysFromNow;
            }).length,
            motorPolicies: this.policies.filter(p => p.type === 'Motor').length,
            nonMotorPolicies: this.policies.filter(p => p.type !== 'Motor').length,
            pendingClaims: this.claims.filter(p => p.status !== 'Approved' && p.status !== 'Settlement Completed' && p.status !== 'Rejected').length,
            monthlyRevenue: "₹" + (Math.floor(Math.random() * 50) + 100).toLocaleString() + ",000",
            cashReceived: "₹" + (Math.floor(Math.random() * 10) + 20).toLocaleString() + ",000"
        };
    }
};

// Initialize datastore
DataStore.init();
