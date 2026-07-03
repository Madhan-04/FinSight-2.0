// Client-side AI Simulation Service for FinSight AI 3.0 (Mock AI Advisor)

import { Transaction, Goal } from './analyzer';

interface ChatMessage {
  id?: number;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}

export class MockAiService {
  // 1. Generate Chat Responses
  public static generateChatResponse(
    userMessage: string,
    history: ChatMessage[],
    context: {
      transactions: Transaction[];
      goals: Goal[];
      overview: { total_income: number; total_expenses: number; total_savings: number };
      healthScore: { score: number; status: string };
      subscriptions: any[];
      anomalies: any[];
    },
    educationLevel: string = 'intermediate'
  ): Promise<string> {
    return new Promise((resolve) => {
      // Simulate network lag
      setTimeout(() => {
        const msg = userMessage.toLowerCase().trim();
        let reply = '';

        // Context stats for personalization
        const incomeFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.overview.total_income);
        const expensesFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.overview.total_expenses);
        const savingsFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.overview.total_savings);

        // Core prompt triggers
        if (msg.includes('hello') || msg.includes('hi ') || msg.includes('hey')) {
          reply = `Hello! I am your **FinSight AI Spending Coach**. 👋\n\nI have analyzed your profile. You have an income of **${incomeFormatted}** and expenses of **${expensesFormatted}** (Health Score: **${context.healthScore.score}/100**).\n\nHow can I help you today? You can ask me to **explain your health score**, **recommend savings targets**, or **generate a budget plan**!`;
        } else if (msg.includes('health') || msg.includes('score')) {
          reply = `### 📊 Your Financial Health Score Analysis\n\nYour current health score is **${context.healthScore.score}/100** (**${context.healthScore.status}**).\n\n**Here is the structural breakdown:**\n- **Income to Expense Ratio**: You spent **${expensesFormatted}** out of **${incomeFormatted}**.\n- **Unusual Activity**: We found **${context.anomalies.length} anomaly flags** in your ledger.\n- **Active Subscriptions**: You have **${context.subscriptions.length} recurring dependencies**.\n\n**My Recommendation:**\nTry to automate a **15% savings allocation** right on payday. We should also look into disabling any inactive subscriptions to recover leakage immediately.`;
        } else if (msg.includes('budget') || msg.includes('optimize') || msg.includes('plan')) {
          reply = `### 🎯 Custom AI Budget Optimization Plan\n\nBased on your monthly outflow of **${expensesFormatted}**, I suggest adopting a **50/30/20 budget division**:\n\n1. **Essential Needs (50%)**: Limit to **${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.overview.total_income * 0.5)}** (Rent, utilities, groceries).\n2. **Wants & Comforts (30%)**: Allocate **${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.overview.total_income * 0.3)}** (Dining out, shopping, streaming).\n3. **Active Savings (20%)**: Secure **${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.overview.total_income * 0.2)}** immediately for long-term investments.\n\n*Would you like me to identify which discretionary categories (like shopping or dining delivery) are currently exceeding these thresholds?*`;
        } else if (msg.includes('goal') || msg.includes('saving')) {
          if (context.goals.length === 0) {
            reply = `You haven't defined any savings goals yet! Defining goals is crucial for financial tracking.\n\nGo to the **Savings Goals** tab to add a target (e.g. "Emergency Fund", "Down Payment"). Once added, I will run achievement projections and probabilities for you.`;
          } else {
            const firstGoal = context.goals[0];
            reply = `### 🏆 Savings Goals Check\n\nYou currently have **${context.goals.length} active savings targets**.\n\nYour primary goal is **"${firstGoal.name}"** with a target of **${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(firstGoal.target_amount)}** (funded: **${((firstGoal.current_amount/firstGoal.target_amount)*100).toFixed(0)}%**).\n\nIf you maintain your savings pace of **${savingsFormatted}** per month, you are highly likely to reach your goals on time.`;
          }
        } else if (msg.includes('anomalies') || msg.includes('duplicate') || msg.includes('spike')) {
          if (context.anomalies.length === 0) {
            reply = `Excellent! We did not detect any duplicate transactions or unusual spending spikes in your statement files. Your cash outflow is consistent and clean.`;
          } else {
            reply = `### ⚠️ Anomaly Flag Report\n\nWe detected **${context.anomalies.length} unusual items** in your ledger:\n\n${context.anomalies.map((a, i) => `${i+1}. **${a.merchant}** on ${a.date}: **${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a.amount)}** (${a.type === 'duplicate' ? 'Potential Double Billing' : 'Unusually High Outflow'}).`).join('\n')}\n\nI recommend contacting these vendors if you did not authorize consecutive swipes of these identical amounts.`;
          }
        } else {
          // General generic fallback based on user query
          reply = `### 💡 AI Financial Advisor Insight\n\nThat is an interesting question! Regarding your query on *" ${userMessage} "*. Since we are running in database-free client mode, here is a general financial best practice:\n\n- **Rule of 72**: Divide 72 by your annual interest rate to find out exactly how many years it takes for your investment to double.\n- **Pay Yourself First**: Instead of saving whatever is left at the end of the month, transfer your savings target *on salary day* and spend what remains.\n- **Micro-transaction Leakage**: Small UPI micro-payments (like Rs. 50/100 for snacks) accumulate rapidly. UPI dependency shows that these constitute over **30% of discretionary spending**.\n\nIf you want specific numbers, try asking me about **"my budget details"**, **"unusual expenses"**, or **"my health score"**!`;
        }

        // Adjust vocabulary based on educationLevel
        if (educationLevel === 'beginner') {
          reply = reply.replace(/\b(telemetry|thresholds|allocations|stdDev|discretionary|derivatives)\b/gi, 'spending habits');
        } else if (educationLevel === 'advanced') {
          reply += `\n\n*Advanced Quantitative Note: Portfolio optimization models suggest correlating your surplus assets into debt-hedged index instruments based on current inflation cycles.*`;
        }

        resolve(reply);
      }, 700);
    });
  }

  // 2. Generate Budget Optimizations
  public static generateBudgetOptimization(transactions: Transaction[]): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const debits = transactions.filter(t => t.type === 'debit');
        const cats: Record<string, number> = {};
        debits.forEach(t => {
          cats[t.category] = (cats[t.category] || 0) + t.amount;
        });

        const suggested_budgets = [
          {
            category: 'Food & Dining',
            current_spend: cats['Food & Dining'] || 0,
            suggested_limit: 8000,
            savings_potential: Math.max(0, (cats['Food & Dining'] || 0) - 8000),
            rationale: 'High frequency of convenience delivery orders. Limit dining apps to twice a week to save.'
          },
          {
            category: 'Shopping & Entertainment',
            current_spend: cats['Shopping & Entertainment'] || 0,
            suggested_limit: 5000,
            savings_potential: Math.max(0, (cats['Shopping & Entertainment'] || 0) - 5000),
            rationale: 'E-commerce transactions show weekend spending spikes. Implement a 48-hour cool-off rule before checkout.'
          },
          {
            category: 'Bills & Subscriptions',
            current_spend: cats['Bills & Subscriptions'] || 0,
            suggested_limit: 12000,
            savings_potential: Math.max(0, (cats['Bills & Subscriptions'] || 0) - 12000),
            rationale: 'Multiple streaming and cloud subscriptions detected. Audit active services and consolidate plans.'
          },
          {
            category: 'Travel & Transport',
            current_spend: cats['Travel & Transport'] || 0,
            suggested_limit: 4000,
            savings_potential: Math.max(0, (cats['Travel & Transport'] || 0) - 4000),
            rationale: 'Cab aggregator dependency is high. Optimize local travel by using shared transport or corporate discounts.'
          }
        ];

        const estimated_monthly_savings = suggested_budgets.reduce((acc, b) => acc + b.savings_potential, 0);

        resolve({
          suggested_budgets,
          estimated_monthly_savings,
          summary: 'Audit reveals substantial leakage in convenience apps and weekend shopping. Restructuring these limits can reclaim significant cash flow.'
        });
      }, 500);
    });
  }

  // 3. Generate Executive Diagnosis Reports
  public static generateDiagnosis(context: {
    overview: { total_income: number; total_expenses: number; total_savings: number };
    healthScore: { score: number; status: string };
    subscriptions: any[];
    anomalies: any[];
  }): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const issues = [];
        const wins = [];

        if (context.overview.total_expenses > context.overview.total_income * 0.8) {
          issues.push('High Burn Rate: Expenses exceed 80% of your total credits. Current trajectory limits emergency safety.');
          wins.push('Budget Cap: Limit shopping and dining outflows to 25% of income to establish a secure savings margin.');
        } else {
          wins.push('Maintain Allocation: You are maintaining a healthy cash flow. Transfer the surplus to target goals.');
        }

        if (context.anomalies.length > 0) {
          issues.push(`Anomaly Warning: We flagged ${context.anomalies.length} transaction spikes/duplicates. Review these files for double-billing.`);
          wins.push('Ledger Auditing: Contact your bank branch regarding any double-swipe transactions.');
        }

        if (context.subscriptions.length > 4) {
          issues.push(`Subscription Creep: You have ${context.subscriptions.length} active recurring subscriptions. Small monthly debits accumulate.`);
          wins.push('Disable Inactive Services: Audit your streaming and cloud storage memberships to prune duplicates.');
        }

        resolve({
          executive_summary: `Your finance diagnosis is completed with a score of ${context.healthScore.score}/100. Cash flow remains positive, but optimizations are needed to curb convenience apps spending and consolidate recurring service memberships.`,
          overall_status: context.healthScore.score >= 80 ? 'Healthy' : context.healthScore.score >= 60 ? 'Action Required' : 'Critical Review',
          critical_issues: issues.length > 0 ? issues : ['No critical issues detected. Maintain current cash allocations.'],
          quick_wins: wins.length > 0 ? wins : ['Automate a monthly payday transfer to goal accounts.']
        });
      }, 500);
    });
  }

  // 4. Generate local advice templates for safety modules
  public static getSurvivalSuggestions(survival: any) {
    if (survival.risk_level === 'High') {
      return [
        'Critical Outflow Alert: Your current daily burn rate will deplete your remaining cash before next payday.',
        'Immediate Action: Freeze non-essential purchases (dining, clothes, gadgets) for the next 7 days.',
        'Postpone Payments: Defer discretionary variable costs where possible to avoid short-term credit dependence.'
      ];
    } else if (survival.risk_level === 'Medium') {
      return [
        'Watchful Buffer: You have enough balance, but your reserves will be low. Limit micro-spends.',
        'Weekly Cap: Establish a strict weekly cash limit to keep month-end balances positive.',
        'Automate Goal Transfer: Pay your savings goals first, then adjust daily spending.'
      ];
    }
    return [
      'Excellent Surplus: You are on track to end the month with a strong positive balance.',
      'Investment Sweep: Consider setting up an auto-investment sweep for any end-of-month cash surplus.',
      'Goal Booster: Boost allocations to your active goals to achieve milestones ahead of schedule.'
    ];
  }

  public static getEmergencyPlan(emergency: any) {
    if (emergency.resilience_score < 30) {
      return [
        'Critical Priority: Create an Emergency Contingency Fund goal immediately.',
        'payday Sweep: Automate a 10% direct transfer from your salary account on day one.',
        'Discretionary Freeze: Cut swiggy/shopping expenses for 2 months to fast-track your first month essentials buffer.'
      ];
    } else if (emergency.resilience_score < 60) {
      return [
        'Improve Buffer: You have a starting resilience, but aim for a full 6-month buffer.',
        'Safety Sweep: Redirect cash back rewards or windfall credits straight to your contingency account.',
        'Prune Subscriptions: Clean up duplicate subscriptions to increase emergency fund contributions.'
      ];
    }
    return [
      'Rock Solid Reserves: You have achieved an excellent emergency reserve score!',
      'Inflation Hedge: Consider moving part of your contingency cash to a high-yield liquid mutual fund.',
      'Audit Coverage: Review your medical insurance coverage to protect your emergency cash from medical claims.'
    ];
  }

  public static getLifestyleAdvice(creep: any) {
    if (creep.creep_detected) {
      return [
        'Lifestyle Creep Warning: Your expense growth is outpacing your income growth rate.',
        'Re-baseline Expenses: Every time your income rises, commit 50%+ of the increment to investments.',
        'Evaluate Purchases: Distinguish between luxury upgrades (first-class, premium versions) and utility requirements.'
      ];
    }
    return [
      'Healthy Budgeting: Your expense growth is well-aligned with your income cycles.',
      'Rule of 50: Keep allocating any salary increments to goals before expanding discretionary budgets.',
      'Regular Audits: Re-evaluate category budgets quarterly to ensure creep does not stealthily take over.'
    ];
  }

  public static getDebtPlan(emi: any) {
    if (emi.stress_score > 60) {
      return [
        'Severe Debt Load: Debt commitments exceed the 40% safe threshold.',
        'Debt Snowball: List all loans by size. Pay minimum on all, and put all surplus cash towards the smallest debt to eliminate it.',
        'Refinance: Explore consolidating high-interest credit card debts into a lower-interest personal loan.'
      ];
    }
    return [
      'Healthy Debt Margin: Your loan obligations are fully within safe boundaries.',
      'Pre-payment: Pay an extra EMI yearly on your home/long-term loan to reduce outstanding duration.',
      'Avoid Fresh Debt: Avoid zero-cost EMI shopping loops; buy discretionary assets only with saved funds.'
    ];
  }

  public static getUpiAdvice(upi: any) {
    if (upi.upi_dependency_score > 70) {
      return [
        'High UPI Footprint: Micro-payments are creeping up discretionary spending silently.',
        'Wallet Budgeting: Transfer your weekly discretionary budget (e.g. Rs. 2,000) to a separate digital wallet (like Paytm Wallet). Pay only from there.',
        'The 24-Hour Rule: Delay any online shopping purchase by 24 hours to eliminate immediate digital swipe impulses.'
      ];
    }
    return [
      'Ideal UPI Control: You are managing your digital micro-payments well.',
      'Track Small Spends: Continue scanning transaction statements weekly to catch minor snacks/cabs loops.',
      'Secure limits: Set an daily limit on your UPI app to prevent high-value fraud or accidental swipes.'
    ];
  }
}
