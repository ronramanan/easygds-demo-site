---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: refined minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction. **Never use brutalist/raw themes.**
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

**ALWAYS use light themes.** Dark themes and dark backgrounds should never be used. Design with light, bright, or white backgrounds and ensure text and UI elements have strong contrast against light surfaces.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Mobile-First Design & UX

**ALWAYS design mobile-first.** Start with the smallest viewport and progressively enhance for larger screens.

- **Layout**: Use a single-column flow as the baseline. Expand to multi-column grids only at wider breakpoints (`@media (min-width: 768px)` and above). Avoid horizontal scrolling.
- **Touch Targets**: All interactive elements must be at least 44×44px. Add generous padding to links, buttons, and controls. Space interactive elements apart to prevent mis-taps.
- **Typography Scaling**: Use `clamp()` for fluid type sizing (e.g., `clamp(1rem, 2.5vw, 1.5rem)`). Ensure body text is at least 16px on mobile to prevent browser zoom.
- **Navigation**: Prefer collapsible/hamburger navigation on mobile. Use sticky headers sparingly and keep them slim. Consider bottom navigation for app-like interfaces.
- **Content Priority**: Show the most important content first. Defer secondary content below the fold or behind progressive disclosure (accordions, tabs, "show more").
- **Performance**: Lazy-load images and heavy assets. Use responsive images (`srcset`, `<picture>`). Minimize layout shifts with explicit width/height or aspect-ratio.
- **Spacing & Rhythm**: Use consistent spacing scales (e.g., 4px/8px/16px/24px/32px). Reduce padding and margins on mobile; increase at wider breakpoints.
- **Forms & Inputs**: Use appropriate input types (`tel`, `email`, `number`) for better mobile keyboards. Make form fields full-width on mobile. Place labels above inputs, not beside them.
- **Gestures & Interaction**: Design for thumb-friendly zones. Place primary actions within easy reach at the bottom of the screen. Avoid hover-dependent interactions as the only way to access content.
- **Testing Mindset**: Always consider: "Does this work on a 375px-wide screen?" before expanding to desktop.

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, cookie-cutter design that lacks context-specific character, dark themes or dark backgrounds, or brutalist/raw aesthetics.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Use light themes with varied palettes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Don't hold back. Show what can truly be created when thinking outside the box and committing fully to a distinctive vision.