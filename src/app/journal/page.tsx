// app/journal/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/index";
import { addJournalEntry, deleteJournalEntry, updateJournalEntry, setJournalEntries } from "@/store/journalSlice";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

// --- Types ---
export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    mood?: string;
    tags?: string[];
}

// --- Helper Functions ---
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDate(dateString);
};

// --- Main Component ---
export default function JournalPage() {
    const dispatch = useDispatch();
    const entries = useSelector((state: RootState) => state.journal.entries);
    const [isClient, setIsClient] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
    const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

    // Load entries from localStorage on client side only
    useEffect(() => {
        setIsClient(true);
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("journalEntries");
            if (saved) {
                try {
                    const entries = JSON.parse(saved);
                    dispatch(setJournalEntries(entries));
                } catch (e) {}
            }
        }
    }, [dispatch]);

    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const handleSaveEntry = () => {
        if (!content.trim() && !title.trim()) return;

        const now = new Date().toISOString();

        if (editingEntry) {
            const updatedEntry: JournalEntry = {
                ...editingEntry,
                title: title.trim() || "Untitled",
                content: content.trim(),
                updatedAt: now,
            };
            dispatch(updateJournalEntry(updatedEntry));
        } else {
            const newEntry: JournalEntry = {
                id: `entry-${Date.now()}`,
                title: title.trim() || "Untitled",
                content: content.trim(),
                createdAt: now,
                updatedAt: now,
            };
            dispatch(addJournalEntry(newEntry));
        }

        setTitle("");
        setContent("");
        setEditingEntry(null);
    };

    const handleEditEntry = (entry: JournalEntry) => {
        setEditingEntry(entry);
        setTitle(entry.title);
        setContent(entry.content);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setTitle("");
        setContent("");
        setEditingEntry(null);
    };

    const handleDeleteEntry = (id: string) => {
        if (window.confirm("Delete this entry?")) {
            dispatch(deleteJournalEntry(id));
            if (editingEntry?.id === id) {
                handleCancelEdit();
            }
        }
    };

    const toggleExpand = (entryId: string) => {
        setExpandedEntryId(expandedEntryId === entryId ? null : entryId);
    };

    // Don't render until client-side to avoid hydration mismatch
    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-amber-100 rounded-xl">
                            <div className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                            Journal
                        </h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            0
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-amber-100 rounded-xl">
                            <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                            Journal
                        </h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            {entries.length}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-11">
                        Daily Pages
                    </p>
                </div>

                {/* Entry Editor */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden mb-8">
                    <div className="p-5 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                <span>{editingEntry ? "Editing" : "New entry"}</span>
                            </div>
                            {editingEntry && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="text-xs text-slate-400 hover:text-slate-600"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        {/* Title Input */}
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title your entry..."
                            className="w-full text-xl font-semibold text-slate-900 placeholder:text-slate-300 bg-transparent border-0 border-b border-slate-200 pb-2 focus:ring-0 focus:outline-none focus:border-amber-400"
                        />

                        {/* Content Textarea */}
                        <div className="mt-4">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What is present for you right now?"
                                className="min-h-[180px] resize-none border-0 p-0 text-slate-700 placeholder:text-slate-300 focus:ring-0 focus:outline-none text-base leading-relaxed"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                            <Button
                                onClick={handleSaveEntry}
                                variant="secondary"
                            >
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                {editingEntry ? "Update Entry" : "Save Entry"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Past Entries */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                            Past Writings
                        </h2>
                    </div>

                    {sortedEntries.length === 0 ? (
                        <div className="text-center py-12 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-sm text-slate-400">No entries yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedEntries.map((entry) => {
                                const isExpanded = expandedEntryId === entry.id;
                                const previewText =
                                    entry.content.length > 120
                                        ? `${entry.content.slice(0, 120)}...`
                                        : entry.content;

                                return (
                                    <div
                                        key={entry.id}
                                        className={`bg-white rounded-xl border transition-all ${
                                            isExpanded
                                                ? "border-amber-200 shadow-md"
                                                : "border-slate-200 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="p-4 md:p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div
                                                    className="flex-1 min-w-0 cursor-pointer"
                                                    onClick={() => toggleExpand(entry.id)}
                                                >
                                                    <h3 className="font-medium text-slate-900">
                                                        {entry.title || "Untitled"}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                        <span>{formatDate(entry.createdAt)}</span>
                                                        <span>·</span>
                                                        <span>{getTimeAgo(entry.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditEntry(entry);
                                                        }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                                        title="Edit entry"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteEntry(entry.id);
                                                        }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                        title="Delete entry"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => toggleExpand(entry.id)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                                    >
                                                        {isExpanded ? (
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {!isExpanded && (
                                                <p
                                                    className="mt-2 text-sm text-slate-500 line-clamp-2 cursor-pointer"
                                                    onClick={() => toggleExpand(entry.id)}
                                                >
                                                    {previewText}
                                                </p>
                                            )}

                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                                        {entry.content}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}0