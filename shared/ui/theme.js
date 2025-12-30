/* =========================================================
   FREE VOICE — UI THEME SYSTEM
   File: shared/ui/theme.js
   Owner: Subhan Ahmad

   PURPOSE:
   - Simple, clean, modern SaaS UI
   - Dark + Light theme support
   - Single source of truth for UI tokens
========================================================= */

/* =====================================================
   BASE TOKENS
===================================================== */
const base = {
  radius: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    xl: "22px"
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px"
  },

  shadow: {
    sm: "0 2px 6px rgba(0,0,0,0.08)",
    md: "0 6px 20px rgba(0,0,0,0.12)",
    lg: "0 12px 40px rgba(0,0,0,0.18)"
  },

  font: {
    family:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    size: {
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "20px",
      xl: "26px"
    },
    weight: {
      regular: 400,
      medium: 500,
      bold: 600
    }
  }
};

/* =====================================================
   LIGHT THEME
===================================================== */
const light = {
  name: "light",
  background: "#f9fafb",
  surface: "#ffffff",
  text: {
    primary: "#111827",
    secondary: "#4b5563",
    muted: "#9ca3af"
  },
  primary: "#2563eb",
  accent: "#22c55e",
  danger: "#ef4444",
  border: "#e5e7eb"
};

/* =====================================================
   DARK THEME
===================================================== */
const dark = {
  name: "dark",
  background: "#0b0f14",
  surface: "#121826",
  text: {
    primary: "#f9fafb",
    secondary: "#9ca3af",
    muted: "#6b7280"
  },
  primary: "#3b82f6",
  accent: "#22c55e",
  danger: "#f87171",
  border: "#1f2937"
};

/* =====================================================
   THEME GETTER
===================================================== */
function getTheme(mode = "dark") {
  return {
    ...base,
    colors: mode === "light" ? light : dark
  };
}

/* =====================================================
   EXPORT
===================================================== */
export {
  base,
  light,
  dark,
  getTheme
};

/* =========================================================
   END OF FILE
   ✔ Simple & professional
   ✔ One-time design system
   ✔ No redesign needed later
========================================================= */
