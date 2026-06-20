## 2026-06-20 - Intl.DateTimeFormat Instantiation Bottleneck
**Learning:** In vanilla JS projects without rendering libraries, rendering lists containing hundreds/thousands of items where each calls inline `toLocaleDateString` or `toLocaleTimeString` blocks the main thread because creating `Intl.DateTimeFormat` objects is an expensive operation.
**Action:** Always cache `Intl.DateTimeFormat` instances in the global/module scope when formatting timestamps for long lists to reduce format time by over 99%.
