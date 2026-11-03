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
})();
