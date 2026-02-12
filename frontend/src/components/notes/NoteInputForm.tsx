'use client';

import React, { useState } from 'react';
import { PencilIcon, TagIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface NoteInputFormProps {
    titleValue: string;
    setTitleValue: (value: string) => void;
    contentValue: string;
    setContentValue: (value: string) => void;
    formatValue: 'plain' | 'markdown';
    setFormatValue: (value: 'plain' | 'markdown') => void;
    tagsValue: string[];
    setTagsValue: (tags: string[]) => void;
    handleSubmit: () => void;
    loading: boolean;
    userVerified: boolean;
    editingNoteId?: string | null;
}

export const NoteInputForm = React.memo(
    ({
        titleValue,
        setTitleValue,
        contentValue,
        setContentValue,
        formatValue,
        setFormatValue,
        tagsValue,
        setTagsValue,
        handleSubmit,
        loading,
        userVerified,
        editingNoteId = null,
    }: NoteInputFormProps) => {
        const [tagInput, setTagInput] = useState('');

        return (
            <section className="glass p-8 md:p-10 rounded-3xl border-white/20 shadow-2xl animate-fade-slide-up relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-1">
                            {editingNoteId ? 'Edit Note' : 'Create Note'}
                        </h3>
                        <p className="text-2xl font-black text-gray-900 dark:text-white italic">
                            Encrypted <span className="text-blue-600">Note</span>
                        </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                        <PencilIcon className="w-6 h-6 text-blue-600" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="group">
                        <input
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            placeholder="Title..."
                            className="w-full bg-transparent text-3xl font-black text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-none transition-all"
                            disabled={loading}
                        />
                        <div className="h-px w-full bg-gray-100 dark:bg-white/5 mt-2 group-focus-within:bg-blue-500 transition-colors" />
                    </div>

                    <div className="relative">
                        <textarea
                            value={contentValue}
                            onChange={(e) => setContentValue(e.target.value)}
                            placeholder="Write your note here..."
                            className="w-full bg-transparent text-lg font-medium text-gray-600 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-none min-h-[160px] resize-none"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:items-end pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {tagsValue.map(tag => (
                                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors">
                                        #{tag}
                                        <button onClick={() => setTagsValue(tagsValue.filter(t => t !== tag))} className="hover:scale-125 transition-transform">
                                            <XMarkIcon className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && tagInput.trim()) {
                                                e.preventDefault();
                                                if (!tagsValue.includes(tagInput.trim())) {
                                                    setTagsValue([...tagsValue, tagInput.trim()]);
                                                }
                                                setTagInput('');
                                            }
                                        }}
                                        placeholder="Add tag..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={formatValue}
                                        onChange={(e) => setFormatValue(e.target.value as 'plain' | 'markdown')}
                                        className="appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        disabled={loading || !userVerified}
                                    >
                                        <option value="plain">Plain</option>
                                        <option value="markdown">MDX</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ClockIcon className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !titleValue.trim()}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center min-w-[160px]"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                editingNoteId ? 'Save Changes' : 'Create Note'
                            )}
                        </button>
                    </div>
                </div>
            </section>
        );
    }
);
