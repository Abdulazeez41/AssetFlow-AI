import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#061815",
        foreground: "#eafaf5",
        card: "#0a2420",
        border: "#1c3f38",
        primary: "#2FAE8B",
        primaryDark: "#1F8A6D",
        sky: "#4CC3E8",
        success: "#3ddc97",
        muted: "#8fb3ab",
        accent: "#4CC3E8",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(47,174,139,0.22), 0 24px 80px rgba(0,0,0,0.35)",
      },
      backgroundImage: {
        radial:
          "radial-gradient(circle at top, rgba(47,174,139,0.18), transparent 50%), radial-gradient(circle at 80% 0%, rgba(76,195,232,0.12), transparent 45%)",
      },
    },
  },
  plugins: [],
};

export default config;
