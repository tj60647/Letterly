"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./LetterApp.module.css";
import { ModelSelector } from "./ModelSelector";
import {
    SparklesIcon, CopyIcon, CheckIcon, EraserIcon,
    UserIcon, PenToolIcon, InfoIcon,
    ChevronLeftIcon, ChevronRightIcon
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

export default function LetterApp() {
    // Config State
    const [recipient, setRecipient] = useState("");
    const [sender, setSender] = useState("");
    const [tone, setTone] = useState("Professional");
    const [length, setLength] = useState("Medium");
    const [draft, setDraft] = useState("");
    const [model, setModel] = useState("google/gemini-2.0-flash-exp:free");

    // Output State
    const [generatedLetter, setGeneratedLetter] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    // History State
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Chat State
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);

    // TODO: Implement History and Chat in next iteration if needed, keeping simple for now to match verified plan steps for migration first.

    const handleGenerate = async () => {
        if (!draft.trim()) {
            setError("Please enter some details.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedLetter("");

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipient,
                    sender,
                    tone,
                    length,
                    draft,
                    model
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate letter");
            }

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const text = data.text;
            setGeneratedLetter(text);

            // Update history
            setHistory(prev => {
                const newHistory = [...prev, text];
                setHistoryIndex(newHistory.length - 1); // Point to the new latest
                return newHistory;
            });

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistoryNav = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setGeneratedLetter(history[newIndex]);
        } else if (direction === 'next' && historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setGeneratedLetter(history[newIndex]);
        }
    };

    const handleChatSubmit = async () => {
        if (!chatInput.trim() || !draft.trim()) return;

        const instructions = chatInput;
        setChatInput("");
        setIsChatLoading(true);
        setError(null);

        try {
            // 1. Refine the draft based on instructions
            const refineResponse = await fetch("/api/refine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    draft,
                    instructions,
                    model
                }),
            });

            if (!refineResponse.ok) throw new Error("Failed to refine draft");
            const refineData = await refineResponse.json();
            if (refineData.error) throw new Error(refineData.error);

            const newDraft = refineData.text;
            setDraft(newDraft);

            // 2. Auto-regenerate letter with new draft
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
                    draft: newDraft, // use updated draft
                    model
                }),
            });

            if (!genResponse.ok) throw new Error("Failed to regenerate letter");
            const genData = await genResponse.json();
            if (genData.error) throw new Error(genData.error);

            const text = genData.text;
            setGeneratedLetter(text);
            setHistory(prev => {
                const newHistory = [...prev, text];
                setHistoryIndex(newHistory.length - 1);
                return newHistory;
            });

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to update draft");
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
                                <h1 className={styles.title}>Letterly</h1>
                            </div>
                            <p className={styles.subtitle}>Messy thoughts to polished letters.</p>
                        </div>
                        {/* About button could go here */}
                    </header>

                    <div className={styles.formGrid}>
                        <div className={styles.fieldGroup}>
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
                        <div className={styles.fieldGroup}>
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
                        <div className={styles.fieldGroup}>
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
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Length</label>
                            <div className={styles.toggleGroup}>
                                {LENGTH_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setLength(opt.value)}
                                        className={`${styles.toggleBtn} ${length === opt.value ? styles.toggleBtnActive : ''}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <ModelSelector value={model} onChange={setModel} />

                    <div style={{ marginTop: "1.5rem" }}>
                        <label className={styles.label} style={{ marginBottom: "0.5rem" }}>
                            Rough Notes <span style={{ color: "var(--status-error)" }}>*</span>
                        </label>
                        <textarea
                            className={styles.textarea}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder={"- Ask about the project timeline\n- Mention the budget constraints\n- Express excitement for the collaboration..."}
                        />
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
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className={styles.rightPanel}>
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
                        />
                    )}
                </div>

                {generatedLetter && (
                    <>
                        <div className={styles.chatSection}>
                            <div className={styles.chatInputWrapper}>
                                <input
                                    type="text"
                                    className={styles.chatInput}
                                    placeholder="Make it shorter, add more detail..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                                    disabled={isChatLoading || isLoading}
                                />
                                <button
                                    className={styles.chatSendBtn}
                                    onClick={handleChatSubmit}
                                    disabled={isChatLoading || isLoading || !chatInput.trim()}
                                >
                                    {isChatLoading ? <div className={styles.spinner}></div> : <SparklesIcon />}
                                </button>
                            </div>
                        </div>

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

        </div>
    );
}
