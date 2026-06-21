"use client";

import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';

export default function UploadZone() {
  const { uploadStatement } = useFinance();
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error' | 'password_required'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File, passwordVal?: string) => {
    if (!file) return;

    setStatus('uploading');
    setFileName(file.name);
    setErrorMessage(null);
    
    const startTime = Date.now();

    // Mock progress message transitions for UX delight
    const messages = [
      "Uploading statement file to server...",
      "Checking file format & attributes...",
      "Attempting decryption & text OCR...",
      "Analyzing transaction patterns & UPI metadata...",
      "Categorizing expenses & saving records...",
    ];

    let msgIdx = 0;
    setProgressMsg(messages[msgIdx]);
    const interval = setInterval(() => {
      if (msgIdx < messages.length - 1) {
        msgIdx++;
        setProgressMsg(messages[msgIdx]);
      }
    }, 450);

    try {
      const data = await uploadStatement(file, passwordVal);
      
      // Ensure the loader stays visible for at least 1.5 seconds for visual feedback
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1500 - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      clearInterval(interval);
      setStatus('success');
      setPassword('');
      setActiveFile(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Clear success feedback back to idle after 4 seconds
      setTimeout(() => {
        setStatus('idle');
        setFileName('');
      }, 4000);
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      
      if (err.message === "PASSWORD_REQUIRED") {
        setStatus('password_required');
        setActiveFile(file);
        setErrorMessage(null);
      } else if (err.message === "INVALID_PASSWORD") {
        setStatus('password_required');
        setActiveFile(file);
        setErrorMessage("Invalid password. Please try again.");
      } else {
        setStatus('error');
        setErrorMessage(err.message || "Failed to process bank statement.");
        setActiveFile(null);
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        id="statement-file-input"
        className="hidden"
        accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
        onChange={handleFileChange}
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => status === 'idle' && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
          flex flex-col items-center justify-center min-h-60 relative overflow-hidden
          ${isDragActive ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-slate-800 bg-slate-950/20 hover:border-slate-700/80'}
          ${status === 'uploading' ? 'cursor-wait border-blue-500/40 bg-slate-950/60' : ''}
          ${status === 'success' ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}
          ${status === 'error' ? 'border-rose-500 bg-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : ''}
          ${status === 'password_required' ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : ''}
        `}
      >
        {status === 'idle' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all duration-300">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Drag and drop your financial statement here
              </p>
              <p className="text-xs text-slate-500 mt-1.5">
                Supports PDF, CSV, Excel (XLSX), or transaction screenshots (PNG, JPG)
              </p>
            </div>
            <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 rounded-lg border border-slate-800 transition-all">
              Browse Files
            </button>
          </div>
        )}

        {status === 'uploading' && (
          <div className="space-y-4 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-200">Analyzing {fileName}</p>
              <p className="text-xs text-blue-400 animate-pulse mt-1.5 font-medium">{progressMsg}</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-fade-in flex flex-col items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-200">Analysis Complete!</p>
              <p className="text-xs text-emerald-400 font-semibold mt-1">Successfully parsed {fileName}</p>
              <p className="text-[10px] text-slate-500 mt-2">Transactions imported and intelligence engine updated.</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-12 h-12 text-rose-500" />
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-slate-200">Upload Failed</p>
              <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p>
              <p className="text-[10px] text-slate-500 mt-3 max-w-md mx-auto">
                Double-check that the file isn&apos;t password protected or corrupt. Try uploading a screenshot or CSV if the PDF fails.
              </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setStatus('idle'); }}
              className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg border border-rose-500/20 transition-all mt-2"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'password_required' && activeFile && (
          <div className="space-y-4 animate-fade-in flex flex-col items-center justify-center p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-200">Password Protected Document</p>
              <p className="text-[10px] text-slate-400 mt-1">
                The file <span className="font-semibold text-slate-300">&ldquo;{fileName}&rdquo;</span> is encrypted. Enter the password to decrypt:
              </p>
            </div>
            
            <div className="w-full space-y-2">
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && password.trim()) {
                    await processFile(activeFile, password);
                  }
                }}
                className="w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 text-center"
                autoFocus
              />
              {errorMessage && (
                <p className="text-[10px] text-rose-400 font-semibold text-center">{errorMessage}</p>
              )}
            </div>

            <div className="flex gap-2 w-full pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStatus('idle');
                  setActiveFile(null);
                  setPassword('');
                }}
                className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-slate-300 rounded-lg border border-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (password.trim()) {
                    await processFile(activeFile, password);
                  }
                }}
                disabled={!password.trim()}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-55 text-[11px] font-bold text-white rounded-lg transition-all"
              >
                Decrypt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
