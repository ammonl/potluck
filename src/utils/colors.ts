export const getCategoryBorderColor = (colorClass: string): string => {
  const colorMap: { [key: string]: string } = {
    'from-red-400 to-red-600': '#f87171',
    'from-orange-400 to-orange-600': '#fb923c',
    'from-yellow-400 to-yellow-600': '#facc15',
    'from-green-400 to-green-600': '#4ade80',
    'from-blue-400 to-blue-600': '#60a5fa',
    'from-indigo-400 to-indigo-600': '#818cf8',
    'from-purple-400 to-purple-600': '#c4b5fd',
    'from-pink-400 to-pink-600': '#f472b6',
    'from-gray-400 to-gray-600': '#9ca3af',
    'from-teal-400 to-teal-600': '#2dd4bf',
    'from-cyan-400 to-cyan-600': '#22d3ee',
    'from-emerald-400 to-emerald-600': '#34d399',
    'from-lime-400 to-lime-600': '#a3e635',
    'from-amber-400 to-amber-600': '#fbbf24',
    'from-rose-400 to-rose-600': '#fb7185',
    'from-violet-400 to-violet-600': '#c4b5fd',
    'from-fuchsia-400 to-fuchsia-600': '#e879f9',
    'from-sky-400 to-sky-600': '#38bdf8'
  };
  
  return colorMap[colorClass] || '#9ca3af';
}; 