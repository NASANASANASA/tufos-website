/* ============================================================
   台灣飛碟學會官網 — 共用前端腳本
   由 index.html（中文）與 en/index.html（English）共用
   window.SITE_LANG 由各頁面自行設定為 'zh' 或 'en'
============================================================ */
const SITE_LANG = window.SITE_LANG || 'zh';
const SITE_BASE = window.SITE_BASE || '/';
const sitePath = (path='') => SITE_BASE + String(path).replace(/^\/+/, '');

/* ---- Mobile menu ---- */
function toggleMobile(){
  const menu = document.getElementById('mobileMenu');
  const btn = document.querySelector('.nav-hamburger');
  const open = menu.classList.toggle('open');
  if(btn) btn.setAttribute('aria-expanded', String(open));
}
function closeMobile(){
  document.getElementById('mobileMenu').classList.remove('open');
  const btn = document.querySelector('.nav-hamburger');
  if(btn) btn.setAttribute('aria-expanded', 'false');
}

let lastFocusedElement = null;
function showModal(id){
  const modal = document.getElementById(id);
  if(!modal) return;
  lastFocusedElement = document.activeElement;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const focusTarget = modal.querySelector('.modal-close,button,a');
  if(focusTarget) focusTarget.focus();
}
function hideModal(id){
  const modal = document.getElementById(id);
  if(!modal) return;
  modal.classList.remove('open');
  if(!document.querySelector('.modal-overlay.open')) document.body.style.overflow = '';
  if(lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
}
function openInfoModal(id){ showModal(id); }
function closeInfoModal(id){ hideModal(id); }

/* ---- News modal：點擊新聞卡片顯示完整內容 ---- */
function openNewsModal(i){
  const data = (window.__newsData || [])[i];
  if(!data) return;
  const { item, title, summary } = data;
  const imgEl = document.getElementById('modal-img');
  if(item.image){
    imgEl.className = 'ph';
    imgEl.style.backgroundImage = `url('${sitePath(item.image)}')`;
    imgEl.style.backgroundSize = 'cover';
    imgEl.style.backgroundPosition = 'center';
  } else {
    imgEl.className = `ph ${item.background || 'ph-grid'}`;
    imgEl.style.backgroundImage = '';
  }
  document.getElementById('modal-date').textContent = item.date || '';
  document.getElementById('modal-title').textContent = title || '';
  document.getElementById('modal-body').textContent = summary || '';
  showModal('news-modal');
}
function closeNewsModal(){ hideModal('news-modal'); }

/* ---- All news modal：「查看所有消息」彈出完整列表 ---- */
function openAllNewsModal(){ showModal('all-news-modal'); }
function closeAllNewsModal(){ hideModal('all-news-modal'); }
/* ---- Case modal：點擊案例卡片顯示完整內容 ---- */
function openCaseModal(i){
  const data = (window.__casesData || [])[i];
  if(!data) return;
  const { item, title, summary, location } = data;
  const imgEl = document.getElementById('case-modal-img');
  if(item.image){
    imgEl.className = 'ph';
    imgEl.style.backgroundImage = `url('${sitePath(item.image)}')`;
    imgEl.style.backgroundSize = 'cover';
    imgEl.style.backgroundPosition = 'center';
  } else {
    imgEl.className = `ph ${item.background || 'ph-grid'}`;
    imgEl.style.backgroundImage = '';
  }
  document.getElementById('case-modal-meta').textContent = `${item.date||''}　${location||''}　${item.witnesses||1}${ui('人')}`;
  document.getElementById('case-modal-title').textContent = title || '';
  document.getElementById('case-modal-body').textContent = summary || '';
  const details = document.getElementById('case-modal-details');
  if(details){
    const status = SITE_LANG === 'en' ? (item.status_en || item.status || '') : (item.status || '');
    const source = SITE_LANG === 'en' ? (item.source_en || item.source || '') : (item.source || '');
    const observation = SITE_LANG === 'en' ? (item.observation_en || item.observation || '') : (item.observation || '');
    const review = SITE_LANG === 'en' ? (item.review_en || item.review || '') : (item.review || '');
    const completeness = completenessLabel(item.completeness);
    details.innerHTML = `
      <div><span>${SITE_LANG==='en'?'Case ID':'案例編號'}</span><strong>${item.caseId || ''}</strong></div>
      <div><span>${SITE_LANG==='en'?'Investigation status':'調查狀態'}</span><strong>${status}</strong></div>
      <div><span>${SITE_LANG==='en'?'Data completeness':'資料完整度'}</span><strong>${completeness}</strong></div>
      <div><span>${SITE_LANG==='en'?'Last updated':'最後更新'}</span><strong>${item.updated || ''}</strong></div>
      <div class="full"><span>${SITE_LANG==='en'?'Source':'資料來源'}</span><p>${source}</p></div>
      <div class="full"><span>${SITE_LANG==='en'?'Observation':'觀測紀錄'}</span><p>${observation}</p></div>
      <div class="full"><span>${SITE_LANG==='en'?'Review notes':'調查說明'}</span><p>${review}</p></div>`;
  }
  showModal('case-modal');
}
function closeCaseModal(){ hideModal('case-modal'); }

/* ---- All cases modal：「查看所有案例」彈出完整列表 ---- */
function openAllCasesModal(){ showModal('all-cases-modal'); }
function closeAllCasesModal(){ hideModal('all-cases-modal'); }

document.addEventListener('keydown', e=>{
  if(e.key !== 'Escape') return;
  closeNewsModal();
  closeAllNewsModal();
  closeCaseModal();
  closeAllCasesModal();
  closeInfoModal('privacy-modal');
});

/* ---- Links：展開/收合更多連結 ---- */
function toggleLinksMore(){
  const list = document.getElementById('links-list');
  const btn = document.getElementById('links-more-btn');
  const expanded = list.classList.toggle('expanded');
  btn.textContent = expanded ? ui('收合 ↑') : ui('顯示更多 ↓');
}

/* ---- Hero：星空閃爍效果 ---- */
(function(){
  const starBox = document.getElementById('hero-stars');
  if(!starBox) return;
  const STAR_COUNT = 85;
  for(let i=0;i<STAR_COUNT;i++){
    const star = document.createElement('span');
    const isBright = Math.random() > .84;
    star.className = isBright ? 'star star-bright' : 'star';
    const size = (Math.random()*(isBright ? 3.2 : 2.2) + (isBright ? 1.8 : .8)).toFixed(1);
    star.style.left = (Math.random()*100) + '%';
    star.style.top = (Math.random()*100) + '%';
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.setProperty('--star-size', size + 'px');
    star.style.setProperty('--star-opacity', (Math.random()*.45 + .42).toFixed(2));
    star.style.animationDuration = (Math.random()*2.8 + 1.6).toFixed(2) + 's';
    star.style.animationDelay = (Math.random()*4.2).toFixed(2) + 's';
    starBox.appendChild(star);
  }
})();

/* ---- Hero：滑鼠光暈 ---- */
(function(){
  const hero = document.getElementById('hero');
  if(!hero) return;
  hero.addEventListener('mousemove', e=>{
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    hero.style.setProperty('--mx', x + 'px');
    hero.style.setProperty('--my', y + 'px');
  });
})();

/* 將「2026.6.14」「2024.11.28」「2026年6月14日（星期日）」等日期字串轉為可比較的數字 */
function parseDate(str){
  const m = String(str || '').match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if(!m) return 0;
  return Number(m[1])*10000 + Number(m[2])*100 + Number(m[3]);
}

/* 取得內容欄位：中文版直接回傳；英文版優先用 `${key}_en`，
   若該欄位為空則顯示中文，避免將內容傳送至第三方翻譯服務 */
function field(item, key){
  const zh = (item && item[key]) || '';
  if(SITE_LANG !== 'en') return Promise.resolve(zh);
  const en = item && item[key + '_en'];
  if(en) return Promise.resolve(en);
  return Promise.resolve(zh);
}

/* 固定 UI 文字（分類標籤、可信度等）中英對照 */
const UI_DICT = {
  '學會公告':'Society Announcements',
  '活動預告':'Upcoming Events',
  '國際動態':'International News',
  '研究報告':'Research Reports',
  '媒體報導':'Media Coverage',
  '待確認':'Unverified',
  '資料完整':'Complete',
  '部分完整':'Partial',
  '資料不足':'Insufficient',
  '人':' people',
  '/ 年':'/ year',
  '聯絡我們':'Contact Us',
  '顯示更多 ↓':'Show More ↓',
  '收合 ↑':'Collapse ↑',
};
function ui(zh){ return SITE_LANG === 'en' ? (UI_DICT[zh] || zh) : zh; }
function completenessLabel(value){
  if(value === 'complete') return ui('資料完整');
  if(value === 'partial') return ui('部分完整');
  return ui('資料不足');
}

/* ---- Content loader (reads /content/*.json so the site can be maintained via /admin) ---- */
(async function loadContent(){
  const fetchJson = async (path) => {
    try{
      const res = await fetch(path, {cache:'no-store'});
      if(!res.ok) return null;
      return await res.json();
    }catch(err){ return null; }
  };

  /* 有照片時只套用 .ph（避免與 .ph-* 漸層樣式的 background 簡寫衝突），並補上完整的背景屬性 */
  const ph = (item) => item && item.image
    ? `style="background-image:url('${sitePath(item.image)}');background-size:cover;background-position:center;background-repeat:no-repeat;"`
    : '';
  const phClass = (item) => item && item.image
    ? 'ph'
    : `ph ${item && item.background ? item.background : 'ph-grid'}`;

  const [hero, about, news, cases, join, links, settings] = await Promise.all([
    fetchJson(sitePath('content/hero.json')),
    fetchJson(sitePath('content/about.json')),
    fetchJson(sitePath('content/news.json')),
    fetchJson(sitePath('content/cases.json')),
    fetchJson(sitePath('content/join.json')),
    fetchJson(sitePath('content/links.json')),
    fetchJson(sitePath('content/settings.json')),
  ]);

  /* ---- Hero ---- */
  if(hero){
    const heroSection = document.getElementById('hero');
    const [tag, title, desc] = await Promise.all([
      field(hero,'tag'), field(hero,'title'), field(hero,'description'),
    ]);
    document.getElementById('hero-tag').textContent = tag;
    document.getElementById('hero-date').textContent = hero.date || '';
    document.getElementById('hero-title').innerHTML = (title || '').replace(/\n/g,'<br>');
    document.getElementById('hero-desc').textContent = desc;
    if(hero.image){
      heroSection.className = 'ph';
      heroSection.style.backgroundImage = `url('${sitePath(hero.image)}')`;
      heroSection.style.backgroundSize = 'cover';
      heroSection.style.backgroundPosition = 'center';
      heroSection.style.backgroundRepeat = 'no-repeat';
    } else {
      heroSection.className = `ph ${hero.background || 'ph-nebula'}`;
    }
  }

  /* ---- About ---- */
  if(about){
    const [heading, p1, p2] = await Promise.all([
      field(about,'heading'), field(about,'paragraph1'), field(about,'paragraph2'),
    ]);
    document.getElementById('about-eyebrow').textContent = about.eyebrow || '';
    document.getElementById('about-heading').textContent = heading;
    document.getElementById('about-p1').textContent = p1;
    document.getElementById('about-p2').textContent = p2;
    document.getElementById('about-chairs').textContent = SITE_LANG==='en' ? '' : (about.chairHistory || '');
    const aboutImg = document.getElementById('about-image');
    if(about.image){
      aboutImg.className = '';
      aboutImg.style.backgroundImage = `url('${sitePath(about.image)}')`;
      aboutImg.style.backgroundSize = 'cover';
      aboutImg.style.backgroundPosition = 'center';
    }
  }

  /* ---- News ---- */
  if(news && Array.isArray(news.items)){
    const grid = document.getElementById('news-grid');
    const allItems = [...news.items].sort((a,b)=>parseDate(b.date)-parseDate(a.date));
    const gridItems = allItems.slice(0,3);
    const tagClass = (cat) => (cat==='國際動態' || cat==='媒體報導') ? 'tag-red' : 'tag-blue';

    window.__newsData = await Promise.all(allItems.map(async item=>{
      const [title, summary] = await Promise.all([field(item,'title'), field(item,'summary')]);
      return {item, title, summary};
    }));

    grid.innerHTML = gridItems.map(item=>{
      const i = allItems.indexOf(item);
      const {title, summary} = window.__newsData[i];
      return `
      <button type="button" class="news-card" onclick="openNewsModal(${i})" aria-label="${title||''}">
        <div class="${phClass(item)}" ${ph(item)}><span class="tag ${tagClass(item.category)}">${ui(item.category)||''}</span></div>
        <div class="news-body">
          <div class="news-date">${item.date||''}</div>
          <h3>${title||''}</h3>
          <p>${summary||''}</p>
        </div>
      </button>`;
    }).join('');

    const listEl = document.getElementById('news-list');
    if(listEl){
      listEl.innerHTML = allItems.map((item,i)=>{
        const {title, summary} = window.__newsData[i];
        return `
        <button type="button" class="news-list-item" onclick="closeAllNewsModal();openNewsModal(${i})">
          <span class="tag ${tagClass(item.category)}">${ui(item.category)||''}</span>
          <div class="news-date">${item.date||''}</div>
          <h4>${title||''}</h4>
          <p>${summary||''}</p>
        </button>`;
      }).join('');
    }
  }

  /* ---- Cases ---- */
  if(cases && Array.isArray(cases.items)){
    const grid = document.getElementById('cases-grid');
    const allItems = [...cases.items].sort((a,b)=>parseDate(b.date)-parseDate(a.date));

    window.__casesData = await Promise.all(allItems.map(async item=>{
      const [title, summary, location] = await Promise.all([field(item,'title'), field(item,'summary'), field(item,'location')]);
      return {item, title, summary, location};
    }));

    const caseCard = (item)=>{
      const i = allItems.indexOf(item);
      const {title, summary, location} = window.__casesData[i];
      const status = SITE_LANG === 'en' ? (item.status_en || item.status || '') : (item.status || '');
      return `
      <button type="button" class="case-card" onclick="openCaseModal(${i})" aria-label="${title||''}">
        <div class="${phClass(item)}" ${ph(item)}></div>
        <div class="case-body">
          <div class="case-topline"><span>${item.caseId||''}</span><span class="case-status">${status}</span></div>
          <h3>${title||''}</h3>
          <p>${summary||''}</p>
          <div class="case-meta"><span>${item.date||''}</span><span>${location||''}</span><span>${completenessLabel(item.completeness)}</span></div>
        </div>
      </button>`;
    };

    const search = document.getElementById('case-search');
    const locationFilter = document.getElementById('case-location');
    const yearFilter = document.getElementById('case-year');
    const statusFilter = document.getElementById('case-status');
    const reset = document.getElementById('case-reset');
    const resultsMeta = document.getElementById('case-results-meta');

    const unique = (values)=>[...new Set(values.filter(Boolean))].sort();
    unique(window.__casesData.map(d=>d.location)).forEach(value=>locationFilter.add(new Option(value,value)));
    unique(allItems.map(item=>String(item.date||'').slice(0,4))).sort().reverse().forEach(value=>yearFilter.add(new Option(value,value)));
    unique(allItems.map(item=>SITE_LANG === 'en' ? (item.status_en || item.status) : item.status)).forEach(value=>statusFilter.add(new Option(value,value)));

    const renderCases = ()=>{
      const query = (search.value || '').trim().toLowerCase();
      const filtered = allItems.filter(item=>{
        const i = allItems.indexOf(item);
        const data = window.__casesData[i];
        const status = SITE_LANG === 'en' ? (item.status_en || item.status || '') : (item.status || '');
        const haystack = [item.caseId,data.title,data.location,data.summary].join(' ').toLowerCase();
        return (!query || haystack.includes(query))
          && (!locationFilter.value || data.location === locationFilter.value)
          && (!yearFilter.value || String(item.date||'').startsWith(yearFilter.value))
          && (!statusFilter.value || status === statusFilter.value);
      });
      grid.innerHTML = filtered.map(caseCard).join('') || `<p class="case-empty">${SITE_LANG==='en'?'No cases match these filters.':'沒有符合篩選條件的案例。'}</p>`;
      resultsMeta.textContent = SITE_LANG==='en' ? `${filtered.length} cases` : `共 ${filtered.length} 筆案例`;
    };
    [search,locationFilter,yearFilter,statusFilter].forEach(el=>el.addEventListener(el === search ? 'input' : 'change',renderCases));
    reset.addEventListener('click',()=>{
      search.value=''; locationFilter.value=''; yearFilter.value=''; statusFilter.value=''; renderCases();
    });
    renderCases();

    const listEl = document.getElementById('cases-list');
    if(listEl){
      listEl.innerHTML = allItems.map((item,i)=>{
        const {title, summary, location} = window.__casesData[i];
        const status = SITE_LANG === 'en' ? (item.status_en || item.status || '') : (item.status || '');
        return `
        <button type="button" class="news-list-item" onclick="closeAllCasesModal();openCaseModal(${i})">
          <div class="news-date">${item.caseId||''}　${item.date||''}　${location||''}　${status}</div>
          <h4>${title||''}</h4>
          <p>${summary||''}</p>
        </button>`;
      }).join('');
    }
  }

  /* ---- Join gallery：加入學會下方相簿（可從 CMS 上傳/排序） ---- */
  if(join && Array.isArray(join.photos)){
    const track = document.getElementById('join-gallery-track');
    if(track){
      const photos = join.photos.filter(p=>p && p.image);
      const slide = (p)=>`<div class="ph" style="background-image:url('${sitePath(p.image)}');background-size:cover;background-position:center;"></div>`;
      track.innerHTML = photos.map(slide).join('') + photos.map(slide).join('');
    }
  }

  /* ---- Links：外太空探索相關網站連結（可從 CMS 編輯） ---- */
  if(links && Array.isArray(links.items)){
    const list = document.getElementById('links-list');
    if(list){
      const rows = await Promise.all(links.items.map(async item=>{
        const [name, desc] = await Promise.all([field(item,'name'), field(item,'description')]);
        return `
        <a class="link-row" href="${item.url || '#'}" target="_blank" rel="noopener">
          <div class="link-name">${name || ''}<span class="arrow">→</span></div>
          <div class="link-desc">${desc || ''}</div>
        </a>`;
      }));
      list.innerHTML = rows.join('');

      const more = document.getElementById('links-more');
      if(more) more.style.display = links.items.length > 6 ? 'flex' : 'none';
    }
  }

  /* ---- Settings (footer / report alert) ---- */
  if(settings){
    const footerDesc = await field(settings,'footerDescription');
    if(footerDesc) document.getElementById('footer-desc').textContent = footerDesc;
    if(settings.facebook) document.getElementById('social-fb').href = settings.facebook;
    if(settings.email) document.getElementById('social-email').href = `mailto:${settings.email}`;

    const alertBox = document.getElementById('report-alert');
    const alertText = await field(settings,'alert');
    if(alertText){
      alertBox.style.display = 'flex';
      alertBox.innerHTML = alertText;
    }
  }

  /* ---- Re-run fade-up observer for newly injected sections ---- */
  document.querySelectorAll('.fade-up').forEach(el=>fadeObs.observe(el));
})();

/* ---- Fade-up ---- */
const fadeObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:.1});
document.querySelectorAll('.fade-up').forEach(el=>fadeObs.observe(el));

