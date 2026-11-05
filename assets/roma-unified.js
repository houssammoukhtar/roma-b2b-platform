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

/* ROMA_BRAND_FILTER_LOADER_V2: replace prior category icons with brand marks. */
(()=>{const s=document.createElement('script');s.src='/business/assets/roma-brand-filter.js?v=20261105-b2';s.defer=true;document.head.appendChild(s);})();

/* Align the legacy root homepage KONN brand tile with the supplied official logo. */
(()=>{function fixKonn(){document.querySelectorAll('.brand-logo-card.brand-konn img').forEach(img=>{const src=img.getAttribute('src')||'';if(!src.includes('konn-logo.png')){img.src='/assets.7903/brands/konn-logo.png?v=20261105-correct';img.alt='KONN';img.style.cssText='width:min(100%,150px);height:68px;object-fit:contain;mix-blend-mode:normal';}});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fixKonn,{once:true});else fixKonn();})();
