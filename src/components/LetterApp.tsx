"use client";

import React, { useState, useRef, useCallback } from "react";
import styles from "./LetterApp.module.css";
// ModelSelector removed in favor of AgentModelSettings
import { AgentModelSettings } from "./AgentModelSettings";
import { AGENTS } from "@/lib/agent-constants";
import {
    SparklesIcon, CopyIcon, CheckIcon, EraserIcon,
    UserIcon, PenToolIcon, InfoIcon,
    ChevronLeftIcon, ChevronRightIcon,
    TeamIcon
} from "./ui/icons";

// --- Constants ---
const TONE_OPTIONS = [
    "Professional", "Casual", "Persuasive",
    "Apologetic", "Warm & Friendly", "Firm & Direct", "Grateful"
];

const LENGTH_OPTIONS = [
    { value: "Short", label: "Brief" },
    { value: "Medium", label: "Standard" },
    { value: "Long", label: "Detailed" },
];

interface HistoryItem {
    letter: string;
    roughNotes: string;
    chatHistory: { role: 'user' | 'model'; text: string }[];
    score: number | null;
}

export default function LetterApp() {
    // Config State
    const [recipient, setRecipient] = useState("");
    const [sender, setSender] = useState("");
    const [tone, setTone] = useState("Casual");
    const [length, setLength] = useState("Short");
    const [roughNotes, setRoughNotes] = useState("");
    const [language, setLanguage] = useState("English");
    const [styleExample, setStyleExample] = useState("");
    
    // Model State
    const [agentModels, setAgentModels] = useState<Record<string, string>>({});
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Helper to get model for specific agent
    const getModelFor = useCallback((agentId: string) => {
        return agentModels[agentId] || AGENTS[agentId as keyof typeof AGENTS]?.primary;
    }, [agentModels]);

    // Output State
    const [generatedLetter, setGeneratedLetter] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    // History State
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Chat State
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    // Suggestions State
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [addressedSuggestions, setAddressedSuggestions] = useState<Set<number>>(new Set());
    const [suggestionScores, setSuggestionScores] = useState<Map<number, number>>(new Map());
    const [submittedSuggestions, setSubmittedSuggestions] = useState<Set<number>>(new Set());

    // Score State
    const [completenessScore, setCompletenessScore] = useState<number | null>(null);
    const [isScoring, setIsScoring] = useState(false);

    // Metadata State
    const [modelUsage, setModelUsage] = useState<{ generated?: string, reviewed?: string, refined?: string }>({});
    
    // Recommendation State
    const [recommendedLength, setRecommendedLength] = useState<string>("Short");

    // Sync State
    const [isSyncing, setIsSyncing] = useState(false);
    const lastSyncedLetterRef = useRef<string>("");

    // Debounced suggestion matching
    const matchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleChatInputChange = (value: string) => {
        setChatInput(value);

        // Clear existing timeout
        if (matchTimeoutRef.current) {
            clearTimeout(matchTimeoutRef.current);
        }

        // If input is empty, clear addressed suggestions
        if (!value.trim()) {
            setAddressedSuggestions(new Set());
            setSuggestionScores(new Map());
            return;
        }

        // Only match if there are suggestions and a letter exists
        if (suggestions.length === 0 || !generatedLetter) {
            return;
        }

        // Debounce the match API call - use agent-based with longer debounce
        matchTimeoutRef.current = setTimeout(async () => {
            try {
                // Try agent-based matching first
                const response = await fetch("/api/match-suggestions-agent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chatInput: value,
                        suggestions,
                        model: getModelFor(AGENTS.MATCH_SUGGESTIONS.id)
                    }),
                });
                const data = await response.json();
                if (data.matchedSuggestions && Array.isArray(data.matchedSuggestions)) {
                    const indices = data.matchedSuggestions.map((m: { index: number; score: number }) => m.index);
                    const scores = new Map<number, number>(
                        data.matchedSuggestions.map((m: { index: number; score: number }) => [m.index, m.score] as [number, number])
                    );
                    setAddressedSuggestions(new Set(indices));
                    setSuggestionScores(scores);
                } else {
                    // Fallback to embedding-based matching
                    const embeddingResponse = await fetch("/api/match-suggestions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            chatInput: value,
                            suggestions,
                            model: getModelFor(AGENTS.MATCH_SUGGESTIONS_SCORER.id)
                        }),
                    });
                    const embeddingData = await embeddingResponse.json();
                    if (embeddingData.matchedIndices && Array.isArray(embeddingData.matchedIndices)) {
                        setAddressedSuggestions(new Set(embeddingData.matchedIndices));
                        setSuggestionScores(new Map());
                    }
                }
            } catch (error) {
                console.error("Failed to match suggestions:", error);
            }
        }, 800); // 800ms debounce for agent-based approach
    };

    // Effect to fetch recommended length when rough notes change
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (roughNotes.trim().length > 10) {
                fetch("/api/recommend-length", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        roughNotes,
                        model: getModelFor(AGENTS.RECOMMEND_LENGTH.id)
                    }),
                })
                .then(res => res.json())
                .then(data => {
                    if (data.recommendation) {
                        setRecommendedLength(data.recommendation);
                    }
                })
                .catch(err => console.error("Failed to get length recommendation", err));
            }
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(timer);
    }, [roughNotes, getModelFor]);

    // TODO: Implement History and Chat in next iteration if needed, keeping simple for now to match verified plan steps for migration first.

    const fetchScore = async (roughNotes: string, letter: string) => {
        setIsScoring(true);
        try {
            const response = await fetch("/api/score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    roughNotes, 
                    letter,
                    model: getModelFor(AGENTS.SCORED.id)
                }),
            });
            const data = await response.json();
            if (typeof data.score === 'number') {
                setCompletenessScore(data.score);
                // Update current history item with the score
                setHistory(prev => {
                    if (prev.length === 0) return prev;
                    const newHistory = [...prev];
                    // Assuming the last item is the current one being scored
                    // However, fetchScore is async and might finish after history is updated.
                    // A safer way is to update the item at historyIndex if it matches.
                    // For simplicity, we'll update the latest item if we are at the end.
                    const lastIdx = newHistory.length - 1;
                    if (lastIdx >= 0) {
                        newHistory[lastIdx] = { ...newHistory[lastIdx], score: data.score };
                    }
                    return newHistory;
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsScoring(false);
        }
    };

    const fetchSuggestions = async (currentRoughNotes: string, currentLetter: string) => {
        if (!currentRoughNotes.trim()) return;
        setIsSuggesting(true);
        try {
            const response = await fetch("/api/suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    roughNotes: currentRoughNotes, 
                    context: "Letter", 
                    recipient,
                    tone,
                    length,
                    generatedLetter: currentLetter,
                    model: getModelFor(AGENTS.SUGGEST.id)
                }),
            });
            const data = await response.json();
            if (data.suggestions) {
                setSuggestions(data.suggestions);
            }
            if (data.usedModel) {
                setModelUsage(prev => ({ ...prev, reviewed: data.usedModel }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleApplySuggestion = (suggestion: string) => {
        setRoughNotes(prev => prev + (prev.trim() ? "\n- " : "- ") + suggestion);
        setSuggestions(prev => prev.filter(s => s !== suggestion));
    };

    const handleSyncNotes = async () => {
        // Only sync if letter has content and has changed since last sync/load
        if (!generatedLetter || generatedLetter === lastSyncedLetterRef.current) return;

        setIsSyncing(true);
        try {
            const response = await fetch("/api/sync-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roughNotes: roughNotes,
                    editedLetter: generatedLetter,
                    model: getModelFor(AGENTS.SYNC_NOTES.id)
                }),
            });
            
            const data = await response.json();
            
            // Update the ref immediately so we don't re-sync the same changes
            lastSyncedLetterRef.current = generatedLetter;

            if (data.newPoints && data.newPoints.length > 0) {
                const pointsText = data.newPoints.map((p: string) => `- ${p}`).join("\n");
                
                // Update Rough Notes State
                setRoughNotes(prev => {
                    const separator = prev.trim() ? "\n" : "";
                    return prev + separator + pointsText;
                });

                // Update History to persist the manual edits and the new rough notes
                setHistory(prev => {
                    const newHistory = [...prev];
                    if (historyIndex >= 0 && historyIndex < newHistory.length) {
                        newHistory[historyIndex] = {
                            ...newHistory[historyIndex],
                            roughNotes: newHistory[historyIndex].roughNotes + (newHistory[historyIndex].roughNotes.trim() ? "\n" : "") + pointsText,
                            letter: generatedLetter
                        };
                    }
                    return newHistory;
                });
            } else {
                // Even if no new points, we should save the edited letter to history
                setHistory(prev => {
                    const newHistory = [...prev];
                    if (historyIndex >= 0 && historyIndex < newHistory.length) {
                        newHistory[historyIndex] = {
                            ...newHistory[historyIndex],
                            letter: generatedLetter
                        };
                    }
                    return newHistory;
                });
            }
        } catch (e) {
            console.error("Failed to sync notes", e);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleGenerate = async () => {
        if (!roughNotes.trim()) {
            setError("Please enter some details.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedLetter("");
        setSuggestions([]); // Clear old suggestions
        setAddressedSuggestions(new Set()); // Clear addressed suggestions
        setSuggestionScores(new Map()); // Clear scores
        setSubmittedSuggestions(new Set()); // Clear submitted suggestions

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipient,
                    sender,
                    tone,
                    length,
                    language,
                    roughNotes,
                    styleExample,
                    model: getModelFor(AGENTS.GENERATE.id)
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate letter");
            }

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const text = data.text;
            setGeneratedLetter(text);
            lastSyncedLetterRef.current = text;
            if (data.usedModel) {
                setModelUsage(prev => ({ ...prev, generated: data.usedModel }));
            }

            // Update history
            setHistory(prev => {
                const newHistory = [...prev, { letter: text, roughNotes: roughNotes, chatHistory: [...chatHistory], score: null }];
                setHistoryIndex(newHistory.length - 1); // Point to the new latest
                return newHistory;
            });

            // Automatically fetch suggestions
            fetchSuggestions(roughNotes, text);

            // Calculate Completeness Score
            const inputs = `${recipient}\n${roughNotes}\n${sender}`;
            fetchScore(inputs, text);

        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistoryNav = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setGeneratedLetter(history[newIndex].letter);
            lastSyncedLetterRef.current = history[newIndex].letter;
            setRoughNotes(history[newIndex].roughNotes);
            if (history[newIndex].chatHistory) {
                setChatHistory(history[newIndex].chatHistory);
            }
            setCompletenessScore(history[newIndex].score);
        } else if (direction === 'next' && historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setGeneratedLetter(history[newIndex].letter);
            lastSyncedLetterRef.current = history[newIndex].letter;
            setRoughNotes(history[newIndex].roughNotes);
            if (history[newIndex].chatHistory) {
                setChatHistory(history[newIndex].chatHistory);
            }
            setCompletenessScore(history[newIndex].score);
        }
    };

    const handleChatSubmit = async () => {
        if (!chatInput.trim() || !roughNotes.trim()) return;

        const instructions = chatInput;
        const newChatEntry = { role: 'user' as const, text: instructions };
        const updatedChatHistory = [...chatHistory, newChatEntry];
        
        // Capture currently addressed suggestions before clearing chat input
        const currentlyAddressed = new Set(addressedSuggestions);
        
        // Mark currently addressed suggestions as submitted
        setSubmittedSuggestions(prev => new Set([...prev, ...currentlyAddressed]));
        
        setChatInput("");
        setChatHistory(updatedChatHistory);
        
        setIsChatLoading(true);
        setError(null);

        try {
            // 1. Refine the rough notes based on instructions
            const refineResponse = await fetch("/api/refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roughNotes: roughNotes,
                    instructions,
                    conversationHistory: updatedChatHistory,
                    model: getModelFor(AGENTS.REFINE.id)
                }),
            });

            if (!refineResponse.ok) throw new Error("Failed to refine rough notes");
            const refineData = await refineResponse.json();
            if (refineData.error) throw new Error(refineData.error);

            const newRoughNotes = refineData.text;
            if (refineData.usedModel) {
                setModelUsage(prev => ({ ...prev, refined: refineData.usedModel }));
            }
            setRoughNotes(newRoughNotes);
            
            const modelMsg = { role: 'model' as const, text: "Rough notes updated. Regenerating letter..." };
            const finalChatHistory = [...updatedChatHistory, modelMsg];
            setChatHistory(finalChatHistory);

            // 2. Auto-regenerate letter with new rough notes
            // We need to call generation logic again. To avoid duplicating code, 
            // we'll extract the core generation logic or just call a similar fetch here.

            // Re-use logic:
            setIsLoading(true);
            const genResponse = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipient,
                    sender,
                    tone,
                    length,
                    language,
                    roughNotes: newRoughNotes, // use updated rough notes
                    model: getModelFor(AGENTS.GENERATE.id)
                }),
            });

            if (!genResponse.ok) throw new Error("Failed to regenerate letter");
            const genData = await genResponse.json();
            if (genData.error) throw new Error(genData.error);

            const text = genData.text;
            setGeneratedLetter(text);
            lastSyncedLetterRef.current = text;
            if (genData.usedModel) {
                setModelUsage(prev => ({ ...prev, generated: genData.usedModel }));
            }
            setHistory(prev => {
                const newHistory = [...prev, { letter: text, roughNotes: newRoughNotes, chatHistory: finalChatHistory, score: null }];
                setHistoryIndex(newHistory.length - 1);
                return newHistory;
            });

            // Remove addressed suggestions after successful refinement
            setSuggestions(prev => prev.filter((_, i) => !currentlyAddressed.has(i)));
            setAddressedSuggestions(new Set());
            setSuggestionScores(new Map());
            setSubmittedSuggestions(new Set());

            // Automatically fetch suggestions for the new rough notes
            fetchSuggestions(newRoughNotes, text);

            // Recalculate Score
            const inputs = `${sender}\n${newRoughNotes}\n${recipient}`;
            fetchScore(inputs, text);

        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to update rough notes");
            }
        } finally {
            setIsChatLoading(false);
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLetter).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className={styles.appContainer}>

            {/* LEFT PANEL */}
            <div className={styles.leftPanel}>
                <div className={styles.scrollArea}>
                    <header className={styles.header}>
                        <div>
                            <div className={styles.titleGroup}>
                                <div className={styles.logoBox}>
                                    <PenToolIcon />
                                </div>
                                <h1 className={styles.title}>
                                    Letterly: <span className={styles.subtitle}>Messy thoughts to polished letters.</span>
                                </h1>
                                <div className={styles.tooltipContainer}>
                                    <InfoIcon />
                                    <div className={styles.tooltipText}>
                                        Let AI assist you by writing a draft.
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* About button could go here */}
                    </header>

                    <div className={styles.formGrid}>
                        <div className={styles.fieldGroupRow}>
                            <label className={styles.label}>From</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="text"
                                    className={`${styles.input} ${styles.inputWithIcon}`}
                                    value={sender}
                                    onChange={(e) => setSender(e.target.value)}
                                    placeholder="Your Name"
                                />
                                <div className={styles.inputIcon}><UserIcon /></div>
                            </div>
                        </div>
                        <div className={styles.fieldGroupRow}>
                            <label className={styles.label}>To</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="text"
                                    className={`${styles.input} ${styles.inputWithIcon}`}
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    placeholder="Receiver"
                                />
                                <div className={styles.inputIcon}><UserIcon /></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.fieldGroupRow}>
                            <label className={styles.label}>Tone</label>
                            <div className={styles.inputWrapper}>
                                <select
                                    className={styles.input}
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                >
                                    {TONE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={styles.fieldGroupRow}>
                            <label className={styles.label}>Length</label>
                            <div className={styles.toggleGroup}>
                                {LENGTH_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setLength(opt.value)}
                                        className={`${styles.toggleBtn} ${length === opt.value ? styles.toggleBtnActive : ''} ${recommendedLength === opt.value && roughNotes.length > 0 ? styles.toggleBtnRecommended : ''}`}
                                        title={recommendedLength === opt.value ? "Recommended based on your notes" : ""}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: "1.5rem" }}>
                        <label className={styles.label} style={{ marginBottom: "0.5rem" }}>
                            Rough Notes <span style={{ color: "var(--status-error)" }}>*</span>
                        </label>
                        <textarea
                            className={styles.textarea}
                            style={{ minHeight: "160px" }}
                            value={roughNotes}
                            onChange={(e) => setRoughNotes(e.target.value)}
                            placeholder={"- Ask about the project timeline\n- Mention the budget constraints\n- Express excitement for the collaboration..."}
                        />
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                        <label className={styles.label} style={{ marginBottom: "0.5rem" }}>Output Language</label>
                        <div className={styles.toggleGroup}>
                            {["English", "Spanish (LatAm)", "Italian"].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={`${styles.toggleBtn} ${language === lang ? styles.toggleBtnActive : ''}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>

<div style={{ marginTop: "1rem" }}>
                        <details className={styles.details}>
                            <summary className={styles.summary}>
                                Style Match (Optional)
                            </summary>
                            <div style={{ paddingTop: "0.5rem" }}>
                                <textarea
                                    className={styles.textarea}
                                    style={{ height: "6rem", fontSize: "0.75rem" }}
                                    value={styleExample}
                                    onChange={(e) => setStyleExample(e.target.value)}
                                    placeholder="Paste an email or letter here, and the AI will try to mimic its writing style."
                                />
                            </div>
                        </details>
                    </div>

                    <div className={styles.writersRoomContainer} style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
                        <button 
                            className={styles.writersRoomBtn} 
                            onClick={() => setIsSettingsOpen(true)}
                            title="Configure AI Models"
                        >
                             <TeamIcon />
                             Writers&apos; Room
                        </button>
                    </div>
                    
                    {error && (
                        <div style={{ marginTop: "1rem", color: "var(--status-error)", fontSize: "0.875rem" }}>
                            Warning: {error}
                        </div>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className={`${styles.generateBtn} ${isLoading ? styles.generateBtnDisabled : ''}`}
                    >
                        {isLoading ? (
                            <>
                                <div className={styles.spinner}></div>
                                Writing...
                            </>
                        ) : (
                            <>
                                <SparklesIcon />
                                Generate Draft
                            </>
                        )}
                    </button>

                    <div className={styles.statsBarLeft}>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Letter:</span>
                        <span>{generatedLetter ? generatedLetter.trim().split(/\s+/).filter(w => w.length > 0).length : 0} words</span>
                        <span>•</span>
                        <span>{generatedLetter ? generatedLetter.length : 0} chars</span>
                        <span>•</span>
                        <span>~{generatedLetter ? Math.max(1, Math.ceil(generatedLetter.trim().split(/\s+/).filter(w => w.length > 0).length / 300)) : 0} pages</span>
                        
                        {completenessScore !== null && (
                            <>
                                <span>•</span>
                                <span title="Completeness Score (Cosine Similarity)" style={{ color: completenessScore > 0.8 ? 'var(--status-success)' : 'var(--text-secondary)' }}>
                                    {Math.round(completenessScore * 100)}% Match
                                </span>
                            </>
                        )}
                        {isScoring && <span>• Scoring...</span>}
                        {isSyncing && <span style={{ color: "var(--color-primary)" }}>• Syncing Notes...</span>}
                    </div>

                    {(modelUsage.generated || modelUsage.reviewed || modelUsage.refined) && (
                        <div style={{ marginTop: "0.5rem", fontSize: "0.65rem", opacity: 0.7, textAlign: "center", color: "var(--text-secondary)", display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                            {modelUsage.generated && <span>Generated: {modelUsage.generated.split('/').pop()}</span>}
                            {modelUsage.reviewed && <span>Reviewed: {modelUsage.reviewed.split('/').pop()}</span>}
                            {modelUsage.refined && <span>Refined: {modelUsage.refined.split('/').pop()}</span>}
                        </div>
                    )}
                    
                    <div style={{ height: "1rem" }}></div>
                </div>
            </div>

            <div className={styles.centerPanel}>
                <div className={styles.paperSheet}>
                    {!generatedLetter && !isLoading && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}><PenToolIcon /></div>
                            <p>Ready to write.</p>
                        </div>
                    )}

                    {generatedLetter && (
                        <textarea
                            className={styles.paperContent}
                            value={generatedLetter}
                            onChange={(e) => setGeneratedLetter(e.target.value)}
                            onBlur={handleSyncNotes}
                        />
                    )}
                </div>

                {generatedLetter && (
                    <>
                        <div className={styles.floatingBar}>
                            <div className={styles.navGroup}>
                                <button
                                    onClick={() => handleHistoryNav('prev')}
                                    disabled={historyIndex <= 0}
                                    className={`${styles.navBtn} ${historyIndex <= 0 ? styles.navBtnDisabled : ''}`}
                                >
                                    <ChevronLeftIcon />
                                </button>
                                <span className={styles.versionLabel}>
                                    v{historyIndex + 1} <span style={{ opacity: 0.5 }}>/ {history.length}</span>
                                </span>
                                <button
                                    onClick={() => handleHistoryNav('next')}
                                    disabled={historyIndex >= history.length - 1}
                                    className={`${styles.navBtn} ${historyIndex >= history.length - 1 ? styles.navBtnDisabled : ''}`}
                                >
                                    <ChevronRightIcon />
                                </button>
                            </div>

                            <div className={styles.divider}></div>

                            <button onClick={copyToClipboard} className={styles.actionBtn}>
                                {isCopied ? <CheckIcon /> : <CopyIcon />}
                                {isCopied ? "Copied" : "Copy"}
                            </button>
                            <div className={styles.divider}></div>
                            <button onClick={() => {
                                setGeneratedLetter("");
                                setHistory([]);
                                setHistoryIndex(-1);
                            }} className={`${styles.actionBtn} ${styles.clearBtn}`}>
                                <EraserIcon />
                                Clear
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className={styles.rightPanel}>
                {generatedLetter && (
                    <div className={styles.reviewPanel}>
                        <div className={styles.reviewHeader}>
                            <span className={styles.reviewTitle}>Editor Review <span style={{ fontWeight: 'normal', opacity: 0.7 }}>— suggestions for refinement</span></span>
                            {isSuggesting && <div className={styles.spinner} style={{ width: "1rem", height: "1rem", borderColor: "var(--text-secondary)", borderTopColor: "transparent" }}></div>}
                        </div>
                        {suggestions.length > 0 ? (
                            <div className={styles.suggestionsList}>
                                {suggestions.map((s, i) => {
                                    const score = suggestionScores.get(i);
                                    const isAddressed = addressedSuggestions.has(i);
                                    const isSubmitted = submittedSuggestions.has(i);
                                    const tintOpacity = score !== undefined ? score : 0;
                                    
                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => handleApplySuggestion(s)} 
                                            className={`${styles.suggestionChip} ${isSubmitted ? styles.suggestionChipSubmitted : ''}`}
                                            style={isAddressed && score !== undefined ? {
                                                opacity: tintOpacity,
                                                backgroundColor: `rgba(var(--accent-primary-rgb), ${1 - tintOpacity})`,
                                                borderColor: `rgba(var(--accent-primary-rgb), ${1 - tintOpacity})`,
                                                color: 'white'
                                            } : undefined}
                                            title={isAddressed ? `Match confidence: ${Math.round((1 - tintOpacity) * 100)}%` : undefined}
                                        >
                                            + {s}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className={styles.suggestionsEmpty}>
                                {isSuggesting ? "Analyzing draft..." : "No major issues found."}
                            </p>
                        )}
                    </div>
                )}

                <div className={styles.chatPanel}>
                    <div className={styles.chatHeader}>
                        <h3 className={styles.chatTitle}>Refine & Iterate</h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem", lineHeight: "1.4" }}>
                            Chat with the AI to tweak your rough notes and regenerate the letter.
                        </p>
                    </div>

                    <div className={styles.chatHistory}>
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`${styles.chatMessage} ${msg.role === 'user' ? styles.chatMessageUser : styles.chatMessageModel}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <div className={styles.chatInputWrapper}>
                        <input
                            type="text"
                            className={styles.chatInput}
                            placeholder={generatedLetter ? "Refine draft (e.g. 'Add more urgency')..." : "Generate a draft first to refine"}
                            value={chatInput}
                            onChange={(e) => handleChatInputChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                            disabled={isChatLoading || isLoading || !generatedLetter}
                        />
                        <button
                            className={styles.chatSendBtn}
                            onClick={handleChatSubmit}
                            disabled={isChatLoading || isLoading || !chatInput.trim() || !generatedLetter}
                        >
                            {isChatLoading ? <div className={styles.spinner}></div> : <SparklesIcon />}
                        </button>
                    </div>
                </div>
            </div>

            <AgentModelSettings 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                assignments={agentModels}
                onAssignmentChange={(agentId, modelId) => setAgentModels(prev => ({ ...prev, [agentId]: modelId }))}
            />
        </div>
    );
}
