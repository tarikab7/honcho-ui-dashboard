## 2024-05-18 - Widespread Unescaped DOM Interpolation in Vanilla JS

**Vulnerability:** Found multiple XSS vulnerabilities across the application where untrusted user data (conclusions, session summaries, observations, peer contexts) were directly interpolated into HTML strings and rendered via `innerHTML`.
**Learning:** In vanilla JS applications lacking a framework with automatic escaping (like React or Vue), using template literals to construct HTML strings and inserting them with `innerHTML` is highly prone to XSS. A specific tricky pattern was the custom regex-based markdown parser which processed raw text and returned HTML without first escaping the input.
**Prevention:** Always define and use an `escapeHtml` function before interpolating any dynamic or untrusted data into HTML strings. When implementing custom markdown parsing or transformations, sanitize the input text *before* applying regex transformations to ensure no raw HTML tags can bypass the parser.
