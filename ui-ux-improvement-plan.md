# UI/UX Improvement Plan - SISJAD

## Goal
Refresh visual design dan improve user experience. Make UI feel more modern, polished, dan professional.

## Current State Analysis

### Strengths
- Skeleton loaders sudah premium
- Consistent spacing system (padding, gaps)
- Status color coding jelas (validated=blue, hard-conflict=rose, soft-warning=amber)
- Responsive grid layout

### Issues
1. **Color Scheme**: Terlalu banyak slate tones, kurang contrast. Background `#f9fafb` terlalu washout.
2. **Typography**: Font sizes terlalu kecil di banyak tempat (9px-11px). Susah dibaca.
3. **Shadows**: Terlalu subtle, kurang depth. `shadow-[0_8px_30px_rgb(0,0,0,0.02)]` almost invisible.
4. **Interactive Feedback**: Hover states ada tapi kurang prominent. Focus states missing.
5. **Visual Hierarchy**: Semua section pakai style sama, tidak ada differentiation antara primary content dan secondary.
6. **Cards & Containers**: Border colors inconsistent (`border-slate-200/60`, `border-slate-150`, `border-slate-200`).
7. **Icons**: Size konsisten tapi stroke width `1.5` terlalu thin untuk size kecil.
8. **Buttons**: Primary button kurang pop, secondary button kurang defined.
9. **Tables**: Terlalu minimal, no alternating row colors, hard to scan.
10. **Forms**: Input fields terlalu compact, labels terlalu small.

---

## Tasks

### Phase 1: Design System Foundation

- [ ] **Task 1.1**: Define color palette yang lebih vibrant
  - Replace `#f9fafb` background dengan gradient atau warmer tone
  - Increase contrast ratio untuk text
  - Create CSS variables untuk semantic colors (primary, success, warning, danger)
  - Verify: Color contrast ≥4.5:1 untuk body text

- [ ] **Task 1.2**: Standardize spacing dan sizing tokens
  - Increase base font size dari 12px → 14px untuk body text
  - Standardize border radius (8px, 12px, 16px, 24px)
  - Verify: Consistent spacing scale di globals.css

- [ ] **Task 1.3**: Improve shadow system
  - Add elevation levels (sm, md, lg, xl)
  - Use colored shadows untuk cards (e.g., `shadow-blue-100/50` untuk primary cards)
  - Verify: Visual depth clearly visible on light background

### Phase 2: Component Polish

- [ ] **Task 2.1**: Refresh Calendar Grid component
  - Add subtle gradient background untuk day headers
  - Increase card padding dari `p-3.5` → `p-4`
  - Add hover glow effect pada schedule cards
  - Verify: Cards have clear visual hierarchy dan feel clickable

- [ ] **Task 2.2**: Improve Conflict Panel styling
  - Add icon background circles dengan color-coded fills
  - Increase spacing between conflict items
  - Make "Resolve" button more prominent
  - Verify: Issue cards stand out, action clear

- [ ] **Task 2.3**: Redesign Master Data tables
  - Add alternating row backgrounds (`bg-slate-50` / `bg-white`)
  - Increase row padding (py-4 → py-5)
  - Add sticky headers dengan subtle shadow on scroll
  - Verify: Tables easier to scan, headers stay visible

- [ ] **Task 2.4**: Polish modal dialogs
  - Increase max-width untuk better readability
  - Add overlay gradient instead of solid color
  - Improve close button visibility
  - Verify: Modals feel like elevated surfaces

- [ ] **Task 2.5**: Enhance form inputs
  - Increase input height (py-2.5 → py-3)
  - Make labels larger (10px → 12px)
  - Add subtle animation on focus (border color transition)
  - Verify: Forms feel comfortable to fill

### Phase 3: Navigation & Layout

- [ ] **Task 3.1**: Improve sidebar navigation
  - Add section dividers dengan labels
  - Active state dengan left border indicator
  - Add subtle hover background transition
  - Verify: Navigation clear, current location obvious

- [ ] **Task 3.2**: Enhance header
  - Add subtle bottom gradient
  - Improve stats badges styling (add icons, increase padding)
  - Make user profile section more prominent
  - Verify: Header feels like top-level navigation

### Phase 4: Accessibility & Interaction

- [ ] **Task 4.1**: Add proper focus states
  - Focus ring untuk semua interactive elements
  - High contrast focus indicator
  - Verify: Keyboard navigation visible dan usable

- [ ] **Task 4.2**: Improve loading states
  - Add subtle pulse animation pada skeleton elements
  - Smooth transition when content loads
  - Verify: Loading → loaded feels smooth

- [ ] **Task 4.3**: Add micro-interactions
  - Button press feedback (scale down slightly)
  - Card hover lift effect
  - Toast notification slide-in animation
  - Verify: Interactions feel responsive dan polished

---

## Done When

- [ ] Visual design feels modern dan professional
- [ ] Typography readable tanpa strain
- [ ] Clear visual hierarchy antar sections
- [ ] Interactive elements have obvious feedback
- [ ] Accessible via keyboard navigation
- [ ] Consistent spacing, colors, dan shadows throughout

---

## Notes

- Keep existing functionality intact - only visual changes
- Test di berbagai screen sizes (mobile, tablet, desktop)
- Maintain role-based UI visibility (admin vs dosen vs mahasiswa)
- Preserve dark mode capability (even if not currently used)
