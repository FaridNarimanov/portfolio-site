// Matrix-tərzi fon animasiyası — cyan/crimson simvol yağışı
(() => {
  const canvas = document.getElementById('matrix-bg');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const chars = 'アイウエオカキクケコサシスセソタチツテト01ABCDEF{}<>/;$#'.split('');
  const fontSize = 15;
  let columns, drops;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * -40));
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.fillStyle = 'rgba(10, 13, 18, 0.06)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px "JetBrains Mono", monospace';

    for (let i = 0; i < columns; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const isAccent = Math.random() < 0.02;
      ctx.fillStyle = isAccent ? '#ff3b5c' : '#2de0c9';
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 50);
})();

// Səhifələr arası keçid: link klikləndikdə əvvəl yumşaq fade-out,
// sonra naviqasiya. Bütün brauzerlərdə eyni cür işləyir (təcrübi
// View Transitions API-dən fərqli olaraq).
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href) return;

  const isExternal = /^([a-z]+:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
  const isHash = href.startsWith('#');
  const opensNewTab = link.target === '_blank';

  if (isExternal || isHash || opensNewTab) return;

  e.preventDefault();
  document.body.classList.add('page-leaving');
  setTimeout(() => { window.location.href = href; }, 150);
});

// CVE kartları — açılıb-bağlanan (accordion) bölmələr
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cve-card.collapsible').forEach(card => {
    const toggle = card.querySelector('.cve-top');
    const body = card.querySelector('.cve-body');
    if (!toggle || !body) return;

    toggle.addEventListener('click', () => {
      const isOpen = card.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      body.style.maxHeight = isOpen ? body.scrollHeight + 'px' : '0px';
    });
  });
});

// Dil seçimi — localStorage ilə yadda saxlayır
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const btnEn = document.querySelector('.lang-toggle [data-set-lang="en"]');
  const btnAz = document.querySelector('.lang-toggle [data-set-lang="az"]');

  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    localStorage.setItem('preferred_lang', lang);
    if (btnEn && btnAz) {
      btnEn.classList.toggle('active', lang === 'en');
      btnAz.classList.toggle('active', lang === 'az');
    }
    // Açıq CVE kartlarının hündürlüyünü dil dəyişəndən sonra yenidən hesabla
    document.querySelectorAll('.cve-card.collapsible.open .cve-body').forEach(body => {
      body.style.maxHeight = body.scrollHeight + 'px';
    });
  }

  if (btnEn && btnAz) {
    btnEn.addEventListener('click', () => setLang('en'));
    btnAz.addEventListener('click', () => setLang('az'));
    
    // Yaddaşda saxlanmış dili yoxla, yoxsa default 'en' seç
    const savedLang = localStorage.getItem('preferred_lang') || 'en';
    setLang(savedLang);
  }
});

// Mobil naviqasiya menyusu (Top Nav üçün)
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  // Terminal typing effekti (daha sürətli və axıcı)
  const termEl = document.querySelector('[data-typewriter]');
  if (termEl) {
    const lines = JSON.parse(termEl.getAttribute('data-typewriter'));
    termEl.innerHTML = '';
    let li = 0, ci = 0;

    function typeLine() {
      if (li >= lines.length) return;
      const line = lines[li];
      const div = document.createElement('div');
      div.innerHTML = line.prefix ? `<span class="prompt">${line.prefix}</span> ` : '';
      const textSpan = document.createElement('span');
      textSpan.className = line.class || 'out';
      div.appendChild(textSpan);
      termEl.appendChild(div);

      if (!line.instant) {
        const caret = document.createElement('span');
        caret.className = 'caret';
        div.appendChild(caret);
        const text = line.text;
        function typeChar() {
          if (ci < text.length) {
            textSpan.textContent += text[ci];
            ci++;
            setTimeout(typeChar, 10 + Math.random() * 15); // Sürətləndirildi
          } else {
            caret.remove();
            ci = 0; li++;
            setTimeout(typeLine, 180);
          }
        }
        typeChar();
      } else {
        textSpan.innerHTML = line.text;
        li++;
        setTimeout(typeLine, 100);
      }
    }
    typeLine();
  }
});