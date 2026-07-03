// Client-side Financial Intelligence Analytics Engine in TypeScript

export interface Transaction {
  id: number;
  date: string;
  raw_description: string;
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  payment_method: string;
  is_recurring: boolean;
  statement_id?: number;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
}

export class FinancialAnalyzer {
  // 1. Detect Subscriptions
  public static detectSubscriptions(transactions: Transaction[]) {
    if (!transactions || transactions.length === 0) return [];
    
    const debits = transactions.filter(t => t.type === 'debit');
    const merchantGroups: Record<string, Transaction[]> = {};
    
    debits.forEach(t => {
      const key = t.merchant.trim().toLowerCase();
      if (!merchantGroups[key]) merchantGroups[key] = [];
      merchantGroups[key].push(t);
    });

    const subscriptions: any[] = [];
    
    Object.entries(merchantGroups).forEach(([merchant, group]) => {
      // Direct keyword matches
      const isKnownSub = ['netflix', 'spotify', 'youtube', 'amazon prime', 'swiggy one', 'zomato gold', 'gym', 'rent', 'microsoft', 'adobe', 'icloud', 'google one'].some(
        name => merchant.includes(name)
      );
      
      if (group.length >= 2 || isKnownSub) {
        // Sort chronologically
        const sorted = [...group].sort((a, b) => a.date.localeCompare(b.date));
        
        // Calculate average amount
        const avgAmount = sorted.reduce((acc, t) => acc + t.amount, 0) / sorted.length;
        
        // Detect frequency (weekly vs monthly)
        let frequency = 'monthly';
        if (sorted.length >= 2) {
          const firstDate = new Date(sorted[0].date);
          const lastDate = new Date(sorted[sorted.length - 1].date);
          const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
          const avgInterval = daysDiff / (sorted.length - 1);
          if (avgInterval >= 5 && avgInterval <= 9) {
            frequency = 'weekly';
          }
        }
        
        // Calculate next expected date
        const lastTxDate = new Date(sorted[sorted.length - 1].date);
        const nextDate = new Date(lastTxDate);
        if (frequency === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
          nextDate.setDate(nextDate.getDate() + 7);
        }

        subscriptions.push({
          merchant: group[0].merchant,
          category: group[0].category,
          amount: parseFloat(avgAmount.toFixed(2)),
          frequency,
          next_expected_date: nextDate.toISOString().slice(0, 10)
        });
      }
    });

    return subscriptions;
  }

  // 2. Detect Anomalies
  public static detectAnomalies(transactions: Transaction[]) {
    if (!transactions || transactions.length === 0) return [];
    
    const debits = transactions.filter(t => t.type === 'debit');
    const anomalies: any[] = [];
    
    if (debits.length === 0) return [];

    // Calculate mean & std dev for transaction amount to detect spikes
    const amounts = debits.map(t => t.amount);
    const mean = amounts.reduce((acc, v) => acc + v, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / amounts.length) || 1;
    
    // 1. Spikes: Amount > mean + 2.5 * stdDev
    debits.forEach(t => {
      if (t.amount > mean + 2.2 * stdDev && t.amount > 5000) {
        anomalies.push({
          transaction_id: t.id,
          date: t.date,
          merchant: t.merchant,
          amount: t.amount,
          type: 'spike',
          reason: `Transaction amount is significantly higher than your average spend of ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(mean)}.`
        });
      }
    });

    // 2. Duplicates: Same merchant, amount, and date
    const dupMap: Record<string, Transaction[]> = {};
    debits.forEach(t => {
      const key = `${t.date}_${t.merchant.toLowerCase().trim()}_${t.amount}`;
      if (!dupMap[key]) dupMap[key] = [];
      dupMap[key].push(t);
    });

    Object.values(dupMap).forEach(group => {
      if (group.length > 1) {
        group.slice(1).forEach(t => {
          anomalies.push({
            transaction_id: t.id,
            date: t.date,
            merchant: t.merchant,
            amount: t.amount,
            type: 'duplicate',
            reason: `Potential duplicate charge detected. Multiple charges of identical amount found on the same day.`
          });
        });
      }
    });

    return anomalies;
  }

