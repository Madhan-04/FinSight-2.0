import os
import json
import logging
import requests
import base64
from typing import Dict, Any, List

logger = logging.getLogger("uvicorn")

class NvidiaService:
    API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
    API_KEY = os.getenv("NVIDIA_API_KEY", "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")
    
    TEXT_MODEL = "meta/llama-3.1-70b-instruct"
    VISION_MODEL = "meta/llama-3.2-11b-vision-instruct"
    
    _recommendation_cache = {}

    @classmethod
    def _call_nvidia_nim(cls, messages: List[Dict[str, Any]], model: str, json_mode: bool = False) -> str:
        """
        Helper method to call the NVIDIA NIM API with header authorization and payload.
        """
        headers = {
            "Authorization": f"Bearer {cls.API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 2048
        }
        
        # If model supports response_format, we can pass it (Llama NIM supports JSON format instructions)
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        try:
            logger.info(f"Invoking NVIDIA NIM model: {model}")
            res = requests.post(cls.API_URL, headers=headers, json=payload, timeout=2.5)
            if res.status_code != 200:
                logger.error(f"NVIDIA NIM API Error {res.status_code}: {res.text}")
                raise Exception(f"NVIDIA API responded with status {res.status_code}")
                
            data = res.json()
            return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.error(f"Failed to communicate with NVIDIA NIM: {str(e)}")
            raise e

    @classmethod
    def parse_statement(cls, file_bytes: bytes, file_name: str, mime_type: str, password: str = None) -> Dict[str, Any]:
        """
        Parses statement files using NVIDIA NIM.
        - Spreadsheets/CSVs are converted to text and parsed using Text LLM.
        - Images/PDFs are base64 encoded and parsed using Vision LLM.
        """
        try:
            # If it is a PDF file, try to extract text and parse using Llama-3.1
            if file_name.lower().endswith('.pdf'):
                import io
                from pypdf import PdfReader
                
                logger.info(f"Using pypdf text extractor for PDF: {file_name}")
                pdf_file = io.BytesIO(file_bytes)
                reader = PdfReader(pdf_file)
                if reader.is_encrypted and password:
                    reader.decrypt(password)
                    
                pdf_text = ""
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        pdf_text += text + "\n"
                        
                if pdf_text.strip():
                    logger.info(f"Extracted {len(pdf_text)} characters of text. Invoking Llama-3.1 Text model to parse transactions.")
                    prompt = f"""
                    You are an expert bank statement parser. Extract all transaction details from the text below.
                    Return a JSON structure matching this schema:
                    {{
                      "bank_name": "Name of the Bank",
                      "statement_period": "Start Date to End Date",
                      "transactions": [
                        {{
                          "date": "YYYY-MM-DD",
                          "raw_description": "Raw transaction text description",
                          "merchant": "Cleaned Merchant Name",
                          "amount": float,
                          "type": "debit" or "credit",
                          "category": "One of: Income, Food & Dining, Shopping & Entertainment, Bills & Subscriptions, Investment & Savings, Transfers, Travel & Transport, Health & Personal Care, Other Expenses",
                          "payment_method": "One of: UPI, NetBanking, Debit Card, Credit Card, Cash, Other",
                          "is_recurring": boolean
                        }}
                      ]
                    }}

                    Input Text:
                    {pdf_text[:8000]}
                    """
                    messages = [{"role": "user", "content": prompt}]
                    response_content = cls._call_nvidia_nim(messages, cls.TEXT_MODEL, json_mode=True)
                    
                    # Clean and parse JSON
                    response_content = response_content.strip()
                    if response_content.startswith("```"):
                        lines = response_content.splitlines()
                        if lines[0].startswith("```"): lines = lines[1:]
                        if lines[-1].startswith("```"): lines = lines[:-1]
                        response_content = "\n".join(lines).strip()
                        
                    return json.loads(response_content)

            is_text_data = file_name.endswith('.csv') or file_name.endswith('.xlsx') or file_name.endswith('.xls')
            
            if is_text_data:
                import pandas as pd
                import io
                import re
                from datetime import datetime
                
                logger.info(f"Using local pandas parser for spreadsheet: {file_name}")
                if file_name.endswith('.csv'):
                    df = pd.read_csv(io.BytesIO(file_bytes))
                else:
                    df = pd.read_excel(io.BytesIO(file_bytes))
                
                # Clean columns: make them lowercase strings
                orig_cols = list(df.columns)
                cols = [str(c).strip().lower() for c in orig_cols]
                df.columns = cols
                
                # 1. Identify critical columns
                date_col = None
                for c in cols:
                    if 'date' in c or 'dt' in c:
                        date_col = c
                        break
                if not date_col:
                    date_col = cols[0]
                    
                desc_col = None
                for c in cols:
                    if any(x in c for x in ['desc', 'particular', 'remark', 'narrat', 'detail', 'merchant', 'info']):
                        desc_col = c
                        break
                if not desc_col:
                    desc_col = cols[1] if len(cols) > 1 else cols[0]
                    
                debit_col = None
                credit_col = None
                amount_col = None
                type_col = None
                
                for c in cols:
                    if 'debit' in c or 'withdraw' in c or 'outflow' in c:
                        debit_col = c
                    elif 'credit' in c or 'deposit' in c or 'inflow' in c:
                        credit_col = c
                    elif 'amount' in c or 'val' in c:
                        amount_col = c
                    elif 'type' in c or 'd/c' in c or 'cr/dr' in c:
                        type_col = c
                
                if not debit_col and not credit_col and not amount_col:
                    numeric_cols = []
                    for c in cols:
                        if df[c].dtype in ['float64', 'int64']:
                            numeric_cols.append(c)
                    if len(numeric_cols) >= 2:
                        debit_col = numeric_cols[0]
                        credit_col = numeric_cols[1]
                    elif len(numeric_cols) == 1:
                        amount_col = numeric_cols[0]
                    else:
                        amount_col = cols[-1]
                
                transactions_list = []
                
                def clean_amount(val):
                    if pd.isna(val):
                        return 0.0
                    if isinstance(val, (int, float)):
                        return float(val)
                    s = str(val).replace(',', '').strip()
                    m = re.search(r'[-+]?\d*\.\d+|\d+', s)
                    return float(m.group()) if m else 0.0
                
                def format_date(val):
                    if pd.isna(val):
                        return datetime.now().strftime("%Y-%m-%d")
                    if isinstance(val, (datetime, pd.Timestamp)):
                        return val.strftime("%Y-%m-%d")
                    s = str(val).strip()
                    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y", "%d-%b-%Y", "%d-%B-%Y", "%Y/%m/%d"):
                        try:
                            # clean possible time suffix
                            s_clean = s.split()[0] if ' ' in s else s
                            return datetime.strptime(s_clean, fmt).strftime("%Y-%m-%d")
                        except ValueError:
                            continue
                    # extraction regex fallback
                    m = re.search(r'(\d{1,4})[-/](\d{1,2}|[a-zA-Z]{3})[-/](\d{1,4})', s)
                    if m:
                        return s
                    return s
                
                def classify_transaction(desc_str):
                    desc_lower = desc_str.lower()
                    if any(x in desc_lower for x in ['salary', 'pay', 'credit', 'dividend', 'inward', 'interest']):
                        return 'Income', 'Income'
                    elif any(x in desc_lower for x in ['zomato', 'swiggy', 'food', 'restaurant', 'cafe', 'starbucks', 'dine', 'hotel', 'eats']):
                        return 'Food & Dining', 'Zomato/Swiggy'
                    elif any(x in desc_lower for x in ['amazon', 'flipkart', 'myntra', 'shopping', 'retail', 'pos', 'apple store']):
                        return 'Shopping & Entertainment', 'Amazon/Retail'
                    elif any(x in desc_lower for x in ['netflix', 'spotify', 'rent', 'bill', 'recharge', 'electricity', 'broadband', 'jio', 'airtel', 'subscription', 'youtube']):
                        return 'Bills & Subscriptions', 'Subscriptions'
                    elif any(x in desc_lower for x in ['mutual fund', 'sip', 'nippon', 'hdfc mutual', 'zerodha', 'groww', 'investment', 'savings', 'fd', 'stocks']):
                        return 'Investment & Savings', 'Mutual Fund'
                    elif any(x in desc_lower for x in ['uber', 'ola', 'cab', 'ride', 'travel', 'rail', 'flight', 'petrol', 'fuel', 'metro']):
                        return 'Travel & Transport', 'Transport/Ride'
                    elif any(x in desc_lower for x in ['apollo', 'pharmacy', 'hospital', 'medical', 'doctor', 'health']):
                        return 'Health & Personal Care', 'Apollo Pharmacy'
                    elif any(x in desc_lower for x in ['transfer', 'self', 'to a/c', 'paytm', 'phonepe', 'upi', 'tfr']):
                        return 'Transfers', 'UPI Transfer'
                    else:
                        return 'Other Expenses', 'Other Merchant'
                
                def clean_merchant(desc_str, category):
                    desc_lower = desc_str.lower()
                    for m in ['zomato', 'swiggy', 'uber', 'ola', 'amazon', 'flipkart', 'netflix', 'spotify', 'starbucks', 'apollo', 'cult.fit', 'google']:
                        if m in desc_lower:
                            return m.capitalize()
                    upi_match = re.search(r'upi/dr/([^/]+)', desc_lower)
                    if upi_match:
                        return upi_match.group(1).upper()
                    words = desc_str.split()
                    return " ".join(words[:2]) if len(words) > 1 else desc_str
                
                for idx, row in df.iterrows():
                    desc_val = str(row[desc_col]).strip()
                    if desc_val == 'nan' or not desc_val:
                        continue
                    
                    amount = 0.0
                    tx_type = 'debit'
                    
                    if debit_col and credit_col:
                        deb_val = row[debit_col]
                        cred_val = row[credit_col]
                        
                        deb_amt = clean_amount(deb_val)
                        cred_amt = clean_amount(cred_val)
                        
                        if cred_amt > 0:
                            amount = cred_amt
                            tx_type = 'credit'
                        elif deb_amt > 0:
                            amount = deb_amt
                            tx_type = 'debit'
                    elif amount_col:
                        amt_val = row[amount_col]
                        amount = clean_amount(amt_val)
                        
                        if type_col:
                            t_val = str(row[type_col]).strip().lower()
                            if any(x in t_val for x in ['cr', 'credit', 'deposit', '+']):
                                tx_type = 'credit'
                            else:
                                tx_type = 'debit'
                        else:
                            if amount < 0:
                                amount = abs(amount)
                                tx_type = 'debit'
                            else:
                                if any(x in desc_val.lower() for x in ['salary', 'refund', 'credit', 'interest']):
                                    tx_type = 'credit'
                                else:
                                    tx_type = 'debit'
                    
                    if amount == 0:
                        continue
                        
                    date_val = format_date(row[date_col])
                    category, fallback_merchant = classify_transaction(desc_val)
                    merchant = clean_merchant(desc_val, category)
                    
                    pm = 'Other'
                    desc_upper = desc_val.upper()
                    if 'UPI' in desc_upper:
                        pm = 'UPI'
                    elif 'CARD' in desc_upper or 'POS' in desc_upper:
                        pm = 'Credit Card' if 'CREDIT' in desc_upper else 'Debit Card'
                    elif any(x in desc_upper for x in ['NETBANKING', 'IMPS', 'NEFT', 'RTGS', 'TFR']):
                        pm = 'NetBanking'
                    elif 'CASH' in desc_upper:
                        pm = 'Cash'
                        
                    transactions_list.append({
                        "date": date_val,
                        "raw_description": desc_val,
                        "merchant": merchant,
                        "amount": amount,
                        "type": tx_type,
                        "category": category,
                        "payment_method": pm,
                        "is_recurring": any(x in desc_val.lower() for x in ['netflix', 'spotify', 'rent', 'sip', 'emi', 'loan'])
                    })
                
                try:
                    transactions_list.sort(key=lambda x: x['date'], reverse=True)
                except:
                    pass
                
                dates = [t['date'] for t in transactions_list if t['date']]
                period = "Unknown Period"
                if dates:
                    try:
                        min_date = min(dates)
                        max_date = max(dates)
                        d1 = datetime.strptime(min_date, "%Y-%m-%d").strftime("%d-%m-%Y")
                        d2 = datetime.strptime(max_date, "%Y-%m-%d").strftime("%d-%m-%Y")
                        period = f"{d1} to {d2}"
                    except:
                        period = f"{min(dates)} to {max(dates)}"
                
                bank_name = "Imported Statement"
                desc_blob = " ".join([t['raw_description'] for t in transactions_list[:20]]).lower()
                if 'kotak' in desc_blob or 'kkbk' in desc_blob:
                    bank_name = "Kotak Mahindra Bank"
                elif 'hdfc' in desc_blob:
                    bank_name = "HDFC Bank"
                elif 'icici' in desc_blob:
                    bank_name = "ICICI Bank"
                elif 'sbi' in desc_blob or 'state bank' in desc_blob:
                    bank_name = "State Bank of India"
                
                return {
                    "bank_name": bank_name,
                    "statement_period": period,
                    "transactions": transactions_list
                }
            
            else:
                # Multimodal image analysis using Llama-3.2-Vision
                base64_image = base64.b64encode(file_bytes).decode('utf-8')
                
                # Check mime type
                clean_mime = mime_type
                if 'pdf' in mime_type:
                    # NVIDIA Vision NIM accepts images; if pdf is uploaded, fallback or convert
                    # For simplicity in local testing, map pdf to mock extraction, or assume PNG/JPG screenshot
                    clean_mime = "image/png"
                
                messages = [
                    {
                        "role": "user",
                        "content": [
                          {
                            "type": "text", 
                            "text": """
                            You are a financial document parser. Analyze this statement screenshot/image.
                            Extract all transaction rows and return a JSON structure with:
                            1. bank_name: string (e.g. HDFC, Kotak, ICICI)
                            2. statement_period: string
                            3. transactions: JSON list of objects containing:
                               - date: YYYY-MM-DD
                               - raw_description: string
                               - merchant: string (cleaned)
                               - amount: positive float
                               - type: "debit" or "credit"
                               - category: One of 'Income', 'Food & Dining', 'Shopping & Entertainment', 'Bills & Subscriptions', 'Investment & Savings', 'Transfers', 'Travel & Transport', 'Health & Personal Care', 'Other Expenses'
                               - payment_method: "UPI", "NetBanking", "Debit Card", "Credit Card", "Cash", or "Other"
                               - is_recurring: boolean
                            
                            Return raw JSON. Do not write anything else.
                            """
                          },
                          {
                            "type": "image_url",
                            "image_url": {
                              "url": f"data:{clean_mime};base64,{base64_image}"
                            }
                          }
                        ]
                    }
                ]
                
                response_content = cls._call_nvidia_nim(messages, cls.VISION_MODEL, json_mode=False)

            # Clean and parse JSON
            response_content = response_content.strip()
            if response_content.startswith("```"):
                lines = response_content.splitlines()
                if lines[0].startswith("```"): lines = lines[1:]
                if lines[-1].startswith("```"): lines = lines[:-1]
                response_content = "\n".join(lines).strip()
                
            return json.loads(response_content)

        except Exception as e:
            logger.error(f"Nvidia NIM parse failed: {str(e)}")
            # Fall back to mock result
            from app.services.gemini_service import GeminiService
            return GeminiService._generate_mock_parse_result(file_name)

    @classmethod
    def _local_chat_fallback(cls, message: str, context: Dict[str, Any], education_level: str) -> str:
        """
        Rich rule-based chat engine that answers common personal finance questions
        using the user's actual financial context. Used when NVIDIA API is unavailable.
        """
        msg = message.lower().strip()
        overview = context.get('overview', {})
        income = overview.get('total_income', 0)
        expenses = overview.get('total_expenses', 0)
        savings = overview.get('total_savings', 0)
        health = context.get('health_score', {}).get('score', 75)
        health_status = context.get('health_score', {}).get('status', 'Good')
        goals = context.get('goals', [])
        subs = context.get('subscriptions', [])

        savings_rate = round((savings / income * 100), 1) if income > 0 else 0
        expense_ratio = round((expenses / income * 100), 1) if income > 0 else 0

        beginner = education_level == 'beginner'
        advanced = education_level == 'advanced'

        # ── SIP / Mutual Funds ──────────────────────────────────────────────
        if any(k in msg for k in ['sip', 'systematic investment', 'mutual fund', 'mf', 'index fund', 'nifty', 'sensex']):
            if beginner:
                return (
                    "📈 **What is SIP? (Simple Explanation)**\n\n"
                    "SIP stands for **Systematic Investment Plan**. Imagine putting ₹500 in a piggy bank every month — but this piggy bank grows over time! 🐷\n\n"
                    "**How it works:**\n"
                    "• You invest a fixed amount (e.g. ₹1,000) every month automatically\n"
                    "• Your money buys 'units' of a mutual fund\n"
                    "• Over years, these units grow in value due to market returns\n\n"
                    "**Example:** ₹1,000/month for 10 years at 12% returns = ₹2.3 Lakhs! 🎉\n\n"
                    f"💡 **Your tip:** Since your savings are ₹{savings:,.0f}, starting a SIP of even ₹500/month is a great first step!"
                )
            elif advanced:
                return (
                    "📊 **SIP — Advanced Analysis**\n\n"
                    "SIPs leverage **Rupee Cost Averaging (RCA)** to neutralize market timing risk. During downturns, you accumulate more units at lower NAV, improving your average cost basis.\n\n"
                    "**Recommended Allocation (based on your profile):**\n"
                    "• 60% — Large Cap Index Fund (Nifty 50 / Sensex)\n"
                    "• 25% — Mid Cap Index / Flexi Cap Fund\n"
                    "• 15% — Debt Fund or Liquid Fund for rebalancing\n\n"
                    f"**Your Investable Surplus:** ₹{max(savings*0.7, 0):,.0f}/month (70% of savings ₹{savings:,.0f})\n\n"
                    "**Tax efficiency:** LTCG on equity MFs > 1 year is taxed at 12.5% (post-Budget 2024). ELSS gives 80C deduction up to ₹1.5L."
                )
            else:
                return (
                    "📈 **SIP — Your Smart Wealth Builder**\n\n"
                    "A **Systematic Investment Plan** lets you invest a fixed amount monthly in mutual funds. It's the most disciplined way to grow wealth.\n\n"
                    "**Key Benefits:**\n"
                    "✅ Rupee Cost Averaging — buy more units when markets fall\n"
                    "✅ Power of Compounding — small amounts grow big over time\n"
                    "✅ Flexible — start with as little as ₹100/month\n\n"
                    f"💡 **Based on your finances:** You save ₹{savings:,.0f}/month. Consider investing 50-70% of that in a SIP.\n\n"
                    "**Popular choices:** Nifty 50 Index Funds (low cost, broad market exposure)."
                )

        # ── Emergency Fund ──────────────────────────────────────────────────
        if any(k in msg for k in ['emergency fund', 'emergency', 'rainy day', 'safety net', 'buffer fund']):
            recommended = expenses * 6 if expenses > 0 else 90000
            gap = max(recommended - savings, 0)
            if beginner:
                return (
                    "🛡️ **Emergency Fund — Your Financial Safety Net**\n\n"
                    "An emergency fund is money you keep saved for unexpected situations — like losing your job, a medical bill, or a car repair.\n\n"
                    f"**How much do you need?** 3 to 6 months of your monthly expenses.\n"
                    f"• Your estimated monthly expenses: ₹{expenses:,.0f}\n"
                    f"• Your recommended emergency fund: ₹{recommended:,.0f}\n"
                    f"• Your current savings: ₹{savings:,.0f}\n"
                    f"• Gap to fill: ₹{gap:,.0f}\n\n"
                    "💡 Start by saving just ₹2,000/month into a separate savings account!"
                )
            else:
                return (
                    "🛡️ **Emergency Fund Status**\n\n"
                    f"**Recommended Fund (6 months of expenses):** ₹{recommended:,.0f}\n"
                    f"**Your Current Savings:** ₹{savings:,.0f}\n"
                    f"**Gap:** ₹{gap:,.0f}\n\n"
                    "**Best Instruments for Emergency Fund:**\n"
                    "• High-yield Savings Account (3-4% interest, instant access)\n"
                    "• Liquid Mutual Funds (4-5% returns, T+1 redemption)\n"
                    "• FD with sweep-in facility\n\n"
                    "💡 **Action Plan:** Automate a monthly sweep of 10% of your income to your emergency fund until you reach the target."
                )

        # ── Compound Interest ───────────────────────────────────────────────
        if any(k in msg for k in ['compound', 'compounding', 'compound interest', '8th wonder']):
            if beginner:
                return (
                    "🔄 **Compound Interest — Money Making Money!**\n\n"
                    "Imagine you plant a mango tree 🌳. Each year it grows more mangoes, and those mangoes grow MORE mango trees!\n\n"
                    "**Simple Example:**\n"
                    "• Year 1: ₹10,000 earns 10% = ₹1,000 → Total: ₹11,000\n"
                    "• Year 2: ₹11,000 earns 10% = ₹1,100 → Total: ₹12,100\n"
                    "• Year 3: ₹12,100 earns 10% = ₹1,210 → Total: ₹13,310\n\n"
                    "See how the interest itself earns interest? That's the magic! 🪄\n\n"
                    f"💡 If you invest ₹{max(savings,500):,.0f}/month starting today at 12%/year, in 10 years you'll have over ₹{max(savings,500)*0.23*10*10:,.0f}!"
                )
            else:
                return (
                    "📐 **The Power of Compounding**\n\n"
                    "Compound interest follows the formula: **A = P(1 + r/n)^(nt)**\n\n"
                    "**Real Impact Example (₹5,000 SIP @ 12% for 20 years):**\n"
                    "• Total invested: ₹12,00,000\n"
                    "• Maturity value: ₹49,95,740\n"
                    "• Wealth created: ₹37,95,740 (pure compounding!) 🚀\n\n"
                    "**Key insight:** Starting 5 years earlier can nearly double your final corpus. Time is the most powerful variable in the equation."
                )

        # ── Credit Score ─────────────────────────────────────────────────────
        if any(k in msg for k in ['credit score', 'cibil', 'credit rating', 'credit report', 'credit card']):
            return (
                "💳 **Credit Score — Your Financial Reputation**\n\n"
                "**Score Ranges (CIBIL):**\n"
                "• 750-900 → Excellent (best loan rates) ✅\n"
                "• 650-749 → Good\n"
                "• 550-649 → Fair (higher interest rates)\n"
                "• Below 550 → Poor (loan rejections likely) ❌\n\n"
                "**How to Improve Your Score:**\n"
                "1. Pay all EMIs and credit card bills on time (most important!)\n"
                "2. Keep credit utilization below 30%\n"
                "3. Don't apply for too many loans at once\n"
                "4. Keep old credit cards active (credit history length matters)\n"
                "5. Mix of credit types (home loan + credit card) helps\n\n"
                "💡 Check your free CIBIL score at **oneScore** or **Paytm** app monthly."
            )

        # ── Budget / 50-30-20 Rule ───────────────────────────────────────────
        if any(k in msg for k in ['budget', 'budgeting', '50 30 20', '50/30/20', 'allocate', 'allocation', 'spending plan']):
            need_50 = income * 0.50
            want_30 = income * 0.30
            save_20 = income * 0.20
            return (
                "💰 **The 50-30-20 Budgeting Rule**\n\n"
                f"Based on your monthly income of ₹{income:,.0f}:\n\n"
                f"**50% → Needs (₹{need_50:,.0f}):** Rent, groceries, utilities, EMIs, transport\n"
                f"**30% → Wants (₹{want_30:,.0f}):** Dining out, subscriptions, shopping, travel\n"
                f"**20% → Savings/Investments (₹{save_20:,.0f}):** SIP, FD, emergency fund, goals\n\n"
                f"**Your actual split:** Expenses {expense_ratio}% | Savings {savings_rate}%\n\n"
                + ("✅ Great balance! You're on track." if savings_rate >= 20 else f"⚠️ You're saving {savings_rate}% — aim to reach 20% by reducing discretionary spending by ₹{(save_20-savings):,.0f}/month.")
            )

        # ── Tax / Income Tax / 80C ───────────────────────────────────────────
        if any(k in msg for k in ['tax', 'income tax', '80c', 'itr', 'tds', 'tax saving', 'hra', 'nps', 'epf', 'ppf']):
            return (
                "🧾 **Tax Saving Guide (India)**\n\n"
                "**Section 80C (up to ₹1.5 Lakh deduction):**\n"
                "• ELSS Mutual Funds (tax-saving + market growth) 📈\n"
                "• PPF (15-year lock-in, 7.1% risk-free) 🏦\n"
                "• EPF contribution (already deducted for salaried)\n"
                "• Life Insurance Premium\n"
                "• Sukanya Samriddhi Yojana (for girl child)\n\n"
                "**Other Deductions:**\n"
                "• 80D: Health Insurance (up to ₹25,000, ₹50,000 for senior parents)\n"
                "• 80CCD(1B): NPS extra ₹50,000 over 80C limit\n"
                "• HRA: House Rent Allowance if renting\n"
                "• Standard Deduction: ₹75,000 (New Tax Regime, FY 2024-25)\n\n"
                "💡 **New vs Old Regime:** If your deductions exceed ₹3.75L, Old Regime saves more tax. Otherwise New Regime is simpler."
            )

        # ── EMI / Loans / Debt ───────────────────────────────────────────────
        if any(k in msg for k in ['emi', 'loan', 'debt', 'home loan', 'personal loan', 'car loan', 'prepay', 'repay']):
            return (
                "🏦 **Loan & EMI Management**\n\n"
                "**Golden Rule:** Keep total EMIs below 40% of your monthly income.\n\n"
                "**Debt Repayment Strategies:**\n"
                "1. **Avalanche Method** — Pay highest interest rate loan first (saves max money) 💰\n"
                "2. **Snowball Method** — Pay smallest loan first (builds momentum) 🎯\n"
                "3. **Prepayment** — Add ₹1,000 extra/month to principal — reduces tenure significantly\n\n"
                "**Home Loan Tips:**\n"
                "• Prepay when you have a bonus or windfall\n"
                "• Consider balance transfer if you find a rate 0.5%+ lower\n"
                "• Tax benefit: 80C on principal (₹1.5L) + 24(b) on interest (₹2L)\n\n"
                f"💡 **Your situation:** At ₹{income:,.0f} income, your safe EMI limit is ₹{income*0.4:,.0f}/month."
            )

        # ── Savings Rate / Financial Health ─────────────────────────────────
        if any(k in msg for k in ['savings', 'save more', 'saving rate', 'save money', 'how to save', 'saving tips']):
            return (
                f"💡 **Your Savings Analysis**\n\n"
                f"• Monthly Income: ₹{income:,.0f}\n"
                f"• Monthly Expenses: ₹{expenses:,.0f}\n"
                f"• Monthly Savings: ₹{savings:,.0f} ({savings_rate}% savings rate)\n\n"
                + ("✅ Excellent! A savings rate above 20% puts you in the top tier of financial health!\n\n" if savings_rate >= 20 else
                   f"⚠️ Your savings rate is {savings_rate}%. The target is 20%+. You need to save ₹{max(income*0.2-savings,0):,.0f} more/month.\n\n")
                + "**Quick Wins to Boost Savings:**\n"
                "1. 'Pay yourself first' — Auto-transfer savings on salary day\n"
                "2. Cancel unused subscriptions\n"
                "3. Reduce food delivery orders by 50%\n"
                "4. Use UPI cashback offers and reward credit cards\n"
                "5. Set a monthly dining-out budget and stick to it"
            )

        # ── Financial Health / Score ─────────────────────────────────────────
        if any(k in msg for k in ['health score', 'financial health', 'score', 'how am i doing', 'financial status']):
            return (
                f"📊 **Your Financial Health Report**\n\n"
                f"**Overall Score: {health}/100 — {health_status}**\n\n"
                f"• Monthly Income: ₹{income:,.0f}\n"
                f"• Monthly Expenses: ₹{expenses:,.0f} ({expense_ratio}% of income)\n"
                f"• Monthly Savings: ₹{savings:,.0f} ({savings_rate}% savings rate)\n"
                + (f"• Active Goals: {len(goals)} goal(s) in progress\n" if goals else "• No active savings goals yet\n")
                + (f"• Subscriptions: {len(subs)} tracked\n\n" if subs else "\n")
                + ("✅ You're in great financial shape! Keep investing consistently." if health >= 70 else
                   "⚠️ There's room for improvement. Focus on reducing discretionary expenses and building your emergency fund.")
            )

        # ── Goals ────────────────────────────────────────────────────────────
        if any(k in msg for k in ['goal', 'target', 'dream', 'vacation', 'car', 'house', 'saving for']):
            if goals:
                goal_text = "\n".join([f"• **{g['name']}**: ₹{g['current']:,.0f} / ₹{g['target']:,.0f} ({round(g['current']/g['target']*100,1) if g['target'] > 0 else 0}%)" for g in goals[:5]])
                return (
                    f"🎯 **Your Savings Goals**\n\n"
                    + goal_text + "\n\n"
                    "**Tips to Reach Goals Faster:**\n"
                    "• Link each goal to a recurring SIP or RD\n"
                    "• Redirect windfalls (bonuses, tax refunds) to goals\n"
                    "• Break large goals into quarterly milestones\n"
                    "• Review goal progress monthly — small wins keep motivation high!"
                )
            else:
                return (
                    "🎯 **Setting Financial Goals**\n\n"
                    "You haven't set any savings goals yet! Goals give direction to your money.\n\n"
                    "**Suggested Goals to Start:**\n"
                    "1. Emergency Fund (3-6 months of expenses)\n"
                    "2. Vacation Fund\n"
                    "3. Gadget / Car upgrade fund\n"
                    "4. Home Down Payment\n"
                    "5. Retirement Corpus\n\n"
                    "💡 Go to the **Goals** page to add your first goal and start tracking progress!"
                )

        # ── Subscriptions ─────────────────────────────────────────────────────
        if any(k in msg for k in ['subscription', 'netflix', 'spotify', 'amazon prime', 'ott', 'streaming', 'recurring']):
            if subs:
                sub_text = "\n".join([f"• {s.get('merchant','?')} — ₹{s.get('amount',0):,.0f}/month" for s in subs[:5]])
                total_subs = sum(s.get('amount', 0) for s in subs)
                return (
                    f"📺 **Your Active Subscriptions**\n\n"
                    + sub_text + "\n\n"
                    f"**Total monthly subscription spend: ₹{total_subs:,.0f}**\n\n"
                    "💡 **Action:** Review each subscription. Cancel any you haven't used in the last 30 days. "
                    f"Even cancelling 2 subs could save you ₹{total_subs*0.4:,.0f}/year!"
                )
            else:
                return "📺 No recurring subscriptions detected in your transactions yet. Upload more statements to get subscription tracking!"

        # ── PPF / FD / RD ─────────────────────────────────────────────────────
        if any(k in msg for k in ['ppf', 'fd', 'fixed deposit', 'rd', 'recurring deposit', 'nsc', 'post office']):
            return (
                "🏦 **Safe Investment Options (Guaranteed Returns)**\n\n"
                "| Option | Rate | Lock-in | Best For |\n"
                "|--------|------|---------|----------|\n"
                "| PPF | 7.1% | 15 years | Long-term, tax-free |\n"
                "| NSC | 7.7% | 5 years | 80C benefit |\n"
                "| FD (Bank) | 6-7.5% | 7d-10yr | Short/medium term |\n"
                "| RD | 6-7% | 6m-10yr | Monthly savers |\n"
                "| SCSS | 8.2% | 5 years | Senior citizens |\n\n"
                f"💡 For your emergency fund, a **liquid FD** or **sweep-in FD** is ideal. "
                f"For long-term goals, pair PPF with ELSS for best tax-adjusted returns."
            )

        # ── Generic financial question ────────────────────────────────────────
        summary = (
            f"📊 **Quick Financial Snapshot**\n\n"
            f"• Income: ₹{income:,.0f} | Expenses: ₹{expenses:,.0f} | Savings: ₹{savings:,.0f}\n"
            f"• Health Score: {health}/100 ({health_status})\n"
            f"• Savings Rate: {savings_rate}%\n\n"
        )

        # Generic advice based on context
        if income == 0:
            return (
                "👋 **Welcome to FinSight AI Coach!**\n\n"
                "I'm your personal financial advisor. To give you personalized advice, please **upload your bank statements** from the Statements page.\n\n"
                "**I can help you with:**\n"
                "• 📈 SIPs & Mutual Funds\n"
                "• 💳 Credit Score tips\n"
                "• 🛡️ Emergency Fund planning\n"
                "• 🧾 Tax saving strategies\n"
                "• 💰 Budgeting & savings tips\n"
                "• 🎯 Goal planning\n\n"
                "Try asking: *'What is SIP?'* or *'How do I build an emergency fund?'*"
            )

        return (
            summary +
            "I'm here to help with your finances! You can ask me about:\n"
            "• **SIPs & Mutual Funds** — how to invest\n"
            "• **Budgeting** — the 50-30-20 rule\n"
            "• **Emergency Fund** — how much to save\n"
            "• **Credit Score** — how to improve it\n"
            "• **Tax Saving** — 80C, NPS, HRA\n"
            "• **EMI & Loans** — repayment strategies\n"
            "• **Goals** — saving for dreams\n\n"
            "What would you like to know more about? 😊"
        )

    @classmethod
    def generate_chat_response(cls, message: str, history: List[Dict[str, str]], context: Dict[str, Any], education_level: str = "intermediate") -> str:
        """
        NVIDIA NIM spending coach chat responder with intelligent local fallback.
        """
        try:
            # Customize tone/explanations based on education level
            style_instruction = ""
            if education_level == "beginner":
                style_instruction = "Use extremely simple, clear, and friendly language. Avoid complex financial jargon. Explain concepts using easy-to-understand real-life analogies (e.g. explain like the user is a 15-year-old student)."
            elif education_level == "advanced":
                style_instruction = "Use professional financial terminology, provide detailed analytical breakdowns, discuss advanced investment strategies (e.g. SIP index allocation, debt structures, tax implications), and mention compounding math where appropriate."
            else:
                style_instruction = "Provide balanced, practical, and clear personal finance advice suitable for a working professional or middle-class family. Keep it clear, concise, and actionable."

            system_prompt = f"""
            You are 'FinSight Coach', a helpful, premium AI Financial Companion, Coach, and Educator powered by NVIDIA NIM.
            You help users understand their spending, build budgets, optimize subscriptions, reach savings goals, and learn about finance (SIPs, Mutual Funds, Taxes, Credit Scores, etc.).
            
            Style instructions: {style_instruction}
            
            Here is the user's current financial data:
            - Overview: Income ₹{context.get('overview', {}).get('total_income', 0.0)}, Expenses ₹{context.get('overview', {}).get('total_expenses', 0.0)}, Savings ₹{context.get('overview', {}).get('total_savings', 0.0)}
            - Health Score: {context.get('health_score', {}).get('score', 75)}/100 ({context.get('health_score', {}).get('status', 'Good')})
            - Active Subscriptions: {json.dumps(context.get('subscriptions', []))}
            - Recent Anomalies/Warnings: {json.dumps(context.get('anomalies', []))}
            - Active Savings Goals: {json.dumps(context.get('goals', []))}
            - Recent 5 Transactions: {json.dumps(context.get('transactions', [])[:5])}

            Answer the user's question with direct, actionable personal finance advice. Keep your response concise, motivating, and professional. Use currency formatting in Indian Rupees (₹) where appropriate.
            """
            
            messages = [{"role": "system", "content": system_prompt}]
            for turn in history:
                role = "user" if turn["role"] == "user" else "assistant"
                messages.append({"role": role, "content": turn["content"]})
                
            messages.append({"role": "user", "content": message})
            
            return cls._call_nvidia_nim(messages, cls.TEXT_MODEL, json_mode=False)
        except Exception as e:
            logger.error(f"Nvidia NIM chat failed: {str(e)}")
            # Use rich local fallback engine instead of a generic error message
            return cls._local_chat_fallback(message, context, education_level)

    @classmethod
    def generate_budget_optimization(cls, transactions_summary: List[Dict[str, Any]], current_budgets: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        NVIDIA NIM budget optimizer recommendations.
        """
        try:
            prompt = f"""
            You are a senior budget auditor and AI wealth optimizer.
            Below is a summary of the user's current spending by category and their current monthly budget limits:
            
            Current Spending Summary: {json.dumps(transactions_summary)}
            Current Budget Limits: {json.dumps(current_budgets)}
            
            Generate an optimized monthly budget plan. Recommend categories to trim down.
            For each recommended optimization, return:
            - category: category name.
            - current_spend: current spend float.
            - suggested_limit: suggested limit float.
            - savings_potential: savings potential float.
            - rationale: short advice sentence.
            
            Also calculate the total estimated monthly savings and provide a summary.
            Return ONLY a raw JSON object matching this schema:
            {{
              "suggested_budgets": [
                {{
                  "category": "Food & Dining",
                  "current_spend": 12000.0,
                  "suggested_limit": 9000.0,
                  "savings_potential": 3000.0,
                  "rationale": "Trim food delivery by cooking at home."
                }}
              ],
              "estimated_monthly_savings": 3000.0,
              "summary": "Summary details."
            }}
            """
            
            messages = [{"role": "user", "content": prompt}]
            response_content = cls._call_nvidia_nim(messages, cls.TEXT_MODEL, json_mode=True)
            
            # clean JSON
            response_content = response_content.strip()
            if response_content.startswith("```"):
                lines = response_content.splitlines()
                if lines[0].startswith("```"): lines = lines[1:]
                if lines[-1].startswith("```"): lines = lines[:-1]
                response_content = "\n".join(lines).strip()
                
            return json.loads(response_content)
        except Exception as e:
            logger.error(f"Nvidia NIM budget optimization failed: {str(e)}")
            from app.services.gemini_service import GeminiService
            return GeminiService._generate_mock_optimization_result()

    @classmethod
    def generate_diagnosis(cls, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        NVIDIA NIM wealth diagnosis checkup generator.
        """
        try:
            prompt = f"""
            You are a master personal wealth auditor.
            Generate a personal finance diagnosis report based on details:
            - Financial Summary: {json.dumps(context.get('overview', {}))}
            - Health Score Breakdown: {json.dumps(context.get('health_score', {}))}
            - Active Subscriptions: {json.dumps(context.get('subscriptions', []))}
            - Warning Anomalies: {json.dumps(context.get('anomalies', []))}
            - Savings Milestones: {json.dumps(context.get('goals', []))}

            Generate a clinical diagnosis:
            - executive_summary: Paragraph summarizing findings.
            - overall_status: 'Healthy', 'Action Required', or 'Critical Review'.
            - critical_issues: List of string issues.
            - quick_wins: List of string wins.

            Return ONLY a raw JSON object matching this schema:
            {{
              "executive_summary": "Text summary.",
              "overall_status": "Action Required",
              "critical_issues": ["Issue 1"],
              "quick_wins": ["Win 1"]
            }}
            """
            
            messages = [{"role": "user", "content": prompt}]
            response_content = cls._call_nvidia_nim(messages, cls.TEXT_MODEL, json_mode=True)
            
            response_content = response_content.strip()
            if response_content.startswith("```"):
                lines = response_content.splitlines()
                if lines[0].startswith("```"): lines = lines[1:]
                if lines[-1].startswith("```"): lines = lines[:-1]
                response_content = "\n".join(lines).strip()
                
            return json.loads(response_content)
        except Exception as e:
            logger.error(f"Nvidia NIM diagnosis failed: {str(e)}")
            from app.services.gemini_service import GeminiService
            return GeminiService._generate_mock_diagnosis_result()

    @classmethod
    def _parse_json_list(cls, res_str: str) -> List[str]:
        """
        Parses JSON response. If it's a list, returns it.
        If it's a dictionary, extracts the first list found inside,
        or looks for key names matching 'suggestions', 'plans', 'recs', etc.
        """
        res_str = res_str.strip()
        if res_str.startswith("```"):
            lines = res_str.splitlines()
            if lines[0].startswith("```"): lines = lines[1:]
            if lines[-1].startswith("```"): lines = lines[:-1]
            res_str = "\n".join(lines).strip()
            
        try:
            data = json.loads(res_str)
            if isinstance(data, list):
                return [str(x) for x in data]
            elif isinstance(data, dict):
                for key in ["suggestions", "plans", "recs", "recommendations", "advice", "coaching", "data", "list", "improvement_plans"]:
                    if key in data and isinstance(data[key], list):
                        return [str(x) for x in data[key]]
                for val in data.values():
                    if isinstance(val, list):
                        return [str(x) for x in val]
                return [str(v) for v in data.values()]
            return [str(data)]
        except Exception as e:
            logger.error(f"Error parsing list from JSON: {str(e)}. Raw: {res_str}")
            raise e

    @classmethod
    def generate_survival_suggestions(cls, current_balance: float, burn_rate: float, daily_spending: float, remaining_days: int, prob: int, risk: str) -> List[str]:
        """
        NVIDIA NIM salary survival safety recommendations.
        """
        # Short-circuit empty database states
        if current_balance == 0.0 and burn_rate == 0.0 and daily_spending == 0.0:
            logger.info("Empty database state. Returning static survival suggestions.")
            return [
                "Upload bank statements to analyze your salary survival metrics.",
                "Review daily spending burn rate projections after adding transactions.",
                "Keep a buffer of 10-15% of your income for month-end expenses."
            ]

        cache_key = f"survival_{current_balance:.0f}_{burn_rate:.0f}_{daily_spending:.0f}_{remaining_days}_{prob}_{risk}"
        if cache_key in cls._recommendation_cache:
            logger.info("Returning cached survival suggestions")
            return cls._recommendation_cache[cache_key]

        try:
            prompt = f"""
            You are a cash flow survival doctor. The user has these financial status metrics:
            - Current Balance: ₹{current_balance:.0f}
            - Monthly Burn Rate: ₹{burn_rate:.0f}
            - Average Daily Spending: ₹{daily_spending:.0f}
            - Remaining Days in Month: {remaining_days}
            - Survival Probability: {prob}%
            - Risk Level: {risk}
            
            Based on these, generate 3 highly practical, concrete, short cash-saving suggestions to improve their salary survival probability for the rest of this month.
            Return a JSON list of strings. Do not write anything else. E.g.:
            ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
            """
            messages = [{"role": "user", "content": prompt}]
            res = cls._call_nvidia_nim(messages, cls.TEXT_MODEL, json_mode=True)
            result = cls._parse_json_list(res)
            cls._recommendation_cache[cache_key] = result
            return result
        except Exception as e:
            logger.error(f"Nvidia NIM survival suggestions failed: {str(e)}")
            if risk == "Low":
                return [
                    "Maintain your current spending pattern; your surplus is healthy.",
                    "Allocate a portion of your remaining balance to your savings goals.",
                    "Review your subscriptions to see if any can be optimized further."
                ]
            elif risk == "Medium":
                return [
                    "Postpone non-essential shopping items to next month.",
                    "Switch to home-cooked meals for the remaining days.",
                    "Limit daily cab rides and use public transport where possible."
                ]
            else:  # High risk
                return [
                    "Immediately freeze all discretionary shopping and entertainment.",
                    "Cut down on Swiggy/Zomato orders; prepare meals at home.",
                    "Postpone all non-essential utility renewals and shopping bills."
                ]

    @classmethod
    def generate_emergency_plan(cls, monthly_essentials: float, recommended_fund: float, current_fund: float, ratio: float, risk: str) -> List[str]:
        """
        NVIDIA NIM emergency safety recommendations.
        """
        # Short-circuit empty database states
        if current_fund == 0.0 and monthly_essentials == 15000.0 and ratio == 0.0:
            logger.info("Empty database state. Returning static emergency suggestions.")
            return [
                "Create an emergency savings goal on the Goals page to track progress.",
                "Aim to save 3 to 6 months of essential living expenses.",
                "Start building your buffer with small automatic weekly sweeps."
            ]

        cache_key = f"emergency_{monthly_essentials:.0f}_{recommended_fund:.0f}_{current_fund:.0f}_{ratio:.1f}_{risk}"
        if cache_key in cls._recommendation_cache:
            logger.info("Returning cached emergency plans")
            return cls._recommendation_cache[cache_key]

        try:
            prompt = f"""
            You are a financial safety and crisis auditor. The user has these emergency metrics:
            - Monthly Essential Expenses: ₹{monthly_essentials:.0f}
            - Recommended Emergency Fund (6 Months of Essentials): ₹{recommended_fund:.0f}
            - Current Emergency Fund Savings: ₹{current_fund:.0f}
            - Preparedness Ratio: {ratio:.1f}%
            - Risk Level: {risk}
            
            Based on these, generate 3 highly practical, short bullet points outlining a fast action plan to help them build their emergency fund to the recommended level.
            Return a JSON list of strings. Do not write anything else. E.g.:
            ["Plan 1", "Plan 2", "Plan 3"]
            """
            messages = [{"role": "user", "content": prompt}]
            res = cls._call_nvidia_nim(messages, cls.TEXT_MODEL, json_mode=True)
            result = cls._parse_json_list(res)
            cls._recommendation_cache[cache_key] = result
            return result
        except Exception as e:
            logger.error(f"Nvidia NIM emergency plan failed: {str(e)}")
            if risk == "Low":
                return [
                    "Maintain your current savings rate to reach 100% preparedness.",
                    "Consider placing the emergency reserves in a high-yield liquid fund.",
                    "Re-verify your essential monthly expenses index once a year."
                ]
            elif risk == "Medium":
                return [
                    "Direct any windfall gains, bonuses, or cash gifts straight to this fund.",
                    "Automate a ₹2,000 monthly sweep from salary to emergency fund.",
                    "Review monthly expenses to find ₹1,000 to add to your savings."
                ]
            else:  # High risk
                return [
                    "Establish a dedicated high-yield savings account just for emergency reserves.",
                    "Prioritize building 1 month of essentials before funding other goals.",
                    "Set up an automatic transfers plan of 10% of your monthly credits."
                ]

    @classmethod
    def generate_lifestyle_advice(cls, income_growth: float, expense_growth: float, savings_growth: float, creep: bool, risk: str) -> List[str]:
        """
        NVIDIA NIM lifestyle creep recommendations.
        """
        # Short-circuit empty database states
        if income_growth == 0.0 and expense_growth == 0.0 and savings_growth == 0.0:
            logger.info("Empty database state. Returning static lifestyle advice.")
            return [
                "Monitor your Month-Over-Month spending growth relative to income.",
                "Ensure that expense growth does not outpace your savings capacity.",
                "Adopt the 'Save First, Spend Later' strategy as a core rule."
            ]

        cache_key = f"creep_{income_growth:.1f}_{expense_growth:.1f}_{savings_growth:.1f}_{creep}_{risk}"
        if cache_key in cls._recommendation_cache:
            logger.info("Returning cached lifestyle advice")
            return cls._recommendation_cache[cache_key]

        try:
            prompt = f"""
            You are a personal wealth manager. The user has these growth metrics:
            - Income Growth: {income_growth:.1f}%
            - Expense Growth: {expense_growth:.1f}%
            - Savings Growth: {savings_growth:.1f}%
            - Creep Detected: {creep}
            - Risk Level: {risk}
            
            Based on these, generate 3 short, actionable suggestions to curb lifestyle inflation and align their spending growth with income growth.
            Return a JSON list of strings. Do not write anything else. E.g.:
            ["Advice 1", "Advice 2", "Advice 3"]
            """
            messages = [{"role": "user", "content": prompt}]
            res = cls._call_nvidia_nim(messages, cls.TEXT_MODEL, json_mode=True)
            result = cls._parse_json_list(res)
            cls._recommendation_cache[cache_key] = result
            return result
        except Exception as e:
            logger.error(f"Nvidia NIM lifestyle creep failed: {str(e)}")
            if risk == "Low":
                return [
                    "Keep tracking your MoM spending to maintain this balance.",
                    "Invest any recent salary increments immediately before expenses grow.",
                    "Review discretionary limits at the end of each quarter."
                ]
            else:  # Medium/High creep
                return [
                    "Adopt the 'Save First, Spend Later' strategy (automate savings on salary day).",
                    "Review premium upgrades and downscale unused luxury packages.",
                    "Enforce a 48-hour cool-off period for discretionary shopping purchases."
                ]

    @classmethod
    def generate_debt_plan(cls, total_emi: float, debt_burden: float, stress_score: int, stress_level: str) -> List[str]:
        """
        NVIDIA NIM debt burden safety advice.
        """
        # Short-circuit empty database states
        if total_emi == 0.0 and debt_burden == 0.0:
            logger.info("Empty database state. Returning static debt plan.")
            return [
                "Keep your EMI commitments below 30% of your monthly credits.",
                "Avoid consumer retail loans or credit card EMI extensions.",
                "Review loan interest rates periodically to check for refinancing offers."
            ]

        cache_key = f"debt_{total_emi:.0f}_{debt_burden:.1f}_{stress_score}_{stress_level}"
        if cache_key in cls._recommendation_cache:
            logger.info("Returning cached debt plan")
            return cls._recommendation_cache[cache_key]

        try:
            prompt = f"""
            You are a debt relief and credit coach. The user has these EMI burden metrics:
            - Total Monthly EMI Payments: ₹{total_emi:.0f}
            - Debt Burden (EMI-to-Income): {debt_burden:.1f}%
            - Stress Score: {stress_score}/100
            - Stress Level: {stress_level}
            
            Based on these, generate 3 highly actionable, short points to help them manage, reduce, or optimize their loan commitments.
            Return a JSON list of strings. Do not write anything else. E.g.:
            ["Debt plan 1", "Debt plan 2", "Debt plan 3"]
            """
            messages = [{"role": "user", "content": prompt}]
            res = cls._call_nvidia_nim(messages, cls.TEXT_MODEL, json_mode=True)
            result = cls._parse_json_list(res)
            cls._recommendation_cache[cache_key] = result
            return result
        except Exception as e:
            logger.error(f"Nvidia NIM debt plan failed: {str(e)}")
            if stress_level == "Low":
                return [
                    "Continue paying EMIs on time to build a strong credit history.",
                    "Avoid taking new consumer EMIs or credit card loans for retail shopping.",
                    "Check your credit score periodically to ensure no discrepancies exist."
                ]
            else:  # Medium/High stress
                return [
                    "Consider loan consolidation to reduce interest rates and monthly EMIs.",
                    "Target the loan with the highest interest rate for prepayments (debt avalanche).",
                    "Renegotiate repayment terms or duration with your bank if EMIs exceed 40% of income."
                ]

    @classmethod
    def generate_upi_advice(cls, upi_count: int, spend_share: float, daily_avg: float, impulse_count: int, impulse_amt: float, risk: str) -> List[str]:
        """
        NVIDIA NIM UPI spending habit coaching.
        """
        # Short-circuit empty database states
        if upi_count == 0 and impulse_count == 0:
            logger.info("Empty database state. Returning static upi advice.")
            return [
                "Set a weekly digital pocket money limit to curb impulse micro-spending.",
                "Track micro-purchases under ₹500, as they quickly compound.",
                "Consider using cash or a separate debit card for local snacks and tea."
            ]

        cache_key = f"upi_{upi_count}_{spend_share:.1f}_{daily_avg:.1f}_{impulse_count}_{impulse_amt:.0f}_{risk}"
        if cache_key in cls._recommendation_cache:
            logger.info("Returning cached upi advice")
            return cls._recommendation_cache[cache_key]

        try:
            prompt = f"""
            You are a spending habit behavior coach. The user has these UPI spending stats:
            - Monthly UPI transactions count: {upi_count}
            - Average daily transactions: {daily_avg:.1f}
            - UPI share of expenses: {spend_share:.1f}%
            - Impulse Micro-purchases count: {impulse_count}
            - Total Impulse spend: ₹{impulse_amt:.0f}
            - Impulse spending risk: {risk}
            
            Based on these, generate 3 highly practical, short coaching points to curb their UPI micro-payments impulse spend.
            Return a JSON list of strings. Do not write anything else. E.g.:
            ["Coaching 1", "Coaching 2", "Coaching 3"]
            """
            messages = [{"role": "user", "content": prompt}]
            res = cls._call_nvidia_nim(messages, cls.TEXT_MODEL, json_mode=True)
            result = cls._parse_json_list(res)
            cls._recommendation_cache[cache_key] = result
            return result
        except Exception as e:
            logger.error(f"Nvidia NIM upi advice failed: {str(e)}")
            if risk == "Low":
                return [
                    "UPI transactions are well within safe frequency levels.",
                    "Keep tracking your small payments via ledger categories.",
                    "Avoid linking too many merchant accounts directly to instant UPI."
                ]
            else:  # Medium/High risk
                return [
                    "Set a weekly wallet cap by transferring static funds to a pocket wallet.",
                    "Disable instant UPI touch-ID approvals for micro-payments.",
                    "Commit to a cash-only policy or debit card for local snacks and tea."
                ]

