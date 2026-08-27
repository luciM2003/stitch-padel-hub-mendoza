import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
  "colors": {
    "primary-container": "#d4f84a",
    "status-ok": "#27AE60",
    "surface-container": "#eeeeee",
    "on-tertiary-container": "#5a6a7b",
    "surface": "#f9f9f9",
    "surface-bright": "#f9f9f9",
    "secondary-fixed": "#e5e2e1",
    "tertiary-fixed": "#d3e4f8",
    "on-primary": "#ffffff",
    "surface-container-lowest": "#ffffff",
    "outline-variant": "#c5c9af",
    "surface-dim": "#dadada",
    "surface-tint": "#536600",
    "on-secondary": "#ffffff",
    "status-pending": "#F2994A",
    "on-secondary-fixed": "#1c1b1b",
    "tertiary-fixed-dim": "#b7c8dc",
    "on-primary-fixed-variant": "#3e4c00",
    "surface-container-high": "#e8e8e8",
    "on-primary-fixed": "#171e00",
    "secondary-fixed-dim": "#c8c6c5",
    "text-primary": "#111111",
    "surface-variant": "#e2e2e2",
    "error": "#ba1a1a",
    "tertiary": "#506071",
    "on-secondary-fixed-variant": "#474646",
    "on-background": "#1a1c1c",
    "surface-container-highest": "#e2e2e2",
    "primary-fixed": "#cdf143",
    "status-error": "#EB5757",
    "on-tertiary": "#ffffff",
    "outline": "#757963",
    "on-primary-container": "#5c7000",
    "tertiary-container": "#daebff",
    "on-surface-variant": "#454935",
    "inverse-surface": "#2f3131",
    "background": "#f9f9f9",
    "primary": "#536600",
    "on-error": "#ffffff",
    "secondary-container": "#e5e2e1",
    "on-tertiary-fixed-variant": "#384858",
    "inverse-primary": "#b2d424",
    "on-tertiary-fixed": "#0c1d2b",
    "error-container": "#ffdad6",
    "primary-fixed-dim": "#b2d424",
    "on-surface": "#1a1c1c",
    "secondary": "#5f5e5e",
    "surface-container-low": "#f3f3f3",
    "on-secondary-container": "#656464",
    "text-secondary": "#8A8A8A",
    "inverse-on-surface": "#f1f1f1",
    "on-error-container": "#93000a",
    "border-subtle": "#E5E5E5"
  },
  "borderRadius": {
    "DEFAULT": "0.25rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "full": "9999px",
    "kondor": "28px",
    "2xl": "1rem",
    "3xl": "1.5rem",
    "4xl": "2rem"
  },
  "spacing": {
    "stack-md": "24px",
    "container-margin": "20px",
    "stack-lg": "32px",
    "inline-gutter": "16px",
    "stack-sm": "12px"
  },
  "fontFamily": {
    "headline-lg-mobile": [
      "Hanken Grotesk"
    ],
    "body-md": [
      "Inter"
    ],
    "label-muted": [
      "Inter"
    ],
    "label-caps": [
      "Inter"
    ],
    "headline-xl": [
      "Hanken Grotesk"
    ],
    "body-lg": [
      "Inter"
    ],
    "headline-lg": [
      "Hanken Grotesk"
    ]
  },
  "fontSize": {
    "headline-lg-mobile": [
      "28px",
      {
        "lineHeight": "32px",
        "letterSpacing": "-0.02em",
        "fontWeight": "700"
      }
    ],
    "body-md": [
      "16px",
      {
        "lineHeight": "24px",
        "fontWeight": "400"
      }
    ],
    "label-muted": [
      "13px",
      {
        "lineHeight": "18px",
        "fontWeight": "400"
      }
    ],
    "label-caps": [
      "12px",
      {
        "lineHeight": "16px",
        "letterSpacing": "0.05em",
        "fontWeight": "600"
      }
    ],
    "headline-xl": [
      "44px",
      {
        "lineHeight": "48px",
        "letterSpacing": "-0.04em",
        "fontWeight": "800"
      }
    ],
    "body-lg": [
      "18px",
      {
        "lineHeight": "28px",
        "fontWeight": "400"
      }
    ],
    "headline-lg": [
      "32px",
      {
        "lineHeight": "36px",
        "letterSpacing": "-0.02em",
        "fontWeight": "700"
      }
    ]
  }
},
  },
  plugins: [forms, containerQueries],
};