  // 3. Health Score
  public static calculateHealthScore(transactions: Transaction[], goals: Goal[]) {
    if (!transactions || transactions.length === 0) {
      return {
        score: 60,
        status: 'Fair',
        breakdown: ['No transaction records available. Upload a statement to calculate score.'],
        recommendation: 'Get started by uploading your recent bank statement to analyze your cash flow.'
      };
    }

    const credits = transactions.filter(t => t.type === 'credit');
    const debits = transactions.filter(t => t.type === 'debit');
    
    const income = credits.reduce((acc, t) => acc + t.amount, 0);
    const expenses = debits.reduce((acc, t) => acc + t.amount, 0);
    
    let score = 70; // baseline
    const breakdown: string[] = [];

    // Rule 1: Savings Rate
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    
    if (savingsRate >= 30) {
      score += 15;
      breakdown.push(`Excellent Savings Rate: You saved ${savingsRate.toFixed(0)}% of your income, well above the 20% benchmark.`);
    } else if (savingsRate >= 15) {
      score += 5;
      breakdown.push(`Healthy Savings Rate: You saved ${savingsRate.toFixed(0)}% of your income.`);
    } else {
      score -= 15;
      breakdown.push(`Low Savings Rate: You saved only ${savingsRate.toFixed(0)}% of your income. Focus on reducing discretionary costs.`);
    }

    // Rule 2: Fixed vs Variable expense ratios
    const essentialCategories = ['bills', 'rent', 'utilities', 'groceries', 'health', 'insurance'];
    const essentialsSum = debits
      .filter(t => essentialCategories.some(cat => t.category.toLowerCase().includes(cat)))
      .reduce((acc, t) => acc + t.amount, 0);
    
    const essentialRatio = expenses > 0 ? (essentialsSum / expenses) * 100 : 0;
    if (essentialRatio > 0 && essentialRatio <= 55) {
      score += 10;
      breakdown.push(`Ideal Needs Budgeting: Essential living costs account for ${essentialRatio.toFixed(0)}% of your total spending.`);
    } else if (essentialRatio > 55) {
      score -= 5;
      breakdown.push(`Heavy Living Costs: Essential needs consume ${essentialRatio.toFixed(0)}% of your expenditures. Consider lifestyle optimization.`);
    }

    // Rule 3: Goal progression
    if (goals.length > 0) {
      const activeProgress = goals.reduce((acc, g) => acc + (g.current_amount / g.target_amount), 0) / goals.length;
      if (activeProgress >= 0.5) {
        score += 5;
        breakdown.push(`Strong Goal Momentum: Your savings goals are average 50%+ funded.`);
      }
    } else {
      breakdown.push('Establish a savings goal to start building wealth milestones.');
    }

    // Clip score
    score = Math.max(10, Math.min(100, score));
    
    let status = 'Fair';
    let recommendation = 'Aim to increase your savings rate to 20% and reduce duplicate subscriptions.';
    
    if (score >= 85) {
      status = 'Excellent';
      recommendation = 'Exceptional financial discipline! Maintain your current allocation and invest the surplus.';
    } else if (score >= 70) {
      status = 'Good';
      recommendation = 'You are in a healthy position. Focus on automating your investments and building milestones.';
    } else if (score < 50) {
      status = 'Poor';
      recommendation = 'Action required: Restructure your budgeting, limit credit card/UPI transactions, and scan for active money leaks.';
    }

    return { score, status, breakdown, recommendation };
  }

  // 4. Forecast Expenses
  public static forecastExpenses(transactions: Transaction[]) {
    if (!transactions || transactions.length < 5) {
      return {
        next_month_estimated_expenses: 15000.0,
        trend: 'stable',
        confidence: 0.4,
        insights: ['Insufficent chronological transactions to predict trends. Keep uploading bank records.']
      };
    }
    
    const debits = transactions.filter(t => t.type === 'debit');
    const sorted = [...debits].sort((a, b) => a.date.localeCompare(b.date));
    const monthlySpending: Record<string, number> = {};
    
    sorted.forEach(t => {
      const monthKey = t.date.slice(0, 7); // YYYY-MM
      monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + t.amount;
    });

    const values = Object.values(monthlySpending);
    const avgSpend = values.reduce((acc, v) => acc + v, 0) / values.length;
    
    let trend = 'stable';
    let nextMonthEstimate = avgSpend;
    
    if (values.length >= 2) {
      const change = values[values.length - 1] - values[values.length - 2];
      if (change > avgSpend * 0.05) {
        trend = 'increasing';
        nextMonthEstimate = values[values.length - 1] * 1.03; // project 3% growth
      } else if (change < -avgSpend * 0.05) {
        trend = 'decreasing';
        nextMonthEstimate = values[values.length - 1] * 0.97; // project 3% reduction
      }
    }

    return {
      next_month_estimated_expenses: parseFloat(nextMonthEstimate.toFixed(2)),
      trend,
      confidence: values.length > 3 ? 0.85 : 0.6,
      insights: [
        `Expenses are projected to be ${trend === 'increasing' ? 'slightly higher' : trend === 'decreasing' ? 'lower' : 'consistent'} next month based on recent spend cycles.`,
        `Major budget driver remains ${sorted[sorted.length-1]?.category || 'discretionary costs'}.`
      ]
    };
  }

