/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}", // ครอบคลุมทุกไฟล์ใน src

      "./src/components/Quiz/**/*.{js,ts,jsx,tsx}",
      "./src/components/lesson/MovementOfRPD/**/*.{js,ts,jsx,tsx}",
      "./src/components/navbar/**/*.{js,ts,jsx,tsx}",
      "./src/page/pageQuiz/**/*.{js,ts,jsx,tsx}",
      "./src/page/home/**/*.{js,ts,jsx,tsx}",
      "./src/page/MovementOfRPD3D/**/*.{js,ts,jsx,tsx}",
      
      // เพิ่ม Material Tailwind ไลบรารี
    "./node_modules/@material-tailwind/react/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/theme/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily:{
          sans: ['Noto Sans Thai', 'Open Sans', 'Arial', 'sans-serif'],
          display: ['Oswald'],  // ฟอนต์สำหรับ header หรือแสดงผลใหญ่
          body: ['"Noto Sans Thai"', 'Open Sans'],
        },
        gridTemplateColumns:{
          '70/30':'70% 28%',
        }
      },
      screens: {
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
      }

    },
    plugins: [],
  }