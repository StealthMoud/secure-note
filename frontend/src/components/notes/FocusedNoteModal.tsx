'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { marked } from 'marked';
import { Note } from '@/types/note';
import { getTagColor } from '@/utils/tagColors';

interface FocusedNoteModalProps {
    focusedNote: Note;
    setFocusedNote: (note: Note | null) => void;
}

export const FocusedNoteModal: React.FC<FocusedNoteModalProps> = ({
    focusedNote,
    setFocusedNote,
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fadeInShort">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                onClick={() => setFocusedNote(null)}
            />
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/5 dark:ring-white/10">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <div className="flex flex-col">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {focusedNote.title}
                        </h3>
                        <div className="flex gap-2 mt-2">
                            {(focusedNote.tags || []).map(tag => (
                                <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide ${getTagColor(tag)}`}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => setFocusedNote(null)}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-rose-500 transition-all active:scale-95"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                    <div className="prose dark:prose-invert prose-lg max-w-none">
                        {focusedNote.format === 'markdown' ? (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: marked.parse(focusedNote.content) as string,
                                }}
                            />
                        ) : (
                            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 leading-relaxed">
                                {focusedNote.content}
                            </p>
                        )}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t border-gray-100 dark:border-gray-700">
                    Focus Mode • Created {new Date(focusedNote.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};
