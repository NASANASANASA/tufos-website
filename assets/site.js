/* ============================================================
   台灣飛碟學會官網 — 共用前端腳本
   由 index.html（中文）與 en/index.html（English）共用
   window.SITE_LANG 由各頁面自行設定為 'zh' 或 'en'
============================================================ */
const SITE_LANG = window.SITE_LANG || 'zh';

/* ---- Mobile menu ---- */
function toggleMobile(){ document.getElementById('mobileMenu').classList.toggle('open'); }
function closeMobile(){ document.getElementById('mobileMenu').classList.remove('open'); }

/* ---- News modal：點擊新聞卡片顯示完整內容 ---- */
function openNewsModal(i){
  const data = (window.__newsData || [])[i];
  if(!data) return;
  const { item, title, summary } = data;
  const imgEl = document.getElementById('modal-img');
  if(item.image){
    imgEl.className = 'ph';
    imgEl.style.backgroundImage = `url('${item.image}')`;
    imgEl.style.backgroundSize = 'cover';
    imgEl.style.backgroundPosition = 'center';
  } else {
    imgEl.className = `ph ${item.background || 'ph-grid'}`;
    imgEl.style.backgroundImage = '';
  }
  document.getElementById('modal-date').textContent = item.date || '';
  document.getElementById('modal-title').textContent = title || '';
  document.getElementById('modal-body').textContent = summary || '';
  document.getElementById('news-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeNewsModal(){
  document.getElementById('news-modal').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e=>{ if(e.key === 'Escape') closeNewsModal(); });

/* ---- Hero：滑鼠光暈 + 流星拖尾效果 ---- */
(function(){
  const hero = document.getElementById('hero');
  const meteorBox = document.getElementById('hero-meteors');
  if(!hero || !meteorBox) return;
  let lastMeteor = 0;
  hero.addEventListener('mousemove', e=>{
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    hero.style.setProperty('--mx', x + 'px');
    hero.style.setProperty('--my', y + 'px');

    const now = Date.now();
    if(now - lastMeteor < 60) return;
    lastMeteor = now;
    const meteor = document.createElement('span');
    meteor.className = 'meteor';
    meteor.style.left = x + 'px';
    meteor.style.top = y + 'px';
    meteorBox.appendChild(meteor);
    meteor.addEventListener('animationend', ()=> meteor.remove());
  });
})();

/* ---- Counter ---- */
const counterObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const el=e.target, target=+el.dataset.target;
    let cur=0; const step=target/60;
    const t=setInterval(()=>{
      cur+=step; if(cur>=target){ cur=target; clearInterval(t); }
      el.textContent=Math.floor(cur).toLocaleString();
    },25);
    counterObs.unobserve(el);
  });
},{threshold:.4});
document.querySelectorAll('[data-target]').forEach(el=>counterObs.observe(el));

