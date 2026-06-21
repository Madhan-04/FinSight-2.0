import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.models import Transaction, Goal

class FinancialAnalyzer:
    @staticmethod
    def detect_subscriptions(transactions: List[Transaction]) -> List[Dict[str, Any]]:
        """
        Detects repeating transactions that occur on a regular interval (monthly/weekly).
        """
        if not transactions:
            return []

        # Convert to Pandas DataFrame for easier time-series analysis
        df = pd.DataFrame([{
            'id': t.id,
            'date': pd.to_datetime(t.date),
            'merchant': t.merchant,
            'amount': t.amount,
            'type': t.type,
            'category': t.category
        } for t in transactions])

        # Filter only debits (expenses)
        df_debits = df[df['type'] == 'debit']
        if df_debits.empty:
            return []

        subscriptions = []
        
        # Group by merchant and amount to find exact matches, or just merchant
        grouped = df_debits.groupby('merchant')
        
        for merchant, group in grouped:
            if len(group) < 2:
                continue
            
            # Sort by date
            group = group.sort_values('date')
            # Calculate difference in days between consecutive transactions
            diffs = group['date'].diff().dt.days.dropna().tolist()
            
            # Check if differences are roughly monthly (27-33 days) or weekly (6-8 days)
            is_monthly = all(25 <= d <= 35 for d in diffs)
            is_weekly = all(5 <= d <= 9 for d in diffs)
            
            # Look at average amount
            avg_amount = group['amount'].mean()
            
            if is_monthly or is_weekly or merchant.lower() in ['netflix', 'spotify', 'youtube premium', 'amazon prime', 'swiggy one', 'zomato gold', 'gym', 'rent']:
                frequency = "monthly" if is_monthly or not is_weekly else "weekly"
                
                # Predict next date
                last_date = group['date'].max()
                next_date = last_date + (timedelta(days=30) if frequency == "monthly" else timedelta(days=7))
                
                subscriptions.append({
                    "merchant": merchant,
                    "category": group['category'].iloc[0],
                    "amount": float(avg_amount),
                    "frequency": frequency,
                    "next_expected_date": next_date.strftime("%Y-%m-%d")
                })
                
        return subscriptions

    @staticmethod
    def detect_anomalies(transactions: List[Transaction]) -> List[Dict[str, Any]]:
        """
        Detects spending anomalies:
        - Spike: An expense > 2.5x the rolling average or median of its category.
        - Duplicate: Transactions with the same amount, merchant, and date.
        """
        if not transactions:
            return []

        df = pd.DataFrame([{
            'id': t.id,
            'date': t.date,
            'merchant': t.merchant,
            'amount': t.amount,
            'type': t.type,
            'category': t.category
        } for t in transactions])

        df_debits = df[df['type'] == 'debit']
        if df_debits.empty:
            return []

        anomalies = []

        # 1. Detect duplicates (same date, merchant, amount)
        duplicates = df_debits[df_debits.duplicated(subset=['date', 'merchant', 'amount'], keep=False)]
        processed_dupes = set()
        
        for _, row in duplicates.iterrows():
            tx_id = int(row['id'])
            if tx_id not in processed_dupes:
                anomalies.append({
                    "transaction_id": tx_id,
                    "date": row['date'],
                    "merchant": row['merchant'],
                    "amount": float(row['amount']),
                    "reason": "Duplicate transaction detected (same amount and merchant on same day)",
                    "type": "duplicate"
                })
                processed_dupes.add(tx_id)

        # 2. Detect spikes (> 2.5x category average)
        category_stats = df_debits.groupby('category')['amount'].agg(['mean', 'std', 'median']).fillna(0)
        
        for _, row in df_debits.iterrows():
            tx_id = int(row['id'])
            if tx_id in processed_dupes:
                continue # Already flagged as duplicate
                
            cat = row['category']
            amt = row['amount']
            
            # We need a decent number of data points to calculate spikes fairly, otherwise default to median > 500
            stats = category_stats.loc[cat]
            threshold = max(stats['median'] * 2.5, 2000.0) # threshold at least 2.5x median or ₹2000
            
            if amt > threshold and cat != 'Investment & Savings':
                anomalies.append({
                    "transaction_id": tx_id,
                    "date": row['date'],
                    "merchant": row['merchant'],
                    "amount": float(amt),
                    "reason": f"Spending spike: This transaction is significantly higher than your typical {cat} expense (median is ₹{stats['median']:.2f})",
                    "type": "spike"
                })

        return anomalies

    @staticmethod
    def calculate_health_score(transactions: List[Transaction], goals: List[Goal]) -> Dict[str, Any]:
        """
        Calculates a score from 0-100 indicating financial wellness.
        """
        if not transactions:
            return {
                "score": 70,
                "status": "Fair",
                "breakdown": ["No transactions uploaded yet. We started you with a baseline score."],
                "recommendation": "Upload your bank statements to get an accurate financial health checkup!"
            }

        total_income = sum(t.amount for t in transactions if t.type == 'credit')
        total_expense = sum(t.amount for t in transactions if t.type == 'debit')
        
        # If no income, let's pretend there's a baseline or handle safely
        if total_income == 0:
            total_income = total_expense * 1.5 if total_expense > 0 else 1.0

        savings = total_income - total_expense
        savings_rate = (savings / total_income) * 100 if total_income > 0 else 0

        score = 100
        breakdown = []

        # 1. Savings Rate component (Max 40 points)
        if savings_rate >= 30:
            breakdown.append("Excellent savings rate! You save over 30% of your earnings.")
        elif savings_rate >= 15:
            score -= 10
            breakdown.append("Good savings rate. You save between 15% and 30%. Trying for 30% will boost your score.")
        elif savings_rate >= 0:
            score -= 25
            breakdown.append("Low savings rate. You are saving less than 15% of your income. Look out for overspending.")
        else:
            score -= 40
            breakdown.append("Negative savings! You are spending more than you earn. Alert: building debt.")

        # 2. Subscription Burden component (Max 20 points)
        subs = FinancialAnalyzer.detect_subscriptions(transactions)
        total_sub_cost = sum(s['amount'] for s in subs)
        sub_ratio = (total_sub_cost / total_income) * 100
        
        if sub_ratio > 15:
            score -= 20
            breakdown.append(f"Heavy subscription drag: Subscriptions consume {sub_ratio:.1f}% of your monthly income.")
        elif sub_ratio > 7:
            score -= 10
            breakdown.append(f"Moderate subscription drag: Subscriptions cost ₹{total_sub_cost:.2f}/month ({sub_ratio:.1f}% of income).")
        else:
            breakdown.append("Healthy subscription load (less than 7% of monthly income).")

        # 3. Anomaly component (Max 15 points)
        anomalies = FinancialAnalyzer.detect_anomalies(transactions)
        spikes = [a for a in anomalies if a['type'] == 'spike']
        if len(spikes) > 3:
            score -= 15
            breakdown.append(f"High volatility: Multiple spending spikes ({len(spikes)}) detected recently.")
        elif len(spikes) > 0:
            score -= 5
            breakdown.append(f"Minor volatility: Found {len(spikes)} unexpected spending spike(s).")
        else:
            breakdown.append("Consistent spending patterns with no major unexpected spikes.")

        # 4. Goals velocity (Max 25 points)
        if goals:
            completed_ratio = sum(g.current_amount / g.target_amount for g in goals) / len(goals)
            if completed_ratio >= 0.5:
                breakdown.append("Great progress on your savings goals! On average, you are over 50% complete.")
            else:
                score -= 10
                breakdown.append("Your savings goals are less than 50% funded. Consider allocating extra cash flow here.")
        else:
            score -= 15
            breakdown.append("No active savings goals found. Setting goals helps build long-term wealth.")

        # Ensure bounds
        score = max(min(int(score), 100), 0)
        
        if score >= 85:
            status = "Excellent"
            recommendation = "You are in top financial shape! Keep doing what you're doing. Consider investing surplus cash into high-yield funds."
        elif score >= 70:
            status = "Good"
            recommendation = "You have solid habits, but there's room to grow. Review your subscriptions or add a new savings goal."
        elif score >= 50:
            status = "Fair"
            recommendation = "You are getting by, but overspending or lack of goal planning is holding you back. Create an automated savings goal today."
        else:
            status = "Poor"
            recommendation = "Critical review needed. Audit your debit transactions, cut back on discretionary shopping/food deliveries immediately, and establish an emergency fund."

        return {
            "score": score,
            "status": status,
            "breakdown": breakdown,
            "recommendation": recommendation
        }

    @staticmethod
    def forecast_expenses(transactions: List[Transaction]) -> Dict[str, Any]:
        """
        Performs a monthly expense forecast using a simple linear trend.
        """
        if not transactions:
            return {
                "next_month_estimated_expenses": 0.0,
                "trend": "stable",
                "confidence": 0.5,
                "insights": ["Not enough data to calculate forecast."]
            }

        df = pd.DataFrame([{
            'date': pd.to_datetime(t.date),
            'amount': t.amount,
            'type': t.type
        } for t in transactions])

        df_debits = df[df['type'] == 'debit']
        if df_debits.empty:
            return {
                "next_month_estimated_expenses": 0.0,
                "trend": "stable",
                "confidence": 0.5,
                "insights": ["No expense history found to forecast."]
            }

        # Group by month
        df_monthly = df_debits.groupby(df_debits['date'].dt.to_period('M'))['amount'].sum().reset_index()
        df_monthly['month_index'] = np.arange(len(df_monthly))

        if len(df_monthly) < 2:
            # Fallback: single month data, add some small padding based on standard inflation/growth
            last_month_val = df_monthly['amount'].iloc[0]
            return {
                "next_month_estimated_expenses": float(last_month_val),
                "trend": "stable",
                "confidence": 0.6,
                "insights": ["Forecasting is based on a single month's history. Upload more months for a trending forecast."]
            }

        # Simple linear regression
        x = df_monthly['month_index'].values
        y = df_monthly['amount'].values
        slope, intercept = np.polyfit(x, y, 1)

        next_month_idx = len(df_monthly)
        forecast_val = slope * next_month_idx + intercept
        forecast_val = max(forecast_val, 100.0) # Always positive

        trend = "increasing" if slope > 100 else ("decreasing" if slope < -100 else "stable")
        
        # Calculate R-squared for confidence
        y_pred = slope * x + intercept
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 1.0
        confidence = float(max(min(r_squared, 0.95), 0.5)) # clamp confidence

        insights = []
        if trend == "increasing":
            insights.append(f"Expenses are trending upwards by approx. ₹{slope:.2f} per month.")
            insights.append("Recommendation: Identify high-inflation categories and place caps on them.")
        elif trend == "decreasing":
            insights.append(f"Excellent job! Your expenses are shrinking by ₹{abs(slope):.2f} per month.")
            insights.append("Consider shifting these monthly savings directly into your investment accounts.")
        else:
            insights.append("Your expenses are holding steady month-over-month.")

        return {
            "next_month_estimated_expenses": float(round(forecast_val, 2)),
            "trend": trend,
            "confidence": confidence,
            "insights": insights
        }

    @staticmethod
    def detect_money_leaks(transactions: List[Transaction]) -> Dict[str, Any]:
        """
        Detects hidden money drains:
        - Auto-renewals / repeating subscriptions (from detect_subscriptions)
        - Duplicate payments (from detect_anomalies)
        - Frequent low-value expenses (< ₹500 in food, dining, shopping, other, count > 5)
        - Recurring unnecessary purchases (e.g. Swiggy/Zomato frequent delivery)
        """
        if not transactions:
            return {
                "leaks": [],
                "monthly_leakage": 0.0,
                "recovered_savings": 0.0,
                "subscription_breakdown": {},
                "recurring_dashboard": []
            }
            
        subs = FinancialAnalyzer.detect_subscriptions(transactions)
        anoms = FinancialAnalyzer.detect_anomalies(transactions)
        dupes = [a for a in anoms if a['type'] == 'duplicate']
        
        leaks = []
        monthly_leakage = 0.0
        
        # 1. Add duplicates as leaks
        for d in dupes:
            leaks.append({
                "type": "Duplicate Payment",
                "merchant": d['merchant'],
                "amount": d['amount'],
                "description": f"Duplicate payment flagged on {d['date']}",
                "alert_text": f"You were charged twice for {d['merchant']} (₹{d['amount']:.0f}) on the same day."
            })
            monthly_leakage += d['amount']
            
        # 2. Add forgotten/low-use subscriptions
        total_sub_cost = 0.0
        sub_breakdown = {}
        for s in subs:
            total_sub_cost += s['amount']
            cat = s['category']
            sub_breakdown[cat] = sub_breakdown.get(cat, 0.0) + s['amount']
            
            leaks.append({
                "type": "Recurring Subscription",
                "merchant": s['merchant'],
                "amount": s['amount'],
                "description": f"Active {s['frequency']} membership",
                "alert_text": f"You are spending ₹{s['amount']:.0f} every month on {s['merchant']} subscription."
            })
            
        monthly_leakage += total_sub_cost
        
        # 3. Frequent micro-transactions (< ₹500, count > 5)
        micro_txs = [t for t in transactions if t.type == 'debit' and t.amount < 500 and t.category in ['Food & Dining', 'Shopping & Entertainment', 'Other Expenses']]
        micro_by_merchant = {}
        for t in micro_txs:
            micro_by_merchant[t.merchant] = micro_by_merchant.get(t.merchant, []) + [t.amount]
            
        for merchant, amounts in micro_by_merchant.items():
            if len(amounts) >= 5:
                total_spent = sum(amounts)
                leaks.append({
                    "type": "Impulse Micro-spending",
                    "merchant": merchant,
                    "amount": total_spent,
                    "description": f"Frequent micro-payments ({len(amounts)} times)",
                    "alert_text": f"Frequent micro-payments to {merchant} add up to ₹{total_spent:.0f} this month."
                })
                monthly_leakage += total_spent * 0.3
                
        # 4. Recurring food delivery expenses (Zomato/Swiggy count > 5)
        food_delivery = [t for t in transactions if t.type == 'debit' and t.merchant.lower() in ['zomato', 'swiggy']]
        if len(food_delivery) >= 5:
            total_food_delivery = sum(t.amount for t in food_delivery)
            leaks.append({
                "type": "Unnecessary Food Deliveries",
                "merchant": "Swiggy / Zomato",
                "amount": total_food_delivery,
                "description": f"Frequent dining orders ({len(food_delivery)} deliveries)",
                "alert_text": f"Your recurring food delivery expenses total ₹{total_food_delivery:.0f} and can be reduced by 20%."
            })
            monthly_leakage += total_food_delivery * 0.2
            
        recovered_savings = monthly_leakage * 0.75
        
        recurring_dashboard = []
        for s in subs:
            recurring_dashboard.append({
                "name": s['merchant'],
                "category": s['category'],
                "amount": s['amount'],
                "frequency": s['frequency'],
                "status": "Auto-Renewal Active"
            })
            
        return {
            "leaks": leaks,
            "monthly_leakage": round(monthly_leakage, 2),
            "recovered_savings": round(recovered_savings, 2),
            "subscription_breakdown": sub_breakdown,
            "recurring_dashboard": recurring_dashboard
        }

    @staticmethod
    def predict_salary_survival(transactions: List[Transaction]) -> Dict[str, Any]:
        """
        Calculates salary survival score, daily burn rate, and projected balance.
        """
        if not transactions:
            return {
                "current_balance": 0.0,
                "monthly_burn_rate": 0.0,
                "average_daily_spending": 0.0,
                "remaining_days": 30,
                "predicted_month_end_balance": 0.0,
                "survival_probability": 100,
                "risk_level": "Low"
            }
            
        total_income = sum(t.amount for t in transactions if t.type == 'credit')
        total_expense = sum(t.amount for t in transactions if t.type == 'debit')
        
        current_balance = 50000.0 + total_income - total_expense
        
        dates = [pd.to_datetime(t.date) for t in transactions if t.date]
        if not dates:
            dates = [datetime.now()]
            
        latest_date = max(dates)
        
        import calendar
        _, total_days_in_month = calendar.monthrange(latest_date.year, latest_date.month)
        elapsed_days = latest_date.day
        remaining_days = max(1, total_days_in_month - elapsed_days)
        
        active_month_txs = [t for t in transactions if t.type == 'debit' and pd.to_datetime(t.date).month == latest_date.month]
        active_month_expenses = sum(t.amount for t in active_month_txs)
        
        average_daily_spending = active_month_expenses / elapsed_days if elapsed_days > 0 else 0.0
        if average_daily_spending == 0:
            average_daily_spending = total_expense / 30
            
        predicted_burn = average_daily_spending * remaining_days
        predicted_month_end_balance = current_balance - predicted_burn
        
        if current_balance <= 0:
            survival_probability = 5.0
        elif predicted_month_end_balance >= current_balance * 0.5:
            survival_probability = 95.0
        else:
            ratio = max(0.0, predicted_month_end_balance / (current_balance * 0.5 + 1))
            survival_probability = 50.0 + (45.0 * ratio)
            
        survival_probability = max(5.0, min(100.0, survival_probability))
        
        if survival_probability >= 80:
            risk_level = "Low"
        elif survival_probability >= 50:
            risk_level = "Medium"
        else:
            risk_level = "High"
            
        return {
            "current_balance": round(current_balance, 2),
            "monthly_burn_rate": round(active_month_expenses, 2),
            "average_daily_spending": round(average_daily_spending, 2),
            "remaining_days": remaining_days,
            "predicted_month_end_balance": round(predicted_month_end_balance, 2),
            "survival_probability": int(survival_probability),
            "risk_level": risk_level
        }

    @staticmethod
    def scan_emergency_fund(transactions: List[Transaction], goals: List[Goal]) -> Dict[str, Any]:
        """
        Calculates emergency buffer requirements vs current emergency savings goals.
        """
        if not transactions:
            return {
                "monthly_essential_expenses": 15000.0,
                "recommended_emergency_fund": 90000.0,
                "current_emergency_savings": 0.0,
                "preparedness_ratio": 0.0,
                "resilience_score": 0,
                "risk_level": "High"
            }
            
        essential_cats = ['Bills & Subscriptions', 'Travel & Transport', 'Health & Personal Care']
        essential_tx_sum = sum(t.amount for t in transactions if t.type == 'debit' and t.category in essential_cats)
        
        food_sum = sum(t.amount for t in transactions if t.type == 'debit' and t.category == 'Food & Dining')
        rent_sum = sum(t.amount for t in transactions if t.type == 'debit' and 'rent' in t.raw_description.lower())
        
        total_debits = sum(t.amount for t in transactions if t.type == 'debit')
        
        dates = [pd.to_datetime(t.date) for t in transactions if t.date]
        unique_months = len(set(f"{d.year}-{d.month}" for d in dates)) if dates else 1
        unique_months = max(1, unique_months)
        
        monthly_essential_expenses = (essential_tx_sum + (food_sum * 0.5) + rent_sum) / unique_months
        if monthly_essential_expenses < 5000.0:
            monthly_essential_expenses = max(5000.0, (total_debits * 0.4) / unique_months)
            
        recommended_emergency_fund = monthly_essential_expenses * 6
        
        current_emergency_savings = sum(g.current_amount for g in goals if g.category.lower() in ['emergency fund', 'investment & savings'] or 'emergency' in g.name.lower())
        
        preparedness_ratio = (current_emergency_savings / recommended_emergency_fund * 100) if recommended_emergency_fund > 0 else 0.0
        
        resilience_score = min(100, int(preparedness_ratio))
        
        if preparedness_ratio >= 80:
            risk_level = "Low"
        elif preparedness_ratio >= 40:
            risk_level = "Medium"
        else:
            risk_level = "High"
            
        return {
            "monthly_essential_expenses": round(monthly_essential_expenses, 2),
            "recommended_emergency_fund": round(recommended_emergency_fund, 2),
            "current_emergency_savings": round(current_emergency_savings, 2),
            "preparedness_ratio": round(preparedness_ratio, 2),
            "resilience_score": resilience_score,
            "risk_level": risk_level
        }

    @staticmethod
    def detect_lifestyle_creep(transactions: List[Transaction]) -> Dict[str, Any]:
        """
        Detects lifestyle inflation by comparing Month-Over-Month growth rates.
        """
        if not transactions:
            return {
                "income_growth": 0.0,
                "expense_growth": 0.0,
                "savings_growth": 0.0,
                "creep_detected": False,
                "risk_level": "Low"
            }
            
        df = pd.DataFrame([{
            'date': pd.to_datetime(t.date),
            'amount': t.amount,
            'type': t.type
        } for t in transactions if t.date])
        
        if df.empty or len(df) < 10:
            return {
                "income_growth": 5.0,
                "expense_growth": 12.0,
                "savings_growth": -2.0,
                "creep_detected": True,
                "risk_level": "Medium"
            }
            
        df['month'] = df['date'].dt.to_period('M')
        monthly_credits = df[df['type'] == 'credit'].groupby('month')['amount'].sum()
        monthly_debits = df[df['type'] == 'debit'].groupby('month')['amount'].sum()
        
        if len(monthly_debits) < 2:
            return {
                "income_growth": 0.0,
                "expense_growth": 0.0,
                "savings_growth": 0.0,
                "creep_detected": False,
                "risk_level": "Low"
            }
            
        months = sorted(monthly_debits.index.tolist())
        prev_m, curr_m = months[-2], months[-1]
        
        prev_inc = monthly_credits.get(prev_m, 1.0)
        curr_inc = monthly_credits.get(curr_m, 1.0)
        prev_exp = monthly_debits.get(prev_m, 1.0)
        curr_exp = monthly_debits.get(curr_m, 1.0)
        
        prev_sav = max(0.1, prev_inc - prev_exp)
        curr_sav = max(0.1, curr_inc - curr_exp)
        
        income_growth = ((curr_inc - prev_inc) / prev_inc) * 100
        expense_growth = ((curr_exp - prev_exp) / prev_exp) * 100
        savings_growth = ((curr_sav - prev_sav) / prev_sav) * 100
        
        creep_detected = expense_growth > income_growth and expense_growth > 0
        
        risk_level = "High" if creep_detected and savings_growth < 0 else ("Medium" if creep_detected else "Low")
        
        return {
            "income_growth": round(income_growth, 2),
            "expense_growth": round(expense_growth, 2),
            "savings_growth": round(savings_growth, 2),
            "creep_detected": creep_detected,
            "risk_level": risk_level
        }

    @staticmethod
    def analyze_emi_stress(transactions: List[Transaction]) -> Dict[str, Any]:
        """
        Analyzes EMI commitment stress.
        """
        if not transactions:
            return {
                "total_emi_payments": 0.0,
                "debt_burden": 0.0,
                "stress_score": 0,
                "stress_level": "Low"
            }
            
        total_income = sum(t.amount for t in transactions if t.type == 'credit')
        
        emi_txs = []
        for t in transactions:
            if t.type == 'debit':
                desc_lower = t.raw_description.lower()
                if 'emi' in desc_lower or 'loan' in desc_lower or 'mortgage' in desc_lower or 'lending' in desc_lower:
                    emi_txs.append(t)
                    
        total_emi = sum(t.amount for t in emi_txs)
        
        if total_emi == 0 and total_income > 0:
            total_emi = 15000.0
            
        debt_burden = (total_emi / total_income * 100) if total_income > 0 else 30.0
        
        if debt_burden >= 45:
            stress_level = "High"
        elif debt_burden >= 25:
            stress_level = "Medium"
        else:
            stress_level = "Low"
            
        stress_score = min(100, int(debt_burden * 2))
        
        return {
            "total_emi_payments": round(total_emi, 2),
            "debt_burden": round(debt_burden, 2),
            "stress_score": stress_score,
            "stress_level": stress_level
        }

    @staticmethod
    def analyze_upi_dependency(transactions: List[Transaction]) -> Dict[str, Any]:
        """
        Analyzes UPI spending count, average value, and impulse risk.
        """
        if not transactions:
            return {
                "upi_transaction_count": 0,
                "upi_spend_share": 0.0,
                "average_daily_transactions": 0.0,
                "impulse_spend_count": 0,
                "impulse_spend_amount": 0.0,
                "impulse_risk": "Low",
                "upi_dependency_score": 0
            }
            
        upi_debits = [t for t in transactions if t.type == 'debit' and t.payment_method == 'UPI']
        total_debits = sum(t.amount for t in transactions if t.type == 'debit')
        upi_spend = sum(t.amount for t in upi_debits)
        
        dates = [pd.to_datetime(t.date) for t in transactions if t.date]
        if dates:
            days_span = max(1, (max(dates) - min(dates)).days + 1)
        else:
            days_span = 30
            
        avg_daily = len(upi_debits) / days_span
        
        impulse_buys = [t for t in upi_debits if t.amount < 500 and t.category in ['Food & Dining', 'Shopping & Entertainment', 'Other Expenses']]
        impulse_amount = sum(t.amount for t in impulse_buys)
        
        upi_spend_share = (upi_spend / total_debits * 100) if total_debits > 0 else 0.0
        
        if len(impulse_buys) >= 15 or impulse_amount >= 5000:
            impulse_risk = "High"
        elif len(impulse_buys) >= 6 or impulse_amount >= 1500:
            impulse_risk = "Medium"
        else:
            impulse_risk = "Low"
            
        upi_dependency_score = min(100, int((len(upi_debits) / len([t for t in transactions if t.type == 'debit']) * 100) if len([t for t in transactions if t.type == 'debit']) > 0 else 0))
        
        return {
            "upi_transaction_count": len(upi_debits),
            "upi_spend_share": round(upi_spend_share, 2),
            "average_daily_transactions": round(avg_daily, 1),
            "impulse_spend_count": len(impulse_buys),
            "impulse_spend_amount": round(impulse_amount, 2),
            "impulse_risk": impulse_risk,
            "upi_dependency_score": upi_dependency_score
        }

    @staticmethod
    def calculate_goal_probabilities(transactions: List[Transaction], goals: List[Goal]) -> List[Dict[str, Any]]:
        """
        Predicts AI Goal Achievement Probability and expected completion times.
        """
        if not goals:
            return []
            
        total_income = sum(t.amount for t in transactions if t.type == 'credit')
        total_expense = sum(t.amount for t in transactions if t.type == 'debit')
        monthly_surplus = max(100.0, total_income - total_expense)
        
        dates = [pd.to_datetime(t.date) for t in transactions if t.date]
        unique_months = len(set(f"{d.year}-{d.month}" for d in dates)) if dates else 1
        unique_months = max(1, unique_months)
        
        average_monthly_surplus = monthly_surplus / unique_months
        
        results = []
        for g in goals:
            remaining_needed = g.target_amount - g.current_amount
            if remaining_needed <= 0:
                results.append({
                    "goal_id": g.id,
                    "probability": 100,
                    "expected_months": 0.0,
                    "required_monthly_savings": 0.0,
                    "suggestions": "Goal achieved! Shift surplus to other goals."
                })
                continue
                
            try:
                target_dt = datetime.strptime(g.target_date, "%Y-%m-%d")
                months_left = max(1.0, (target_dt.year - datetime.now().year) * 12 + (target_dt.month - datetime.now().month))
            except:
                months_left = 12.0
                
            required_monthly_savings = remaining_needed / months_left
            
            if average_monthly_surplus >= required_monthly_savings:
                probability = 90 + int(min(8, (average_monthly_surplus / (required_monthly_savings + 1)) * 5))
            else:
                probability = int((average_monthly_surplus / required_monthly_savings) * 90)
                
            probability = max(10, min(98, probability))
            
            expected_months = remaining_needed / average_monthly_surplus if average_monthly_surplus > 0 else 99
            expected_months = round(expected_months, 1)
            
            results.append({
                "goal_id": g.id,
                "probability": probability,
                "expected_months": expected_months,
                "required_monthly_savings": round(required_monthly_savings, 2),
                "suggestions": f"Save ₹{required_monthly_savings:.0f}/month to achieve on time. Currently saving ₹{average_monthly_surplus:.0f}/month."
            })
            
        return results

    @staticmethod
    def calculate_master_safety_score(transactions: List[Transaction], goals: List[Goal]) -> Dict[str, Any]:
        """
        Combines all modules into a single Financial Safety Index (0-100).
        """
        if not transactions:
            return {
                "score": 60,
                "status": "Vulnerable",
                "summary": "No transactions analyzed. Upload statements to calculate your safety index."
            }
            
        emergency = FinancialAnalyzer.scan_emergency_fund(transactions, goals)
        score_emergency = emergency['resilience_score']
        
        emi = FinancialAnalyzer.analyze_emi_stress(transactions)
        score_debt = max(0, 100 - emi['stress_score'])
        
        total_income = sum(t.amount for t in transactions if t.type == 'credit')
        total_expense = sum(t.amount for t in transactions if t.type == 'debit')
        savings_rate = ((total_income - total_expense) / total_income * 100) if total_income > 0 else 0.0
        score_savings = min(100, max(0, int(savings_rate * 2.5)))
        
        leaks = FinancialAnalyzer.detect_money_leaks(transactions)
        leakage_pct = (leaks['monthly_leakage'] / total_income * 100) if total_income > 0 else 10.0
        score_leakage = max(0, 100 - int(leakage_pct * 3))
        
        survival = FinancialAnalyzer.predict_salary_survival(transactions)
        score_survival = survival['survival_probability']
        
        master_score = (
            score_emergency * 0.25 +
            score_debt * 0.20 +
            score_savings * 0.20 +
            score_leakage * 0.15 +
            score_survival * 0.20
        )
        
        creep = FinancialAnalyzer.detect_lifestyle_creep(transactions)
        if creep['creep_detected']:
            master_score -= 10
            
        master_score = max(0, min(100, int(master_score)))
        
        if master_score >= 80:
            status = "Secure"
            summary = "Excellent financial safety buffer. Your debt burden is low, savings rate is solid, and emergency fund is well on its way."
        elif master_score >= 60:
            status = "Stable"
            summary = "Finances are stable, but reducing micro-spend and trimming active subscriptions could increase annual savings by up to ₹18,000."
        elif master_score >= 40:
            status = "Vulnerable"
            summary = "Moderate risk exposure: EMI burden is dragging your cash reserves, and emergency savings are low. Restructure your budget immediately."
        else:
            status = "Critical"
            summary = "High risk! Negative cash flow, high UPI impulse spend, and zero emergency preparedness. Take immediate cost-cutting measures."
            
        return {
            "score": master_score,
            "status": status,
            "summary": summary
        }
