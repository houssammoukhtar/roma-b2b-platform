
/* ROMA_BRAND_LOGO_FILTER_V2: lightweight logo-based navigation; reuses official catalog brand GET filters. */
(()=>{'use strict';
const logos={"sante":"https://cdn.salla.sa/pQdzXB/psgD2X2p87r7GVkRS6MTatwdpJ2NrmcWXh09opxi.png","konn":"/business/assets/konn-wordmark.svg?v=20261105-b1","oggi":"https://cdn.salla.sa/pQdzXB/bJ7kFMklLfhj4zM2yhqaDpkIS4oyPVuMgizuPqqQ.jpg","holy":"https://cdn.salla.sa/pQdzXB/ylHeTXpeD1ADvRuoxrEZiERffIfYERPwfACH1THh.jpg","ponca":"https://cdn.salla.sa/pQdzXB/aqoLUXzN7zjYBup0bELdsLUtgZAkKlFhzywC9wv4.png","yummy":"https://cdn.salla.sa/pQdzXB/R3bpnCiW8NnLsncTA5Qu4BPB6uqmzgq0aKv7h5NE.jpg","roma":"/assets.7903/branding/roma-group-logo.png"};
const t={ar:['تصفّح العلامات التجارية','اختر البراند لعرض منتجاته'],en:['Browse brands','Tap a logo to filter'],fr:['Parcourir les marques','Choisissez une marque'],de:['Marken entdecken','Marke auswählen'],es:['Explorar marcas','Elige una marca'],ur:['برانڈ منتخب کریں','ایک برانڈ منتخب کریں']};
function mount(){
 const form=document.querySelector('.site-shell .filters form'),filter=form?.closest('.filters');
 const select=form?.querySelector('select[name="brand"]');
 if(!form||!filter||!select||document.getElementById('roma-brand-filter'))return;
 const lang=(document.documentElement.lang||'ar').toLowerCase(),copy=t[lang]||t.en;
 const linkCss=document.createElement('link');linkCss.rel='stylesheet';linkCss.href='/business/assets/roma-brand-filter.css?v=20261105-b2';document.head.appendChild(linkCss);
 const nav=document.createElement('nav');nav.id='roma-brand-filter';nav.className='roma-brand-filter';nav.setAttribute('aria-label',copy[0]);
 const head=document.createElement('div');head.className='rbf-header';const title=document.createElement('strong');title.textContent=copy[0];const hint=document.createElement('small');hint.textContent=copy[1];head.append(title,hint);
 const list=document.createElement('div');list.className='rbf-list';
 const current=select.value||new URL(location.href).searchParams.get('brand')||'';
 for(const opt of select.options){
  const code=opt.value;
  if(code&&!logos[code])continue;
  const dest=new URL(location.href);
  if(code)dest.searchParams.set('brand',code);else dest.searchParams.delete('brand');
  dest.searchParams.delete('category');dest.searchParams.delete('page');dest.searchParams.delete('p');dest.hash='roma-brand-filter';
  const card=document.createElement('a');card.className='rbf-card';card.href=dest.pathname+dest.search+dest.hash;card.setAttribute('aria-label',opt.textContent.trim());
  if(code===current)card.setAttribute('aria-current','page');
  const graphic=document.createElement('span');graphic.className='rbf-image';
  if(code){
   const img=document.createElement('img');img.src=logos[code];img.loading='lazy';img.decoding='async';img.alt=opt.textContent.trim();
   img.addEventListener('error',()=>{graphic.textContent=opt.textContent.trim();graphic.style.fontWeight='800';},{once:true});graphic.appendChild(img);
  }else{
   const grid=document.createElement('span');grid.className='rbf-all';for(let i=0;i<4;i++)grid.appendChild(document.createElement('i'));graphic.appendChild(grid);
  }
  const label=document.createElement('span');label.className='rbf-caption';label.textContent=opt.textContent.trim();card.append(graphic,label);list.appendChild(card);
 }
 nav.append(head,list);form.insertAdjacentElement('afterend',nav);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
