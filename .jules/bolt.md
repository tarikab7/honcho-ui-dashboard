## 2026-06-19 - Sequential API Fetches in loadWorkspaceMeta
**Learning:** The loadWorkspaceMeta function was performing three sequential API fetches and one duplicate fetch for conclusions/list, blocking the UI update by adding unnecessary latency waterfalls.
**Action:** Replaced the sequential fetches with a single Promise.all concurrent execution and reused the initial conclusions payload instead of making a duplicate HTTP request.
## 2024-06-22 - Network Connection Exhaustion from unbounded Promise.all
**Learning:** Performing `Promise.all` on large arrays of items where each iteration performs multiple network `fetch` requests can lead to browser queue contention and stall the application. Browsers limit simultaneous connections (usually 6) per origin. When flooded, tasks back up indefinitely leading to timeouts or freezing.
**Action:** Always batch or throttle concurrent network requests by implementing a worker-queue pattern or concurrency limit (e.g. 10 at a time) for iterative bulk loading over a REST API that doesn't natively support bulk fetch.
