import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

/** @type {import('tailwindcss').Config} */

// Tokens whose value flips between light/dark are backed by a CSS variable (defined as an
// "R G B" triple in src/index.css) so opacity modifiers like `bg-surface/50` keep working.
// See CLAUDE notes in index.css for the full light/dark value table.
function themed(varName) {
  return ({ opacityValue }) =>
    opacityValue !== undefined ? `rgb(var(${varName}) / ${opacityValue})` : `rgb(var(${varName}))`;
}

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
  "colors": {
    // --- Tokens que cambian entre claro/oscuro (via CSS variables) ---
    "background": themed("--color-background"),
    "on-background": themed("--color-on-background"),
    "surface": themed("--color-surface"),
    "surface-dim": themed("--color-surface-dim"),
    "surface-bright": themed("--color-surface-bright"),
    "surface-container-lowest": themed("--color-surface-container-lowest"),
    "surface-container-low": themed("--color-surface-container-low"),
    "surface-container": themed("--color-surface-container"),
    "surface-container-high": themed("--color-surface-container-high"),
    "surface-container-highest": themed("--color-surface-container-highest"),
    "surface-variant": themed("--color-surface-variant"),
    "surface-tint": themed("--color-surface-tint"),
    "on-surface": themed("--color-on-surface"),
    "on-surface-variant": themed("--color-on-surface-variant"),
    "outline": themed("--color-outline"),
    "outline-variant": themed("--color-outline-variant"),
    "inverse-primary": themed("--color-inverse-primary"),
    "primary": themed("--color-primary"),
    "on-primary": themed("--color-on-primary"),
    "primary-container": themed("--color-primary-container"),
    "on-primary-container": themed("--color-on-primary-container"),
    "secondary": themed("--color-secondary"),
    "on-secondary": themed("--color-on-secondary"),
    "secondary-container": themed("--color-secondary-container"),
    "on-secondary-container": themed("--color-on-secondary-container"),
    "tertiary": themed("--color-tertiary"),
    "on-tertiary": themed("--color-on-tertiary"),
    "tertiary-container": themed("--color-tertiary-container"),
    "on-tertiary-container": themed("--color-on-tertiary-container"),
    "error": themed("--color-error"),
    "on-error": themed("--color-on-error"),
    "error-container": themed("--color-error-container"),
    "on-error-container": themed("--color-on-error-container"),
    "text-primary": themed("--color-text-primary"),
    "text-secondary": themed("--color-text-secondary"),
    "border-subtle": themed("--color-border-subtle"),

    // --- Tokens "fixed" (M3): a propósito NO cambian entre claro/oscuro ---
    "primary-fixed": "#cdf143",
    "primary-fixed-dim": "#b2d424",
    "on-primary-fixed": "#171e00",
    "on-primary-fixed-variant": "#3e4c00",
    "secondary-fixed": "#e5e2e1",
    "secondary-fixed-dim": "#c8c6c5",
    "on-secondary-fixed": "#1c1b1b",
    "on-secondary-fixed-variant": "#474646",
    "tertiary-fixed": "#d3e4f8",
    "tertiary-fixed-dim": "#b7c8dc",
    "on-tertiary-fixed": "#0c1d2b",
    "on-tertiary-fixed-variant": "#384858",
    // Tarjetas de acento "siempre oscuras" (ej. hero de próxima reserva): no deben invertirse
    // en modo oscuro, a diferencia de text-primary/text-secondary que sí son texto adaptable.
    "ink-fixed": "#111111",
    "on-ink-fixed": "#ffffff",
    // inverse-surface/inverse-on-surface: en este codebase se usan siempre como "tarjeta de
    // acento oscura con texto claro" (stats, burbujas de chat), nunca como el rol M3 real de
    // snackbar invertido — por eso quedan fijos en vez de invertirse en modo oscuro.
    "inverse-surface": "#2f3131",
    "inverse-on-surface": "#f1f1f1",

    // --- Colores de estado y marca (constantes) ---
    "status-ok": "#27AE60",
    "status-pending": "#F2994A",
    "status-error": "#EB5757",
    "rank-gold": "#D4AF37",
    "rank-silver": "#B4B8C5",
    "rank-bronze": "#CD7F32",
    "bracket-line": "#c5c9af",
    "sponsor-tier-oro": "#D4AF37",
    "sponsor-tier-plata": "#B4B8C5",
    "sponsor-tier-bronce": "#CD7F32"
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
