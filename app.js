// Basic State Management
const state = {
    quotes: new Map(), // quoteId -> { planId, price, details }
    policies: [], // Array of policy objects
    claims: new Map(), // claimId -> status
    currentQuote: null
};

// --- Business Logic ---

const PLANS = [
    {
        id: 'basic',
        name: 'Basic Explorer',
        basePrice: 30,
        coverage: 15000,
        deductible: 500,
        features: ['Medical Emergencies', 'Lost Luggage ($500)', '24/7 Support']
    },
    {
        id: 'pro',
        name: 'Pro Voyager',
        basePrice: 60,
        coverage: 50000,
        deductible: 100,
        features: ['Medical Emergencies', 'Trip Cancellation', 'Lost Luggage ($1500)', 'Adventure Sports Cover']
    },
    {
        id: 'nomad',
        name: 'Digital Nomad',
        basePrice: 90,
        coverage: 100000,
        deductible: 0,
        features: ['Full Medical', 'Laptop/Gear Cover', 'Remote Work Disruption', 'Visa Compliant']
    }
];

// Smart Quoting Engine
function calculateQuote(destination, days, age, activities) {
    let multiplier = 1.0;

    // Age factor
    if (age > 60) multiplier += 0.5;
    if (age > 75) multiplier += 1.0;

    // Destination factor
    if (destination === 'worldwide') multiplier += 0.3;
    if (destination === 'americas') multiplier += 0.2;

    // Activity Risk Surcharges
    const highRisk = ['skiing', 'scuba', 'trekking'];
    const selectedHighRisk = activities.filter(a => highRisk.includes(a.toLowerCase()));
    multiplier += (selectedHighRisk.length * 0.2); // +20% per high risk activity

    // Base calculation
    const quoteId = 'Q-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const quoteResults = PLANS.map(plan => {
        let price = plan.basePrice * (days / 7) * multiplier; // Normalized to weekly price
        return {
            ...plan,
            finalPrice: Math.round(price * 100) / 100
        };
    });

    return {
        id: quoteId,
        details: { destination, days, age, activities },
        plans: quoteResults
    };
}

// Claims Simulation
function simulateClaim(policyId, reason) {
    const isAutoApproved = Math.random() > 0.5;
    const claimId = 'CLM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const status = isAutoApproved ? 'Auto-Approved' : 'Under Review';
    return { id: claimId, status, policyId, reason, date: new Date().toISOString() };
}

// --- UI Rendering ---