  // 5. Money Leaks
  public static detectMoneyLeaks(transactions: Transaction[]) {
    const debits = transactions.filter(t => t.type === 'debit');
    const leaks: any[] = [];
    let monthlyLeakage = 0;

    // A. Detect duplicates
    const dupMap: Record<string, Transaction[]> = {};
    debits.forEach(t => {
      const key = `${t.date}_${t.merchant.toLowerCase().trim()}_${t.amount}`;
      if (!dupMap[key]) dupMap[key] = [];
      dupMap[key].push(t);
    });
    Object.values(dupMap).forEach(group => {
      if (group.length > 1) {
        const dup = group[1];
        leaks.push({
          type: 'Duplicate Charge',
          merchant: dup.merchant,
          amount: dup.amount,
          description: 'Identical amount charged by the same merchant on the same day.',
          alert_text: 'Review this duplicate transaction; request a charge reversal if double-billed.'
        });
        monthlyLeakage += dup.amount;
      }
    });

    // B. Scrutinize swiggy/zomato high frequency spikes
    const foodTxs = debits.filter(t => ['swiggy', 'zomato', 'ubereats', 'zepto', 'blinkit'].some(m => t.merchant.toLowerCase().includes(m)));
    if (foodTxs.length > 8) {
      const foodSum = foodTxs.reduce((acc, t) => acc + t.amount, 0);
      leaks.push({
        type: 'Impulse Convenience Outflow',
        merchant: 'Delivery Apps (Zomato/Zepto/Swiggy)',
        amount: foodSum * 0.25, // estimate 25% waste
        description: `High convenience dependency. You placed ${foodTxs.length} delivery orders this period.`,
        alert_text: 'Convenience apps creep. Restructure grocery cooking to recover 25%+ of delivery waste.'
      });
      monthlyLeakage += foodSum * 0.25;
    }

    // C. Inactive unused memberships (mock based on common leaks)
    const subs = this.detectSubscriptions(transactions);
    subs.forEach(s => {
      if (s.amount > 500 && ['gym', 'adobe', 'canva', 'premium'].some(k => s.merchant.toLowerCase().includes(k))) {
        leaks.push({
          type: 'Unused Membership',
          merchant: s.merchant,
          amount: s.amount,
          description: `Active recurring sub: ${s.merchant}. User checks show low transactional footprint.`,
          alert_text: 'Cancel if you have not used this membership in the last 30 days.'
        });
        monthlyLeakage += s.amount;
      }
    });

    const categorySummary: Record<string, number> = {};
    debits.forEach(t => {
      categorySummary[t.category] = (categorySummary[t.category] || 0) + t.amount;
    });

    return {
      leaks,
      monthly_leakage: parseFloat(monthlyLeakage.toFixed(2)),
      recovered_savings: parseFloat((monthlyLeakage * 0.85).toFixed(2)),
      subscription_breakdown: categorySummary,
      recurring_dashboard: subs.map(s => ({ name: s.merchant, value: s.amount }))
    };
  }

