/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}', './src/index.html'],
  theme: {
    extend: {
      colors: {
        ink: '#05060a',
        surface: 'rgba(14, 16, 24, 0.78)',
        accent: '#b66bff',
        'accent-2': '#53e9ff',
        'text-primary': '#ffffff',
        'text-muted': '#cfd5ff',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'Space Grotesk', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        strong: '0 25px 60px rgba(0, 0, 0, 0.45)',
        soft: '0 12px 35px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        xl: '32px',
        lg: '22px',
      },
      backgroundImage: {
        'cre8-bg':
          'radial-gradient(120% 120% at 20% 20%, #0f3a63 0%, transparent 35%), radial-gradient(100% 100% at 80% 10%, #5d2c8b 0%, transparent 40%), #05060a',
      },
    },
  },
  plugins: [],
};
