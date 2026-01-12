---
description: create a professional section for SettleIt
---
# How to create a professional section for SettleIt

To add a new core section (like About, FAQ, or Features) to SettleIt, follow these steps:

1. **Plan the Section Content**
   - Identify the goal (e.g., informative, instructional, or marketing).
   - Define a set of cards or a structured layout.
   - Select appropriate icons from `lucide-vue-next`.

2. **Create the View Component**
   - Create a new file in `src/views/[SectionName].vue`.
   - Use the `glass-card` class for a consistent, modern UI.
   - Utilize linear gradients for headers or icons to maintain the premium feel.
   - Ensure mobile responsiveness using media queries.

3. **Register the Route**
   - Open `src/router/index.js`.
   - Add the new route to the `routes` array.
   - If the page is accessible without logging in, set `meta: { public: true }`.

4. **Add to Navigation**
   - If the section should be accessible globally, add it to the `navLinks` array in `src/App.vue`.

5. **Style the Section**
   - Use global CSS variables defined in `src/style.css` (e.g., `--primary`, `--secondary`, `--glass`).
   - Add animations or transitions for a "WOW" factor.