/* ---- Smooth scroll ---- */
function scrollToHashTarget(hash, behavior = 'smooth'){
  if(!hash || hash === '#') return;
  const t = document.querySelector(hash);
  if(!t) return;
  const header = document.getElementById('header');
  const offset = (header ? header.offsetHeight : 0) + 14;
  const padTop = parseFloat(getComputedStyle(t).paddingTop) || 0;
  const y = t.getBoundingClientRect().top + window.pageYOffset - offset + padTop;
  window.scrollTo({ top: Math.max(0, y), behavior });
}

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const hash = a.getAttribute('href');
    if(!hash || hash === '#') return;
    const t=document.querySelector(hash);
    if(t){
      e.preventDefault();
      history.pushState(null, '', hash);
      scrollToHashTarget(hash);
    }
  });
});

window.addEventListener('hashchange', ()=>scrollToHashTarget(window.location.hash));
window.addEventListener('load', ()=>{
  if(window.location.hash) setTimeout(()=>scrollToHashTarget(window.location.hash, 'auto'), 0);
});


/* ---- Report form ---- */
function updateFileName(input){
  const nameEl=document.getElementById('attachment-name');
  if(!nameEl) return;
  if(input.files.length===0){ nameEl.textContent = SITE_LANG==='en' ? 'No file selected' : '未選擇任何檔案'; }
  else if(input.files.length===1){ nameEl.textContent=input.files[0].name; }
  else{ nameEl.textContent = SITE_LANG==='en' ? `${input.files.length} files selected` : `已選擇 ${input.files.length} 個檔案`; }
}

