"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import GlassCard from '../../components/GlassCard';
import Waveform from '../../components/Waveform';
import { 
  Send, 
  Mic, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Trash2, 
  Loader2,
  ChevronRight,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export default function AIAdvisor() {
  const { 
    chatHistory, 
    sendChatMessage, 
    clearChat,
    loading 
  } = useFinance();

  const [inputMsg, setInputMsg] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [educationLevel, setEducationLevel] = useState<string>('intermediate');
  const messageEndRef = useRef<HTMLDivElement>(null);

  const suggestionPrompts = [
    { text: "Explain SIP like I am 15 years old", category: "beginner" },
    { text: "How does compound interest work?", category: "beginner" },
    { text: "What is a good emergency fund?", category: "beginner" },
    { text: "Explain active vs passive mutual funds", category: "intermediate" },
    { text: "What are the tax implications of mutual funds?", category: "advanced" }
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Handle TTS Speak
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined') return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const cleanText = text.replace(/[\*#_]/g, ''); // strip markdown chars
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (msgText: string) => {
    if (!msgText.trim()) return;

    setSending(true);
    setInputMsg('');
    try {
      const reply = await sendChatMessage(msgText, voiceEnabled, educationLevel);
      if (voiceEnabled) {
        speakText(reply);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to speak with advisor. Make sure the backend is active.");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMsg);
  };

  // Web Speech STT Recognition
  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    try {
      setIsListening(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in flex flex-col h-[82vh] justify-between">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            AI Literacy Coach <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            ChatGPT-style financial advisor and education tutor equipped with voice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Education level selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setEducationLevel('beginner')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                educationLevel === 'beginner' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setEducationLevel('intermediate')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                educationLevel === 'intermediate' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Intermediate
            </button>
            <button
              onClick={() => setEducationLevel('advanced')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                educationLevel === 'advanced' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Advanced
            </button>
          </div>

          {/* Voice Output Toggle */}
          <button 
            onClick={() => {
              const nextVal = !voiceEnabled;
              setVoiceEnabled(nextVal);
              if (!nextVal && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              voiceEnabled 
                ? 'bg-blue-600/15 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={voiceEnabled ? "Mute Voice Response" : "Unmute Voice Response"}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Clear history */}
          <button 
            onClick={clearChat}
            className="p-2.5 bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Conversation Log Container */}
      <GlassCard className="flex-1 my-4 overflow-y-auto flex flex-col justify-between p-4 min-h-[300px] border-blue-500/5">
        <div className="space-y-4 pr-1 overflow-y-auto max-h-[50vh] min-h-[220px]">
          {chatHistory.length > 0 ? (
            chatHistory.map((msg) => {
              const isAI = msg.sender === 'ai';
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}
                >
                  <div className={`
                    max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed
                    ${isAI 
                      ? 'bg-slate-950/40 border border-slate-900/80 text-slate-200' 
                      : 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    }
                  `}>
                    <div className="whitespace-pre-wrap">{msg.message}</div>
                    
                    <span className="block text-[8px] text-slate-400/80 text-right mt-2 uppercase font-medium">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs italic space-y-3">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No conversation history. Ask a personal finance question, select your educational mode, or click a lesson below to start.</p>
            </div>
          )}
          
          <div ref={messageEndRef} />
        </div>
      </GlassCard>

      {/* Suggested chips & Input panel */}
      <div className="space-y-4 flex-shrink-0">
        
        {isListening && <Waveform />}

        {/* Suggestion Prompt Chips */}
        {chatHistory.length <= 1 && !isListening && (
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-black text-blue-400 tracking-wider flex items-center justify-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" /> Recommended Study Paths
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestionPrompts.map((p) => (
                <button
                  key={p.text}
                  onClick={() => handleSendMessage(p.text)}
                  disabled={sending}
                  className="px-3.5 py-2 bg-slate-950/40 hover:bg-slate-900/60 border border-slate-900 rounded-xl text-slate-300 hover:text-white text-[10px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer glass-panel-hover"
                >
                  <span className="px-1 py-0.5 rounded bg-blue-600/20 text-[8px] font-black uppercase text-blue-400">
                    {p.category}
                  </span>
                  <span>{p.text}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Input Panel */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          {/* Voice Input Mic button */}
          <button 
            type="button"
            onClick={startListening}
            disabled={sending || isListening}
            className={`
              p-3.5 rounded-xl border flex items-center justify-center transition-all flex-shrink-0
              ${isListening 
                ? 'bg-rose-600/10 border-rose-500 text-rose-500 animate-pulse' 
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }
            `}
            title="Speak with Voice"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text message box */}
          <input
            type="text"
            placeholder={isListening ? "Listening to your speech..." : "Ask your AI Coach about SIPs, emergency funds, debt management, or budgeting..."}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            disabled={sending || isListening}
            className="flex-1 px-4 py-3 bg-slate-950/40 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 placeholder-slate-500 glass-input"
          />

          {/* Send text button */}
          <button 
            type="submit"
            disabled={sending || !inputMsg.trim() || isListening}
            className="p-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
