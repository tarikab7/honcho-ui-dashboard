## 2026-06-19 - Sequential API Fetches in loadWorkspaceMeta
**Learning:** The loadWorkspaceMeta function was performing three sequential API fetches and one duplicate fetch for conclusions/list, blocking the UI update by adding unnecessary latency waterfalls.
**Action:** Replaced the sequential fetches with a single Promise.all concurrent execution and reused the initial conclusions payload instead of making a duplicate HTTP request.
