/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    { pattern: /^(flex|grid|block|inline|hidden)/ },
    { pattern: /^(items|justify|content|self|place)/ },
    { pattern: /^(w|h|min|max)/ },
    { pattern: /^(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr)/ },
    { pattern: /^(text|font|leading|tracking)/ },
    { pattern: /^(bg|border|rounded|shadow|ring)/ },
    { pattern: /^(space|gap|col|row)/ },
    { pattern: /^(overflow|relative|absolute|fixed|sticky|z|top|bottom|left|right)/ },
    { pattern: /^(opacity|cursor|pointer|select|transition|duration|ease|animate)/ },
    { pattern: /^(scale|rotate|translate|transform)/ },
    { pattern: /^(sr|not-sr)/ },
    { pattern: /^(active|disabled|focus|hover)/ },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        giveaway: { DEFAULT: '#10b981', light: '#d1fae5' },
        sale:     { DEFAULT: '#3b82f6', light: '#dbeafe' },
        wanted:   { DEFAULT: '#f59e0b', light: '#fef3c7' },
      },
      fontFamily: {
        sans: ['var(--font-assistant)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
