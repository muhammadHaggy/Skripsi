/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend:
    {
      boxShadow: {
        'inset-outline': 'inset 0 0 0 1px #7A9CCB',
      },
      fontFamily: {
        'montserrat': ['Montserrat'],
        'inter': ['Inter']
      },
      colors: {
        'primary': '#215AA8',
        'primary-border': '#7A9CCB',
        'primary-surface': '#D3DEEE',
        'primary-hover': '#143665',
        'primary-pressed': '#122641',
        'success': '#22C55E',
        'success-border': '#86EFAC',
        'success-surface': '#DCFCE7',
        'success-hover': '#15803D',
        'success-pressed': '#14532D',
        'danger': '#E72B2B',
        'danger-border': '#FCA6A6',
        'danger-surface': '#FEE1E1',
        'danger-hover': '#BA1C1C',
        'danger-pressed': '#811D1D',
        'warning': '#EAB308',
        'warning-border': '#FDE047',
        'warning-surface': '#FEF9C3',
        'warning-hover': '#A16207',
        'warning-pressed': '#713F12',
        'neutral-10' :'#FFFFFF',
        'neutral-20' :'#E5E7EB',
        'neutral-30' :'#D1D5DB',
        'neutral-40' :'#9CA3B0',
        'neutral-50' :'#6B7280',
        'neutral-60' :'#4B5563',
        'neutral-70' :'#384252',
        'neutral-80' :'#1F2937',
        'neutral-90' :'#111827',
      },
    },
  },
  plugins: [],
}
