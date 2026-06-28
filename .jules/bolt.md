## 2026-06-19 - Sequential API Fetches in loadWorkspaceMeta
**Learning:** The loadWorkspaceMeta function was performing three sequential API fetches and one duplicate fetch for conclusions/list, blocking the UI update by adding unnecessary latency waterfalls.
**Action:** Replaced the sequential fetches with a single Promise.all concurrent execution and reused the initial conclusions payload instead of making a duplicate HTTP request.

## 2026-06-28 - Attaching Event Listeners Inside Render Loops
**Learning:** Attaching event listeners directly to dynamically generated elements inside a render function using `.querySelectorAll().forEach()` is a major performance bottleneck and causes memory leaks, as older handlers remain in memory when the `.innerHTML` is overwritten. It also blocks the main thread during heavy rendering.
**Action:** Use Event Delegation by attaching a single event listener to the parent container during initialization (`initEvents()`) and checking `e.target.closest()` to handle the action.
