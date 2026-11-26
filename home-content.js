/* V20: live content from Pages CMS-managed JSON; layout/art/animations remain V19. */
(() => {

  /* V23: justified row layout — DOM order reads left-to-right, then top-to-bottom.
     Every image keeps its native ratio. The row width is shared among up to three images. */
  function setupJustifiedRows(container, itemSelector) {
    if (!container || container.dataset.rowsReady === 'true') return;
    container.dataset.rowsReady = 'true';
    container.classList.add('justified-gallery');
    let pending = false;
    let lastWidth = -1;
    const layout = () => {
      pending = false;
      const items = [...container.children].filter(node => node.matches(itemSelector));
      if (!items.length) return;
      const style = getComputedStyle(container);
      const availableWidth = container.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
      if (availableWidth < 1) return;
      const gap = parseFloat(style.columnGap) || 16;
      const count = window.matchMedia('(max-width: 620px)').matches ? 1 :
                    window.matchMedia('(max-width: 920px)').matches ? 2 : 3;
      for (let start = 0; start < items.length; start += count) {
        const row = items.slice(start, start + count);
        const ratios = row.map(item => {
          const image = item.querySelector('img');
          return image && image.naturalWidth > 0 && image.naturalHeight > 0
            ? image.naturalWidth / image.naturalHeight : 4 / 3;
        });
        const totalRatio = ratios.reduce((sum, ratio) => sum + ratio, 0);
        const rowWidth = Math.max(1, availableWidth - gap * (row.length - 1) - 2);
        // Incomplete final rows should not blow a single portrait up to several screen heights.
        const maximumHeight = row.length === count ? Infinity : (count === 3 ? 540 : 640);
        const height = Math.min(rowWidth / totalRatio, maximumHeight);
        row.forEach((item, index) => {
          item.style.width = `${(height * ratios[index]).toFixed(2)}px`;
          item.style.height = `${height.toFixed(2)}px`;
        });
      }
    };
    const schedule = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(layout);
    };
    container.addEventListener('load', event => {
      if (event.target.tagName === 'IMG') schedule();
    }, true);
    new MutationObserver(schedule).observe(container, { childList: true });
    new ResizeObserver(() => {
      const width = container.clientWidth;
      if (width !== lastWidth) { lastWidth = width; schedule(); }
    }).observe(container);
    window.addEventListener('resize', schedule, { passive: true });
    schedule();
  }
  ['stills-gallery', 'worlds-gallery'].forEach(id => setupJustifiedRows(document.getElementById(id), '.image-tile'));
  const siteRoot = './';
  const validSlug = v => typeof v === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
  function media(path) {
    if (typeof path !== 'string' || !path.trim()) return '';
    if (/^https?:\/\//i.test(path)) return path;
    // GitHub image uploads may contain spaces, parentheses, Unicode, etc.
    // Encode each filename segment for the browser while rejecting path traversal.
    const raw = path.trim().replace(/^(\.\.\/)+/, '').replace(/^\/?(?:\.\/)?/, '');
    if (!/^(assets|videos)\//.test(raw)) return '';
    const segments = raw.split('/');
    if (segments.some(s => !s)) return '';
    const encoded = [];
    for (const segment of segments) {
      let name;
      try { name = decodeURIComponent(segment); }
      catch { name = segment; }
      if (name === '.' || name === '..' || name.includes('/') || name.includes('\\')) return '';
      encoded.push(encodeURIComponent(name));
    }
    return siteRoot + encoded.join('/');
  }
  const put = (node, text) => { if(node && text !== undefined && text !== null) node.textContent = String(text); };
  const visibleList = v => Array.isArray(v) ? v.filter(x => typeof x === 'string' && x.trim()) : [];

  async function loadJson(url) {
    const res = await fetch(url, {cache:'no-cache'});
    if (!res.ok) throw Error(`${url}: HTTP ${res.status}`);
    return res.json();
  }
  function fillWords(container, words, tag='span') {
    if (!container || !Array.isArray(words)) return;
    container.replaceChildren(...visibleList(words).map(x => {
      const item=document.createElement(tag);
      if(tag==='li') {const em=document.createElement('em');em.textContent=x;item.append(em);} else item.textContent=x;
      return item;
    }));
  }
  function drawGallery(id, images, label) {
    if (!Array.isArray(images)) return;
    const root=document.getElementById(`${id}-gallery`);
    if (!root) return;
    const fragment=document.createDocumentFragment();
    images.map(media).filter(Boolean).forEach((src,i)=>{
      const b=document.createElement('button');
      b.type='button'; b.className='image-tile';
      b.style.setProperty('--tilt', (((i%5)-2)*.34)+'deg');
      b.setAttribute('aria-label',`View ${label.toLowerCase()} image ${i+1}`);
      const img=document.createElement('img');img.src=src;img.loading='lazy';img.decoding='async';img.alt=`${label} image ${i+1}`;
      b.append(img);
      b.addEventListener('click',()=>{
        const overlay=document.getElementById('overlay');
        document.getElementById('overlay-image').src=img.src;
        document.getElementById('overlay-title').textContent=label;
        document.getElementById('overlay-text').textContent='';
        document.getElementById('overlay-text').style.display='none';
        overlay.classList.add('open');document.body.style.overflow='hidden';
      });
      fragment.append(b);
    });
    root.replaceChildren(fragment);
  }
  function applySite(site) {
    if (!site || typeof site !== 'object') return;
    put(document.querySelector('.topnav .logo'), site.site_name);
    const heading=document.querySelector('.about-copy h1');
    if (heading) {
      heading.replaceChildren(document.createTextNode(`${site.about_heading_prefix || "Hi, I'm"} `));
      const em=document.createElement('em');em.textContent=site.about_heading_highlight || 'Anaelle.';heading.append(em);
    }
    if (Array.isArray(site.about_paragraphs)) {
      document.querySelectorAll('.about-copy > p').forEach(p=>p.remove());
      const tags=document.querySelector('.about-copy .tiny-tags');
      visibleList(site.about_paragraphs).forEach(v=>{const p=document.createElement('p');p.textContent=v;tags?.before(p)});
    }
    const portrait=media(site.portrait);
    if (portrait) document.querySelector('.about .portrait img').src=portrait;
    fillWords(document.querySelector('.tiny-tags'), site.creative_fields);
    fillWords(document.querySelector('.tools-list'), site.tools, 'li');
    put(document.querySelector('.contact-kicker'), site.contact_kicker);
    const contactTitle=document.querySelector('.footer h2');
    if (contactTitle) {
      contactTitle.replaceChildren(document.createTextNode(`${site.contact_heading_prefix||"Let's make"} `));
      const em=document.createElement('em');em.textContent=site.contact_heading_highlight||'something new.';contactTitle.append(em);
    }
    put(document.querySelector('.footer > p'), site.contact_text);
    const email=document.querySelector('.email-link');
    if (email) {
      const address=String(site.contact_email || '').trim();
      email.hidden=!address;
      email.href=`mailto:${address}?subject=${encodeURIComponent("Let's make something new")}`;
      put(email.querySelector('span'),address);
    }
    for(const [field,id] of [['nav_about_image','about'],['nav_projects_image','projects'],['nav_stills_image','stills'],['nav_worlds_image','worlds']]) {
      const source=media(site[field]);
      const img=document.querySelector(`.nav-link[data-memory="${id}"] img`);
      if (img && source) img.src=source;
    }
    if (Array.isArray(site.memories)) {
      const photos=[...document.querySelectorAll('.memory-photo')];
      const sources=site.memories.slice(0,photos.length).map(media);
      photos.forEach((el,i)=>{
        const src=sources[i];el.hidden=!src;
        if (src) el.querySelector('img').src=src;
      });
    }
    drawGallery('stills',site.stills,'Stills');
    drawGallery('worlds',site.worlds,'Worldbuilding');
    document.title=`${site.site_name||'Portfolio'} — Stories, Stills & Worlds`;
  }
  function applyProjects(projects) {
    if(!Array.isArray(projects)) return;
    const parent=document.querySelector('.journal-list');
    if(!parent) return;
    const old=[...parent.querySelectorAll('.journal-entry')];
    const bySlug=new Map(old.map(node=>[node.id.replace(/^journal-/,''),node]));
    const sample=old[0];
    const fragment=document.createDocumentFragment();
    const knownPaths=new Set(['trust-the-plan','between-the-trees','a-place-to-return-to','dragon-forest-scene','last-summer-tape','lantern-paths']);
    let count=0;
    for(const p of projects) {
      if(!p || !validSlug(p.slug) || !p.title) continue;
      const link=bySlug.get(p.slug) || sample?.cloneNode(true);
      if(!link) continue;
      link.id=`journal-${p.slug}`;
      link.href=knownPaths.has(p.slug) ? `projects/${p.slug}.html` : `projects/project.html?slug=${encodeURIComponent(p.slug)}`;
      link.dataset.kind=p.type||'Project';
      link.dataset.name=p.title;
      link.dataset.description=p.summary||'';
      const thumbnail=media(p.image);
      if(thumbnail) {link.dataset.image=thumbnail;link.querySelector('.sketch-photo img').src=thumbnail;}
      put(link.querySelector('.entry-type'),p.type||'Project');
      put(link.querySelector('.entry-copy h3'),p.title);
      put(link.querySelector('.entry-copy p'),p.summary||p.subtitle||'');
      link.querySelector('.sketch-photo img').alt=`${p.title} thumbnail`;
      link.querySelector('.sketch-photo').style.setProperty('--tilt',`${(count%2 ? .6 : -.6)}deg`);
      fragment.append(link);
      count++;
    }
    parent.replaceChildren(fragment);
    // Maintain correct bookmark geometry if number of projects changes.
    // Layout observers in the original homepage update it automatically.
    if(window.location.hash.startsWith('#journal-')) {
      requestAnimationFrame(()=>{
        const el=document.getElementById(decodeURIComponent(location.hash.substring(1)));
        el?.scrollIntoView({block:'center',behavior:'instant'});
      });
    }
  }
  loadJson('content/site.json').then(applySite).catch(err=>console.warn('Using built-in site content:',err));
  loadJson('content/projects.json').then(applyProjects).catch(err=>console.warn('Using built-in project content:',err));
})();
