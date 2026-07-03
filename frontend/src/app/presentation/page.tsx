"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  FileSpreadsheet, 
  ShieldCheck, 
  MessageSquare, 
  Database,
  CheckCircle,
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { useFinance } from '../../context/FinanceContext';

export default function PresentationMode() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [fileScanning, setFileScanning] = useState<boolean>(false);
  const [ocrText, setOcrText] = useState<string>('');
  const [parseComplete, setParseComplete] = useState<boolean>(false);

  const { uploadStatement } = useFinance();

  const steps = [
    {
      title: "FinSight AI 3.0 Platform Overview",
      subtitle: "A Fintech Operating System solving financial awareness.",
      desc: "Millions struggle to track spending across statements, UPI logs, and EMIs. FinSight AI is built to combine these scattered records into localized financial intelligence, powered by AI, offline analysis, and local storage.",
      icon: <Sparkles className="w-8 h-8 text-blue-400" />,
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      title: "100% Client-Side Database & Security",
      subtitle: "Zero server databases. Full user privacy control.",
      desc: "By storing transaction histories, goals, and chat transcripts entirely in the browser's IndexedDB, the platform runs with zero server-side setups. Users can export their profiles as encrypted JSON backups, clear their browser states instantly, and restore them anywhere.",
      icon: <Database className="w-8 h-8 text-cyan-400" />,
      color: "from-cyan-500/20 to-purple-500/20"
    },
    {
      title: "Simulated Statement Parsing & OCR Engine",
      subtitle: "Watch the statement intelligence parse transaction ledgers.",
      desc: "Let's run a live simulation of uploading a PDF/Excel bank statement. Below, click the trigger button to watch the OCR scan raw text, extract fields, categorize merchants, and dynamically inject them into your IndexedDB workspace.",
      icon: <FileSpreadsheet className="w-8 h-8 text-emerald-400" />,
      color: "from-emerald-500/20 to-blue-500/20",
      action: "simulate-ocr"
    },
    {
      title: "12 Advanced Financial Intelligence Indicators",
      subtitle: "Real-time risk calculations in your dashboard.",
      desc: "Every transaction swipe updates key metrics immediately on the client: Salary survival countdown, emergency fund resilience multiplier, UPI micro-payment impulse risk, lifestyle creep rates, and debt stress indexes.",
      icon: <ShieldCheck className="w-8 h-8 text-purple-400" />,
      color: "from-purple-500/20 to-rose-500/20"
    },
    {
      title: "AI Spending Coach & Budget Optimizer",
      subtitle: "Interactive conversational guidance.",
      desc: "A ChatGPT-like interface powered by local text-generation templates and streaming messages. The coach reads transaction profiles and highlights category spending optimization suggestions instantly.",
      icon: <MessageSquare className="w-8 h-8 text-rose-400" />,
      color: "from-rose-500/20 to-blue-500/20"
    }
  ];

  const handleSimulateOCR = async () => {
    setFileScanning(true);
    setParseComplete(false);
    setOcrText('');

    // Stage 1: Scanning file
    setTimeout(() => {
      setOcrText('Scanning page 1: [HDFC Statement Header]...\nFound AC NO: XXXXXXXX1234\nDate: 01-06-2026 to 30-06-2026\n');
    }, 1000);

    // Stage 2: OCR Extraction
    setTimeout(() => {
      setOcrText(prev => prev + '\nExtracted transaction records:\n[05-06] SWIGGY FOOD ORDER -> Debit: 450.00\n[10-06] HDFC HOME EMI DEBIT -> Debit: 8,500.00\n[15-06] NETFLIX COM SWIPE -> Debit: 649.00\n');
    }, 2200);

    // Stage 3: Auto-classification and import
    setTimeout(async () => {
      setOcrText(prev => prev + '\nClassification results:\n- Swiggy -> Food & Dining (Confidence: 99%)\n- Netflix -> Bills & Subscriptions (Confidence: 100%)\n- EMI -> EMI Payments (Confidence: 95%)\n\nSaving statement structure to IndexedDB...');
      
      // Load mock files locally
      const mockFile = new File(['date,desc,amount,type,category\n2026-06-05,SWIGGY FOOD ORDER,450,debit,Food & Dining\n2026-06-10,HDFC HOME EMI DEBIT,8500,debit,EMI Payments\n2026-06-15,NETFLIX COM SWIPE,649,debit,Bills & Subscriptions'], 'simulated_statement.csv', { type: 'text/csv' });
      try {
        await uploadStatement(mockFile);
        setParseComplete(true);
      } catch (err) {
        console.error("Simulated import error:", err);
      } finally {
        setFileScanning(false);
      }
    }, 3800);
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-20 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops)) pointer-events-none opacity-20" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900/60 relative z-10">
        <Link href="/">
          <span className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-all cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Walkthrough</span>
          </span>
        </Link>
        <div className="text-xs font-extrabold tracking-wider text-slate-500 uppercase">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Main Walkthrough Card */}
      <div className="max-w-4xl mx-auto px-6 mt-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <GlassCard className="p-8 md:p-12 relative overflow-hidden">
              {/* Card Corner Glow */}
              <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${steps[currentStep].color} blur-3xl opacity-40 pointer-events-none`} />

              <div className="flex gap-6 items-start">
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
                  {steps[currentStep].icon}
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">FinSight Walkthrough</span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">{steps[currentStep].title}</h2>
                  <p className="text-slate-400 text-sm font-semibold">{steps[currentStep].subtitle}</p>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-900/80 pt-6">
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  {steps[currentStep].desc}
                </p>

                {/* Simulated action content if step matches */}
                {steps[currentStep].action === "simulate-ocr" && (
                  <div className="mt-8 p-6 bg-slate-950/60 rounded-2xl border border-slate-900 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Statement Scanner Terminal</h4>
                      <button
                        onClick={handleSimulateOCR}
                        disabled={fileScanning}
                        className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white transition-all disabled:opacity-50"
                      >
                        {fileScanning ? 'Scanner Running...' : 'Launch Simulated Import'}
                      </button>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/80 font-mono text-xs text-emerald-500 min-h-36 max-h-52 overflow-y-auto whitespace-pre-wrap leading-normal relative">
                      {fileScanning && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 text-slate-400 text-[10px]">
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                          <span>Extracting text via client OCR...</span>
                        </div>
                      )}
                      {ocrText || "Click 'Launch Simulated Import' above to test the statement extraction pipeline."}
                    </div>

                    {parseComplete && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 flex items-center gap-3 text-xs">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <p>Simulation complete! Transaction entries successfully parsed and saved into IndexedDB. Go to the dashboard later to see the live updates.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation controls */}
              <div className="mt-12 flex justify-between items-center border-t border-slate-900/80 pt-6">
                <button
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 disabled:opacity-30 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                    className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all"
                  >
                    <span>Next Slide</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link href="/dashboard">
                    <span className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-xs font-bold text-white transition-all cursor-pointer">
                      <span>Enter Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Presenter Footer Info */}
      <div className="text-center mt-12 space-y-1">
        <p className="text-xs text-slate-500 font-semibold">FinSight AI 3.0 Platform Presentation Mode</p>
        <p className="text-[10px] text-slate-600">Built by Madhan E — Panimalar Engineering College (AI & DS)</p>
      </div>
    </div>
  );
}
