# Known Limitations

- The websocket listener depends on Chrome's `chrome.debugger` API, which shows a persistent banner at the top of the browser.
- Hard page refreshes reset session tracking values.
- Rare spawn coordinates are currently limited to approximate mapping based on player radius triggers.
