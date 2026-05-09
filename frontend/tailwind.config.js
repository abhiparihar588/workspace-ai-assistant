/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        bg4: 'var(--bg4)',
        border: 'var(--border)',
        border2: 'var(--border2)',
        text: 'var(--text)',
        text2: 'var(--text2)',
        text3: 'var(--text3)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        accent3: 'var(--accent3)',
        green: 'var(--green)',
        green2: 'var(--green2)',
        amber: 'var(--amber)',
        red: 'var(--red)',
        blue: 'var(--blue)',
      },
      borderRadius: {
        '1': 'var(--radius)',
        '2': 'var(--radius2)',
        '3': 'var(--radius3)',
      }
    },
  },
  plugins: [],
}