function submitReport(e){
  e.preventDefault();
  const form=e.target;
  const btn=form.querySelector('button[type="submit"]');
  const orig=btn.textContent;
  const alertBox=document.getElementById('report-alert');
  const MAX_SIZE=8*1024*1024;
  const fileInput=form.querySelector('input[type="file"]');
  if(fileInput && fileInput.files){
    for(const file of fileInput.files){
      if(file.size>MAX_SIZE){
        if(alertBox){
          alertBox.textContent = SITE_LANG==='en'
            ? `⚠️ File "${file.name}" exceeds 8MB. Please provide a cloud link (Google Drive, YouTube, etc.) in the description instead.`
            : `⚠️ 檔案「${file.name}」超過 8MB，請改在「詳細描述」中提供雲端連結（Google Drive、YouTube 等）後再提交。`;
          alertBox.style.display='block';
        }
        return;
      }
    }
  }
  if(alertBox) alertBox.style.display='none';
  btn.disabled=true;
  btn.textContent = SITE_LANG==='en' ? 'Submitting...' : '送出中...';
  const data=new FormData(form);
  fetch(sitePath(''), { method:'POST', body:data })
    .then(res=>{
      if(!res.ok) throw new Error('提交失敗');
      btn.textContent = SITE_LANG==='en' ? 'Submitted, thank you ✓' : '已提交，感謝您的通報 ✓';
      btn.style.background='var(--blue)'; btn.style.borderColor='var(--blue)';
      form.reset();
      const nameEl=document.getElementById('attachment-name');
      if(nameEl) nameEl.textContent = SITE_LANG==='en' ? 'No file selected' : '未選擇任何檔案';
    })
    .catch(()=>{
      if(alertBox){
        alertBox.textContent = SITE_LANG==='en'
          ? '⚠️ Submission failed. Please try again later or contact us by email.'
          : '⚠️ 提交失敗，請稍後再試或直接以 Email 與我們聯繫。';
        alertBox.style.display='block';
      }
    })
    .finally(()=>{
      btn.disabled=false;
      setTimeout(()=>{ btn.textContent=orig; btn.style.background=''; btn.style.borderColor=''; },3500);
    });
}
