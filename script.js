(() => {
  const folders = window.PORTFOLIO || [];
  const overlay = document.getElementById('overlay');
  const win = document.getElementById('finder-window');
  const nav = document.getElementById('finder-navigation');
  const content = document.getElementById('finder-content');
  const desktopFolders = document.getElementById('desktop-folders');
  const breadcrumb = document.getElementById('folder-breadcrumb');
  const topTitle = document.getElementById('window-title');
  const count = document.getElementById('file-count');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxOriginal = document.getElementById('lightbox-original');
  const lightboxError = document.getElementById('lightbox-error');
  let lastTrigger = null;
  // Public contact email; edit this value if you change your portfolio contact address.
  const CONTACT_EMAIL = 'a01359e2@gmail.com';

  const icon = (size = '') => `<img class="folder-svg ${size}" src="assets/custom-folder-icon.png" alt="" aria-hidden="true">`;
  const escapeHTML = str => String(str ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  desktopFolders.innerHTML = folders.map(f => `
    <button type="button" class="desktop-folder folder-${f.slug}" data-open="${f.slug}" aria-label="Open ${escapeHTML(f.label)} folder">
      ${icon()}<span class="desktop-folder-label">${escapeHTML(f.label)}</span>
    </button>`).join('');

  function buildNav(active) {
    nav.innerHTML = folders.map(f => `
      <button type="button" data-open="${f.slug}" class="finder-nav-item ${active === f.slug ? 'is-active' : ''}">
        ${icon('nav-folder')}<span>${escapeHTML(f.label)}</span>
      </button>`).join('') + `<div class="sidebar-separator"></div>
      <button type="button" data-open="about" class="finder-nav-item ${active === 'about' ? 'is-active' : ''}"><span class="nav-symbol">◎</span><span>about</span></button>
      <button type="button" data-open="contact" class="finder-nav-item ${active === 'contact' ? 'is-active' : ''}"><span class="nav-symbol">↗</span><span>contact</span></button>`;
  }

  function tile(project, index) {
    const title = escapeHTML(project.title);
    const desc = escapeHTML(project.type);
    const thumb = project.image
      ? `<img src="${escapeHTML(project.thumb || project.image)}" alt="${title}" loading="lazy" decoding="async" style="object-fit:contain;object-position:center">`
      : `<div class="tile-placeholder"><span>${escapeHTML(project.placeholder || 'YOUR WORK')}</span></div>`;
    const extra = project.wide ? ' is-wide' : '';
    return `<article class="project-card${extra}">
      ${project.image ? `<button type="button" class="project-image" data-preview="${escapeHTML(project.image)}" data-title="${title}" aria-label="View ${title} full size">${thumb}<span class="image-view">VIEW FULL SIZE ↗</span></button>` : `<div class="project-image no-image">${thumb}</div>`}
      <div class="project-meta"><span class="project-counter">${String(index + 1).padStart(2,'0')}</span><div><h3>${title}</h3><p>${desc}</p></div><span class="project-arrow">↗</span></div>
    </article>`;
  }

  function folderPage(f) {
    const projects = f.projects || [];
    count.textContent = `${projects.length} ITEMS · ${f.label.toUpperCase()}`;
    const categories = new Map();
    projects.forEach((project, index) => {
      const group = project.group || 'COLLECTION';
      if (!categories.has(group)) categories.set(group, []);
      categories.get(group).push({project, index});
    });
    const sections = Array.from(categories, ([group, items]) => `<section class="gallery-group" aria-label="${escapeHTML(group)}">
      <div class="gallery-group-heading"><h2>${escapeHTML(group)}</h2><span>${String(items.length).padStart(2,'0')} WORKS</span></div>
      <div class="project-grid">${items.map(({project,index}) => tile(project,index)).join('')}</div>
    </section>`).join('');
    return `<div class="folder-page"><div class="folder-page-top"><span>PORTFOLIO / ${f.number}</span><span>2026 COLLECTION</span></div>
      <div class="folder-page-heading"><h1>${escapeHTML(f.title)}</h1><span class="folder-page-index">(${f.number}/05)</span></div>
      <p class="folder-intro">${escapeHTML(f.intro)}</p>
      ${sections}
    </div>`;
  }

  function staticPage(type) {
    count.textContent = `ARISSA · ${type.toUpperCase()}`;
    if (type === 'about') return `<div class="information-page"><span class="info-overline">ARISSA / ABOUT</span><h1>HI, I'M<br>ARISSA<span class="info-dot">.</span></h1><div class="information-text"><p>I'm currently studying Visual Effects and Entertainment Design at Flinders University, working towards a career in concept art and visual development for games and film. I'm especially drawn to character design, atmospheric environments, and the small details that make a world feel alive.</p><p>My practice moves between digital painting, traditional drawing, photography and 3D sculpting. I enjoy exploring ideas through lighting, colour and storytelling, from loose sketches and studies to more developed characters and scenes.</p></div><span class="info-aside">CONCEPT ART · VISUAL DEVELOPMENT · DIGITAL & TRADITIONAL MEDIA</span></div>`;
    const emailBlock = CONTACT_EMAIL
      ? `<p class="contact-email"><a href="mailto:${escapeHTML(CONTACT_EMAIL)}">${escapeHTML(CONTACT_EMAIL)} ↗</a></p>`
      : `<p class="contact-note">A public contact email will be added before launch.</p>`;
    return `<div class="information-page contact-page"><span class="info-overline">ARISSA / CONTACT</span><h1>LET'S MAKE<br>SOMETHING<span class="info-dot">.</span></h1><div class="information-text"><p>For internships, creative opportunities, collaborations or questions about my work, I'd love to hear from you.</p>${emailBlock}</div><span class="info-aside">THANK YOU FOR VISITING ↗</span></div>`;
  }

  function render(slug) {
    const f = folders.find(x => x.slug === slug);
    if (!f && slug !== 'about' && slug !== 'contact') { closePanel(false); return; }
    const current = f ? f.slug : slug;
    buildNav(current);
    topTitle.textContent = f ? f.label : current;
    breadcrumb.textContent = f ? f.label.toUpperCase() : current.toUpperCase();
    content.innerHTML = f ? folderPage(f) : staticPage(current);
    content.scrollTop = 0;
    overlay.hidden = false;
    document.body.classList.add('panel-open');
    win.focus({preventScroll:true});
  }

  function closePanel(changeHash = true) {
    overlay.hidden = true;
    win.classList.remove('is-maximized');
    win.style.removeProperty('--drag-x');win.style.removeProperty('--drag-y');
    document.body.classList.remove('panel-open');
    if (changeHash && location.hash) {
      // Works on hosted sites and when index.html is opened directly from a ZIP.
      try { history.replaceState(null, document.title, location.href.split('#')[0]); }
      catch { location.hash = ''; }
    }
    if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus({preventScroll:true});
  }

  function syncFromHash() {
    const slug = decodeURIComponent(location.hash.replace(/^#\/?/, '').trim());
    if (slug) render(slug);
    else closePanel(false);
  }

  document.addEventListener('click', (event) => {
    const open = event.target.closest('[data-open]');
    if (open) {
      lastTrigger = open;
      const slug = open.dataset.open;
      if (location.hash === `#${slug}`) render(slug);
      else location.hash = slug;
      return;
    }
    const preview = event.target.closest('[data-preview]');
    if (preview) {
      event.preventDefault();
      const src = preview.getAttribute('data-preview');
      const title = preview.getAttribute('data-title') || 'Artwork preview';
      lightboxImage.removeAttribute('src');
      lightboxImage.alt = title;
      lightboxTitle.textContent = title;
      lightboxOriginal.href = src;
      lightboxError.hidden = true;
      lightboxImage.hidden = false;
      // Native showModal renders in the top layer above every Finder window.
      if (!lightbox.open) lightbox.showModal();
      lightboxImage.src = src;
      return;
    }
    if (event.target.closest('[data-close]')) closePanel();
  });

  document.getElementById('close-window').addEventListener('click', () => closePanel());
  document.getElementById('minimize-window').addEventListener('click', () => closePanel());
  const maximize = () => {win.style.removeProperty('--drag-x');win.style.removeProperty('--drag-y');win.classList.toggle('is-maximized');};
  document.getElementById('maximize-window').addEventListener('click', maximize);
  document.getElementById('open-fullpage').addEventListener('click', maximize);
  const closePreview = () => {if(lightbox.open) lightbox.close();};
  document.getElementById('close-lightbox').addEventListener('click', closePreview);
  lightboxImage.addEventListener('error', () => {lightboxImage.hidden = true;lightboxError.hidden = false;});
  lightboxImage.addEventListener('load', () => {lightboxImage.hidden = false;lightboxError.hidden = true;});
  lightbox.addEventListener('click', event => {if(event.target === lightbox) closePreview();});
  lightbox.addEventListener('close', () => {lightboxImage.removeAttribute('src');});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !lightbox.open && !overlay.hidden) closePanel();
  });

  // Desktop windows can be dragged by their chrome, as in macOS Finder.
  let drag = null;
  const handle = document.getElementById('window-drag-handle');
  handle.addEventListener('pointerdown', event => {
    if(event.button !== 0 || event.target.closest('button') || win.classList.contains('is-maximized') || matchMedia('(max-width: 760px)').matches) return;
    const rect = win.getBoundingClientRect();
    drag = {x:event.clientX, y:event.clientY, left:rect.left, top:rect.top};
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove', event => {
    if (!drag) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    const x = Math.max(-win.offsetWidth+100, Math.min(window.innerWidth-100, dx));
    const y = Math.max(-30, Math.min(window.innerHeight-100, dy));
    win.style.setProperty('--drag-x', `${x}px`);win.style.setProperty('--drag-y', `${y}px`);
  });
  handle.addEventListener('pointerup', () => drag = null);
  handle.addEventListener('pointercancel', () => drag = null);

  window.addEventListener('hashchange', syncFromHash);
  window.addEventListener('popstate', syncFromHash);
  syncFromHash();
})();
