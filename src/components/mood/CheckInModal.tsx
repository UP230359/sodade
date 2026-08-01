// src/components/mood/CheckInModal.tsx
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface CheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function CheckInModal({ isOpen, onClose, onSave }: CheckInModalProps) {
    const [emotion, setEmotion] = useState("");
    const [note, setNote] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold mb-4">Check-in</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">How are you feeling?</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={emotion}
                            onChange={(e) => setEmotion(e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="joy">Joy</option>
                            <option value="calm">Calm</option>
                            <option value="sadness">Sadness</option>
                            <option value="anger">Anger</option>
                            <option value="fear">Fear</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="What's on your mind?"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={() => onSave({ emotion, note })}>Save</Button>
                </div>
            </div>
        </div>
    );
}