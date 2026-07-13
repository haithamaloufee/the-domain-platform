---
name: Cinematic Noir
colors:
  surface: '#121317'
  surface-dim: '#121317'
  surface-bright: '#38393d'
  surface-container-lowest: '#0d0e12'
  surface-container-low: '#1a1b1f'
  surface-container: '#1e1f23'
  surface-container-high: '#292a2e'
  surface-container-highest: '#343539'
  on-surface: '#e3e2e7'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e3e2e7'
  inverse-on-surface: '#2f3034'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#d0cdcd'
  on-tertiary: '#313030'
  tertiary-container: '#b4b2b2'
  on-tertiary-container: '#454544'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#121317'
  on-background: '#e3e2e7'
  surface-variant: '#343539'
typography:
  display-xl:
    fontFamily: Syne
    fontSize: 80px
    fontWeight: '800'
    lineHeight: 90px
    letterSpacing: -0.04em
  display-lg:
    fontFamily: Syne
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Syne
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Syne
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
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
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  headline-lg-mobile:
    fontFamily: Syne
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
spacing:
  section-gap: 160px
  element-gap: 32px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 20px
---

## Brand & Style
The design system embodies a "Cinematic Noir" aesthetic, targeting a premium, high-culture audience. The brand personality is mysterious, authoritative, and intentionally dramatic. The visual language blends **Minimalism** with **Glassmorphism**, utilizing extreme whitespace and high-contrast typography to create an editorial, gallery-like experience. The goal is to evoke a sense of exclusivity and quiet confidence, where the content is treated as art and the interface serves as a sophisticated frame.

## Colors
The palette is dominated by a near-black charcoal (`#0A0A0A`) to provide maximum depth. Gold is no longer a thematic wash but a precise surgical tool, reserved for active states and primary calls to action. 

- **Primary (Gold):** Used only for high-impact interactions.
- **Surface Scale:** A range of deep grays (`#141414`, `#1F1F1F`, `#2C2C2C`) creates subtle structural depth without breaking the noir atmosphere.
- **Typography Colors:** Pure white is reserved for headers; mid-tone grays are used for secondary metadata to maintain a moody, low-light hierarchy.

## Typography
The typographic system relies on a stark contrast between the expressive, heavyweight **Syne** for headlines and the technical precision of **Inter** and **Geist**. 

- **Editorial Presence:** Large-scale headlines use "Extra Bold" weights with tight tracking to command attention.
- **Hierarchy:** Generous vertical rhythm ensures that titles are surrounded by significant negative space, mimicking high-end print layouts.
- **Labels:** Technical metadata uses **Geist** with increased letter spacing and uppercase styling for a refined, modern-monospaced feel.

## Layout & Spacing
The design system utilizes an expansive, editorial spacing model. It moves away from dense utility grids toward a layout that prioritizes focus and breathability.

- **Fluid Grid:** A 12-column grid with wide gutters.
- **Vertical Breathing Room:** Standard section gaps are set to 160px to force a deliberate scroll pace. 
- **Adaptivity:** On mobile, margins reduce but the vertical gaps remain significant (80px-100px) to preserve the premium, uncrowded feel.

## Elevation & Depth
Depth is achieved through **Glassmorphism** and tonal stacking rather than traditional shadows.

- **Navigation:** The header uses a high-density backdrop blur (30px) with a semi-transparent charcoal fill (`rgba(10, 10, 10, 0.7)`). On scroll, the header height shrinks by 30% to increase usable screen real estate.
- **Tonal Layers:** Secondary content areas sit on slightly lighter gray surfaces to distinguish them from the base "void" of the background.
- **Overlays:** Imagery uses deep linear gradients (Bottom-to-Top: `#0A0A0A` at 100% to Transparent at 40%) to ensure metadata legibility and seamless integration with the background.

## Shapes
The design system adopts a **Sharp (0)** roundedness strategy to reinforce the architectural and "noir" precision. 

- **Hard Edges:** Buttons, cards, and input fields utilize 0px border radii. 
- **Architectural Lines:** Thin, 1px borders in low-contrast grays are used to define boundaries without cluttering the visual field.

## Components

- **Primary Buttons:** High-end custom styling. Instead of rounded pills, use a sharp-edged rectangular form with a subtle interior "inset" border. The fill is Gold (`#D4AF37`) for primary actions, with black text.
- **Event Cards:** Featuring a 16:9 or 2:3 cinematic aspect ratio. Imagery must use a desaturated or high-contrast grade. Metadata is placed in the lower third, over a gradient wash, using the **Geist** label style.
- **Navigation Bar:** Fixed/Sticky with a blur effect. The logo and menu items should scale down elegantly upon scroll detection.
- **Input Fields:** Bottom-border only (ghost style) to maintain the minimalist aesthetic, with Gold focus states.
- **Chips/Tags:** Sharp-edged, using a dark gray stroke and no fill, ensuring they remain secondary to primary CTAs.