(()=>{'use strict';
/* Legacy app visual compatibility: do not alter account, order or catalog data. */
const LOGO='/assets.7903/branding/roma-group-logo.png';
const ICON='/assets.7903/branding/roma-r-64.png';
let busy=false;
function enhance(){
 if(busy)return;busy=true;
 try{
  document.querySelectorAll('img').forEach(img=>{
   const src=img.getAttribute('src')||'';
   if(src.startsWith('/assets/branding/roma-group-logo.png')&&src!==LOGO){img.src=LOGO;img.style.objectFit='contain';}
   if(img.classList.contains('roma-logo-full'))img.decoding='async';
  });
  const heading=document.querySelector('.site-shell .site-header,.roma-website-header');
  if(heading)heading.classList.add('roma-unified-header');
  document.querySelectorAll('.site-shell .site-logo,.roma-website-logo').forEach(x=>{if(x.getAttribute('href')==='/ar/')x.href='/';});
  document.querySelectorAll('.site-shell .main-nav a,.roma-website-nav a').forEach(a=>{
   if(a.getAttribute('href')==='/ar/')a.href='/';
  });
  document.querySelectorAll('a').forEach(a=>{
   const href=a.getAttribute('href')||'';
   if(href==='#register'||/^\/portal\.php(?:\?[^#]*)?#register$/i.test(href)){
     const lang=document.documentElement.lang||'ar';
     a.setAttribute('href','/business/apply.html?lang='+encodeURIComponent(lang));
     a.dataset.romaUnifiedRegister='1';
   }
  });
  document.querySelectorAll('.site-shell .p-media img').forEach(img=>{
   if(!img.dataset.romaImageFallback){img.dataset.romaImageFallback='1';img.addEventListener('error',()=>{
     if(!img.src.includes('photo-pending.svg')){img.src='/assets/photo-pending.svg';img.alt=(img.alt||'')+' — الصورة قيد التحديث';}
   },{once:true});}
  });
 }finally{busy=false;}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
/* React-rendered existing customer portal may replace its header after bootstrap. */
let raf=0;const observer=new MutationObserver(records=>{
 if(!records.some(r=>r.addedNodes.length>0))return;
 if(raf)return;raf=requestAnimationFrame(()=>{raf=0;enhance();});
});observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('pageshow',enhance);
document.addEventListener('click',e=>{
 const link=e.target.closest?.('a[data-roma-unified-register]');
 if(!link)return;
 e.preventDefault();e.stopImmediatePropagation();
 window.location.assign(link.href);
},true);
})();
/* ROMA_CATEGORY_ICONS_V1: one-tap, locale-aware catalog category navigation.
   Uses the catalog's existing select options and GET filter routes; no backend changes. */
(()=>{'use strict';
const svgPaths={
  'all':'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  'glass-juice':'<path d="M9 3h6v4l-1.5 2.5V20a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V9.5L9 7z"/><path d="M8 13h8M9 6h6"/>',
  'combi-juice':'<path d="m5 8 7-4 7 4v12H5z"/><path d="M5 8h14M12 4v16M16 6l3-3h2"/>',
  'oggi-juice':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 3v7m0 4v7m-9-9h7m4 0h7M5.6 5.6l5 5m2.8 2.8 5 5m0-12.8-5 5m-2.8 2.8-5 5"/>',
  'malt':'<rect x="7" y="4" width="10" height="17" rx="2"/><path d="M7 7h10M7 17h10M10 4V2h4v2"/>',
  'sauces':'<path d="M10 3h4v4l3 3v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9l3-3z"/><path d="M9 12h6v5H9z"/>',
  'pickles':'<path d="M7 7h10v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1zM6 4h12v3H6z"/><path d="M10 11c-1 1-1 3 1 4m3-5c-1 1-1 3 1 4"/>',
  'frozen':'<path d="M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10"/><path d="m9 5 3 3 3-3m-6 14 3-3 3 3M4.5 11l4 1-1 4m12-5-4 1 1 4"/>',
  'snacks':'<path d="M6 5h12l2 15H4z"/><path d="M8 5V3h8v2M9 11c2-2 4-2 6 0m-6 4c2 2 4 2 6 0"/>',
  'breakfast':'<path d="M7 4h10a5 5 0 0 1 4 8l-2 8H5l-2-8a5 5 0 0 1 4-8z"/><path d="M8 14c2 2 6 2 8 0"/>',
  'canned':'<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v14c0 4 14 4 14 0V5M5 19c0-4 14-4 14 0"/><path d="M8 11h8v5H8z"/>',
  'foodservice':'<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M16 3c-3 2-4 6-4 9h5v9M17 3v18"/>'
};
const shortLabels={
 ar:{all:'كل المنتجات','glass-juice':'سانتي زجاج','combi-juice':'المصاص والكومبي','oggi-juice':'عصائر أوجي',malt:'مشروبات كُن',sauces:'الصوصات',pickles:'المخللات',frozen:'المجمدات',snacks:'السناكات',breakfast:'الفطور',canned:'المعلبات',foodservice:'المطاعم والمقاهي'},
 en:{all:'All products','glass-juice':'Santé glass','combi-juice':'Combi juice','oggi-juice':'OGGI juices',malt:'KONN malt',sauces:'Sauces',pickles:'Pickles',frozen:'Frozen food',snacks:'Snacks',breakfast:'Breakfast',canned:'Canned goods',foodservice:'Foodservice'}
};
const titles={
 ar:['تصفّح التصنيفات','اختَر القسم لعرض منتجاته مباشرة'],
 en:['Browse categories','Choose a category to view its products'],
 fr:['Parcourir les catégories','Choisissez une catégorie'],
 de:['Kategorien entdecken','Kategorie auswählen'],
 es:['Explorar categorías','Elige una categoría'],
 ur:['زمرے دیکھیں','مصنوعات دیکھنے کے لیے زمرہ منتخب کریں']
};
const styleRules=[
 '.site-shell .filters .roma-qc{margin-top:16px;padding-top:15px;border-top:1px solid #e5eee7;min-width:0;scroll-margin-top:125px}',
 '.site-shell .filters .roma-qc-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px}',
 '.site-shell .filters .roma-qc-head strong{font-size:15px;font-weight:800;color:#164532;line-height:1.4}',
 '.site-shell .filters .roma-qc-head small{font-size:11px;font-weight:600;color:#748c7b;text-align:end}',
 '.site-shell .filters .roma-qc-track{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:8px;min-width:0}',
 '.site-shell .filters .roma-qc-item{box-sizing:border-box;min-width:0;min-height:99px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:9px;padding:10px 5px;border:1px solid #e2eee5;border-radius:13px;background:#f8fbf8;color:#345c45;text-decoration:none!important;text-align:center;transition:background .18s,border-color .18s,transform .18s;scroll-snap-align:start}',
 '.site-shell .filters .roma-qc-item:hover{transform:translateY(-2px);background:#eef8f0;border-color:#a8d9b8;color:#1b7045}',
 '.site-shell .filters .roma-qc-item[aria-current="page"]{background:#1e8050;color:white;border-color:#1e8050;box-shadow:0 5px 15px rgba(30,128,80,.15)}',
 '.site-shell .filters .roma-qc-icon{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:white;border:1px solid #e6efe7;color:#208550;flex-shrink:0}',
 '.site-shell .filters .roma-qc-item[aria-current="page"] .roma-qc-icon{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.3);color:white}',
 '.site-shell .filters .roma-qc-icon svg{display:block;width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}',
 '.site-shell .filters .roma-qc-label{font-size:11px;font-weight:800;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-width:100%;min-height:28px}',
 '.site-shell .filters .roma-qc-item:focus-visible{outline:3px solid #77c996;outline-offset:3px}',
 '@media(max-width:1250px){.site-shell .filters .roma-qc-track{display:flex;overflow-x:auto;scroll-snap-type:x proximity;overscroll-behavior-x:contain;padding-bottom:7px;scrollbar-width:thin;scrollbar-color:#b4dac0 transparent}.site-shell .filters .roma-qc-item{flex:0 0 105px}}',
 '@media(max-width:600px){.site-shell .filters .roma-qc{margin-top:13px;padding-top:13px}.site-shell .filters .roma-qc-head strong{font-size:14px}.site-shell .filters .roma-qc-head small{font-size:10px;max-width:155px}.site-shell .filters .roma-qc-item{flex-basis:98px;min-height:92px;padding:8px 5px;gap:7px}.site-shell .filters .roma-qc-icon{width:37px;height:37px}.site-shell .filters .roma-qc-label{font-size:10.5px}}',
 '@media(prefers-reduced-motion:reduce){.site-shell .filters .roma-qc-item{transition:none}}'
].join('\n');
function addIcon(slug){
 const box=document.createElement('span');box.className='roma-qc-icon';
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
 svg.innerHTML=svgPaths[slug]||svgPaths.all;box.appendChild(svg);return box;
}
function mountCategories(){
 const select=document.querySelector('.site-shell .filters form select[name="category"]');
 if(!select||document.getElementById('roma-quick-categories'))return;
 const form=select.form;
 if(!form||select.options.length<2)return;
 const lang=(document.documentElement.lang||'ar').toLowerCase();
 const labels=shortLabels[lang]||{};
 const copy=titles[lang]||titles.en;
 const section=document.createElement('nav');
 section.id='roma-quick-categories';section.className='roma-qc';section.setAttribute('aria-label',copy[0]);
 const heading=document.createElement('div');heading.className='roma-qc-head';
 const headingTitle=document.createElement('strong');headingTitle.textContent=copy[0];
 const hint=document.createElement('small');hint.textContent=copy[1];heading.append(headingTitle,hint);
 const track=document.createElement('div');track.className='roma-qc-track';
 const brand=form.querySelector('[name="brand"]');
 const search=form.querySelector('[name="q"]');
 const selected=select.value||new URLSearchParams(location.search).get('category')||'';
 Array.from(select.options).forEach(option=>{
  const slug=option.value;
  if(slug&&!Object.prototype.hasOwnProperty.call(svgPaths,slug))return;
  const url=new URL(location.href);
  if(slug)url.searchParams.set('category',slug);else url.searchParams.delete('category');
  if(brand){if(brand.value)url.searchParams.set('brand',brand.value);else url.searchParams.delete('brand');}
  if(search){if(search.value.trim())url.searchParams.set('q',search.value.trim());else url.searchParams.delete('q');}
  url.searchParams.delete('page');url.searchParams.delete('p');
  url.hash='roma-quick-categories';
  const a=document.createElement('a');a.className='roma-qc-item';a.href=url.pathname+url.search+url.hash;
  const label=labels[slug||'all']||option.textContent.trim();
  a.setAttribute('aria-label',option.textContent.trim());
  if(slug===selected)a.setAttribute('aria-current','page');
  const name=document.createElement('span');name.className='roma-qc-label';name.textContent=label;
  a.append(addIcon(slug||'all'),name);track.appendChild(a);
 });
 if(track.children.length<2)return;
 section.append(heading,track);
 const style=document.createElement('style');style.id='roma-qc-styles';style.textContent=styleRules;document.head.appendChild(style);
 form.insertAdjacentElement('afterend',section);
 if(location.hash==='#roma-quick-categories')requestAnimationFrame(()=>section.scrollIntoView({block:'start',behavior:'auto'}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountCategories,{once:true});else mountCategories();
})();
