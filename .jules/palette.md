## 2026-06-18 - Div Elements as Buttons
**Learning:** The application extensively uses `div` elements (like `.session-card` and `.conclusion-card`) with click listeners for interactive content without providing `tabindex` or keyboard event handlers (`keydown`), rendering these core interactions completely inaccessible to keyboard and screen reader users.
**Action:** In future updates or new components, interactive elements should either use semantic `<button>` / `<a>` tags, or `div` elements must be explicitly equipped with `tabindex="0"`, `role="button"`, and `keydown` handlers for Enter/Space keys to ensure full accessibility.

## 2026-06-27 - Keyboard Accessibility on Non-Native Elements
**Learning:** When turning non-native elements like `div` or `span` cards into clickable interfaces (e.g. `.timeline-item-session`), they must explicitly include `tabindex="0"`, `role="button"`, and `keydown` event listeners for 'Enter' and 'Space' keys, ensuring `preventDefault()` is called for Space to avoid unintended scrolling.
**Action:** When adding new interactive components, always include keyboard navigation and event handling to ensure consistent accessibility across the application.
