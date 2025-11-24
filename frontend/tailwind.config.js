/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",

      white: "var(--color-white)",
      black: "var(--color-black)",

      // capas de fondo
      page: "var(--color-neutral1)",      // fondo principal
      surface: "var(--color-neutral2)",   // cards / superficies elevadas
      subtle: "var(--color-neutral4)",    // fondos suaves

      // marca
      primary: {
        DEFAULT: "var(--color-primary1)", // bg-primary
        soft: "var(--color-primary4)",    // bg-primary-soft
        dark: "var(--color-primary2)",    // bg-primary-dark
      },

      // texto
      text: {
        DEFAULT: "var(--color-text)",            // text-text
        secondary: "var(--color-text-secondary)",// text-text-secondary
        muted: "var(--color-text-muted)",        // text-text-muted
        onDark: "var(--color-text-on-dark)",     // text-text-onDark
      },

      // estados
      success: "var(--color-success)",
      warning: "var(--color-warning)",
      error: "var(--color-error)",
      neutral: {
        50: "var(--color-neutral2)",
        100: "var(--color-neutral1)",
        200: "#F3EDE5",
        300: "var(--color-neutral3)",
        400: "var(--color-neutral4)",
        500: "#C3B7A9",
        600: "var(--color-neutral)",
        700: "#8A7D71",
        800: "var(--color-secondary2)",
        900: "var(--color-primary2)",
      },
    },

    extend: {
      borderRadius: {
        // atajo para usar tus tokens de radios
        pill: "9999px",
        card: "var(--radius-xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
    },
  },
  plugins: [],
};
