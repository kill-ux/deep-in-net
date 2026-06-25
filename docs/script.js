/* ─── SUBNET CALCULATOR ─── */
function calcSubnet() {
  const raw = document.getElementById('cidr-input').value.trim();
  const out  = document.getElementById('calc-result');

  const match = raw.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
  if (!match) {
    out.style.display = 'block';
    out.innerHTML = `<span class="res-err">✗ Invalid format. Use: 192.168.1.83/29</span>`;
    return;
  }

  const [,a,b,c,d,p] = match.map(Number);
  if ([a,b,c,d].some(n => n > 255) || p < 1 || p > 32) {
    out.style.display = 'block';
    out.innerHTML = `<span class="res-err">✗ Out-of-range values.</span>`;
    return;
  }

  const ip       = (a<<24)|(b<<16)|(c<<8)|d;
  const block    = p === 32 ? 1 : Math.pow(2, 32 - p);
  const usable   = block <= 2 ? 0 : block - 2;
  const maskNum  = p === 0 ? 0 : (0xFFFFFFFF << (32-p)) >>> 0;
  const netNum   = (ip & maskNum) >>> 0;
  const bcastNum = (netNum + block - 1) >>> 0;

  const toIP = n => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
  const maskStr = toIP(maskNum);
  const net     = toIP(netNum);
  const bcast   = toIP(bcastNum);
  const first   = p < 31 ? toIP(netNum+1) : net;
  const last    = p < 31 ? toIP(bcastNum-1) : bcast;

  // Build host range list for small blocks
  let hostRows = '';
  if (block <= 16 && p < 31) {
    for (let i = 1; i < block - 1; i++) {
      const hostNum = netNum + i;
      const hostIP  = toIP(hostNum);
      const isYou   = (hostNum >>> 0) === (ip >>> 0);
      hostRows += `\n  ${hostIP}${isYou ? ' <span class="res-ok">← your IP ✓</span>' : ''}`;
    }
  }

  out.style.display = 'block';
  out.innerHTML = `
<span class="res-ok">✓ ${raw}</span>

  prefix     : /${p}
  mask       : ${maskStr}
  block size : ${block}
  usable IPs : ${usable}

  network    : <span class="res-ok">${net}</span>  (reserved)
  first host : ${first}${hostRows}
  last host  : ${last}
  broadcast  : <span class="res-err">${bcast}</span>  (reserved)
`.trim();
}

document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('cidr-input');
  if (inp) {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') calcSubnet(); });
  }

  /* ─── ACTIVE NAV HIGHLIGHT ─── */
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));

  /* ─── TYPE ANIMATION for hero ─── */
  const typed = document.getElementById('typed-cmd');
  if (!typed) return;
  const msgs = [
    'ping 192.168.2.2',
    'show ip route',
    'traceroute 8.8.8.8',
    'no shutdown',
  ];
  let mi = 0, ci = 0, deleting = false;

  function tick() {
    const msg = msgs[mi];
    if (!deleting) {
      typed.textContent = msg.slice(0, ++ci);
      if (ci === msg.length) { deleting = true; setTimeout(tick, 1800); return; }
    } else {
      typed.textContent = msg.slice(0, --ci);
      if (ci === 0) { deleting = false; mi = (mi + 1) % msgs.length; setTimeout(tick, 400); return; }
    }
    setTimeout(tick, deleting ? 40 : 70);
  }
  tick();
});