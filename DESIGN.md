---
name: Cozy Fluid
colors:
  surface: '#fdf9f3'
  surface-dim: '#dddad4'
  surface-bright: '#fdf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ed'
  surface-container: '#f1ede7'
  surface-container-high: '#ebe8e2'
  surface-container-highest: '#e6e2dc'
  on-surface: '#1c1c18'
  on-surface-variant: '#524346'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f4f0ea'
  outline: '#847376'
  outline-variant: '#d6c1c5'
  surface-tint: '#894c5c'
  primary: '#894c5c'
  on-primary: '#ffffff'
  primary-container: '#f4a7b9'
  on-primary-container: '#733949'
  inverse-primary: '#ffb1c3'
  secondary: '#42617d'
  on-secondary: '#ffffff'
  secondary-container: '#bddefe'
  on-secondary-container: '#43627e'
  tertiary: '#4e635e'
  on-tertiary: '#ffffff'
  tertiary-container: '#abc1bb'
  on-tertiary-container: '#3b504b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e0'
  primary-fixed-dim: '#ffb1c3'
  on-primary-fixed: '#380a1a'
  on-primary-fixed-variant: '#6e3545'
  secondary-fixed: '#cde5ff'
  secondary-fixed-dim: '#aacaea'
  on-secondary-fixed: '#001d32'
  on-secondary-fixed-variant: '#294964'
  tertiary-fixed: '#d0e7e1'
  tertiary-fixed-dim: '#b5cbc6'
  on-tertiary-fixed: '#0a1f1c'
  on-tertiary-fixed-variant: '#364b47'
  background: '#fdf9f3'
  on-background: '#1c1c18'
  surface-variant: '#e6e2dc'
typography:
  headline-xl:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  body-md:
    fontFamily: Bricolage Grotesque
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-md:
    fontFamily: Bricolage Grotesque
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 24px
  container-padding-desktop: 64px
  element-gap: 16px
  section-gap: 80px
---

## Brand & Style
The design system transitions away from rigid, high-contrast editorial structures toward a "Cozy Fluid" aesthetic. The brand personality is gentle, organic, and premium, focusing on tactile softness and a breathable interface. It targets an audience that values comfort, high-end indie aesthetics, and approachable sophistication.

The style is a blend of **Minimalism** and **Soft-Touch Modernism**. It prioritizes organic shapes, a warm "misty" atmosphere, and fluid transitions. Visual hierarchy is established through subtle tonal shifts and soft shadows rather than harsh strokes or borders, evoking a sense of calm and physical comfort.

## Colors
This design system utilizes a warm, creamy foundation to create an inviting environment. 

- **Primary (Warm Rose):** Used for key actions and focal points. It should feel soft and integrated, never aggressive.
- **Background (Cream):** The base of the entire UI is #FFFBF5, providing a much softer contrast than pure white.
- **Accents (Misty Pastels):** Secondary and tertiary colors are used for categorization and decorative elements. These should be applied with low opacity or as soft gradients to maintain the "misty" feel.
- **Typography:** Neutral text uses a deep, warm charcoal (#4A443F) rather than pure black to maintain the soft-touch mood.

## Typography
The system relies exclusively on **Bricolage Grotesque**, leveraging its unique character to feel organic rather than clinical. 

To achieve the "breathable" feel:
- **Tracking:** Increased slightly across all levels to allow the letterforms to "breathe."
- **Weights:** Use ExtraBold for headlines to create a soft, pillowy impact. Use Regular for body copy to maintain legibility without being heavy.
- **Spacing:** Generous line-heights are mandatory to prevent the text from feeling cramped or "zine-like."

## Layout & Spacing
The layout follows a **Fluid Grid** model with extreme emphasis on whitespace. 

- **Margins:** Large, protective margins (64px on desktop) ensure content feels centered and precious.
- **Flow:** Avoid rigid vertical stacking; use staggered layouts or varied horizontal padding to create a more organic, "drifting" visual flow.
- **Rhythm:** An 8px base unit drives the system, but spacing between major sections should be intentionally oversized (80px+) to maintain the premium indie mood.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. 

- **Shadows:** Replace all borders with very soft, diffused shadows. Use high blur radii (20px-40px) and low opacity (5-10%) with a slight warm tint (#4A443F) to make elements appear as if they are resting on a soft surface.
- **Surfaces:** Use subtle color shifts (e.g., a slightly darker cream or a very pale misty rose) to define container areas.
- **No Borders:** Structural borders are strictly prohibited. If separation is required, use a 1px line in a color only 5% darker than the background.

## Shapes
The shape language is defined by **Fluidity and Circularity**. 

- **Containers:** All main containers and cards must use a minimum border radius of **32px**.
- **Pill Shapes:** Interactive elements like buttons and chips should be fully rounded (pill-shaped) to reinforce the soft-touch theme.
- **Organic Cuts:** Occasionally use asymmetrical radii (e.g., 40px, 40px, 40px, 8px) to introduce an "ink-drop" or organic feel to specific callouts.

## Components
- **Buttons:** Fully pill-shaped. Primary buttons use a soft gradient or solid Warm Rose with white text. No borders.
- **Cards:** Large 32px corner radius. Elevation is achieved through a soft ambient shadow and a background color slightly different from the main canvas (#FFF6EA).
- **Inputs:** Pill-shaped with a soft cream background. Focus states are indicated by a soft Warm Rose glow (outer shadow) rather than a stroke.
- **Chips/Labels:** Small, fully rounded capsules with misty pastel backgrounds and dark charcoal text.
- **Lists:** Items are separated by generous vertical spacing rather than lines. Use a soft background hover state with a large corner radius.
- **Progress Indicators:** Use thick, rounded lines with soft, rounded ends to maintain the "liquid" feel of the UI.