/* ============================================================
   翻譯輔助：英文版若 CMS 沒有填寫對應的「_en」欄位，
   會用免費的 MyMemory 翻譯 API 自動產生初稿（結果存在瀏覽器
   localStorage，同一段文字只會呼叫一次 API）。
============================================================ */
function translateText(text){
  if(!text) return Promise.resolve(text);
  if(SITE_LANG !== 'en') return Promise.resolve(text);
  const cacheKey = 'tufos_tr_' + text;
  try{
    const cached = localStorage.getItem(cacheKey);
    if(cached) return Promise.resolve(cached);
  }catch(e){}
  return fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh-TW|en-GB`)
    .then(res=>res.json())
    .then(data=>{
      const translated = (data && data.responseData && data.responseData.translatedText) ? data.responseData.translatedText : text;
      try{ localStorage.setItem(cacheKey, translated); }catch(e){}
      return translated;
    })
    .catch(()=>text);
}

/* 取得內容欄位：中文版直接回傳；英文版優先用 `${key}_en`，
   若該欄位為空則自動翻譯中文內容 */
function field(item, key){
  const zh = (item && item[key]) || '';
  if(SITE_LANG !== 'en') return Promise.resolve(zh);
  const en = item && item[key + '_en'];
  if(en) return Promise.resolve(en);
  return translateText(zh);
}

/* 固定 UI 文字（分類標籤、可信度等）中英對照 */
const UI_DICT = {
  '學會公告':'Society Announcements',
  '活動預告':'Upcoming Events',
  '國際動態':'International News',
  '研究報告':'Research Reports',
  '媒體報導':'Media Coverage',
  '高可信度':'High Credibility',
  '中可信度':'Medium Credibility',
  '待確認':'Unverified',
  '人':' people',
  '/ 年':'/ year',
  '聯絡我們':'Contact Us',
};
function ui(zh){ return SITE_LANG === 'en' ? (UI_DICT[zh] || zh) : zh; }

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
    ? `style="background-image:url('${item.image}');background-size:cover;background-position:center;background-repeat:no-repeat;"`
    : '';
  const phClass = (item) => item && item.image
    ? 'ph'
    : `ph ${item && item.background ? item.background : 'ph-grid'}`;

  const [hero, about, stats, news, cases, membership, settings] = await Promise.all([
    fetchJson('/content/hero.json'),
    fetchJson('/content/about.json'),
    fetchJson('/content/stats.json'),
    fetchJson('/content/news.json'),
    fetchJson('/content/cases.json'),
    fetchJson('/content/membership.json'),
    fetchJson('/content/settings.json'),
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
      heroSection.style.backgroundImage = `url('${hero.image}')`;
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
      aboutImg.style.backgroundImage = `url('${about.image}')`;
      aboutImg.style.backgroundSize = 'cover';
      aboutImg.style.backgroundPosition = 'center';
    }
  }

  /* ---- Stats ---- */
  if(stats){
    const map = [
      ['stat-members','members','stat-members-label','memberLabel'],
      ['stat-cases','cases','stat-cases-label','caseLabel'],
      ['stat-years','years','stat-years-label','yearLabel'],
      ['stat-partners','partners','stat-partners-label','partnerLabel'],
    ];
    for(const [numId, numKey, labelId, labelKey] of map){
      const el = document.getElementById(numId);
      el.dataset.target = stats[numKey] || 0;
      el.textContent = '0';
      document.getElementById(labelId).textContent = await field(stats, labelKey);
      counterObs.observe(el);
    }
  }

  /* ---- News ---- */
  if(news && Array.isArray(news.items)){
    const grid = document.getElementById('news-grid');
    const featured = news.items.find(n=>n.featured) || news.items[0];
    const rest = news.items.filter(n=>n!==featured).slice(0,4);
    const tagClass = (cat) => (cat==='國際動態' || cat==='媒體報導') ? 'tag-red' : 'tag-blue';
    window.__newsData = [];
    const card = async (item, i) => {
      const [title, summary] = await Promise.all([field(item,'title'), field(item,'summary')]);
      window.__newsData[i] = {item, title, summary};
      return `
      <a class="news-card" href="#" onclick="openNewsModal(${i});return false;">
        <div class="${phClass(item)}" ${ph(item)}><span class="tag ${tagClass(item.category)}">${ui(item.category)||''}</span></div>
        <div class="news-date">${item.date||''}</div>
        <h3>${title||''}</h3>
        <p>${summary||''}</p>
      </a>`;
    };
    const cards = await Promise.all([featured, ...rest].filter(Boolean).map((item,i)=>card(item,i)));
    grid.innerHTML = cards.join('');
  }

  /* ---- Cases ---- */
  if(cases && Array.isArray(cases.items)){
    const grid = document.getElementById('cases-grid');
    const credLabel = { high:'高可信度', mid:'中可信度', low:'待確認' };
    const credCls = { high:'tag-red', mid:'tag-blue', low:'tag-blue' };
    const cardsHtml = await Promise.all(cases.items.map(async item=>{
      const labelZh = credLabel[item.credibility] || credLabel.low;
      const cls = credCls[item.credibility] || credCls.low;
      const [title, summary, location] = await Promise.all([field(item,'title'), field(item,'summary'), field(item,'location')]);
      return `
      <div class="case-card">
        <div class="${phClass(item)}" ${ph(item)}><span class="tag ${cls}">${ui(labelZh)}</span></div>
        <div class="case-body">
          <h3>${title||''}</h3>
          <p>${summary||''}</p>
          <div class="case-meta"><span>${item.date||''}</span><span>${location||''}</span><span>${item.witnesses||1}${ui('人')}</span></div>
        </div>
      </div>`;
    }));
    grid.innerHTML = cardsHtml.join('');
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
  const y = t.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: Math.max(0, y), behavior });
}

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const hash = a.getAttribute('href');
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

/* ---- Tab filter ---- */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
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
  fetch('/', { method:'POST', body:data })
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