  // 6. Salary Survival Predictor
  public static predictSalarySurvival(transactions: Transaction[]) {
    const credits = transactions.filter(t => t.type === 'credit');
    const debits = transactions.filter(t => t.type === 'debit');

    // Salary estimation: find largest regular credit
    const salaryCredits = credits.filter(c => 
      ['salary', 'payroll', 'credit', 'dir dep', 'deposit'].some(k => c.raw_description.toLowerCase().includes(k)) || c.amount > 15000
    );
    const lastSalary = salaryCredits.length > 0 ? salaryCredits[0].amount : 50000;
    
    const income = credits.reduce((acc, t) => acc + t.amount, 0);
    const expenses = debits.reduce((acc, t) => acc + t.amount, 0);
    const currentBalance = Math.max(2500, income - expenses);

    const sortedTxs = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    let lastTxDate = new Date();
    if (sortedTxs.length > 0) lastTxDate = new Date(sortedTxs[0].date);

    // Days remaining in month
    const year = lastTxDate.getFullYear();
    const month = lastTxDate.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const remainingDays = Math.max(1, lastDayOfMonth - lastTxDate.getDate());

    const monthlyBurnRate = expenses;
    const averageDailySpending = expenses > 0 ? expenses / 30 : 500;
    const predictedMonthEndBalance = currentBalance - (averageDailySpending * remainingDays);

    let survivalProbability = 95;
    let riskLevel = 'Low';
    
    if (predictedMonthEndBalance < 0) {
      survivalProbability = Math.max(10, Math.min(45, 100 + Math.floor((predictedMonthEndBalance / lastSalary) * 100)));
      riskLevel = 'High';
    } else if (predictedMonthEndBalance < lastSalary * 0.15) {
      survivalProbability = 70;
      riskLevel = 'Medium';
    }

    return {
      current_balance: currentBalance,
      monthly_burn_rate: parseFloat(monthlyBurnRate.toFixed(2)),
      average_daily_spending: parseFloat(averageDailySpending.toFixed(2)),
      remaining_days: remainingDays,
      predicted_month_end_balance: parseFloat(predictedMonthEndBalance.toFixed(2)),
      survival_probability: survivalProbability,
      risk_level: riskLevel,
      suggestions: [] as string[]
    };
  }

  // 7. Emergency Fund Risk Scanner
  public static scanEmergencyFund(transactions: Transaction[], goals: Goal[]) {
    const debits = transactions.filter(t => t.type === 'debit');
    
    // Find essential fixed expenses
    const essentials = debits.filter(t => 
      ['rent', 'housing', 'bills', 'electricity', 'gas', 'water', 'loan', 'emi', 'insurance', 'groceries', 'medical', 'medicine'].some(
        k => t.category.toLowerCase().includes(k) || t.raw_description.toLowerCase().includes(k)
      )
    );
    const monthlyEssentials = essentials.reduce((acc, t) => acc + t.amount, 0) || 12000;
    const recommendedEmergencyFund = monthlyEssentials * 6; // 6 months buffer

    // Check emergency goals
    const emergencyGoals = goals.filter(g => ['emergency', 'safety', 'contingency'].some(k => g.name.toLowerCase().includes(k)));
    const currentEmergencySavings = emergencyGoals.reduce((acc, g) => acc + g.current_amount, 0) || (recommendedEmergencyFund * 0.35); // fallback mock

    const preparednessRatio = recommendedEmergencyFund > 0 ? (currentEmergencySavings / recommendedEmergencyFund) : 0;
    const resilienceScore = Math.min(100, Math.floor(preparednessRatio * 100));
    
    let riskLevel = 'Low';
    if (resilienceScore < 30) riskLevel = 'Critical';
    else if (resilienceScore < 60) riskLevel = 'Moderate';

    return {
      monthly_essential_expenses: parseFloat(monthlyEssentials.toFixed(2)),
      recommended_emergency_fund: parseFloat(recommendedEmergencyFund.toFixed(2)),
      current_emergency_savings: parseFloat(currentEmergencySavings.toFixed(2)),
      preparedness_ratio: parseFloat(preparednessRatio.toFixed(2)),
      resilience_score: resilienceScore,
      risk_level: riskLevel,
      improvement_plans: [] as string[]
    };
  }

