(() => {
  'use strict';
  const root = document.documentElement;
  const stage = document.querySelector('.lamp-stage');
  const handle = document.querySelector('#pull-handle');
  const cord = document.querySelector('.cord');
  const shade = document.querySelector('.shade-motion');
  const face = document.querySelector('.face');
  const eyes = [...document.querySelectorAll('.eye')];
  const pupils = [...document.querySelectorAll('.pupil')];
  const card = document.querySelector('.login-card');
  const username = document.querySelector('#username');
  const password = document.querySelector('#password');
  const toast = document.querySelector('.toast');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const themes = ['warm', 'cool', 'rose', 'mint', 'lavender', 'pink', 'teal', 'lime', 'peach', 'cherry', 'gold', 'ice'];
  let theme = 0, on = true, dragging = false, pointerId = null;
  let pullX = 0, pullY = 0, velocityX = 0, velocityY = 0;
  let startX = 0, startY = 0, scale = 1, suppressClick = false;
  let targetX = 0, targetY = 0, gazeX = 0, gazeY = 0;
  let last = 0, raf = 0, blinkAt = 2500, errorUntil = 0, toastUntil = 0;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function setLight(next) {
    if (next && !on) theme = (theme + 1) % themes.length;
    on = next;
    root.dataset.theme = themes[theme];
    root.dataset.on = String(on);
    card.inert = !on;
    card.setAttribute('aria-hidden', String(!on));
    handle.setAttribute('aria-pressed', String(on));
    handle.setAttribute('aria-label', `拉动灯绳，${on ? '关闭' : '打开'}灯光`);
    if (!on && card.contains(document.activeElement)) handle.focus();
    if (!on) { toastUntil = 0; toast.classList.remove('visible'); }
  }
  handle.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    dragging = true; pointerId = event.pointerId;
    startX = event.clientX; startY = event.clientY;
    scale = stage.getBoundingClientRect().width / 330;
    velocityX = velocityY = 0;
    handle.setPointerCapture(pointerId);
  });
  handle.addEventListener('pointermove', event => {
    if (!dragging || event.pointerId !== pointerId) return;
    pullX = clamp((event.clientX - startX) / scale, -45, 45);
    pullY = clamp((event.clientY - startY) / scale, 0, 85);
  });
  function release(event, canceled) {
    if (!dragging || event.pointerId !== pointerId) return;
    dragging = false;
    const moved = Math.hypot(event.clientX - startX, event.clientY - startY) > 6;
    suppressClick = moved || canceled;
    if (!canceled && pullY >= 28) setLight(!on);
    if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
    pointerId = null;
  }
  handle.addEventListener('pointerup', event => release(event, false));
  handle.addEventListener('pointercancel', event => release(event, true));
  handle.addEventListener('lostpointercapture', () => { dragging = false; pointerId = null; });
  handle.addEventListener('click', event => {
    // Keyboard clicks have detail=0 and should work after a canceled drag too.
    if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
    suppressClick = false;
    setLight(!on);
    if (!motion.matches) { pullY = 25; velocityY = 0; }
  });
  document.addEventListener('pointermove', event => {
    const rect = face.getBoundingClientRect();
    targetX = clamp((event.clientX - rect.left - rect.width / 2) / 100, -1, 1);
    targetY = clamp((event.clientY - rect.top - rect.height / 2) / 100, -1, 1);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { targetX = targetY = 0; });
  function notify(message, isError = false) {
    toast.textContent = message;
    toastUntil = performance.now() + 2800;
    if (isError) errorUntil = performance.now() + 1800;
    toast.classList.add('visible');
  }
  document.querySelector('#login-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!on) return;
    const missing = !username.value.trim() ? username : !password.value ? password : null;
    [username, password].forEach(input => input.removeAttribute('aria-invalid'));
    if (missing) {
      missing.setAttribute('aria-invalid', 'true');
      notify(missing === username ? '请输入账号' : '请输入密码', true);
      missing.focus();
    } else {
      notify('演示界面，暂未连接账号服务', true);
    }
  });
  document.querySelector('.forgot-button').addEventListener('click', () => notify('此页面为交互演示，请联系管理员找回密码'));
  document.querySelector('#date').textContent = new Intl.DateTimeFormat('sv-SE').format(new Date());

  function animate(now) {
    const dt = Math.min((now - (last || now)) / 1000, .032);
    last = now;
    if (!dragging) {
      if (motion.matches) pullX = pullY = velocityX = velocityY = 0;
      else {
        velocityX += (-240 * pullX - 16 * velocityX) * dt;
        velocityY += (-240 * pullY - 16 * velocityY) * dt;
        pullX += velocityX * dt; pullY += velocityY * dt;
        if (Math.abs(pullX) + Math.abs(pullY) + Math.abs(velocityX) + Math.abs(velocityY) < .06) pullX = pullY = velocityX = velocityY = 0;
      }
    }
    handle.style.transform = `translate(${pullX}px,${pullY}px)`;
    cord.setAttribute('d', `M207 178 Q${207 + pullX * .18} ${230 + pullY * .3} ${207 + pullX} ${288 + pullY}`);
    const error = now < errorUntil;
    const privateEntry = document.activeElement === password;
    root.dataset.expression = error ? 'error' : privateEntry ? 'password' : 'happy';
    const gx = privateEntry ? -1 : targetX;
    const gy = privateEntry ? -.65 : targetY;
    const ease = motion.matches ? 1 : 1 - Math.exp(-dt * 12);
    gazeX += (gx - gazeX) * ease;
    gazeY += (gy - gazeY) * ease;
    pupils.forEach(pupil => { pupil.style.transform = `translate(${gazeX * 2.5}px,${gazeY * 2}px)`; });
    const shake = error && !motion.matches ? Math.sin(now / 65) * 2 : 0;
    const sway = motion.matches ? 0 : clamp(pullX * .03 + pullY * .015, -2, 2);
    shade.style.transform = `rotate(${sway}deg) translateX(${shake}px)`;
    if (now > blinkAt + 150) blinkAt = now + 2500 + Math.random() * 3000;
    const blink = !motion.matches && now >= blinkAt;
    eyes.forEach(eye => { eye.style.transform = `scaleY(${blink ? .1 : 1})`; });
    if (now >= toastUntil) toast.classList.remove('visible');
    raf = requestAnimationFrame(animate);
  }
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) { last = 0; raf = requestAnimationFrame(animate); }
  });
  setLight(true);
  raf = requestAnimationFrame(animate);
})();
