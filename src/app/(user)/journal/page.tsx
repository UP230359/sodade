// app/journal/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/index";
import { 
    fetchJournalEntries, 
    createJournalEntry, 
    updateJournalEntry, 
    deleteJournalEntry,
    selectAllEntries,
    selectJournalLoading,
} from "@/store/journalSlice";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

// --- Types ---
export interface JournalEntry {
    entry_id: number;
    user_id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
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
    // ✅ CORREGIDO: useDispatch<AppDispatch>() - no AppDispatch()
    const dispatch = useDispatch<AppDispatch>();
    const entries = useSelector(selectAllEntries) || [];
    const loading = useSelector(selectJournalLoading) || false;
    const [userId] = useState(1);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
    const [expandedEntryId, setExpandedEntryId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<number | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Cargar entradas al montar
    useEffect(() => {
        dispatch(fetchJournalEntries(userId));
    }, [dispatch, userId]);

    const sortedEntries = [...entries].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    useEffect(() => {
        if (titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, []);

    const handleSaveEntry = async () => {
        if (!content.trim() && !title.trim()) {
            setSaveFeedback("error");
            setTimeout(() => setSaveFeedback("idle"), 2000);
            return;
        }

        setIsSaving(true);
        setSaveFeedback("saving");

        try {
            if (editingEntry) {
                await dispatch(updateJournalEntry({
                    entry_id: editingEntry.entry_id,
                    title: title.trim() || "Untitled",
                    content: content.trim(),
                })).unwrap();
            } else {
                await dispatch(createJournalEntry({
                    user_id: userId,
                    title: title.trim() || "Untitled",
                    content: content.trim(),
                })).unwrap();
            }

            // ✅ Recargar después de guardar para asegurar sincronía
            await dispatch(fetchJournalEntries(userId));

            resetForm();
            setSaveFeedback("saved");
            setTimeout(() => setSaveFeedback("idle"), 1500);

            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        } catch (error) {
            console.error('Error saving entry:', error);
            setSaveFeedback("error");
            setTimeout(() => setSaveFeedback("idle"), 2000);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setContent("");
        setEditingEntry(null);
    };

    const handleEditEntry = (entry: JournalEntry) => {
        setEditingEntry(entry);
        setTitle(entry.title);
        setContent(entry.content);
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (titleInputRef.current) {
            titleInputRef.current.focus();
        }
    };

    const handleCancelEdit = () => {
        resetForm();
        setSaveFeedback("idle");
    };

    const handleDeleteClick = (entry_id: number) => {
        setEntryToDelete(entry_id);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (entryToDelete === null) return;

        try {
            await dispatch(deleteJournalEntry(entryToDelete)).unwrap();
            // ✅ Recargar después de eliminar
            await dispatch(fetchJournalEntries(userId));
            setShowDeleteModal(false);
            setEntryToDelete(null);
            if (editingEntry?.entry_id === entryToDelete) {
                resetForm();
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setEntryToDelete(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSaveEntry();
        }
    };

    const toggleExpand = (entry_id: number) => {
        setExpandedEntryId(expandedEntryId === entry_id ? null : entry_id);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Journal</h1>
                    <p className="text-sm text-slate-400 mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm text-amber-700/50">Daily Pages</p>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Journal</h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            {entries.length}
                        </span>
                    </div>
                </div>

                {/* Entry Editor */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden mb-8">
                    <div className="p-5 md:p-6">
                        {editingEntry && (
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span>Editing</span>
                                    <span className="text-xs text-slate-400">· {formatDate(editingEntry.created_at)}</span>
                                </div>
                                <button onClick={handleCancelEdit} className="text-xs text-slate-400 hover:text-slate-600">
                                    Cancel
                                </button>
                            </div>
                        )}

                        <input
                            ref={titleInputRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title your entry..."
                            className="w-full text-xl font-semibold text-slate-900 placeholder:text-slate-300 bg-transparent border-0 border-b border-slate-200 pb-2 focus:ring-0 focus:outline-none focus:border-amber-400"
                            onKeyDown={handleKeyDown}
                        />

                        <div className="mt-4">
                            <Textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What is present for you right now?"
                                className="min-h-[180px] resize-none border-0 p-0 text-slate-700 placeholder:text-slate-300 focus:ring-0 focus:outline-none text-base leading-relaxed"
                                onKeyDown={handleKeyDown}
                            />
                            {content.length > 0 && (
                                <div className="text-xs text-slate-400 text-right mt-1">
                                    {content.length} characters
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                {saveFeedback === "saving" && <span className="text-sm text-slate-400 animate-pulse">Saving...</span>}
                                {saveFeedback === "saved" && <span className="text-sm text-green-600">✓ Saved!</span>}
                                {saveFeedback === "error" && <span className="text-sm text-red-500">Please add some content</span>}
                                <Button onClick={handleSaveEntry} disabled={isSaving} variant="primary">
                                    {editingEntry ? "Update Entry" : "Save Entry"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Past Entries */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Past Writings</h2>
                    </div>

                    {sortedEntries.length === 0 ? (
                        <div className="text-center py-12 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-sm text-slate-400">No entries yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedEntries.map((entry) => {
                                const isExpanded = expandedEntryId === entry.entry_id;
                                const previewText = entry.content.length > 120
                                    ? `${entry.content.slice(0, 120)}...`
                                    : entry.content;

                                return (
                                    <div
                                        key={entry.entry_id}
                                        className={`bg-white rounded-xl border transition-all ${
                                            isExpanded ? "border-amber-200 shadow-md" : "border-slate-200 hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="p-4 md:p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(entry.entry_id)}>
                                                    <h3 className="font-medium text-slate-900">{entry.title || "Untitled"}</h3>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                        <span>{formatDate(entry.created_at)}</span>
                                                        <span>·</span>
                                                        <span>{getTimeAgo(entry.created_at)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button onClick={(e) => { e.stopPropagation(); handleEditEntry(entry); }} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50">
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(entry.entry_id); }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => toggleExpand(entry.entry_id)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
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
                                                <p className="mt-2 text-sm text-slate-500 line-clamp-2 cursor-pointer" onClick={() => toggleExpand(entry.entry_id)}>
                                                    {previewText}
                                                </p>
                                            )}

                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.content}</p>
                                                    <div className="mt-2 text-xs text-slate-400">Updated {getTimeAgo(entry.updated_at)}</div>
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

            {/* Modal de Confirmación de Eliminación */}
            {showDeleteModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={handleCancelDelete}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200/80"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Delete Entry</h2>
                            <p className="text-sm text-slate-500 mt-2">
                                Are you sure you want to delete this journal entry? 
                                <br />
                                <span className="text-red-500 font-medium">This action cannot be undone.</span>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelDelete}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}