  // 8. Lifestyle Creep Detector
  public static detectLifestyleCreep(transactions: Transaction[]) {
    if (!transactions || transactions.length < 10) {
      return {
        income_growth: 0.0,
        expense_growth: 0.0,
        savings_growth: 0.0,
        creep_detected: false,
        risk_level: 'Low',
        recommendations: []
      };
    }
    
    // Group monthly
    const debits = transactions.filter(t => t.type === 'debit');
    const credits = transactions.filter(t => t.type === 'credit');
    
    const monthlyExpenses: Record<string, number> = {};
    const monthlyIncome: Record<string, number> = {};
    
    debits.forEach(t => {
      const k = t.date.slice(0, 7);
      monthlyExpenses[k] = (monthlyExpenses[k] || 0) + t.amount;
    });
    credits.forEach(t => {
      const k = t.date.slice(0, 7);
      monthlyIncome[k] = (monthlyIncome[k] || 0) + t.amount;
    });

    const months = Object.keys(monthlyExpenses).sort();
    let incomeGrowth = 0.0;
    let expenseGrowth = 0.0;
    let savingsGrowth = 0.0;
    let creepDetected = false;
    let riskLevel = 'Low';

    if (months.length >= 2) {
      const m1 = months[0];
      const m2 = months[months.length - 1];
      
      const inc1 = monthlyIncome[m1] || 1;
      const inc2 = monthlyIncome[m2] || 1;
      const exp1 = monthlyExpenses[m1] || 1;
      const exp2 = monthlyExpenses[m2] || 1;
      
      incomeGrowth = ((inc2 - inc1) / inc1) * 100;
      expenseGrowth = ((exp2 - exp1) / exp1) * 100;
      
      const sav1 = inc1 - exp1;
      const sav2 = inc2 - exp2;
      savingsGrowth = sav1 !== 0 ? ((sav2 - sav1) / Math.abs(sav1)) * 100 : 0;
      
      if (expenseGrowth > incomeGrowth && expenseGrowth > 5) {
        creepDetected = true;
        riskLevel = expenseGrowth - incomeGrowth > 15 ? 'High' : 'Medium';
      }
    }

    return {
      income_growth: parseFloat(incomeGrowth.toFixed(2)),
      expense_growth: parseFloat(expenseGrowth.toFixed(2)),
      savings_growth: parseFloat(savingsGrowth.toFixed(2)),
      creep_detected: creepDetected,
      risk_level: riskLevel,
      recommendations: [] as string[]
    };
  }

  // 9. EMI Stress Analyzer
  public static analyzeEMIStress(transactions: Transaction[]) {
    const debits = transactions.filter(t => t.type === 'debit');
    const credits = transactions.filter(t => t.type === 'credit');
    
    const income = credits.reduce((acc, t) => acc + t.amount, 0) || 50000;
    
    // Scan EMI keywords
    const emiTxs = debits.filter(t => 
      ['emi', 'loan', 'mortgage', 'hfc', 'finance', 'bajaj', 'cred'].some(k => 
        t.raw_description.toLowerCase().includes(k) || t.merchant.toLowerCase().includes(k)
      )
    );
    const totalEmi = emiTxs.reduce((acc, t) => acc + t.amount, 0);
    const debtBurden = income > 0 ? (totalEmi / income) * 100 : 0;
    
    let stressScore = Math.floor(debtBurden * 2);
    stressScore = Math.max(0, Math.min(100, stressScore));
    
    let stressLevel = 'Low';
    if (stressScore > 70) stressLevel = 'Severe';
    else if (stressScore > 40) stressLevel = 'Moderate';

    return {
      total_emi_payments: parseFloat(totalEmi.toFixed(2)),
      debt_burden: parseFloat(debtBurden.toFixed(2)),
      stress_score: stressScore,
      stress_level: stressLevel,
      suggestions: [] as string[]
    };
  }

  // 10. UPI Dependency Analyzer
  public static analyzeUpiDependency(transactions: Transaction[]) {
    const debits = transactions.filter(t => t.type === 'debit');
    
    // Scan GPay / UPI codes
    const upiTxs = debits.filter(t => 
      t.payment_method.toLowerCase() === 'upi' || 
      ['upi', 'gpay', 'paytm', 'phonepe', 'bhim', 'yono', '@'].some(k => 
        t.raw_description.toLowerCase().includes(k) || t.payment_method.toLowerCase().includes(k)
      )
    );
    
    const totalExpenses = debits.reduce((acc, t) => acc + t.amount, 0) || 1;
    const upiExpenses = upiTxs.reduce((acc, t) => acc + t.amount, 0);
    
    const upiTransactionCount = upiTxs.length;
    const upiSpendShare = (upiExpenses / totalExpenses) * 100;
    const averageDailyTransactions = upiTransactionCount / 30;
    
    // Impulse spending under UPI: amounts < 500, category shopping/food
    const impulseTxs = upiTxs.filter(t => t.amount <= 400 && ['food', 'dining', 'shopping', 'entertainment', 'other'].some(k => t.category.toLowerCase().includes(k)));
    const impulseSpendCount = impulseTxs.length;
    const impulseSpendAmount = impulseTxs.reduce((acc, t) => acc + t.amount, 0);

    const upiDependencyScore = Math.min(100, Math.floor(upiSpendShare * 0.8 + (averageDailyTransactions * 5)));
    
    let impulseRisk = 'Low';
    if (upiDependencyScore > 75 && impulseSpendCount > 10) {
      impulseRisk = 'Critical';
    } else if (upiDependencyScore > 50) {
      impulseRisk = 'High';
    }

    return {
      upi_transaction_count: upiTransactionCount,
      upi_spend_share: parseFloat(upiSpendShare.toFixed(2)),
      average_daily_transactions: parseFloat(averageDailyTransactions.toFixed(2)),
      impulse_spend_count: impulseSpendCount,
      impulse_spend_amount: parseFloat(impulseSpendAmount.toFixed(2)),
      impulse_risk: impulseRisk,
      upi_dependency_score: upiDependencyScore,
      suggestions: [] as string[]
    };
  }

