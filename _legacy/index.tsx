import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// --- Icons ---
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const EraserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2.63 15.17 6.47 6.47a2 2 0 0 0 2.82 0l8.9-8.9a2 2 0 0 0 0-2.82l-6.47-6.47a2 2 0 0 0-2.82 0l-8.9 8.9a2 2 0 0 0 0 2.82ZM7.04 7.05l7.1 7.09M2 22h8"/></svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const PenToolIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

// --- Constants ---
const TONE_OPTIONS = [
  "Professional",
  "Casual",
  "Persuasive",
  "Apologetic",
  "Warm & Friendly",
  "Firm & Direct",
  "Grateful"
];

const LENGTH_OPTIONS = [
  { value: "Short", label: "Brief" },
  { value: "Medium", label: "Standard" },
  { value: "Long", label: "Detailed" },
];

type Message = {
    role: 'user' | 'model';
    text: string;
};

// --- Main App Component ---
function App() {
  // State - Letter Config
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [draft, setDraft] = useState("");
  const [styleExample, setStyleExample] = useState("");
  
  // State - Output
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [letterHistory, setLetterHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // State - Chat
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // State - About
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Refs for auto-scrolling
  const outputRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Logic ---

  const scrollToChatBottom = () => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
      scrollToChatBottom();
  }, [chatHistory, isChatLoading]);

  // Main Generator Function
  const handleGenerate = async (overrideDraft?: string) => {
    const activeDraft = overrideDraft !== undefined ? overrideDraft : draft;

    if (!activeDraft.trim()) {
      setError("Please enter some rough notes or points for the letter.");
      return;
    }

    setIsLoading(true);
    setError(null);
    if (historyIndex === -1 && !overrideDraft) setGeneratedLetter(""); 

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key is missing.");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        Act as an expert writer and editor. 
        Write a letter based on the following parameters:

        FROM: ${sender || "[Sender Name]"}
        TO: ${recipient || "[Recipient Name]"}
        TONE: ${tone}
        LENGTH: ${length}

        ROUGH DRAFT / KEY POINTS:
        ${activeDraft}

        ${styleExample ? `STYLE REFERENCE (Mimic this writing style): ${styleExample}` : ""}

        INSTRUCTIONS:
        1. Produce ONLY the content of the letter. Do not include introductory text like "Here is your letter:".
        2. Maintain the requested tone throughout.
        3. Ensure the flow is logical and polished.
        4. If the rough draft is fragmented, expand it into full coherent sentences.
        5. Use standard letter formatting (salutation, body, closing).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text;
      if (text) {
        const trimmedText = text.trim();
        setGeneratedLetter(trimmedText);
        
        // Update history
        setLetterHistory(prev => {
            const newHistory = [...prev, trimmedText];
            setHistoryIndex(newHistory.length - 1);
            return newHistory;
        });

        if (!overrideDraft && window.innerWidth < 1024) {
          setTimeout(() => {
             outputRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while generating the letter.");
    } finally {
      setIsLoading(false);
    }
  };

  // Chat Handler
  const handleChatSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || !draft.trim()) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key is missing.");
        const ai = new GoogleGenAI({ apiKey });

        const updatePrompt = `
            You are a writing assistant helping a user refine their rough notes for a letter.
            
            CURRENT ROUGH NOTES:
            ${draft}

            USER FEEDBACK/REQUEST:
            ${userMsg}

            INSTRUCTIONS:
            1. Rewrite the "Current Rough Notes" to incorporate the "User Feedback".
            2. You can add points, remove points, or change the emphasis as requested.
            3. Do NOT write the final letter. Just output the updated raw notes/bullet points.
            4. Keep the output plain text.
            5. If the user asks to change the tone (e.g. "make it angrier"), incorporate that instruction into the notes themselves (e.g. "Note: Write this with an angry tone").
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: updatePrompt,
        });

        const newDraft = response.text?.trim();

        if (newDraft) {
            setDraft(newDraft);
            setChatHistory(prev => [...prev, { role: 'model', text: "Draft updated. Regenerating letter..." }]);
            await handleGenerate(newDraft);
        }

    } catch (err) {
        console.error(err);
        setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I couldn't update the draft. Please try again." }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  const goToHistory = (index: number) => {
      if (index >= 0 && index < letterHistory.length) {
          setHistoryIndex(index);
          setGeneratedLetter(letterHistory[index]);
      }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const clearOutput = () => {
    setGeneratedLetter("");
    setError(null);
    setChatHistory([]);
    setLetterHistory([]);
    setHistoryIndex(-1);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-slate-800">
      
      {/* About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-in zoom-in-95">
            <button 
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600 rounded-xl text-white">
                <PenToolIcon />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">About Letterly</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p className="font-medium text-slate-900 text-lg">Your thoughts, professionally phrased.</p>
              <p>
                Letterly is your personal writing companion designed to turn messy thoughts into meaningful messages. 
                Whether it's a formal business inquiry, a heartfelt thank-you note, or a firm request, Letterly crafts 
                the perfect letter in seconds.
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li><span className="font-semibold">Transform Rough Notes:</span> Jot down bullet points and let AI build the structure.</li>
                <li><span className="font-semibold">Custom Tone & Length:</span> Adjust how you sound with one click.</li>
                <li><span className="font-semibold">Conversational Iteration:</span> Talk to the agent to refine your draft in real-time.</li>
                <li><span className="font-semibold">Version Control:</span> Travel back in time to compare and choose the best version.</li>
              </ul>
              <p className="pt-2 italic text-sm">Crafted for clarity, powered by Gemini.</p>
            </div>
            <button 
              onClick={() => setIsAboutOpen(false)}
              className="mt-8 w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              Start Writing
            </button>
          </div>
        </div>
      )}

      {/* --- LEFT PANEL: Input & Controls --- */}
      <div className="w-full lg:w-5/12 xl:w-1/3 bg-white border-r border-slate-200 flex flex-col h-auto lg:h-screen">
        
        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto p-6 lg:p-8 pb-0">
            <header className="mb-6 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                    <PenToolIcon />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Letterly</h1>
                </div>
                <p className="text-sm text-slate-500">Messy thoughts to polished letters.</p>
              </div>
              <button 
                onClick={() => setIsAboutOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all border border-slate-200"
              >
                <InfoIcon />
                About
              </button>
            </header>

            <div className="space-y-6">
            
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">From</label>
                <div className="relative">
                    <input
                    type="text"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white"
                    />
                    <div className="absolute left-2.5 top-2.5 text-slate-400">
                    <UserIcon />
                    </div>
                </div>
                </div>
                <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">To</label>
                <div className="relative">
                    <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Recipient Name"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white"
                    />
                    <div className="absolute left-2.5 top-2.5 text-slate-400">
                    <UserIcon />
                    </div>
                </div>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tone</label>
                <div className="relative">
                    <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm appearance-none focus:bg-white cursor-pointer"
                    >
                    {TONE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                </div>
                </div>

                <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Length</label>
                <div className="flex bg-slate-100 p-1 rounded-md">
                    {LENGTH_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setLength(opt.value)}
                        className={`flex-1 text-xs py-1.5 rounded font-medium transition-all ${
                        length === opt.value 
                            ? "bg-white text-slate-900 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        {opt.label}
                    </button>
                    ))}
                </div>
                </div>
            </div>

            {/* Main Input */}
            <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex justify-between">
                Rough Draft / Key Points <span className="text-red-400">*</span>
                </label>
                <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="- Ask about the project timeline&#10;- Mention the budget constraints&#10;- Express excitement for the collaboration..."
                className={`w-full min-h-[160px] p-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white resize-none transition-all ${isChatLoading ? 'opacity-50' : 'opacity-100'}`}
                />
            </div>

            {/* Optional Style */}
            <div className="space-y-1">
                <details className="group">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1 hover:text-slate-800 select-none">
                    <svg className="w-4 h-4 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    Style Match (Optional)
                    </summary>
                    <div className="pt-2">
                    <textarea
                        value={styleExample}
                        onChange={(e) => setStyleExample(e.target.value)}
                        placeholder="Paste an email or letter here, and the AI will try to mimic its writing style and voice."
                        className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs focus:bg-white resize-none"
                    />
                    </div>
                </details>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex items-start gap-2">
                <span className="font-bold">Error:</span> {error}
                </div>
            )}

            <button
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold text-white transition-all transform active:scale-[0.98] ${
                isLoading 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
            >
                {isLoading ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Writing...
                </>
                ) : (
                <>
                    <SparklesIcon />
                    Generate Draft
                </>
                )}
            </button>
            
            <div className="h-4"></div>
            </div>
        </div>

        {/* --- CHAT SECTION --- */}
        <div className="border-t border-slate-200 bg-slate-50 flex flex-col h-1/3 min-h-[250px] max-h-[400px]">
            <div className="px-4 py-2 border-b border-slate-100 bg-white">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Refine & Iterate
                </h3>
            </div>
            
            {/* History */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {chatHistory.length === 0 && (
                    <div className="text-center text-xs text-slate-400 mt-4 italic">
                        Example: "Add a point about the deadline", "Make it friendlier"
                    </div>
                )}
                {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                            msg.role === 'user' 
                                ? 'bg-blue-100 text-blue-900 rounded-br-none' 
                                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isChatLoading && (
                     <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-3 py-2 shadow-sm">
                           <div className="flex gap-1">
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                           </div>
                        </div>
                     </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={generatedLetter ? "Refine draft (e.g. 'Add more urgency')..." : "Enter a draft first"}
                    disabled={!generatedLetter && !draft}
                    className="flex-grow bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:bg-white"
                />
                <button 
                    type="submit"
                    disabled={(!generatedLetter && !draft) || isChatLoading}
                    className="p-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SendIcon />
                </button>
            </form>
        </div>
      </div>

      {/* --- RIGHT PANEL: Output --- */}
      <div ref={outputRef} className="w-full lg:w-7/12 xl:w-2/3 bg-slate-100 p-4 lg:p-8 flex flex-col items-center justify-start h-screen overflow-y-auto relative">
        
        {/* Paper Container */}
        <div className="w-full max-w-2xl flex flex-col gap-2">
            
            {/* History Controls Toolbar */}
            {letterHistory.length > 0 && (
                <div className="flex items-center justify-between px-2 text-sm text-slate-500 animate-in fade-in duration-300">
                    <span className="font-medium">Version {historyIndex + 1} of {letterHistory.length}</span>
                    <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                        <button
                            onClick={() => goToHistory(historyIndex - 1)}
                            disabled={historyIndex <= 0}
                            className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Previous Version"
                        >
                            <ChevronLeftIcon />
                        </button>
                        <div className="w-px h-3 bg-slate-200 mx-1"></div>
                        <button
                            onClick={() => goToHistory(historyIndex + 1)}
                            disabled={historyIndex >= letterHistory.length - 1}
                            className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Next Version"
                        >
                            <ChevronRightIcon />
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-xl min-h-[80vh] lg:min-h-[calc(100vh-6rem)] p-8 lg:p-12 relative flex flex-col transition-all">
                
                {/* Header/Stamp visual (decorative) */}
                <div className="absolute top-0 right-0 p-8 opacity-5 select-none pointer-events-none">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M22 10v6M2 10v6M12 11l-9 4 9 4 9-4-9-4z"/></svg>
                </div>

                {!generatedLetter && !isLoading && (
                <div className="flex-grow flex flex-col items-center justify-center text-slate-300 pointer-events-none">
                    <div className="w-16 h-16 mb-4 opacity-50"><PenToolIcon /></div>
                    <p className="text-lg font-medium">Ready to write.</p>
                    <p className="text-sm">Fill in the details on the left to start.</p>
                </div>
                )}

                {isLoading && (
                <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                    <div className="w-full max-w-sm space-y-3 opacity-30 animate-pulse">
                        <div className="h-4 bg-slate-400 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-400 rounded w-full"></div>
                        <div className="h-4 bg-slate-400 rounded w-full"></div>
                        <div className="h-4 bg-slate-400 rounded w-5/6"></div>
                        <br/>
                        <div className="h-4 bg-slate-400 rounded w-full"></div>
                        <div className="h-4 bg-slate-400 rounded w-full"></div>
                        <div className="h-4 bg-slate-400 rounded w-4/5"></div>
                    </div>
                    <p className="text-slate-500 font-medium animate-pulse">
                        {isChatLoading ? "Updating draft & rewriting..." : "Composing your letter..."}
                    </p>
                </div>
                )}

                {/* Editable Output */}
                {generatedLetter && (
                <div className="flex-grow flex flex-col relative group">
                    <textarea
                    value={generatedLetter}
                    onChange={(e) => setGeneratedLetter(e.target.value)}
                    className="w-full flex-grow resize-none border-none focus:ring-0 text-slate-800 font-serif leading-relaxed text-lg bg-transparent"
                    spellCheck={false}
                    />
                </div>
                )}
            </div>
        </div>

        {/* Floating Action Bar */}
        {generatedLetter && (
          <div className="sticky bottom-6 mt-6 bg-white/90 backdrop-blur border border-slate-200 shadow-lg rounded-full px-6 py-2 flex items-center gap-4 animate-in slide-in-from-bottom-4 z-10">
             <button 
               onClick={copyToClipboard}
               className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
             >
               {isCopied ? <CheckIcon /> : <CopyIcon />}
               {isCopied ? "Copied!" : "Copy Text"}
             </button>
             <div className="w-px h-4 bg-slate-300"></div>
             <button 
               onClick={clearOutput}
               className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-500 transition-colors"
             >
               <EraserIcon />
               Clear
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);