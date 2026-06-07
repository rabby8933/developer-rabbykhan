/* ============================================================================
 * HACKLAB — Curriculum data
 * ----------------------------------------------------------------------------
 * The entire course lives here as plain data so new missions can be added
 * without touching the engine. Structure:
 *
 *   PATHS  ->  modules  ->  missions
 *
 * Mission types:
 *   'lesson'    : read the brief, click to complete.
 *   'quiz'      : multiple-choice questions with explanations.
 *   'terminal'  : a sandboxed fake shell; finish an objective.
 *   'challenge' : free-text answer(s) validated by a function (ciphers,
 *                 injection payloads, hashes, etc).
 *
 * Everything is 100% simulated. No real network traffic ever leaves the page.
 * ==========================================================================*/

const CURRICULUM = {

  /* --------------------------------------------------------------------- *
   * PATH 0 — FOUNDATIONS  (required before the branching paths unlock)
   * --------------------------------------------------------------------- */
  foundations: {
    id: 'foundations',
    title: 'Foundations',
    tag: 'Start here',
    icon: '🧠',
    color: '#22d3ee',
    blurb: 'The hacker mindset, the law, and how computers really talk to each other. Clear this to unlock every other path.',
    modules: [
      {
        id: 'mindset',
        title: 'The Hacker Mindset & The Law',
        missions: [
          {
            id: 'f-ethics',
            type: 'lesson',
            title: 'Rule #1: Stay Legal',
            xp: 40,
            brief: `
              <p>Welcome, operative. Before you touch a single tool, burn this into your memory:</p>
              <p class="big">You may only hack systems you <b>own</b> or have <b>written permission</b> to test.</p>
              <p>"Ethical" hacking isn't a vibe — it's a legal status. The exact same <code>nmap</code> command is a
              career when you're on a signed engagement and a felony when you're not. In most countries
              (US Computer Fraud &amp; Abuse Act, UK Computer Misuse Act, etc.) unauthorized access alone is a crime,
              even if you "didn't break anything".</p>
              <h4>Where to practice legally (for real)</h4>
              <ul>
                <li><b>This game</b> — everything here is simulated and safe.</li>
                <li>Your own lab — VirtualBox/VMware with intentionally vulnerable VMs (Metasploitable, OWASP Juice Shop).</li>
                <li>Legal arenas — TryHackMe, Hack The Box, PortSwigger Web Security Academy, OverTheWire, picoCTF.</li>
                <li>Bug-bounty programs — only within their published scope.</li>
              </ul>
              <p>A pentester's real job is to <i>find weaknesses so they can be fixed</i>. You are a digital locksmith,
              not a burglar. Act like it and the whole industry will pay you for it.</p>`
          },
          {
            id: 'f-ethics-quiz',
            type: 'quiz',
            title: 'Know the Rules',
            xp: 50,
            brief: `<p>Quick gut-check on the legal and ethical ground rules.</p>`,
            questions: [
              {
                q: 'You find a website with an obvious SQL injection bug. You have no agreement with the owner. What do you do?',
                options: [
                  'Exploit it to prove it is real, then tell them',
                  'Do nothing intrusive; report it responsibly through their security/contact channel',
                  'Dump the database so you have evidence',
                  'Sell the bug'
                ],
                answer: 1,
                explain: 'Without authorization, even "proving" the bug by exploiting it is illegal access. Report responsibly and stop.'
              },
              {
                q: 'What single thing separates an ethical hacker from a criminal performing the same action?',
                options: ['Better tools', 'Authorization (permission/scope)', 'Wearing a hoodie', 'Using Linux'],
                answer: 1,
                explain: 'Authorization is the line. Same keystrokes, opposite legal outcome.'
              },
              {
                q: 'A "scope" in a penetration test defines…',
                options: [
                  'How fast you can type',
                  'Exactly which systems/IPs/apps you are allowed to test and how',
                  'The price of the engagement only',
                  'Which hoodie to wear'
                ],
                answer: 1,
                explain: 'Scope is the contract boundary. Touch something outside it and you are no longer "ethical".'
              }
            ]
          }
        ]
      },
      {
        id: 'networking-101',
        title: 'How The Internet Actually Works',
        missions: [
          {
            id: 'f-net',
            type: 'lesson',
            title: 'IP, Ports, DNS & Packets',
            xp: 45,
            brief: `
              <p>Every attack and defense in this game rests on four ideas. Learn them once, use them forever.</p>
              <ul>
                <li><b>IP address</b> — a machine's number on the network, e.g. <code>192.168.1.10</code>. Like a street address.</li>
                <li><b>Port</b> — a numbered door on that machine for a specific service. Web = <code>80</code>/<code>443</code>,
                    SSH = <code>22</code>, MySQL = <code>3306</code>. Like apartment numbers at the address.</li>
                <li><b>DNS</b> — the phone book that turns <code>example.com</code> into an IP address.</li>
                <li><b>Packet</b> — data is chopped into small envelopes (packets), each stamped with source + destination
                    IP and port. Sniffers read these; firewalls filter them.</li>
              </ul>
              <p>So "hacking a server" usually means: <i>find its IP → find which ports/doors are open →
              figure out what service sits behind each door → find a weakness in that service.</i> That sequence is the
              spine of the whole Network path.</p>`
          },
          {
            id: 'f-linux',
            type: 'terminal',
            title: 'First Contact: The Linux Shell',
            xp: 70,
            brief: `<p>Hackers live in the terminal. Here's a safe sandbox. Type <code>help</code> to see commands.
                    <b>Objective:</b> explore the files and read the secret flag.</p>`,
            scenario: {
              welcome: "Sandboxed shell. Type 'help'. Goal: find and 'cat' the secret flag file.",
              prompt: 'recruit@hacklab:~$ ',
              objective: "Use ls and cat to read the contents of the hidden flag file.",
              hints: [
                "List files with: ls",
                "Some files start with a dot and are hidden. Try: ls -a",
                "Read a file with: cat <filename>. The flag lives in .flag"
              ],
              fs: {
                'readme.txt': 'Welcome recruit. The flag is hidden. Try listing ALL files.',
                'notes.txt': 'Remember: dotfiles are hidden from a plain ls.',
                '.flag': 'FLAG{you_can_read_the_filesystem}'
              },
              completeWhen: (t) => t.flags.readFlag === true
            }
          }
        ]
      }
    ]
  },

  /* --------------------------------------------------------------------- *
   * PATH 1 — NETWORK HACKING
   * --------------------------------------------------------------------- */
  network: {
    id: 'network',
    title: 'Network Hacking',
    tag: 'Red — Offense',
    icon: '🛰️',
    color: '#f43f5e',
    requires: 'foundations',
    blurb: 'Reconnaissance, port scanning, service enumeration, sniffing and man-in-the-middle theory. Map the target, find the open doors.',
    modules: [
      {
        id: 'recon',
        title: 'Reconnaissance & Scanning',
        missions: [
          {
            id: 'n-recon-lesson',
            type: 'lesson',
            title: 'The Recon Mindset',
            xp: 45,
            brief: `
              <p>Pros spend most of an engagement <i>before</i> exploiting anything. You can't attack what you can't see.</p>
              <ul>
                <li><b>Passive recon</b> — gather info without touching the target: DNS records, public certs, job posts,
                    Google dorking, leaked creds. Invisible to them.</li>
                <li><b>Active recon</b> — you interact with the target: ping sweeps, port scans. Noisy but precise.</li>
              </ul>
              <p>The single most important offensive tool is <code>nmap</code> — it knocks on every port and reports which
              doors are open and what's likely behind them. Next mission: you drive it.</p>`
          },
          {
            id: 'n-nmap',
            type: 'terminal',
            title: 'Mission: Map The Target',
            xp: 90,
            brief: `<p>Target acquired: <code>10.10.14.7</code>. <b>Objective:</b> scan it with <code>nmap</code>, see which
                    ports are open, then report them with <code>report &lt;ports&gt;</code> (comma-separated).</p>`,
            scenario: {
              welcome: "Engagement sandbox. Authorized target: 10.10.14.7. Type 'help'.",
              prompt: 'operator@hacklab:~$ ',
              objective: "Run: nmap 10.10.14.7  — then report the open ports: report 22,80,3306",
              hints: [
                "Scan with: nmap 10.10.14.7",
                "Read the OPEN ports from the scan output.",
                "Submit them with no spaces: report 22,80,3306"
              ],
              fs: {},
              commands: {
                nmap: function (args, t) {
                  const target = args[0];
                  if (!target) return "nmap: missing target. Usage: nmap <ip>";
                  if (target !== '10.10.14.7')
                    return `nmap: ${target} is OUT OF SCOPE. Only 10.10.14.7 is authorized. (Scanning out of scope = illegal.)`;
                  t.flags.scanned = true;
                  return [
                    "Starting Nmap scan against 10.10.14.7 ...",
                    "PORT     STATE   SERVICE",
                    "22/tcp   open    ssh",
                    "80/tcp   open    http",
                    "443/tcp  closed  https",
                    "3306/tcp open    mysql",
                    "8080/tcp filtered http-proxy",
                    "",
                    "Nmap done. 3 ports open. Now: report <ports>"
                  ].join('\n');
                },
                report: function (args, t) {
                  if (!t.flags.scanned) return "Scan the target first with: nmap 10.10.14.7";
                  const given = (args[0] || '').split(',').map(s => s.trim()).filter(Boolean).sort().join(',');
                  if (given === '22,3306,80') { t.flags.reported = true; return "✔ Correct! Open ports confirmed: 22 (ssh), 80 (http), 3306 (mysql)."; }
                  return "✘ Not quite. Re-read the scan — only OPEN ports count (closed/filtered don't). Try again.";
                }
              },
              completeWhen: (t) => t.flags.reported === true
            }
          },
          {
            id: 'n-ports-quiz',
            type: 'quiz',
            title: 'Know Your Ports',
            xp: 55,
            brief: `<p>Recognising services by port is muscle memory for network hackers.</p>`,
            questions: [
              { q: 'Port 22 typically means…', options: ['HTTP', 'SSH (remote shell)', 'MySQL', 'DNS'], answer: 1,
                explain: 'SSH = encrypted remote administration. A prime target for weak passwords.' },
              { q: 'You see port 3306 open. What is probably running?', options: ['A web server', 'A MySQL database', 'An email server', 'A printer'], answer: 1,
                explain: '3306 = MySQL. A database exposed to the network is a juicy and dangerous find.' },
              { q: 'An nmap port marked "filtered" usually means…', options: ['Open and unprotected', 'A firewall is blocking/dropping probes', 'The service crashed', 'It is port 80'], answer: 1,
                explain: '"filtered" = something (usually a firewall) is silently dropping packets, so nmap cannot tell open vs closed.' }
            ]
          }
        ]
      },
      {
        id: 'sniffing',
        title: 'Sniffing & MITM (Theory)',
        missions: [
          {
            id: 'n-sniff',
            type: 'lesson',
            title: 'Packet Sniffing & Man-in-the-Middle',
            xp: 50,
            brief: `
              <p>On a shared/local network, tools like <b>Wireshark</b> and <b>tcpdump</b> capture passing packets. If traffic is
              <b>unencrypted</b> (plain HTTP, old protocols), an attacker on the path can read usernames, passwords, cookies.</p>
              <p>A <b>Man-in-the-Middle (MITM)</b> attack secretly relays and possibly alters traffic between two parties — e.g. via
              <b>ARP spoofing</b>, tricking your machine into sending packets through the attacker first.</p>
              <p><b>The defense, and why HTTPS won:</b> end-to-end encryption (TLS). A sniffer on the wire just sees scrambled bytes.
              This is exactly why "is there a padlock / https://" matters. You'll attack the web layer next path over — but every
              defender's first win is <i>encrypt everything</i>.</p>`
          },
          {
            id: 'n-subnet',
            type: 'challenge',
            title: 'Challenge: Read The Network',
            xp: 65,
            brief: `<p>You captured a host config. The machine's IP is <code>192.168.1.42</code> with subnet mask
                    <code>255.255.255.0</code> (a /24). <b>Question:</b> what is the broadcast address of this network?
                    (Hint: a /24 keeps the first three octets and the host range is .1–.254.)</p>`,
            inputs: [{ key: 'bcast', label: 'Broadcast address' }],
            validate: (a) => a.bcast.trim() === '192.168.1.255',
            success: 'Correct — in a /24, .255 is the broadcast address (and .0 is the network address).',
            fail: 'Not yet. In a 255.255.255.0 network, the broadcast is the last address: x.x.x.255.',
            hints: ['Keep 192.168.1, change the last octet.', 'Broadcast = highest address = .255']
          }
        ]
      }
    ]
  },

  /* --------------------------------------------------------------------- *
   * PATH 2 — WEB / PENETRATION TESTING
   * --------------------------------------------------------------------- */
  web: {
    id: 'web',
    title: 'Web & Penetration Testing',
    tag: 'Red — Offense',
    icon: '🕸️',
    color: '#a855f7',
    requires: 'foundations',
    blurb: 'How websites break: recon, the OWASP Top 10, SQL injection, XSS and authentication bypass. The most in-demand pentest skillset.',
    modules: [
      {
        id: 'http',
        title: 'HTTP & Web Recon',
        missions: [
          {
            id: 'w-http',
            type: 'lesson',
            title: 'How The Web Talks: HTTP',
            xp: 45,
            brief: `
              <p>Every web hack is just clever HTTP. A browser sends a <b>request</b> (method + path + headers + maybe a body),
              the server sends a <b>response</b> (status code + headers + body).</p>
              <ul>
                <li><b>Methods:</b> <code>GET</code> (fetch), <code>POST</code> (submit data), <code>PUT</code>/<code>DELETE</code> (modify).</li>
                <li><b>Status codes:</b> <code>200</code> OK, <code>301/302</code> redirect, <code>403</code> forbidden, <code>404</code> not found, <code>500</code> server error.</li>
                <li><b>The trick:</b> the browser is just one client. With <code>curl</code> or Burp Suite you can send <i>any</i> request you like,
                    including ones the website's UI would never let you send. That freedom is where bugs hide.</li>
              </ul>`
          },
          {
            id: 'w-curl',
            type: 'terminal',
            title: 'Mission: Find The Hidden Admin Panel',
            xp: 95,
            brief: `<p>Authorized target: <code>http://shop.local</code>. Web devs often leak hidden paths in
                    <code>/robots.txt</code>. <b>Objective:</b> read robots.txt, then curl the hidden admin path it reveals.</p>`,
            scenario: {
              welcome: "Web recon sandbox. Target in scope: http://shop.local. Type 'help'.",
              prompt: 'pentester@hacklab:~$ ',
              objective: "1) curl http://shop.local/robots.txt   2) curl the disallowed admin path it reveals.",
              hints: [
                "Fetch a page with: curl http://shop.local/robots.txt",
                "robots.txt lists Disallow: /secret-admin",
                "Now request it: curl http://shop.local/secret-admin"
              ],
              fs: {},
              commands: {
                curl: function (args, t) {
                  let url = (args[0] || '').replace(/^http:\/\//, '');
                  if (!url) return "curl: try a URL, e.g. curl http://shop.local/robots.txt";
                  if (url === 'shop.local' || url === 'shop.local/') return "<html><body><h1>Welcome to Shop.local</h1></body></html>";
                  if (url === 'shop.local/robots.txt') {
                    t.flags.sawRobots = true;
                    return "User-agent: *\nDisallow: /secret-admin\nDisallow: /backups";
                  }
                  if (url === 'shop.local/secret-admin') {
                    if (!t.flags.sawRobots) return "403 Forbidden — but how did you know this path was here? (read robots.txt first)";
                    t.flags.foundAdmin = true;
                    return "200 OK\n<html><h1>Admin Login</h1>FLAG{robots_txt_leaks_secrets}</html>";
                  }
                  return "404 Not Found";
                }
              },
              completeWhen: (t) => t.flags.foundAdmin === true
            }
          }
        ]
      },
      {
        id: 'owasp',
        title: 'Breaking Web Apps',
        missions: [
          {
            id: 'w-sqli',
            type: 'challenge',
            title: 'Challenge: SQL Injection Login Bypass',
            xp: 100,
            brief: `
              <p>A login form builds this query straight from user input (the classic mistake):</p>
              <pre>SELECT * FROM users WHERE name = '<b>[INPUT]</b>' AND pass = '...'</pre>
              <p>If you can make the <code>WHERE</code> clause always true, you log in without a password.
              <b>Objective:</b> type a username payload that turns the condition into something always-true and comments out the rest.</p>`,
            inputs: [{ key: 'payload', label: 'Username field payload' }],
            validate: (a) => {
              const p = a.payload.toLowerCase().replace(/\s+/g, ' ').trim();
              // accept the classic ' OR '1'='1  family, with or without a comment
              return /'\s*or\s*'?1'?\s*=\s*'?1/.test(p) || /'\s*or\s*1\s*=\s*1/.test(p) || /'\s*or\s*'.+'\s*=\s*'.+/.test(p);
            },
            success: "Access granted! The injected OR makes the WHERE clause always true. Real fix: PARAMETERIZED QUERIES — never concatenate user input into SQL.",
            fail: "Rejected. You need to close the quote and add an always-true OR. Think: ' OR '1'='1",
            hints: [
              "The input is wrapped in single quotes. Close that quote first with: '",
              "Then add an always-true condition: OR '1'='1",
              "A full classic payload: ' OR '1'='1' --"
            ]
          },
          {
            id: 'w-xss-quiz',
            type: 'quiz',
            title: 'XSS & The OWASP Top 10',
            xp: 60,
            brief: `<p>Cross-Site Scripting (XSS) is injecting JavaScript that runs in <i>another user's</i> browser.</p>`,
            questions: [
              { q: 'XSS happens primarily because a site…', options: ['Uses HTTPS', 'Reflects user input into a page without sanitising/encoding it', 'Has open ports', 'Runs Linux'], answer: 1,
                explain: 'Unsanitised input rendered as HTML/JS = the browser runs attacker script. Fix: output-encode and use a Content-Security-Policy.' },
              { q: 'The best fix for SQL injection is…', options: ['Hiding the login page', 'Parameterized queries / prepared statements', 'A longer password', 'Disabling JavaScript'], answer: 1,
                explain: 'Parameterized queries separate code from data so input can never become SQL.' },
              { q: 'The OWASP Top 10 is…', options: ['A list of the 10 best hackers', 'A widely-used list of the most critical web app security risks', 'A type of firewall', 'A programming language'], answer: 1,
                explain: 'OWASP Top 10 is the industry baseline checklist of web risks every pentester and developer should know.' }
            ]
          }
        ]
      }
    ]
  },

  /* --------------------------------------------------------------------- *
   * PATH 3 — DEFENSE / BLUE TEAM
   * --------------------------------------------------------------------- */
  defense: {
    id: 'defense',
    title: 'Defense & Blue Team',
    tag: 'Blue — Defense',
    icon: '🛡️',
    color: '#34d399',
    requires: 'foundations',
    blurb: 'The other half of the job: hashing & passwords, encryption, hardening, firewalls, and reading logs to catch the attacker.',
    modules: [
      {
        id: 'crypto',
        title: 'Passwords, Hashing & Crypto',
        missions: [
          {
            id: 'd-hash-lesson',
            type: 'lesson',
            title: 'Why Passwords Are Hashed (Not Encrypted)',
            xp: 45,
            brief: `
              <p>Good systems never store your actual password. They store a <b>hash</b> — a one-way fingerprint.</p>
              <ul>
                <li><b>Hashing</b> (SHA-256, bcrypt, Argon2) is <i>one-way</i>: easy to compute, practically impossible to reverse.
                    At login the server hashes what you typed and compares fingerprints.</li>
                <li><b>Encryption</b> is <i>two-way</i> (you can decrypt with a key) — used for data you need to read back, not passwords.</li>
                <li><b>Salt</b> = random data added before hashing so two users with the same password get different hashes,
                    defeating precomputed "rainbow table" attacks.</li>
              </ul>
              <p>How do attackers crack hashes then? They <b>guess</b>: hash millions of candidate passwords (dictionary + rules)
              and look for a matching fingerprint. That's why long, unique passwords win — more guesses needed. Next: do it yourself.</p>`
          },
          {
            id: 'd-crack',
            type: 'challenge',
            title: 'Challenge: Crack The Weak Hash',
            xp: 90,
            brief: `
              <p>You recovered this MD5 hash from a breach: <code>5f4dcc3b5aa765d61d8327deb882cf99</code></p>
              <p>It's a famously weak, common password. Use the wordlist below — type the plaintext that produces this hash.</p>
              <p><b>Wordlist:</b> <code>letmein</code>, <code>password</code>, <code>dragon</code>, <code>123456</code>, <code>qwerty</code></p>
              <p class="dim">(In real life you'd run <code>hashcat</code> or <code>john</code> to test all of these in milliseconds.)</p>`,
            inputs: [{ key: 'pw', label: 'Cracked password' }],
            validate: (a) => a.pw.trim().toLowerCase() === 'password',
            success: "Cracked! MD5('password') = 5f4dcc3b5aa765d61d8327deb882cf99. This is THE most common weak password — and MD5 is broken for password storage. Use bcrypt/Argon2 + a salt.",
            fail: "Wrong plaintext. One of those words hashes to the target. ('password' is suspiciously common…)",
            hints: ["It's the most clichéd password of all time.", "It is literally the word: password"]
          },
          {
            id: 'd-cipher',
            type: 'challenge',
            title: 'Challenge: Crack The Caesar Cipher',
            xp: 70,
            brief: `
              <p>Intercepted message, encrypted with a <b>Caesar cipher</b> (each letter shifted by a fixed amount):</p>
              <pre>WKH SDVVZRUG LV CYBER</pre>
              <p>It was shifted forward by <b>3</b>. Shift each letter back by 3 to decrypt. Type the full decoded sentence.</p>`,
            inputs: [{ key: 'msg', label: 'Decoded message' }],
            validate: (a) => a.msg.toUpperCase().replace(/\s+/g, ' ').trim() === 'THE PASSWORD IS CYBER',
            success: "Decrypted! 'THE PASSWORD IS CYBER'. The Caesar cipher is trivial to break — only 25 possible shifts. Real crypto needs huge keyspaces.",
            fail: "Not yet. Shift each letter back by 3: W→T, K→H, H→E … work through it.",
            hints: ["W minus 3 = T. K minus 3 = H.", "The first word is THE.", "Answer format: THE PASSWORD IS CYBER"]
          }
        ]
      },
      {
        id: 'harden',
        title: 'Hardening & Detection',
        missions: [
          {
            id: 'd-harden-quiz',
            type: 'quiz',
            title: 'Defender Fundamentals',
            xp: 60,
            brief: `<p>Blue team thinking: shrink the attack surface, then watch what's left.</p>`,
            questions: [
              { q: 'A firewall primarily works by…', options: ['Encrypting passwords', 'Allowing/blocking traffic based on rules (ports, IPs, protocols)', 'Scanning for ports on other machines', 'Cracking hashes'], answer: 1,
                explain: 'Firewalls filter packets by rules — closing doors the attacker wanted to use.' },
              { q: 'You run a public web server. Best practice for the SSH port (22)?', options: ['Open it to the whole internet with a 4-digit password', 'Restrict it to known admin IPs and use key-based auth', 'Forward it to everyone', 'Delete SSH entirely and never administer the box'], answer: 1,
                explain: 'Limit exposure (IP allow-list) + strong auth (keys, not weak passwords). Minimise attack surface.' },
              { q: 'An IDS (Intrusion Detection System) does what?', options: ['Blocks all traffic', 'Monitors traffic/logs and alerts on suspicious patterns', 'Hashes passwords', 'Performs port scans for fun'], answer: 1,
                explain: 'An IDS watches and alerts (an IPS can also block). Detection is how you catch the attacker you could not keep out.' },
              { q: 'Principle of least privilege means…', options: ['Give everyone admin to be safe', 'Grant each account only the access it needs, nothing more', 'Use the shortest passwords', 'Turn off logging'], answer: 1,
                explain: 'Least privilege limits the blast radius when (not if) an account is compromised.' }
            ]
          }
        ]
      }
    ]
  },

  /* --------------------------------------------------------------------- *
   * PATH 4 — CAPSTONE CTF  (unlocks after all three branches)
   * --------------------------------------------------------------------- */
  capstone: {
    id: 'capstone',
    title: 'Capstone: Operation Final Boss',
    tag: 'CTF — All skills',
    icon: '🏆',
    color: '#fbbf24',
    requires: ['network', 'web', 'defense'],
    blurb: 'A multi-stage Capture-The-Flag that chains recon, web exploitation and crypto. Beat this and you have earned Hero rank.',
    modules: [
      {
        id: 'ctf',
        title: 'The Operation',
        missions: [
          {
            id: 'c-ctf',
            type: 'terminal',
            title: 'CTF: Breach mega-corp.local',
            xp: 200,
            brief: `<p>Full engagement, target <code>mega-corp.local</code> (10.10.99.5). Chain everything you learned:
                    scan → recon the web service → bypass login → grab the flag. Type <code>help</code>, then <code>walkthrough</code>
                    if you get stuck.</p>`,
            scenario: {
              welcome: "FINAL ENGAGEMENT. Authorized target: mega-corp.local (10.10.99.5). Type 'help'. Type 'walkthrough' for the mission steps.",
              prompt: 'hero@hacklab:~$ ',
              objective: "nmap the host → curl the site → find /robots.txt → login bypass on /portal → read the flag.",
              hints: [
                "Step 1: nmap 10.10.99.5",
                "Step 2: curl http://mega-corp.local/robots.txt  (reveals /portal)",
                "Step 3: login --user admin --pass \"' OR '1'='1\"  on the portal"
              ],
              fs: {},
              commands: {
                walkthrough: function () {
                  return [
                    "OPERATION FINAL BOSS — objectives:",
                    " 1) nmap 10.10.99.5                       (recon the open ports)",
                    " 2) curl http://mega-corp.local/robots.txt (find the hidden portal)",
                    " 3) curl http://mega-corp.local/portal     (see the login)",
                    " 4) login --user admin --pass \"' OR '1'='1\"  (SQLi bypass)",
                  ].join('\n');
                },
                nmap: function (args, t) {
                  if (args[0] !== '10.10.99.5') return "Out of scope. Authorized target is 10.10.99.5 only.";
                  t.flags.scanned = true;
                  return "PORT   STATE  SERVICE\n22/tcp open   ssh\n80/tcp open   http   (mega-corp.local)\n\nWeb server found on 80. Try: curl http://mega-corp.local/robots.txt";
                },
                curl: function (args, t) {
                  if (!t.flags.scanned) return "You haven't scanned yet. Start with: nmap 10.10.99.5";
                  let url = (args[0] || '').replace(/^http:\/\//, '');
                  if (url === 'mega-corp.local/robots.txt') { t.flags.robots = true; return "User-agent: *\nDisallow: /portal"; }
                  if (url === 'mega-corp.local/portal') {
                    if (!t.flags.robots) return "404 Not Found";
                    t.flags.portal = true;
                    return "200 OK — Employee Portal\nLogin required. Use: login --user <name> --pass <password>";
                  }
                  if (url === 'mega-corp.local' || url === 'mega-corp.local/') return "<h1>Mega-Corp</h1> Nothing public here. (recon harder)";
                  return "404 Not Found";
                },
                login: function (args, t) {
                  if (!t.flags.portal) return "No login here. Find the portal first (robots.txt → /portal).";
                  const raw = t.lastRaw || '';
                  // grab everything the user typed after --pass and look for an always-true SQLi
                  const after = raw.split('--pass')[1] || '';
                  if (/'\s*or\s*'?1'?\s*=\s*'?1/i.test(after) || /'\s*or\s*1\s*=\s*1/i.test(after)) {
                    t.flags.pwned = true;
                    return "✔ ACCESS GRANTED via SQL injection.\n\n   FLAG{h3r0_rank_unlocked_well_done}\n\nEngagement complete. You chained recon + web recon + SQLi. That's the real job.";
                  }
                  return "Login failed. The password field is injectable — try an always-true SQL payload (remember the SQLi mission).";
                }
              },
              completeWhen: (t) => t.flags.pwned === true
            }
          }
        ]
      }
    ]
  }
};

// Ordered list for rendering.
const PATH_ORDER = ['foundations', 'network', 'web', 'defense', 'capstone'];
