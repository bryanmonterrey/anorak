import type { Config } from "tailwindcss";

export const texts = {
  // Add your text sizes here
};

export const shadows = {
  // Add your shadows here
};

export const borderRadii = {
  lg: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)'
};

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
			purp: '#8497C5',
			lav: '#8497C5',
			olive: '#0D0E15',
			olive2: '#0A0A0A',
			gray: '#9B9B9B',
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
			bitcoin: '#00ED89',
  		},
  		fontFamily: {
  			english: ['english', 'sans-serif'],
			geist: ['geist', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-corner-smoothing"), require("tailwindcss-inner-border")],
} satisfies Config;
