## 2024-06-22 - Fix N+1 API Requests in Session Detail Fetching
**Learning:** Performing a naive `Promise.all` over an array that can be indefinitely large (like sessions mapping to multiple API fetches) causes an N+1 burst that can lead to browser queue exhaustion or server connection resets (ECONNRESET).
**Action:** Always batch or chunk asynchronous network requests using a loop (e.g. slicing chunks of size 5) and `await Promise.all` within the loop to pace the requests, especially when bulk endpoints aren't available.