function renderPlans(quoteData = null) {
    const container = document.getElementById('plans-container');
    const visaFilter = document.getElementById('filter-visa').checked;
    const deductibleFilter = document.getElementById('filter-deductible').checked;

    container.innerHTML = '';

    const plansToShow = quoteData ? quoteData.plans : PLANS.map(p => ({...p, finalPrice: p.basePrice}));

    const filtered = plansToShow.filter(p => {
        if (visaFilter && p.coverage < 30000) return false;
        if (deductibleFilter && p.deductible > 0) return false;
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No plans match your filters.</div>';
        return;
    }

    filtered.forEach(plan => {
        const card = document.createElement('div');
        card.className = `card plan-card ${plan.id === 'pro' ? 'featured' : ''}`;

        // Button Logic
        let actionBtn = '';
        if (quoteData) {
            actionBtn = `<button class="btn btn-primary" onclick="window.purchasePolicy('${quoteData.id}', '${plan.id}')">Buy Now</button>`;
        } else {
            actionBtn = `<button class="btn btn-secondary" onclick="document.getElementById('quote-form').scrollIntoView({behavior: 'smooth'})">Get Quote to Buy</button>`;
        }

        card.innerHTML = `
            <h3>${plan.name}</h3>
            <div class="plan-price">$${plan.finalPrice}</div>
            <ul class="plan-features">
                ${plan.features.map(f => `<li>${f}</li>`).join('')}
                <li>Coverage: $${plan.coverage.toLocaleString()}</li>
                <li>Deductible: $${plan.deductible}</li>
            </ul>
            ${actionBtn}
        `;
        container.appendChild(card);
    });
}

function renderPolicies() {
    const list = document.getElementById('policies-list');
    const select = document.getElementById('claim-policy');
    list.innerHTML = '';
    select.innerHTML = '<option value="" disabled selected>Choose a policy...</option>';

    if (state.policies.length === 0) {
        list.innerHTML = '<div class="empty-state">No active policies.</div>';
        return;
    }

    state.policies.forEach(policy => {
        // Dashboard List
        const item = document.createElement('div');
        item.className = 'policy-item';
        item.innerHTML = `
            <div>
                <strong>${policy.planName}</strong><br>
                <small>${policy.id}</small>
            </div>
            <div class="badge badge-success">Active</div>
        `;
        list.appendChild(item);

        // Claim Select
        const option = document.createElement('option');
        option.value = policy.id;
        option.textContent = `${policy.planName} (${policy.id})`;
        select.appendChild(option);
    });
}

function renderClaims() {
    const list = document.getElementById('claims-list');
    list.innerHTML = '';

    state.claims.forEach(claim => {
        const item = document.createElement('div');
        item.className = 'policy-item';
        const badgeClass = claim.status === 'Auto-Approved' ? 'badge-success' : 'badge-warning';
        item.innerHTML = `
            <div>
                <strong>Claim #${claim.id}</strong><br>
                <small>${claim.reason}</small>
            </div>
            <div class="badge ${badgeClass}">${claim.status}</div>
        `;
        list.appendChild(item);
    });
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- Event Listeners ---

document.getElementById('quote-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const dest = document.getElementById('destination').value;
    const days = parseInt(document.getElementById('days').value);
    const age = parseInt(document.getElementById('age').value);
    const activities = Array.from(document.querySelectorAll('input[name="activities"]:checked')).map(cb => cb.value);

    state.currentQuote = calculateQuote(dest, days, age, activities);
    renderPlans(state.currentQuote);
    showToast('Quote calculated!');
});

document.getElementById('filter-visa').addEventListener('change', () => renderPlans(state.currentQuote));
document.getElementById('filter-deductible').addEventListener('change', () => renderPlans(state.currentQuote));

// Navigation
document.getElementById('nav-home').addEventListener('click', () => {
    document.getElementById('main-view').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('hidden');
});

document.getElementById('nav-dashboard').addEventListener('click', () => {
    document.getElementById('main-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    renderPolicies();
    renderClaims();
});

// Claims Form
document.getElementById('claim-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const policyId = document.getElementById('claim-policy').value;
    const reason = document.getElementById('claim-reason').value;

    const claim = simulateClaim(policyId, reason);
    state.claims.set(claim.id, claim);
    renderClaims();
    showToast(`Claim filed: ${claim.status}`);
    e.target.reset();
});

// --- WebMCP Tools Registration ---

async function registerTools() {
    if (!navigator.modelContext) {
        console.warn("WebMCP API not found. Tools will not be registered.");
        return;
    }

    try {
        // Tool: travel_get_quote
        navigator.modelContext.registerTool({
            name: 'travel_get_quote',
            description: 'Get a travel insurance quote based on trip details.',
            inputSchema: {
                type: 'object',
                properties: {
                    destination: { type: 'string', description: 'Region (europe, asia, americas, worldwide)' },
                    days: { type: 'number', description: 'Duration of trip in days' },
                    age: { type: 'number', description: 'Age of traveler' },
                    activities: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of activities (Skiing, Scuba, Business, Trekking)'
                    }
                },
                required: ['destination', 'days', 'age']
            },
            execute: async ({ destination, days, age, activities = [] }) => {
                // Sync UI Inputs
                const destSelect = document.getElementById('destination');
                const daysInput = document.getElementById('days');
                const ageInput = document.getElementById('age');

                // Match destination options (case-insensitive)
                const options = Array.from(destSelect.options);
                const match = options.find(o => o.value.toLowerCase() === destination.toLowerCase());
                if (match) destSelect.value = match.value;

                if (days) daysInput.value = days;
                if (age) ageInput.value = age;

                // Sync Activities Checkboxes
                const checkboxes = document.querySelectorAll('input[name="activities"]');
                checkboxes.forEach(cb => {
                    cb.checked = activities.some(a => a.toLowerCase() === cb.value.toLowerCase());
                });

                const quote = calculateQuote(destination, days, age, activities);
                state.currentQuote = quote;

                // Update UI context
                renderPlans(quote);

                // Scroll to results so user sees the change
                document.getElementById('plans-container').scrollIntoView({ behavior: 'smooth' });

                return JSON.stringify(quote);
            }
        });

        // Tool: travel_list_plans
        navigator.modelContext.registerTool({
            name: 'travel_list_plans',
            description: 'List available insurance plans, optionally filtered.',
            inputSchema: {
                type: 'object',
                properties: {
                    visa_compliant: { type: 'boolean', description: 'Filter for Visa Compliant plans (min $30k coverage)' },
                    zero_deductible: { type: 'boolean', description: 'Filter for Zero Deductible plans' }
                }
            },
            execute: async ({ visa_compliant, zero_deductible }) => {
                // Apply UI filters to sync state
                if (visa_compliant !== undefined) document.getElementById('filter-visa').checked = visa_compliant;
                if (zero_deductible !== undefined) document.getElementById('filter-deductible').checked = zero_deductible;

                // Return current plan list (based on active quote or base prices)
                const source = state.currentQuote ? state.currentQuote.plans : PLANS;
                const filtered = source.filter(p => {
                    if (visa_compliant && p.coverage < 30000) return false;
                    if (zero_deductible && p.deductible > 0) return false;
                    return true;
                });

                renderPlans(state.currentQuote);

                // Scroll to plans to show results
                document.getElementById('plans-container').scrollIntoView({ behavior: 'smooth' });

                return JSON.stringify(filtered);
            }
        });

        // Tool: travel_purchase_policy
        navigator.modelContext.registerTool({
            name: 'travel_purchase_policy',
            description: 'Purchase a policy from a generated quote.',
            inputSchema: {
                type: 'object',
                properties: {
                    quote_id: { type: 'string', description: 'ID of the quote' },
                    plan_id: { type: 'string', description: 'ID of the plan to purchase (basic, pro, nomad)' }
                },
                required: ['quote_id', 'plan_id']
            },
            execute: async ({ quote_id, plan_id }) => {
                if (!state.currentQuote || state.currentQuote.id !== quote_id) {
                    throw new Error("Quote ID not found or expired.");
                }
                const plan = state.currentQuote.plans.find(p => p.id === plan_id);
                if (!plan) throw new Error("Plan not found.");

                window.purchasePolicy(quote_id, plan_id);

                // Switch to dashboard view
                document.getElementById('nav-dashboard').click();

                return `Successfully purchased ${plan.name}. Policy ID: ${state.policies[state.policies.length-1].id}`;
            }
        });

        // Tool: travel_file_claim
        navigator.modelContext.registerTool({
            name: 'travel_file_claim',
            description: 'File a claim on an existing policy.',
            inputSchema: {
                type: 'object',
                properties: {
                    policy_id: { type: 'string', description: 'Policy ID' },
                    reason: { type: 'string', description: 'Reason for claim' }
                },
                required: ['policy_id', 'reason']
            },
            execute: async ({ policy_id, reason }) => {
                const policy = state.policies.find(p => p.id === policy_id);
                if (!policy) throw new Error("Policy not found.");

                const claim = simulateClaim(policy_id, reason);
                state.claims.set(claim.id, claim);

                // Auto-switch to dashboard to show claim
                document.getElementById('nav-dashboard').click();
                renderClaims(); // Ensure list is refreshed

                return JSON.stringify(claim);
            }
        });

        // Tool: travel_check_claim_status
        navigator.modelContext.registerTool({
            name: 'travel_check_claim_status',
            description: 'Check the status of a filed claim.',
            inputSchema: {
                type: 'object',
                properties: {
                    claim_id: { type: 'string', description: 'Claim ID' }
                },
                required: ['claim_id']
            },
            execute: async ({ claim_id }) => {
                const claim = state.claims.get(claim_id);
                if (!claim) throw new Error("Claim not found.");

                // Switch to dashboard and highlight claim
                document.getElementById('nav-dashboard').click();
                renderClaims();

                // Find the claim element and highlight it (simple scroll for now, could add class)
                // We need to wait for renderClaims to finish if it was async (it's sync here)
                const claimElements = Array.from(document.querySelectorAll('#claims-list .policy-item'));
                const targetEl = claimElements.find(el => el.textContent.includes(claim_id));

                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetEl.style.border = '2px solid var(--primary)';
                    setTimeout(() => targetEl.style.border = '', 3000);
                }

                return claim.status;
            }
        });

        console.log("WebMCP Tools Registered Successfully");

    } catch (e) {
        console.error("Failed to register WebMCP tools:", e);
    }
}

// Global helper for purchase (needs to be available globally for inline onclick)
window.purchasePolicy = (quoteId, planId) => {
    const plan = state.currentQuote.plans.find(p => p.id === planId);
    const policyId = 'POL-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    state.policies.push({
        id: policyId,
        quoteId,
        planId,
        planName: plan.name,
        purchaseDate: new Date().toISOString()
    });

    renderPolicies();
    showToast(`Policy ${policyId} purchased!`);
};

// Initialize
renderPlans();
setTimeout(registerTools, 100);
