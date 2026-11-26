/* V20: the same Pages CMS JSON updates all individual HTML project pages. */
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
  setupJustifiedRows(document.querySelector('.gallery'), 'button');
  const root=document.body;
  const slug=root.dataset.projectSlug || new URLSearchParams(location.search).get('slug');
  if (!slug) return;
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
    return '../' + encoded.join('/');
  }
  const put=(el,value)=>{if(el&&value!==undefined&&value!==null)el.textContent=String(value)};
  function embedUrl(url){
    if(!url) return null;
    try{
      const u=new URL(url);
      if(u.protocol!=='https:')return null;
      const host=u.hostname.toLowerCase().replace(/^www\./,'');
      let id='';
      if(host==='youtu.be')id=u.pathname.slice(1).split('/')[0];
      if(host==='youtube.com'||host==='m.youtube.com') {
        id=u.searchParams.get('v')||'';
        if(!id && u.pathname.startsWith('/shorts/')) id=u.pathname.split('/')[2]||'';
        if(!id && u.pathname.startsWith('/embed/')) id=u.pathname.split('/')[2]||'';
      }
      if(/^[a-zA-Z0-9_-]{11}$/.test(id))return `https://www.youtube-nocookie.com/embed/${id}`;
      if(host==='vimeo.com'||host==='player.vimeo.com') {
        const match=u.pathname.match(/\/(?:video\/)?(\d+)/);
        if(match)return `https://player.vimeo.com/video/${match[1]}`;
      }
    }catch(_error){ /* Invalid external URL: ignore instead of embedding */ }
    return null;
  }
  function apply(projects){
    const project=Array.isArray(projects)?projects.find(p=>p.slug===slug):null;
    if(!project){
      if(!root.dataset.projectSlug) {
        document.querySelector('.heading h1').textContent='Project not found';
        document.querySelector('.subtitle').textContent='Return to the journal to explore the projects.';
      }
      return;
    }
    document.title=`${project.title} — Portfolio`;
    const back=`../index.html#journal-${project.slug}`;
    document.querySelectorAll('a.back, .more a, .topnav .logo, .topnav-links a:first-child').forEach(a=>a.href=back);
    const category=document.querySelector('.heading .category');
    if(category)category.textContent=[project.type,project.tag].filter(Boolean).join(' · ');
    put(document.querySelector('.heading h1'),project.title);
    put(document.querySelector('.heading .subtitle'),project.subtitle);
    const paragraphs=document.querySelector('.description');
    if(paragraphs && Array.isArray(project.description)){
      paragraphs.replaceChildren(...project.description.filter(x=>typeof x==='string'&&x.trim()).map(x=>{
        const p=document.createElement('p');p.textContent=x;return p;
      }));
    }
    const notes=document.querySelector('.notes');
    const detailLines=notes?.querySelectorAll(':scope > p');
    if(detailLines?.[0])detailLines[0].replaceChildren(Object.assign(document.createElement('b'),{textContent:'Type'}),document.createTextNode(` — ${project.type||'Project'}`));
    if(detailLines?.[1])detailLines[1].replaceChildren(Object.assign(document.createElement('b'),{textContent:'Focus'}),document.createTextNode(` — ${project.tag||'—'}`));
    const external=notes?.querySelector('.external-link');
    const externalHeading=external?.previousElementSibling;
    const note=notes?.querySelector('.example-note');
    const dest=project.external_url;
    let validExternal='';
    if(typeof dest==='string'&&dest.trim()){
      try{const u=new URL(dest);if(['https:','http:'].includes(u.protocol))validExternal=u.href}catch(_e){}
    }
    if(external){
      external.hidden=!validExternal; // hide generic YouTube/itch homepages until real URL supplied
      if(validExternal){
        external.href=validExternal;
        // Keep the existing external arrow icon while replacing visible text.
        external.firstChild.nodeValue=(project.external_label||'View project')+' ';
      }
    }
    if(externalHeading)externalHeading.hidden=!validExternal;
    if(note){note.hidden=!validExternal||!project.external_note;put(note,project.external_note||'');}

    const frame=document.querySelector('.film-frame');
    const poster=media(project.image);
    const embed=embedUrl(project.embed_url);
    if(embed){
      const iframe=document.createElement('iframe');
      iframe.src=embed; iframe.title=`${project.title} video`;iframe.loading='lazy';
      iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen=true;
      frame.replaceChildren(iframe);
    } else if(media(project.video)) {
      let video=frame.querySelector('video');
      if(!video){video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='metadata';frame.replaceChildren(video);}
      if(poster)video.poster=poster;
      video.setAttribute('aria-label',`${project.title} video`);
      const path=media(project.video);
      const src=video.querySelector('source')||document.createElement('source');
      src.src=path;src.type=path.toLowerCase().split('?')[0].endsWith('.webm')?'video/webm':'video/mp4';
      video.replaceChildren(src);video.load();
    } else {
      const placeholder=document.createElement('div');placeholder.className='empty-video';
      placeholder.textContent='A film or game demo will appear here soon.';
      frame.replaceChildren(placeholder);
    }
    const caption=document.querySelector('.video-caption');
    if(caption){const children=caption.querySelectorAll('span');
      if(children[0])put(children[0],embed?'WATCH VIDEO': 'PROJECT VIDEO');
      if(children[1])put(children[1],project.video_caption || '');
    }
    const gallery=document.querySelector('.gallery');
    if(gallery && Array.isArray(project.gallery)){
      const fragment=document.createDocumentFragment();
      project.gallery.map(media).filter(Boolean).forEach((src,i)=>{
        const b=document.createElement('button');b.type='button';b.dataset.lightbox='';
        b.setAttribute('aria-label',`Expand image ${i+1}`);
        const img=document.createElement('img');img.src=src;img.alt=`${project.title} image ${i+1}`;
        img.loading='lazy';img.decoding='async';b.append(img);fragment.append(b);
      });
      gallery.replaceChildren(fragment);
    }
  }
  fetch('../content/site.json',{cache:'no-cache'}).then(res=>res.ok?res.json():null).then(site=>{
    if(site && site.site_name){
      put(document.querySelector('.topnav .logo'),site.site_name);
      put(document.querySelector('.footer'),`${site.site_name} · A collection of stories & worlds`);
    }
  }).catch(()=>{});
  fetch('../content/projects.json',{cache:'no-cache'})
    .then(res=>{if(!res.ok)throw Error('Projects not found');return res.json()})
    .then(apply)
    .catch(err=>console.warn('Using built-in project fallback:',err));
})();
