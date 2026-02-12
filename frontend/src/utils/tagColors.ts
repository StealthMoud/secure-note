export const getTagColor = (tag: string) => {
    const colors = [
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
        'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};
