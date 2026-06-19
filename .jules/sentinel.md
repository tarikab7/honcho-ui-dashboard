## 2024-05-18 - [CRITICAL] Prevent XSS by escaping HTML
**Vulnerability:** XSS vulnerabilities in vanilla JS UI rendering
**Learning:** In vanilla JS, user input injected directly into `innerHTML` without HTML escaping leads to XSS. Missing HTML escaping before injecting into `innerHTML` must be avoided.
**Prevention:** Apply an `escapeHtml` function to user-generated data before injecting it into strings that will be parsed as HTML.
