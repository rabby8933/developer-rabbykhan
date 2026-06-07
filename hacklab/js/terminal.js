/* ============================================================================
 * HACKLAB — Simulated terminal
 * ----------------------------------------------------------------------------
 * A safe, fully fake shell. It NEVER touches a real network or filesystem.
 * A mission hands it a `scenario`; this class renders the shell, interprets
 * commands, and calls onComplete() when scenario.completeWhen(term) is true.
 * ==========================================================================*/

class Terminal {
  constructor(mountEl, scenario, onComplete) {
    this.scenario = scenario;
    this.onComplete = onComplete;
    this.flags = {};          // commands set flags here; completeWhen reads them
    this.history = [];        // every command line entered
    this.cmdHistory = [];     // for up/down arrow recall
    this.histIndex = -1;
    this.hintsShown = 0;
    this.done = false;
    this.lastRaw = '';
    this._build(mountEl);
    if (scenario.welcome) this.print(scenario.welcome, 'sys');
    this.print("Type 'help' for commands. Type 'objective' to recall the goal.", 'dim');
  }

  _build(mount) {
    mount.innerHTML = `
      <div class="term">
        <div class="term-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
          <span class="term-title">hacklab — secure sandbox</span></div>
        <div class="term-screen" tabindex="0"></div>
        <div class="term-input-row">
          <span class="term-prompt"></span>
          <input class="term-input" autocomplete="off" autocapitalize="off" spellcheck="false" />
        </div>
      </div>`;
    this.screen = mount.querySelector('.term-screen');
    this.input = mount.querySelector('.term-input');
    mount.querySelector('.term-prompt').textContent = this.scenario.prompt || '$ ';
    mount.querySelector('.term-input-row').style.setProperty('--prompt', JSON.stringify(this.scenario.prompt || '$ '));

    this.input.addEventListener('keydown', (e) => this._onKey(e));
    mount.querySelector('.term-screen').addEventListener('click', () => this.input.focus());
    setTimeout(() => this.input.focus(), 50);
  }

  _onKey(e) {
    if (e.key === 'Enter') {
      const line = this.input.value;
      this.input.value = '';
      this._run(line);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.cmdHistory.length && this.histIndex < this.cmdHistory.length - 1) {
        this.histIndex++;
        this.input.value = this.cmdHistory[this.cmdHistory.length - 1 - this.histIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.histIndex > 0) { this.histIndex--; this.input.value = this.cmdHistory[this.cmdHistory.length - 1 - this.histIndex]; }
      else { this.histIndex = -1; this.input.value = ''; }
    }
  }

  print(text, cls) {
    const div = document.createElement('div');
    div.className = 'term-line' + (cls ? ' ' + cls : '');
    // preserve newlines
    text.split('\n').forEach((ln, i) => {
      if (i > 0) div.appendChild(document.createElement('br'));
      div.appendChild(document.createTextNode(ln));
    });
    this.screen.appendChild(div);
    this.screen.scrollTop = this.screen.scrollHeight;
  }

  _run(raw) {
    const line = raw.trim();
    // echo the command
    this.print((this.scenario.prompt || '$ ') + raw, 'echo');
    if (!line) return;
    this.lastRaw = line;
    this.history.push(line);
    this.cmdHistory.push(line);
    this.histIndex = -1;

    const parts = line.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    const out = this._dispatch(cmd, args);
    if (out !== null && out !== undefined && out !== '') this.print(out);

    // check for completion
    if (!this.done && this.scenario.completeWhen && this.scenario.completeWhen(this)) {
      this.done = true;
      this.print('\n★ OBJECTIVE COMPLETE ★', 'win');
      if (this.onComplete) this.onComplete();
    }
  }

  _dispatch(cmd, args) {
    // mission-specific commands win
    const custom = this.scenario.commands || {};
    if (custom[cmd]) return custom[cmd](args, this);

    switch (cmd) {
      case 'help': {
        const base = ['help', 'objective', 'hint', 'clear', 'whoami', 'ls', 'cat', 'pwd', 'echo'];
        const extra = Object.keys(custom);
        return 'Available commands: ' + [...new Set([...base, ...extra])].join(', ');
      }
      case 'objective':
        return this.scenario.objective || 'Complete the mission.';
      case 'hint': {
        const hints = this.scenario.hints || [];
        if (!hints.length) return 'No hints for this mission.';
        if (this.hintsShown >= hints.length) return 'No more hints — you have them all.';
        return '💡 ' + hints[this.hintsShown++];
      }
      case 'clear':
        this.screen.innerHTML = '';
        return '';
      case 'whoami':
        return 'recruit';
      case 'pwd':
        return '/home/recruit';
      case 'echo':
        return args.join(' ');
      case 'ls': {
        const fs = this.scenario.fs || {};
        const all = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const names = Object.keys(fs).filter(n => all || !n.startsWith('.'));
        return names.length ? names.join('  ') : '(no visible files — try ls -a)';
      }
      case 'cat': {
        const fs = this.scenario.fs || {};
        const name = args[0];
        if (!name) return 'cat: missing file name';
        if (fs[name] === undefined) return `cat: ${name}: No such file`;
        if (name === '.flag' || /flag/i.test(name)) this.flags.readFlag = true;
        if (/FLAG\{/.test(fs[name])) this.flags.readFlag = true;
        return fs[name];
      }
      default:
        return `${cmd}: command not found. Type 'help'.`;
    }
  }
}
