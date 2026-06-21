## 2026-06-21 - Fix XSS Vulnerabilities in Templates
**Vulnerability:** XSS vulnerabilities in dynamically generated HTML templates when rendering external API data into the UI.
**Learning:** Using template literals directly with `innerHTML` leaves data vulnerable if not escaped.
**Prevention:** Make sure to sanitize external inputs using an escape function (e.g. `escapeHtml`) before interpolating them into HTML templates when rendering via `innerHTML`.
