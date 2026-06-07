/* ============================================================================
 * HACKLAB — Game engine & UI
 * ----------------------------------------------------------------------------
 * Handles save/load (localStorage), XP & levels, path/mission locking, and
 * rendering each mission type. Pure vanilla JS, no build step.
 * ==========================================================================*/

const SAVE_KEY = 'hacklab.save.v1';

const Game = {
  state: { xp: 0, completed: {}, name: 'recruit' },

  // ---- persistence ----
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) this.state = Object.assign(this.state, JSON.parse(raw));
    } catch (e) { /* corrupt save, ignore */ }
  },
  save() { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); },
  reset() {
    if (confirm('Wipe all progress and start over?')) {
      localStorage.removeItem(SAVE_KEY);
      this.state = { xp: 0, completed: {}, name: 'recruit' };
      this.renderHome();
    }
  },

  // ---- progression maths ----
  level() {
    // each level needs a bit more than the last
    let lvl = 1, need = 100, xp = this.state.xp;
    while (xp >= need) { xp -= need; lvl++; need = Math.round(need * 1.35); }
    return { lvl, into: xp, need, pct: Math.round((xp / need) * 100) };
  },
  rank() {
    const l = this.level().lvl;
    if (l <= 1) return 'Script Kiddie';
    if (l <= 3) return 'Recruit';
    if (l <= 5) return 'Operator';
    if (l <= 7) return 'Pentester';
    if (l <= 9) return 'Specialist';
    return 'Hero';
  },

  // ---- helpers over the curriculum ----
  allMissions() {
    const out = [];
    PATH_ORDER.forEach(pid => CURRICULUM[pid].modules.forEach(m => m.missions.forEach(ms => out.push({ ...ms, pathId: pid }))));
    return out;
  },
  isComplete(id) { return !!this.state.completed[id]; },
  pathProgress(pid) {
    const ms = []; CURRICULUM[pid].modules.forEach(m => m.missions.forEach(x => ms.push(x)));
    const done = ms.filter(x => this.isComplete(x.id)).length;
    return { done, total: ms.length, pct: ms.length ? Math.round(done / ms.length * 100) : 0 };
  },
  pathUnlocked(pid) {
    const req = CURRICULUM[pid].requires;
    if (!req) return true;
    const reqs = Array.isArray(req) ? req : [req];
    return reqs.every(r => this.pathProgress(r).pct === 100);
  },

  complete(mission) {
    if (this.isComplete(mission.id)) return false;
    this.state.completed[mission.id] = true;
    this.state.xp += (mission.xp || 25);
    this.save();
    return true;
  },

  // ---- rendering: shell ----
  el(id) { return document.getElementById(id); },
  view(html) { this.el('view').innerHTML = html; window.scrollTo(0, 0); this.renderHUD(); },

  renderHUD() {
    const lv = this.level();
    this.el('hud-rank').textContent = this.rank();
    this.el('hud-level').textContent = 'LVL ' + lv.lvl;
    this.el('hud-xp').textContent = this.state.xp + ' XP';
    this.el('hud-bar').style.width = lv.pct + '%';
  },

  // ---- HOME / dashboard ----
  renderHome() {
    const cards = PATH_ORDER.map(pid => {
      const p = CURRICULUM[pid];
      const prog = this.pathProgress(pid);
      const unlocked = this.pathUnlocked(pid);
      const reqTxt = unlocked ? '' :
        `<div class="lock">🔒 Complete ${(Array.isArray(p.requires) ? p.requires : [p.requires]).map(r => CURRICULUM[r].title).join(' + ')} first</div>`;
      return `
        <div class="card ${unlocked ? '' : 'locked'}" style="--accent:${p.color}"
             ${unlocked ? `onclick="Game.renderPath('${pid}')"` : ''}>
          <div class="card-icon">${p.icon}</div>
          <div class="card-tag">${p.tag}</div>
          <h3>${p.title}</h3>
          <p>${p.blurb}</p>
          <div class="bar"><div class="bar-fill" style="width:${prog.pct}%;background:${p.color}"></div></div>
          <div class="card-foot"><span>${prog.done}/${prog.total} missions</span><span>${prog.pct}%</span></div>
          ${reqTxt}
        </div>`;
    }).join('');

    const total = this.allMissions().length;
    const done = this.allMissions().filter(m => this.isComplete(m.id)).length;

    this.view(`
      <section class="hero">
        <h1>HACK<span>LAB</span></h1>
        <p class="tagline">Learn ethical hacking by <b>playing</b>. Pick a path, run missions, earn XP, become a Hero.</p>
        <div class="overall">Overall progress: <b>${done}/${total}</b> missions • Rank: <b>${this.rank()}</b></div>
      </section>
      <div class="legal-note">⚖️ Everything here is 100% simulated &amp; safe. The skills are real — only ever use them on systems you own or are authorized to test.</div>
      <h2 class="section-h">Choose Your Path</h2>
      <div class="cards">${cards}</div>
    `);
  },

  // ---- PATH view: list modules + missions ----
  renderPath(pid) {
    const p = CURRICULUM[pid];
    let prevDone = true; // gating within a path: do missions in order
    const modules = p.modules.map(mod => {
      const missions = mod.missions.map(ms => {
        const complete = this.isComplete(ms.id);
        const unlocked = prevDone || complete;
        const status = complete ? '✓' : (unlocked ? '▶' : '🔒');
        const cls = complete ? 'done' : (unlocked ? '' : 'locked');
        prevDone = complete; // next mission unlocks only when this one is done
        const icon = { lesson: '📖', quiz: '❓', terminal: '💻', challenge: '🎯' }[ms.type] || '•';
        return `<li class="mission ${cls}" ${unlocked ? `onclick="Game.renderMission('${pid}','${ms.id}')"` : ''}>
            <span class="m-status">${status}</span>
            <span class="m-type">${icon}</span>
            <span class="m-title">${ms.title}</span>
            <span class="m-xp">+${ms.xp} XP</span>
          </li>`;
      }).join('');
      return `<div class="module"><h3 class="module-h">${mod.title}</h3><ul class="missions">${missions}</ul></div>`;
    }).join('');

    this.view(`
      <button class="back" onclick="Game.renderHome()">← All paths</button>
      <div class="path-head" style="--accent:${p.color}">
        <div class="card-icon">${p.icon}</div>
        <div><h1>${p.title}</h1><p>${p.blurb}</p></div>
      </div>
      ${modules}
    `);
  },

  // ---- MISSION view: dispatch by type ----
  renderMission(pid, mid) {
    const mission = CURRICULUM[pid].modules.flatMap(m => m.missions).find(x => x.id === mid);
    if (!mission) return this.renderPath(pid);
    this._activeMission = { pid, mission };

    const head = `
      <button class="back" onclick="Game.renderPath('${pid}')">← ${CURRICULUM[pid].title}</button>
      <div class="mission-head">
        <h1>${mission.title}</h1>
        <span class="badge">${mission.type} • +${mission.xp} XP ${this.isComplete(mid) ? '• ✓ done' : ''}</span>
      </div>
      <div class="brief">${mission.brief || ''}</div>
      <div id="mission-body"></div>`;
    this.view(head);

    const body = this.el('mission-body');
    this['_render_' + mission.type](body, mission, pid);
  },

  _finish(mission, pid, msgEl) {
    const gained = this.complete(mission);
    const lv = this.level();
    msgEl.innerHTML = `
      <div class="complete-box">
        <h3>★ Mission Complete</h3>
        ${gained ? `<p>+${mission.xp} XP earned. You are <b>${this.rank()}</b> (Level ${lv.lvl}).</p>`
                 : `<p>Already completed earlier — no extra XP, but well done.</p>`}
        <div class="complete-actions">
          <button class="btn" onclick="Game.nextMission('${pid}','${mission.id}')">Next mission →</button>
          <button class="btn ghost" onclick="Game.renderPath('${pid}')">Back to path</button>
        </div>
      </div>`;
    this.renderHUD();
  },

  nextMission(pid, mid) {
    const list = CURRICULUM[pid].modules.flatMap(m => m.missions);
    const i = list.findIndex(x => x.id === mid);
    if (i >= 0 && i < list.length - 1) this.renderMission(pid, list[i + 1].id);
    else this.renderPath(pid);
  },

  // ---- type renderers ----
  _render_lesson(body, mission, pid) {
    body.innerHTML = `<div id="msg"></div>
      <button class="btn big" onclick="Game._lessonDone('${pid}','${mission.id}')">
        ${this.isComplete(mission.id) ? 'Mark complete again' : 'I\'ve read this — complete ✓'}</button>`;
  },
  _lessonDone(pid, mid) {
    const m = CURRICULUM[pid].modules.flatMap(x => x.missions).find(x => x.id === mid);
    this._finish(m, pid, this.el('msg'));
  },

  _render_quiz(body, mission, pid) {
    const qs = mission.questions.map((q, qi) => `
      <div class="quiz-q" data-qi="${qi}">
        <p class="q-text"><b>Q${qi + 1}.</b> ${q.q}</p>
        ${q.options.map((o, oi) => `
          <label class="q-opt"><input type="radio" name="q${qi}" value="${oi}"> <span>${o}</span></label>`).join('')}
        <div class="q-explain" style="display:none"></div>
      </div>`).join('');
    body.innerHTML = `${qs}<div id="msg"></div>
      <button class="btn big" onclick="Game._quizSubmit('${pid}','${mission.id}')">Submit answers</button>`;
  },
  _quizSubmit(pid, mid) {
    const m = CURRICULUM[pid].modules.flatMap(x => x.missions).find(x => x.id === mid);
    let correct = 0;
    m.questions.forEach((q, qi) => {
      const chosen = document.querySelector(`input[name="q${qi}"]:checked`);
      const box = document.querySelector(`.quiz-q[data-qi="${qi}"]`);
      const exp = box.querySelector('.q-explain');
      box.classList.remove('right', 'wrong');
      exp.style.display = 'block';
      if (!chosen) { exp.textContent = '⚠ No answer selected. Correct answer: ' + q.options[q.answer] + '. ' + q.explain; box.classList.add('wrong'); return; }
      if (parseInt(chosen.value) === q.answer) { correct++; box.classList.add('right'); exp.textContent = '✓ ' + q.explain; }
      else { box.classList.add('wrong'); exp.textContent = '✗ Correct: ' + q.options[q.answer] + '. ' + q.explain; }
    });
    const msg = this.el('msg');
    if (correct === m.questions.length) { this._finish(m, pid, msg); }
    else { msg.innerHTML = `<div class="try-box">You got <b>${correct}/${m.questions.length}</b>. Review the explanations and submit again to pass.</div>`; }
  },

  _render_challenge(body, mission, pid) {
    const inputs = mission.inputs.map(inp => `
      <label class="ch-label">${inp.label}
        <input class="ch-input" data-key="${inp.key}" autocomplete="off" spellcheck="false" />
      </label>`).join('');
    body.innerHTML = `
      <div class="challenge">${inputs}
        <div class="ch-actions">
          <button class="btn" onclick="Game._challengeSubmit('${pid}','${mission.id}')">Submit</button>
          <button class="btn ghost" onclick="Game._challengeHint('${pid}','${mission.id}')">Hint 💡</button>
        </div>
        <div class="ch-feedback" id="ch-fb"></div>
        <div id="msg"></div>
      </div>`;
    this._hintIdx = 0;
  },
  _challengeHint(pid, mid) {
    const m = CURRICULUM[pid].modules.flatMap(x => x.missions).find(x => x.id === mid);
    const hints = m.hints || [];
    const fb = this.el('ch-fb');
    if (this._hintIdx >= hints.length) { fb.innerHTML = '<span class="dim">No more hints.</span>'; return; }
    fb.innerHTML = '💡 ' + hints[this._hintIdx++];
  },
  _challengeSubmit(pid, mid) {
    const m = CURRICULUM[pid].modules.flatMap(x => x.missions).find(x => x.id === mid);
    const ans = {};
    document.querySelectorAll('.ch-input').forEach(el => ans[el.dataset.key] = el.value);
    const fb = this.el('ch-fb');
    if (m.validate(ans)) { fb.innerHTML = '<span class="ok">' + m.success + '</span>'; this._finish(m, pid, this.el('msg')); }
    else { fb.innerHTML = '<span class="bad">' + m.fail + '</span>'; }
  },

  _render_terminal(body, mission, pid) {
    body.innerHTML = `<div id="term-mount"></div><div id="msg"></div>`;
    new Terminal(this.el('term-mount'), mission.scenario, () => {
      setTimeout(() => this._finish(mission, pid, this.el('msg')), 400);
    });
  },

  init() {
    this.load();
    this.renderHome();
  }
};

window.addEventListener('DOMContentLoaded', () => Game.init());
