---
name: Kondor Velocity
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#454935'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#757963'
  outline-variant: '#c5c9af'
  surface-tint: '#536600'
  primary: '#536600'
  on-primary: '#ffffff'
  primary-container: '#d4f84a'
  on-primary-container: '#5c7000'
  inverse-primary: '#b2d424'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#506071'
  on-tertiary: '#ffffff'
  tertiary-container: '#daebff'
  on-tertiary-container: '#5a6a7b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cdf143'
  primary-fixed-dim: '#b2d424'
  on-primary-fixed: '#171e00'
  on-primary-fixed-variant: '#3e4c00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#d3e4f8'
  tertiary-fixed-dim: '#b7c8dc'
  on-tertiary-fixed: '#0c1d2b'
  on-tertiary-fixed-variant: '#384858'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  text-primary: '#111111'
  text-secondary: '#8A8A8A'
  border-subtle: '#E5E5E5'
  status-ok: '#27AE60'
  status-pending: '#F2994A'
  status-error: '#EB5757'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-muted:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 32px
  inline-gutter: 16px
  container-margin: 20px
---

## Brand & Style

The design system is engineered to evoke a sense of high-performance athleticism and precision. It targets an audience that values efficiency, social competition, and modern aesthetics. The emotional response is one of energy and technical reliability—moving away from traditional "country club" tropes toward a "sports-tech" lifestyle.

The visual direction is a fusion of **Minimalism** and **High-Contrast / Bold** styles. It utilizes heavy whitespace and a strictly controlled color palette to ensure the Neon Lime accent provides maximum impact without overwhelming the user. The interface is characterized by large, confident typography, expansive card surfaces, and a "clean-room" digital environment that prioritizes content and action above all else.

## Colors

The palette is centered on a high-visibility **Neon Lime** (#D4F84A), used sparingly as a "performance trigger" for primary actions and active states. To maintain a premium feel, this is balanced against a **Near Black** (#111111) used for high-contrast featured elements and deep-hierarchy containers.

- **Primary Accent:** Reserved for call-to-actions, active navigation indicators, and critical selection states. Limit to 2 elements per screen to maintain urgency.
- **Background Strategy:** Large surfaces use a very light gray (#F4F4F4) to reduce eye strain compared to pure white, while ensuring the black typography remains sharp.
- **Semantic Badges:** Small, desaturated versions of Green, Amber, and Red are used strictly for status indicators (Confirmed, Pending, Cancelled) to avoid competing with the brand's primary Lime.

## Typography

The typography system utilizes **Hanken Grotesk** for headings to provide a sharp, geometric edge that feels contemporary and engineered. **Inter** is used for body copy and UI labels to ensure maximum legibility at high densities.

- **Headlines:** Large scale with tight negative letter-spacing to create a "locked-in" visual weight.
- **Metadata:** Small labels should often be rendered in uppercase with slight tracking (letter-spacing) to differentiate them from body text.
- **Contextual Styles:** Use "label-muted" for secondary information like court types or time-slots to maintain a clean visual hierarchy.

## Layout & Spacing

This design system uses a **Fluid Grid** model with generous vertical breathing room to emphasize the minimalist aesthetic.

- **Vertical Rhythm:** A base increment of 8px is used, with a standard block-to-block gap of **24px to 32px**. This ensures that even data-heavy booking screens feel uncrowded.
- **Grid:** A 12-column grid on desktop and a 4-column grid on mobile. 
- **Horizontal Scrollers:** Used specifically for date selection and court categories, allowing users to browse options without increasing page length. 
- **Safe Areas:** High-contrast cards must maintain internal padding of at least 24px to preserve the "high-performance" spacious feel.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Surface Contrast** rather than traditional shadows. 

- **Layering:** Elements are stacked using color—dark cards sit on light backgrounds. 
- **Overlays:** Real photography in cards should utilize a **20-40% Black Gradient Overlay** at the bottom to ensure white text remains legible.
- **Borders:** Thin, 1px borders in #E5E5E5 are used to define structural boundaries (like input fields or list items) without adding visual weight.
- **Active States:** Elevation is signaled by a shift to the Neon Lime color rather than a shadow or "lift" effect.

## Shapes

The shape language is a deliberate contrast between hyper-rounded interactive elements and large, structural containers.

- **Cards:** Use a radius of **28px - 32px**. This large radius softens the high-contrast black/white palette and makes the app feel more approachable.
- **Interactive Elements:** Buttons, chips, and the active navigation pill use a **999px (Pill)** radius. This creates a clear distinction between "content containers" (cards) and "actionable items" (pills).

## Components

- **Buttons:** Primary buttons are Neon Lime with Black text, pill-shaped. Secondary buttons are Near Black with White text. No shadows or borders.
- **Floating Navigation:** A bottom navigation bar with a frosted-glass background (background-blur) or solid white. The active state is indicated by a Neon Lime pill-shaped background behind the monochrome icon.
- **Booking Cards:** High-contrast Near Black cards for featured clubs. They must feature a rounded image at the top with a subtle dark overlay for text clarity.
- **Chips:** Pill-shaped, using #E5E5E5 for inactive states and Neon Lime for active selections.
- **Input Fields:** Clean, minimal inputs with 1px #E5E5E5 borders. Labels use the "label-caps" typography style.
- **Icons:** Use fine-line, monochrome (Black or White) icons only. Avoid filled icons unless used within the active navigation pill.
- **Status Badges:** Small, circular or pill-shaped badges with minimal padding. Used only for "Confirmed", "Pending", etc.