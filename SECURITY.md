# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 0.0.5 (latest) | ✅ |
| 0.0.4 | ⚠️ Bug fixes only |
| < 0.0.4 | ❌ |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub Issues.**

If you discover a security vulnerability in ROEDEX, please report it responsibly:

### Option 1: GitHub Private Vulnerability Reporting (Preferred)
1. Go to the [Security tab](https://github.com/LordCyberr/ROEDEX/security) of this repository
2. Click **"Report a vulnerability"**
3. Fill out the form with as much detail as possible

### Option 2: GitHub Issues (Non-Critical Only)
For low-severity, non-exploitable issues (e.g., an outdated dependency with a theoretical risk but no real attack surface in this context), you may open a regular GitHub Issue.

---

## What to Include in Your Report

- **Description** of the vulnerability and its potential impact
- **Steps to reproduce** (proof of concept, if possible)
- **Affected version(s)**
- **Your suggested fix** (optional but appreciated)

---

## Our Commitment

- We will acknowledge your report within **72 hours**.
- We will provide a status update within **7 days**.
- We will credit you in the changelog (by your GitHub handle or anonymously — your choice) once a fix is released.
- We will not take legal action against researchers acting in good faith.

---

## Scope

ROEDEX is a **client-side only** Chrome Extension with **zero backend infrastructure**. The primary security concerns are:

| Area | Risk Level | Notes |
|---|---|---|
| WebSocket interception of game traffic | Low | Read-only. No game packets are modified or injected. |
| Local `localStorage` / `IndexedDB` | Low | No cross-origin access. Data stays on user's machine. |
| CoinGecko API fetch (price data) | Very Low | Public keyless endpoint. No user data is transmitted. |
| `eval()` / dynamic code execution | None | Zero uses in codebase. MV3 prohibits `eval()`. |
| Content Security Policy | Low | MV3 `sandbox` restrictions apply. |

---

## Out of Scope

- Vulnerabilities in the Roots of Embervault game itself
- Theoretical vulnerabilities with no practical attack vector
- Issues requiring physical access to the user's machine
- Browser engine vulnerabilities (report those to the browser vendor)

---

Thank you for helping keep ROEDEX and its users safe.
