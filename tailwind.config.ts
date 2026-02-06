import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmos: {
          bg: "#0a0a1a",
          surface: "#12122a",
          card: "#1a1a3e",
          border: "#2a2a5e",
          "border-glow": "rgba(99, 102, 241, 0.4)",
        },
        nebula: {
          blue: "#0693e3",
          purple: "#7c3aed",
          pink: "#ec4899",
          cyan: "#06b6d4",
          gold: "#d4a853",
          orange: "#f97316",
          green: "#10b981",
        },
        star: {
          white: "#f0f0ff",
          dim: "#8888aa",
          muted: "#555577",
        },
      },
      fontFamily: {
        heading: ["Cardo", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "nebula-gradient":
          "linear-gradient(135deg, #0693e3 0%, #7c3aed 50%, #ec4899 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #d4a853 0%, #f5d799 50%, #d4a853 100%)",
        "deep-space":
          "radial-gradient(ellipse at center, #12122a 0%, #0a0a1a 70%)",
        "card-glow":
          "linear-gradient(135deg, rgba(6, 147, 227, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "orbit": "orbit 20s linear infinite",
        "slide-up": "slideUp 0.6s ease-out",
        "fade-in": "fadeIn 0.8s ease-out",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(6, 147, 227, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(6, 147, 227, 0.6)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      boxShadow: {
        "cosmic": "0 0 15px rgba(6, 147, 227, 0.2), 0 0 30px rgba(124, 58, 237, 0.1)",
        "cosmic-lg": "0 0 30px rgba(6, 147, 227, 0.3), 0 0 60px rgba(124, 58, 237, 0.15)",
        "nebula": "0 0 20px rgba(236, 72, 153, 0.2), 0 0 40px rgba(124, 58, 237, 0.1)",
        "gold": "0 0 15px rgba(212, 168, 83, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
