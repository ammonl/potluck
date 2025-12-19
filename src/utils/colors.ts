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

export const COLOR_CLASS_OPTIONS = [
  { value: 'from-red-400 to-red-600', label: 'Red', preview: 'bg-gradient-to-r from-red-400 to-red-600' },
  { value: 'from-orange-400 to-orange-600', label: 'Orange', preview: 'bg-gradient-to-r from-orange-400 to-orange-600' },
  { value: 'from-yellow-400 to-yellow-600', label: 'Yellow', preview: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
  { value: 'from-green-400 to-green-600', label: 'Green', preview: 'bg-gradient-to-r from-green-400 to-green-600' },
  { value: 'from-blue-400 to-blue-600', label: 'Blue', preview: 'bg-gradient-to-r from-blue-400 to-blue-600' },
  { value: 'from-indigo-400 to-indigo-600', label: 'Indigo', preview: 'bg-gradient-to-r from-indigo-400 to-indigo-600' },
  { value: 'from-purple-400 to-purple-600', label: 'Purple', preview: 'bg-gradient-to-r from-purple-400 to-purple-600' },
  { value: 'from-pink-400 to-pink-600', label: 'Pink', preview: 'bg-gradient-to-r from-pink-400 to-pink-600' },
  { value: 'from-gray-400 to-gray-600', label: 'Gray', preview: 'bg-gradient-to-r from-gray-400 to-gray-600' },
  { value: 'from-teal-400 to-teal-600', label: 'Teal', preview: 'bg-gradient-to-r from-teal-400 to-teal-600' },
  { value: 'from-cyan-400 to-cyan-600', label: 'Cyan', preview: 'bg-gradient-to-r from-cyan-400 to-cyan-600' },
  { value: 'from-emerald-400 to-emerald-600', label: 'Emerald', preview: 'bg-gradient-to-r from-emerald-400 to-emerald-600' },
  { value: 'from-lime-400 to-lime-600', label: 'Lime', preview: 'bg-gradient-to-r from-lime-400 to-lime-600' },
  { value: 'from-amber-400 to-amber-600', label: 'Amber', preview: 'bg-gradient-to-r from-amber-400 to-amber-600' },
  { value: 'from-rose-400 to-rose-600', label: 'Rose', preview: 'bg-gradient-to-r from-rose-400 to-rose-600' },
  { value: 'from-violet-400 to-violet-600', label: 'Violet', preview: 'bg-gradient-to-r from-violet-400 to-violet-600' },
  { value: 'from-fuchsia-400 to-fuchsia-600', label: 'Fuchsia', preview: 'bg-gradient-to-r from-fuchsia-400 to-fuchsia-600' },
  { value: 'from-sky-400 to-sky-600', label: 'Sky', preview: 'bg-gradient-to-r from-sky-400 to-sky-600' }
];