/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          light: '#e1f5fe',
          board: '#7ccbff',
          border: '#1e88e5',
          line: '#42a5f5',
          number: '#00838f',
        }
      },
      fontFamily: {
        comic: ['Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