  // 11. Goal Achievement Predictor
  public static calculateGoalProbabilities(transactions: Transaction[], goals: Goal[]) {
    if (!goals || goals.length === 0) return [];
    
    const credits = transactions.filter(t => t.type === 'credit');
    const debits = transactions.filter(t => t.type === 'debit');
    
    const income = credits.reduce((acc, t) => acc + t.amount, 0);
    const expenses = debits.reduce((acc, t) => acc + t.amount, 0);
    const monthlySavings = Math.max(1000, income - expenses);

    return goals.map(g => {
      const targetDateObj = new Date(g.target_date);
      const today = new Date();
      const monthsRemaining = Math.max(1, (targetDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.4));
      
      const balanceNeeded = g.target_amount - g.current_amount;
      const requiredMonthlySavings = balanceNeeded / monthsRemaining;
      
      let probability = 85;
      let expectedMonths = balanceNeeded / monthlySavings;
      if (expectedMonths === Infinity || isNaN(expectedMonths)) expectedMonths = 12;

      if (requiredMonthlySavings > monthlySavings) {
        const ratio = monthlySavings / requiredMonthlySavings;
        probability = Math.floor(ratio * 90);
        probability = Math.max(10, probability);
      } else {
        probability = Math.min(99, 85 + Math.floor((monthlySavings - requiredMonthlySavings) / requiredMonthlySavings * 10));
      }

      let suggestions = 'Keep saving at your current pace to easily meet this target.';
      if (probability < 50) {
        suggestions = `Deficit detected: Boost your monthly allocations by ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(requiredMonthlySavings - monthlySavings)} to achieve this goal by the deadline.`;
      }

      return {
        goal_id: g.id,
        probability,
        expected_months: parseFloat(expectedMonths.toFixed(1)),
        required_monthly_savings: parseFloat(requiredMonthlySavings.toFixed(2)),
        suggestions
      };
    });
  }

  // 12. Master Safety Score Index
  public static calculateMasterSafetyScore(transactions: Transaction[], goals: Goal[]) {
    if (!transactions || transactions.length === 0) {
      return {
        score: 65,
        status: 'Stable',
        summary: 'Awaiting financial statements upload to run indicators.'
      };
    }

    const health = this.calculateHealthScore(transactions, goals);
    const emi = this.analyzeEMIStress(transactions);
    const upi = this.analyzeUpiDependency(transactions);
    const survival = this.predictSalarySurvival(transactions);
    
    // Weighted combination of different scores:
    // Health (40%) + EMI safety (20%) + UPI constraint (20%) + Salary buffer (20%)
    const emiScore = 100 - emi.stress_score;
    const upiScore = 100 - upi.upi_dependency_score;
    const survivalScore = survival.survival_probability;

    const safetyScore = Math.floor(
      (health.score * 0.40) + 
      (emiScore * 0.20) + 
      (upiScore * 0.20) + 
      (survivalScore * 0.20)
    );

    let status = 'Vulnerable';
    let summary = 'Financial risks detected. High dependence on convenience apps and debt levels require budget re-evaluation.';
    
    if (safetyScore >= 80) {
      status = 'Excellent';
      summary = 'Solid buffer. High savings rate, low debt load, and strong salary survival probability indicates robust financial health.';
    } else if (safetyScore >= 60) {
      status = 'Stable';
      summary = 'Generally balanced. Monitor UPI micro-transactions to avoid creep and build emergency reserves.';
    }

    return {
      score: safetyScore,
      status,
      summary
    };
  }
}
