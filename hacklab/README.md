# 🕹️ HACKLAB — Learn Ethical Hacking by Playing

A mission-based, GTA-style game that teaches **ethical hacking, network security,
and penetration testing** through interactive, **100% simulated** challenges.
No real systems are ever touched. No backend. No build step. Just open it.

> ⚖️ **Legal first:** the skills here are real. Only ever use them on systems you
> **own** or have **written permission** to test. The game's Foundations path drills
> this before anything else.

## How to play

Open `index.html` in any modern browser, or visit the hosted version (see below).
Progress is saved automatically in your browser (localStorage).

## The paths (skill tree)

1. **Foundations** — the hacker mindset, the law, how networks work, your first Linux shell. *(unlocks everything else)*
2. **Network Hacking** — recon, `nmap` port scanning, service enumeration, sniffing & MITM theory.
3. **Web & Penetration Testing** — HTTP, web recon, SQL injection, XSS, the OWASP Top 10.
4. **Defense & Blue Team** — password hashing, cracking weak hashes, Caesar ciphers, firewalls, hardening.
5. **Capstone CTF** — a multi-stage Capture-The-Flag that chains every skill. Beat it to reach **Hero** rank.

## Mission types

| Type | What you do |
|------|-------------|
| 📖 Lesson | Read a short, punchy brief and mark it complete. |
| ❓ Quiz | Multiple choice with explanations — must score 100% to pass. |
| 💻 Terminal | A safe simulated shell. Run real-style commands (`nmap`, `curl`, `cat`…) to finish an objective. |
| 🎯 Challenge | Free-text answers validated live (crack a hash, write an SQLi payload, decode a cipher). |

## How to add new content (it's just data)

All course content lives in [`js/curriculum.js`](js/curriculum.js). To add a mission,
drop a new object into a module's `missions` array. The engine renders it automatically.
No engine changes needed for new lessons, quizzes, terminals, or challenges.

## Tech

Vanilla HTML/CSS/JS — three files in `js/`:
- `curriculum.js` — all course content (data).
- `terminal.js` — the sandboxed fake shell.
- `app.js` — game engine (XP, levels, save/load, mission rendering).

## Roadmap ideas

- More missions per path (privilege escalation, password spraying theory, log analysis, steganography).
- Badges/achievements, a leaderboard (needs a small backend or a service like Supabase).
- Wi-Fi security path, mobile/IoT path, malware-analysis (defensive) path.
- An in-browser packet-capture visualiser.
