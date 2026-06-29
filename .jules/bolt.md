## 2026-06-19 - Sequential API Fetches in loadWorkspaceMeta
**Learning:** The loadWorkspaceMeta function was performing three sequential API fetches and one duplicate fetch for conclusions/list, blocking the UI update by adding unnecessary latency waterfalls.
**Action:** Replaced the sequential fetches with a single Promise.all concurrent execution and reused the initial conclusions payload instead of making a duplicate HTTP request.

## 2026-06-20 - Avoid Event Listeners on Dynamically Overwritten Elements
**Learning:** Using `innerHTML` string replacement to render large lists (Conclusions, Sessions) while attaching individual `addEventListener('click')` handlers to each generated child element causes subtle memory leaks and blocks the main thread. Since `innerHTML` destroys previous elements but the browser's JS context may hold onto the detached nodes due to closures, this is a distinct anti-pattern in vanilla JS apps.
**Action:** Always use Event Delegation by attaching a single event listener to the static parent container (e.g., `DOM.conclusionsGridContainer`) and leverage `e.target.closest()` to identify the clicked child item.
