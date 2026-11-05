/* ROMA_B2B_KONN_GLASS_20261105
 * Read-only presentation of five verified KONN Salla glass-carton products.
 * Catalog source and existing B2B application / orders remain unchanged.
 */
(()=>{'use strict';
const SOURCE='/business/assets/konn-glass-products.json?v=20261105-g1';
const STYLE='/business/assets/konn-glass.css?v=20261105-g1';
const detailUrl=(slug,lang)=>'/business/konn-glass.html?variant='+encodeURIComponent(slug)+'&lang='+encodeURIComponent(lang);
const isArabic=lang=>(lang||'ar').toLowerCase()==='ar';
const alt=(p,lang)=>isArabic(lang)?p.name_ar:p.name_en;
const copy=(p,lang)=>isArabic(lang)?p.description_ar:p.description_en;
const plain=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const normalized=s=>String(s||'').trim().toLowerCase().normalize('NFKC').replace(/[\u064b-\u065f\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه');
const langForPage=()=>new URLSearchParams(location.search).get('lang')||document.documentElement.lang||'ar';
function ensureStyles(){if(document.getElementById('roma-konn-glass-css'))return;const style=document.createElement('link');style.rel='stylesheet';style.id='roma-konn-glass-css';style.href=STYLE;document.head.appendChild(style);}
function labels(lang){
if(isArabic(lang))return{
overline:'تشكيلة كُن الزجاجية · جملة',heading:'كُن شعير داكن زجاج 330 مل',desc:'خمس اختيارات من كُن في عبوات زجاجية، كل اختيار كرتون 24 زجاجة. تعرّف على النكهات واختر ما يناسب نشاطك التجاري.',
browse:'عرض كتالوج كُن',business:'فتح حساب أعمال',glass:'زجاج 330 مل',perCarton:'كرتون 24 عبوة',prices:'سعر الجملة بعد اعتماد الحساب',details:'تفاصيل المنتج',original:'كلاسيك وقهوة وكراميل وفانيليا ومنوّع',feature:'منتجات كُن الزجاجية',status:'التوفر والسعر حسب اتفاق التوريد',note:'التوفر يؤكد عند تقديم الطلب',pack:'24 زجاجة / كرتون',volume:'330 مل / زجاجة',brand:'مشروبات شعير كُن',flavors:'اكتشف جميع نكهات كُن الزجاجية',source:'مواصفات وصور المنتجات مأخوذة من كتالوج كُن الرسمي.',goCatalog:'العودة لكتالوج الجملة',home:'الرئيسية',caption:'منتجات مناسبة لطلبات الجملة'};
return{
overline:'KONN glass collection · Wholesale',heading:'KONN Dark Malt · 330 ml Glass',desc:'Five KONN glass-bottle options, each packed in cartons of 24 bottles. Explore the flavors for your business.',
browse:'Explore KONN catalog',business:'Open business account',glass:'330 ml glass',perCarton:'24 bottles / carton',prices:'Wholesale pricing is available after account approval',details:'Product details',original:'Classic, Coffee, Caramel, Vanilla and Mixed',feature:'KONN glass collection',status:'Availability and pricing are confirmed with your supply agreement',note:'Availability confirmed per order',pack:'24 bottles / carton',volume:'330 ml / bottle',brand:'KONN dark malt drinks',flavors:'Explore all glass flavors',source:'Product information and photography sourced from the official KONN catalog.',goCatalog:'Back to wholesale catalog',home:'Home',caption:'For wholesale supply inquiries'};
}
function makeImage(src,altText){
const img=document.createElement('img');img.src=src;img.alt=altText;img.loading='lazy';img.decoding='async';
img.addEventListener('error',()=>{if(!img.dataset.fallback){img.dataset.fallback='1';img.src='/business/assets/photo-pending.svg';}},{once:true});
return img;
}
function makeFeatureCard(p,lang,t){
const article=document.createElement('article');article.className='rgk-card';
const figure=document.createElement('a');figure.className='rgk-card-image';figure.href=detailUrl(p.slug,lang);
figure.appendChild(makeImage(p.image,alt(p,lang)));
const chip=document.createElement('span');chip.className='rgk-card-chip';chip.textContent=t.glass;figure.appendChild(chip);
const content=document.createElement('div');content.className='rgk-card-content';
const kicker=document.createElement('div');kicker.className='rgk-card-kicker';kicker.textContent='KONN · 24 × 330 ml';
const title=document.createElement('h3');title.className='rgk-card-title';const name=document.createElement('a');name.href=detailUrl(p.slug,lang);name.textContent=alt(p,lang);title.appendChild(name);
const note=document.createElement('p');note.className='rgk-card-note';note.textContent=t.note;
const bottom=document.createElement('div');bottom.className='rgk-card-bottom';const price=document.createElement('span');price.textContent=t.prices;
const more=document.createElement('a');more.href=detailUrl(p.slug,lang);more.textContent='↗';more.setAttribute('aria-label',t.details+': '+alt(p,lang));bottom.append(price,more);
content.append(kicker,title,note,bottom);article.append(figure,content);return article;
}
function mountHomepage(products,lang){
const brands=document.querySelector('section.brands-section#brands');
if(!brands||document.getElementById('konn-glass-showcase'))return;
ensureStyles();const t=labels(lang),sec=document.createElement('section');sec.className='rgk-feature';sec.id='konn-glass-showcase';sec.setAttribute('aria-label',t.feature);
const wrap=document.createElement('div');wrap.className='rgk-wrap';
const eyebrow=document.createElement('span');eyebrow.className='rgk-overline';eyebrow.textContent=t.overline;
const top=document.createElement('div');top.className='rgk-heading';
const intro=document.createElement('div');const title=document.createElement('h2');title.textContent=t.heading;const description=document.createElement('p');description.textContent=t.desc;intro.append(title,description);
const actions=document.createElement('div');actions.className='rgk-actions';
const catalog=document.createElement('a');catalog.className='rgk-link';catalog.href='/'+(isArabic(lang)?'ar':'en')+'/catalog?brand=konn&category=malt#roma-brand-filter';catalog.textContent=t.browse+' ←';
const apply=document.createElement('a');apply.className='rgk-link rgk-link-ghost';apply.href='/business/apply.html?lang='+encodeURIComponent(lang);apply.textContent=t.business;
actions.append(catalog,apply);top.append(intro,actions);
const grid=document.createElement('div');grid.className='rgk-product-grid';products.forEach(p=>grid.appendChild(makeFeatureCard(p,lang,t)));
const banner=document.createElement('div');banner.className='rgk-banner';
const btext=document.createElement('div'),strong=document.createElement('strong'),sub=document.createElement('span');
strong.textContent=t.original;sub.textContent=t.status;btext.append(strong,sub);
const browselink=document.createElement('a');browselink.href='/'+(isArabic(lang)?'ar':'en')+'/catalog?brand=konn#roma-brand-filter';browselink.textContent=t.browse;
banner.append(btext,browselink);wrap.append(eyebrow,top,grid,banner);sec.appendChild(wrap);brands.insertAdjacentElement('afterend',sec);
}
function catalogCard(p,lang,t){
const item=document.createElement('article');item.className='p-card reveal shown rgk-b2b-catalog-card';item.dataset.brand='konn';item.dataset.category='malt';
const figure=document.createElement('a');figure.className='p-media';figure.href=detailUrl(p.slug,lang);figure.setAttribute('aria-label',alt(p,lang));
const pill=document.createElement('span');pill.className='pack-pill';pill.textContent=t.pack;figure.append(pill,makeImage(p.image,alt(p,lang)));
const body=document.createElement('div');body.className='p-copy';
const micro=document.createElement('p');micro.className='micro';micro.textContent=t.brand+' · '+t.glass;
const h=document.createElement('h3'),link=document.createElement('a');link.href=detailUrl(p.slug,lang);link.textContent=alt(p,lang);h.appendChild(link);
const note=document.createElement('p');note.className='p-note';note.textContent=t.note;
const bottom=document.createElement('div');bottom.className='p-bottom';
const info=document.createElement('span');info.textContent=t.prices;
const go=document.createElement('a');go.className='round-btn';go.href=detailUrl(p.slug,lang);go.textContent='↗';go.setAttribute('aria-label',t.details+': '+alt(p,lang));
bottom.append(info,go);body.append(micro,h,note,bottom);item.append(figure,body);return item;
}
function mountCatalog(products,lang){
const grid=document.querySelector('.site-shell .product-grid'),filters=document.querySelector('.site-shell .filters form');
if(!grid||!filters||document.querySelector('.rgk-b2b-catalog-card')||!location.pathname.includes('/catalog'))return;
const query=new URLSearchParams(location.search);
const brand=query.get('brand')||'',category=query.get('category')||'',search=query.get('q')||'';
if((brand&&brand!=='konn')||(category&&category!=='malt'))return;
const needle=normalized(search),matching=products.filter(p=>!needle||normalized(p.name_ar+' '+p.name_en+' كُن konn شعير زجاج 330 glass dark malt').includes(needle));
if(!matching.length)return;ensureStyles();
const t=labels(lang);for(let i=matching.length-1;i>=0;i--)grid.prepend(catalogCard(matching[i],lang,t));
const count=document.querySelector('.site-shell .results-count');if(count&&!count.dataset.konnGlassUpdated){count.dataset.konnGlassUpdated='1';count.textContent=count.textContent.replace(/(\d+)\s*\/\s*(\d+)/,(full,c,total)=>String(+c+matching.length)+' / '+String(+total+products.length));}
}
function detail(products,lang){
const root=document.getElementById('rgk-detail-root');if(!root||root.dataset.rendered)return;
ensureStyles();root.dataset.rendered='1';const t=labels(lang);
const params=new URLSearchParams(location.search),variant=params.get('variant')||'mixed';const item=products.find(p=>p.slug===variant)||products[0];
document.documentElement.lang=isArabic(lang)?'ar':'en';document.documentElement.dir=isArabic(lang)?'rtl':'ltr';
document.title=alt(item,lang)+' | Roma B2B';
const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=copy(item,lang);
const main=document.createElement('main');main.className='rgk-detail';
const bar=document.createElement('div');bar.className='rgk-detail-bar';
const nav=document.createElement('div');nav.className='rgk-detail-bar-inner';
const brand=document.createElement('a');brand.className='rgk-detail-brand';brand.href='/';
const romaLogo=makeImage('/assets.7903/branding/roma-group-logo.png','Roma Group');brand.appendChild(romaLogo);
const span=document.createElement('span');span.textContent='B2B / KONN';brand.appendChild(span);
const barActions=document.createElement('div');barActions.className='rgk-detail-bar-actions';
const goCatalog=document.createElement('a');goCatalog.href='/'+(isArabic(lang)?'ar':'en')+'/catalog?brand=konn';goCatalog.textContent=t.goCatalog;
const register=document.createElement('a');register.href='/business/apply.html?lang='+encodeURIComponent(lang);register.textContent=t.business;
barActions.append(goCatalog,register);nav.append(brand,barActions);bar.appendChild(nav);
const container=document.createElement('div');container.className='rgk-detail-main';
const breadcrumb=document.createElement('div');breadcrumb.className='rgk-breadcrumb';
const homeLink=document.createElement('a');homeLink.href='/';homeLink.textContent=t.home;
const catalogLink=document.createElement('a');catalogLink.href=goCatalog.href;catalogLink.textContent=t.browse;
const crumb=document.createElement('span');crumb.textContent=alt(item,lang);
breadcrumb.append(homeLink,' / ',catalogLink,' / ',crumb);
const detailCard=document.createElement('div');detailCard.className='rgk-product-detail-grid';
const media=document.createElement('div');media.className='rgk-detail-media';const photo=makeImage(item.detail_image||item.image,alt(item,lang));photo.loading='eager';media.appendChild(photo);
const body=document.createElement('div');body.className='rgk-detail-copy';
const over=document.createElement('span');over.className='rgk-overline';over.textContent=t.overline;
const h=document.createElement('h1');h.textContent=alt(item,lang);
const d=document.createElement('p');d.textContent=copy(item,lang);
const specs=document.createElement('div');specs.className='rgk-specs';for(const spec of [t.glass,t.pack,t.volume]){const tag=document.createElement('span');tag.textContent=spec;specs.appendChild(tag);}
const pricing=document.createElement('p');pricing.className='rgk-detail-price';pricing.textContent=t.prices+' · '+t.note;
const callToAction=document.createElement('div');callToAction.className='rgk-actions';
const apply=document.createElement('a');apply.className='rgk-link';apply.href=register.href;apply.textContent=t.business+' ←';
const back=document.createElement('a');back.className='rgk-link rgk-link-ghost';back.href=goCatalog.href;back.textContent=t.goCatalog;
callToAction.append(apply,back);body.append(over,h,d,specs,pricing,callToAction);detailCard.append(media,body);
const flavors=document.createElement('div');flavors.className='rgk-flavors';const caption=document.createElement('h2');caption.textContent=t.flavors;
const links=document.createElement('div');links.className='rgk-flavor-grid';
products.forEach(p=>{const a=document.createElement('a');a.className='rgk-flavor';a.href=detailUrl(p.slug,lang);if(p.slug===item.slug)a.setAttribute('aria-current','page');a.append(makeImage(p.image,alt(p,lang)));const name=document.createElement('span');name.textContent=alt(p,lang);a.appendChild(name);links.appendChild(a);});
flavors.append(caption,links);
const info=document.createElement('p');info.className='rgk-footnote';info.textContent=t.source;container.append(breadcrumb,detailCard,flavors,info);
main.append(bar,container);root.appendChild(main);
}
async function boot(){
const wantsHome=!!document.querySelector('section.brands-section#brands');
const wantsCatalog=!!document.querySelector('.site-shell .product-grid')&&location.pathname.includes('/catalog');
const wantsDetail=!!document.getElementById('rgk-detail-root');
if(!wantsHome&&!wantsCatalog&&!wantsDetail)return;
try{
const res=await fetch(SOURCE,{credentials:'same-origin',cache:'no-cache'});
if(!res.ok)throw new Error('Product catalog unavailable');
const data=await res.json();
if(!Array.isArray(data.products)||data.products.length!==5)throw new Error('Unexpected KONN product data');
const lang=langForPage();
if(wantsHome)mountHomepage(data.products,lang);
if(wantsCatalog)mountCatalog(data.products,lang);
if(wantsDetail)detail(data.products,lang);
}catch(err){console.warn('[Roma KONN Glass]',err);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
