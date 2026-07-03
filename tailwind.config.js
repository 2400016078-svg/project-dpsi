/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { dark: "#1E3A8A", medium: "#2563EB", light: "#3B82F6", "medium-light": "#60A5FA" },
        "accent-teal": "#0D9488",
        "accent-teal-light": "#CCFBF1",
        "accent-orange": "#EA580C",
        "accent-orange-light": "#FED7AA",
        "soft-bg": "#F0F9FF",
        success: "#10B981",
        "success-light": "#D1FAE5",
        warning: "#F59E0B",
        "warning-light": "#FEF3C7",
        error: "#EF4444",
        "error-light": "#FEE2E2",
        info: "#06B6D4",
        gray: { 50: "#F9FAFB", 100: "#F3F4F6", 200: "#E5E7EB", 300: "#D1D5DB", 400: "#9CA3AF", 500: "#6B7280", 600: "#4B5563", 700: "#374151", 800: "#1F2937" },
      },
      fontFamily: {
        heading: ['"Poppins"', "sans-serif"],
        body: ['"Inter"', "sans-serif"],
      },
      fontSize: {
        h1: ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "1.4", fontWeight: "500" }],
        "body-large": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-small": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.06)",
        medium: "0 4px 16px rgba(0,0,0,0.08)",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
      },
    },
  },
  plugins: [],
};
