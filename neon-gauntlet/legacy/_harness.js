// Shared harness for SamiTube Originals. Single-file friendly, no network/storage.
window.Harness = (function () {
  const TAU = Math.PI * 2

  function postHost(msg) {
    try { parent.postMessage(Object.assign({ from: 'samitube-game' }, msg), '*') } catch (e) {}
  }

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  function petal(ctx, x, y, r, color, rot) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot || 0)
    const g = ctx.createRadialGradient(-r * .2, -r * .2, r * .1, 0, 0, r)
    g.addColorStop(0, '#fff8df')
    g.addColorStop(1, color)
    ctx.fillStyle = g
    for (let i = 0; i < 5; i++) {
      ctx.rotate(TAU / 5)
      ctx.beginPath()
      ctx.ellipse(0, -r * .45, r * .34, r * .64, 0, 0, TAU)
      ctx.fill()
    }
    ctx.fillStyle = '#ffd166'
    ctx.beginPath(); ctx.arc(0, 0, r * .24, 0, TAU); ctx.fill()
    ctx.restore()
  }

  function star(ctx, x, y, r, color) {
    ctx.save()
    ctx.translate(x, y)
    ctx.fillStyle = color || '#ffd166'
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5
      const rad = i % 2 ? r * .45 : r
      ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad)
    }
    ctx.closePath(); ctx.fill()
    ctx.globalAlpha = .45
    ctx.fillStyle = '#fff7c7'
    ctx.beginPath(); ctx.arc(-r * .22, -r * .22, r * .25, 0, TAU); ctx.fill()
    ctx.restore()
  }

  function cloud(ctx, x, y, s, alpha) {
    ctx.save()
    ctx.globalAlpha = alpha == null ? .45 : alpha
    ctx.fillStyle = '#fff9df'
    ctx.beginPath()
    ctx.ellipse(x - s * .38, y + s * .05, s * .34, s * .18, 0, 0, TAU)
    ctx.ellipse(x, y, s * .46, s * .24, 0, 0, TAU)
    ctx.ellipse(x + s * .42, y + s * .05, s * .32, s * .17, 0, 0, TAU)
    ctx.fill()
    ctx.restore()
  }

  function pip(ctx, x, y, s, faceDir) {
    ctx.save()
    ctx.translate(x, y)
    const d = faceDir || { x: 1, y: 0 }
    ctx.fillStyle = '#20262d'
    ctx.beginPath(); ctx.arc(-s * .28, -s * .31, s * .2, 0, TAU); ctx.arc(s * .28, -s * .31, s * .2, 0, TAU); ctx.fill()
    ctx.fillStyle = '#fff7e8'
    ctx.beginPath(); ctx.arc(0, 0, s * .48, 0, TAU); ctx.fill()
    ctx.fillStyle = '#20262d'
    ctx.beginPath(); ctx.ellipse(-s * .18, -s * .08, s * .13, s * .18, -.5, 0, TAU); ctx.ellipse(s * .18, -s * .08, s * .13, s * .18, .5, 0, TAU); ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(-s * .14 + d.x * s * .025, -s * .12 + d.y * s * .02, s * .04, 0, TAU); ctx.arc(s * .14 + d.x * s * .025, -s * .12 + d.y * s * .02, s * .04, 0, TAU); ctx.fill()
    ctx.fillStyle = '#2d3037'
    ctx.beginPath(); ctx.arc(0, s * .08, s * .055, 0, TAU); ctx.fill()
    ctx.strokeStyle = '#2d3037'; ctx.lineWidth = Math.max(1.5, s * .035); ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(-s * .08, s * .19); ctx.quadraticCurveTo(0, s * .25, s * .08, s * .19); ctx.stroke()
    ctx.restore()
  }

  function owl(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y)
    const g = ctx.createLinearGradient(0, -s, 0, s)
    g.addColorStop(0, '#7b5aa6'); g.addColorStop(1, '#4b3b7a')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.ellipse(0, 0, s * .55, s * .65, 0, 0, TAU); ctx.fill()
    ctx.fillStyle = '#b78be6'
    ctx.beginPath(); ctx.moveTo(-s * .45, -s * .35); ctx.lineTo(-s * .18, -s * .72); ctx.lineTo(0, -s * .42); ctx.lineTo(s * .18, -s * .72); ctx.lineTo(s * .45, -s * .35); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#fff7df'
    ctx.beginPath(); ctx.arc(-s * .18, -s * .1, s * .17, 0, TAU); ctx.arc(s * .18, -s * .1, s * .17, 0, TAU); ctx.fill()
    ctx.fillStyle = '#173543'
    ctx.beginPath(); ctx.arc(-s * .18, -s * .1, s * .065, 0, TAU); ctx.arc(s * .18, -s * .1, s * .065, 0, TAU); ctx.fill()
    ctx.fillStyle = '#f7b267'
    ctx.beginPath(); ctx.moveTo(0, s * .04); ctx.lineTo(-s * .08, s * .18); ctx.lineTo(s * .08, s * .18); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#f3c56b'
    rr(ctx, -s * .55, s * .4, s * 1.1, s * .22, s * .11); ctx.fill()
    ctx.restore()
  }

  function duck(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y)
    ctx.fillStyle = '#ffd766'
    ctx.beginPath(); ctx.ellipse(0, s * .08, s * .44, s * .34, 0, 0, TAU); ctx.fill()
    ctx.beginPath(); ctx.arc(-s * .2, -s * .22, s * .24, 0, TAU); ctx.fill()
    ctx.fillStyle = '#ffa64d'
    ctx.beginPath(); ctx.ellipse(-s * .43, -s * .18, s * .18, s * .08, 0, 0, TAU); ctx.fill()
    ctx.fillStyle = '#70472a'
    ctx.beginPath(); ctx.arc(-s * .26, -s * .28, s * .035, 0, TAU); ctx.fill()
    ctx.strokeStyle = '#e7ad42'; ctx.lineWidth = s * .05; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(s * .02, s * .06); ctx.quadraticCurveTo(s * .22, -s * .06, s * .33, s * .12); ctx.stroke()
    ctx.restore()
  }

  function snail(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y)
    ctx.fillStyle = '#84c88f'
    rr(ctx, -s * .45, s * .05, s * .9, s * .22, s * .11); ctx.fill()
    ctx.fillStyle = '#ef8f83'
    ctx.beginPath(); ctx.arc(-s * .08, -s * .05, s * .27, 0, TAU); ctx.fill()
    ctx.strokeStyle = '#bd5d62'; ctx.lineWidth = s * .04
    ctx.beginPath(); ctx.arc(-s * .08, -s * .05, s * .16, .5, TAU * 1.1); ctx.stroke()
    ctx.strokeStyle = '#4f7d57'; ctx.lineWidth = s * .025
    ctx.beginPath(); ctx.moveTo(s * .25, s * .03); ctx.lineTo(s * .36, -s * .24); ctx.moveTo(s * .34, s * .04); ctx.lineTo(s * .48, -s * .18); ctx.stroke()
    ctx.restore()
  }

  function bamboo(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y)
    ctx.strokeStyle = '#4b9b4d'; ctx.lineWidth = Math.max(3, s * .16); ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(0, s * .38); ctx.lineTo(0, -s * .38); ctx.stroke()
    ctx.strokeStyle = '#2e753d'; ctx.lineWidth = Math.max(1, s * .035)
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(-s * .12, i * s * .15); ctx.lineTo(s * .12, i * s * .15); ctx.stroke() }
    ctx.fillStyle = '#7ec850'
    ctx.beginPath(); ctx.ellipse(s * .18, -s * .22, s * .22, s * .09, -.55, 0, TAU); ctx.ellipse(-s * .18, -s * .02, s * .2, s * .08, .55, 0, TAU); ctx.fill()
    ctx.restore()
  }

  function bubble(ctx, x, y, r, color) {
    ctx.save()
    const g = ctx.createRadialGradient(x - r * .35, y - r * .35, r * .08, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,.96)')
    g.addColorStop(.42, color || 'rgba(126,218,238,.56)')
    g.addColorStop(1, 'rgba(79,161,198,.84)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = Math.max(1, r * .08); ctx.stroke()
    ctx.restore()
  }

  function sprout(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y)
    ctx.strokeStyle = '#3e8f45'; ctx.lineWidth = s * .08; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(0, s * .32); ctx.quadraticCurveTo(0, -s * .1, 0, -s * .32); ctx.stroke()
    ctx.fillStyle = '#69bb5b'
    ctx.beginPath(); ctx.ellipse(-s * .18, -s * .12, s * .23, s * .12, -.45, 0, TAU); ctx.ellipse(s * .18, -s * .22, s * .23, s * .12, .45, 0, TAU); ctx.fill()
    ctx.restore()
  }

  function flower(ctx, x, y, s) { petal(ctx, x, y, s * .5, '#ff8fb1', .25) }

  function meadow(ctx, W, H, night) {
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    if (night) { sky.addColorStop(0, '#11193d'); sky.addColorStop(.55, '#2f4478'); sky.addColorStop(1, '#6bb59a') }
    else { sky.addColorStop(0, '#95e2ed'); sky.addColorStop(.52, '#f8e9ad'); sky.addColorStop(1, '#8dce78') }
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)
    const t = performance.now() / 1000
    if (night) {
      ctx.fillStyle = 'rgba(255,243,172,.85)'
      for (let i = 0; i < 36; i++) {
        const twinkle = .45 + Math.sin(t * 2 + i) * .25
        star(ctx, (i * 97 + t * 8) % (W + 24) - 12, (i * 53) % Math.max(1, H * .62), 1.8 + (i % 3), 'rgba(255,246,190,' + twinkle + ')')
      }
    }
    ctx.fillStyle = night ? 'rgba(255,239,177,.22)' : 'rgba(255,255,255,.36)'
    for (let i = 0; i < 7; i++) {
      cloud(ctx, ((i * 173 + t * (night ? 8 : 15)) % (W + 190)) - 95, H * (.2 + (i % 3) * .08), 80 + i * 8, night ? .18 : .36)
    }
    if (!night) {
      const sun = ctx.createRadialGradient(W * .86, H * .13, 5, W * .86, H * .13, Math.min(W, H) * .16)
      sun.addColorStop(0, 'rgba(255,246,181,.9)'); sun.addColorStop(1, 'rgba(255,246,181,0)')
      ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H)
    }
    ctx.fillStyle = night ? '#4c9a6b' : '#7ec850'
    ctx.beginPath(); ctx.ellipse(W * .5, H + 22, W * .65, H * .18, 0, 0, TAU); ctx.fill()
    ctx.fillStyle = night ? 'rgba(189,239,176,.22)' : 'rgba(255,247,205,.35)'
    for (let i = 0; i < 18; i++) {
      ctx.beginPath(); ctx.arc((i * 71) % Math.max(1, W), H * (.86 + (i % 4) * .03), 2 + (i % 3), 0, TAU); ctx.fill()
    }
  }

  function vignette(ctx, W, H) {
    const g = ctx.createRadialGradient(W * .5, H * .45, Math.min(W, H) * .2, W * .5, H * .5, Math.max(W, H) * .72)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(.72, 'rgba(255,255,255,0)')
    g.addColorStop(1, 'rgba(23,53,67,.18)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }

  const art = { TAU, rr, petal, star, cloud, pip, owl, duck, snail, bamboo, bubble, sprout, flower, meadow, vignette }

  function start(opts) {
    const root = document.getElementById('game')
    const canvas = document.getElementById('c')
    const ctx = canvas.getContext('2d')
    let hud = document.getElementById('hud')
    if (!hud) { hud = document.createElement('div'); hud.id = 'hud'; root.appendChild(hud) }

    const title = opts.title || document.title || 'SamiTube Original'
    let topbar = document.getElementById('topbar')
    if (!topbar) {
      topbar = document.createElement('div'); topbar.id = 'topbar'
      topbar.innerHTML = '<button id="pause" class="icon-btn" aria-label="Pause">II</button><button id="mute" class="icon-btn" aria-label="Mute">♪</button>'
      root.appendChild(topbar)
    }
    let intro = document.getElementById('intro')
    if (!intro) {
      intro = document.createElement('div'); intro.id = 'intro'
      intro.innerHTML = '<div class="card"><div class="badge">ST</div><h1></h1><p></p><button id="start-play">Tap to play</button></div>'
      root.appendChild(intro)
    }
    intro.querySelector('h1').textContent = title
    intro.querySelector('p').textContent = opts.hint || 'Use arrows, WASD, swipe, or the big buttons.'
    let over = document.getElementById('over')
    if (!over) { over = document.createElement('div'); over.id = 'over'; root.appendChild(over) }
    over.hidden = true
    over.innerHTML = '<div class="card"><div class="badge">★</div><h2>Great play!</h2><p id="over-score"></p><button id="restart">Play again</button></div>'
    const overScore = document.getElementById('over-score')
    const pauseBtn = document.getElementById('pause')
    const muteBtn = document.getElementById('mute')
    const startBtn = document.getElementById('start-play')
    const restartBtn = document.getElementById('restart')

    let W = 0, H = 0, dpr = 1, score = 0, state = 'start', muted = false, audio = null
    let shake = 0, pulse = 0
    const particles = []
    const pops = []

    function fit() {
      const r = root.getBoundingClientRect()
      W = Math.max(240, Math.floor(r.width))
      H = Math.max(220, Math.floor(r.height))
      dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (opts.onResize) opts.onResize(W, H)
    }
    window.addEventListener('resize', fit)

    function ensureAudio() {
      if (muted || audio) return audio
      try { audio = new (window.AudioContext || window.webkitAudioContext)() } catch (e) {}
      return audio
    }
    function tone(freq, dur, type, vol) {
      if (muted) return
      const ac = ensureAudio()
      if (!ac) return
      const now = ac.currentTime
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.type = type || 'sine'
      o.frequency.setValueAtTime(freq, now)
      g.gain.setValueAtTime(0.0001, now)
      g.gain.exponentialRampToValueAtTime(vol || .035, now + .015)
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
      o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + dur + .03)
    }
    function sfx(name) {
      if (name === 'score') { tone(660, .09, 'sine', .035); setTimeout(() => tone(880, .07, 'triangle', .025), 55) }
      else if (name === 'bump') tone(160, .14, 'triangle', .04)
      else if (name === 'over') { tone(440, .12, 'sine', .03); setTimeout(() => tone(330, .16, 'sine', .025), 120) }
      else tone(520, .08, 'triangle', .028)
    }

    const api = {
      ctx, art, particles,
      get W() { return W }, get H() { return H },
      get score() { return score },
      get running() { return state === 'playing' },
      setScore(v) {
        const old = score
        score = Math.max(0, v | 0)
        hud.textContent = (opts.scoreLabel || 'Score') + ' ' + score
        pulse = 1
        if (score > old) pops.push({ x: Math.max(88, Math.min(W - 80, W * .18)), y: 66, text: '+' + (score - old), t: 720, color: '#ffd166' })
        postHost({ type: 'score', value: score })
      },
      addScore(d) { api.setScore(score + d); if (d > 0) sfx('score') },
      gameover() {
        if (state === 'over') return
        state = 'over'
        over.hidden = false
        over.querySelector('h2').textContent = opts.overTitle || 'Great play!'
        overScore.textContent = (opts.scoreLabel || 'Score') + ': ' + score
        sfx('over')
        postHost({ type: 'gameover', score: score })
      },
      progress(p) { postHost({ type: 'progress', value: p }) },
      burst(x, y, color, n) {
        for (let i = 0; i < (n || 12); i++) {
          const a = Math.random() * TAU, sp = 40 + Math.random() * 120
          particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 2 + Math.random() * 4, spin: Math.random() * TAU, t: 520 + Math.random() * 260, color: color || '#ffd166' })
        }
      },
      popText(x, y, text, color) { pops.push({ x, y, text, t: 780, color: color || '#ffd166' }) },
      shake(v) { shake = Math.max(shake, v || 7); sfx('bump') },
      sound: sfx,
      start() {
        ensureAudio()
        state = 'playing'
        intro.hidden = true
        pauseBtn.textContent = 'II'
      },
      pause() {
        if (state !== 'playing') return
        state = 'paused'
        intro.hidden = false
        intro.querySelector('h1').textContent = 'Paused'
        intro.querySelector('p').textContent = 'Take a breath, then jump back in.'
        startBtn.textContent = 'Keep playing'
        pauseBtn.textContent = '▶'
      },
      resume() { api.start() }
    }

    function restart() {
      over.hidden = true
      intro.hidden = true
      startBtn.textContent = 'Tap to play'
      state = 'playing'
      api.setScore(0)
      if (opts.reset) opts.reset(api)
    }

    startBtn.onclick = () => { if (state === 'paused') api.resume(); else api.start() }
    restartBtn.onclick = restart
    pauseBtn.onclick = () => { if (state === 'playing') api.pause(); else if (state === 'paused') api.resume() }
    muteBtn.onclick = () => { muted = !muted; muteBtn.textContent = muted ? '×' : '♪' }

    const keys = {}
    window.addEventListener('keydown', (e) => {
      keys[e.key] = true
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter','w','a','s','d','W','A','S','D'].includes(e.key)) e.preventDefault()
      if ((e.key === ' ' || e.key === 'Enter') && state === 'start') { api.start(); return }
      if ((e.key === ' ' || e.key === 'Enter') && state === 'paused') { api.resume(); return }
      if (state !== 'playing') return
      if (opts.onKey) opts.onKey(e.key, true, e)
    })
    window.addEventListener('keyup', (e) => { keys[e.key] = false; if (state === 'playing' && opts.onKey) opts.onKey(e.key, false, e) })
    api.keys = keys

    function fireButton(b, e) {
      e.preventDefault()
      ensureAudio()
      if (state === 'start') api.start()
      if (opts.onButton) opts.onButton(b.dataset.dir || b.dataset.act)
    }
    document.querySelectorAll('.btn').forEach((b) => {
      b.addEventListener('touchstart', (e) => fireButton(b, e), { passive: false })
      b.addEventListener('mousedown', (e) => fireButton(b, e))
    })

    let down = null
    canvas.addEventListener('pointerdown', (e) => {
      ensureAudio()
      if (state === 'start') api.start()
      const r = canvas.getBoundingClientRect()
      down = { x: e.clientX, y: e.clientY }
      if (opts.onPointer) opts.onPointer((e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height), 'down')
    })
    canvas.addEventListener('pointermove', (e) => {
      if (!down || !opts.onPointerMove) return
      const r = canvas.getBoundingClientRect()
      opts.onPointerMove((e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height))
    })
    canvas.addEventListener('pointerup', (e) => {
      if (!down) return
      const dx = e.clientX - down.x, dy = e.clientY - down.y
      if (Math.hypot(dx, dy) > 24 && opts.onSwipe) opts.onSwipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
      down = null
    })

    function drawParticles(dt) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.t -= dt; p.x += p.vx * dt / 1000; p.y += p.vy * dt / 1000; p.vy += 80 * dt / 1000
        if (p.t <= 0) { particles.splice(i, 1); continue }
        ctx.globalAlpha = Math.max(0, Math.min(1, p.t / 520))
        ctx.fillStyle = p.color
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.spin + p.t * .01); rr(ctx, -p.r, -p.r, p.r * 2, p.r * 2, p.r * .5); ctx.fill(); ctx.restore()
      }
      ctx.globalAlpha = 1
    }

    function drawPops(dt) {
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i]
        p.t -= dt
        p.y -= dt * .035
        if (p.t <= 0) { pops.splice(i, 1); continue }
        ctx.globalAlpha = Math.max(0, Math.min(1, p.t / 420))
        ctx.font = '950 22px ui-rounded, system-ui'
        ctx.textAlign = 'center'
        ctx.lineWidth = 5
        ctx.strokeStyle = 'rgba(23,53,67,.35)'
        ctx.strokeText(p.text, p.x, p.y)
        ctx.fillStyle = p.color
        ctx.fillText(p.text, p.x, p.y)
      }
      ctx.globalAlpha = 1
    }

    fit()
    api.setScore(0)
    if (opts.reset) opts.reset(api)
    let last = performance.now()
    function loop(t) {
      const dt = Math.min(50, t - last); last = t
      if (state === 'playing' && opts.update) opts.update(dt, api)
      pulse = Math.max(0, pulse - dt / 350)
      shake = Math.max(0, shake - dt / 55)
      ctx.save()
      if (shake) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake)
      if (opts.draw) opts.draw(api, dt)
      drawParticles(dt)
      drawPops(dt)
      art.vignette(ctx, W, H)
      ctx.restore()
      if (pulse) {
        hud.style.transform = 'scale(' + (1 + pulse * .06).toFixed(3) + ')'
      } else hud.style.transform = ''
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
    return api
  }
  return { start, art }
})()
