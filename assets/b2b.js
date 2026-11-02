
(()=>{
'use strict';
const root=document.documentElement;
let lang=new URLSearchParams(window.location.search).get('lang')==='en'?'en':'ar';
const $=(sel,ctx=document)=>ctx.querySelector(sel), $$=(sel,ctx=document)=>Array.from(ctx.querySelectorAll(sel));
const base=window.location.pathname.split('/').filter(Boolean)[0]||'roma-b2b-preview';
const localUrl=(path)=>{const u=new URL(path,window.location.href);u.searchParams.set('lang',lang);return u.pathname+u.search+u.hash;};
const safeLang=()=>lang==='ar'?'ar':'en';
const toastText=(ar,en)=>lang==='ar'?ar:en;
function translate(){
root.lang=lang;root.dir=lang==='ar'?'rtl':'ltr';
$$('[data-ar][data-en]').forEach(el=>{el.textContent=el.dataset[safeLang()];});
$$('[data-placeholder-ar][data-placeholder-en]').forEach(el=>{el.placeholder=el.dataset['placeholder'+(lang==='ar'?'Ar':'En')];});
$$('[data-lang-link]').forEach(el=>{const u=new URL(el.getAttribute('data-lang-link'),location.href);if(!el.hasAttribute('data-no-query'))u.searchParams.set('lang',lang);el.href=u.pathname+u.search+u.hash;});
$$('[data-portal-link]').forEach(el=>el.href='/portal.php?lang='+lang+'#login');
$$('[data-lang-button]').forEach(el=>el.textContent=lang==='ar'?'EN':'عربي');
document.title=location.pathname.includes('apply')?(lang==='ar'?'طلب فتح حساب أعمال | مجموعة روما التجارية':'Apply for a business account | Roma Group'):(lang==='ar'?'روما للأعمال | حلول التوريد والشراكات التجارية':'Roma for Business | Wholesale and supply solutions');
}
$$('[data-lang-button]').forEach(el=>el.addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';try{sessionStorage.setItem('roma-b2b-lang',lang);}catch{} translate();updateStep&&updateStep();}));
if(!new URLSearchParams(location.search).has('lang')){try{const saved=sessionStorage.getItem('roma-b2b-lang');if(saved==='ar'||saved==='en')lang=saved;}catch{}}
const menu=$('[data-menu-button]');if(menu){menu.addEventListener('click',()=>{const nav=$('[data-main-links]');if(!nav)return;const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');});$$('[data-main-links] a').forEach(a=>a.addEventListener('click',()=>{$('[data-main-links]').classList.remove('open');menu.setAttribute('aria-expanded','false');}));}
$$('img[data-fallback-hide]').forEach(img=>img.addEventListener('error',()=>img.classList.add('hide')));
if('IntersectionObserver' in window&& !matchMedia('(prefers-reduced-motion: reduce)').matches){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');io.unobserve(e.target);}}),{threshold:.09});$$('[data-reveal]').forEach(el=>io.observe(el));}else{$$('[data-reveal]').forEach(el=>el.classList.add('revealed'));}
const form=$('#businessApplication');
let updateStep=null;
if(form){
const sections=$$('[data-app-step]',form),dots=$$('[data-progress] span'),stepTitle=$('#appStepNumber'),next=$('#appNext'),back=$('#appBack'),submit=$('#appSubmit'),status=$('#appStatus');
let step=0,busy=false;
function msg(ar,en,error=true){status.textContent=lang==='ar'?ar:en;status.className=(ar||en)?'app-status visible '+(error?'error':'ok'):'app-status';}
function resetStatus(){status.textContent='';status.className='app-status';}
function currentFields(){return $$('input,select,textarea',sections[step]);}
function checkStep(n){
const fields=$$('input,select,textarea',sections[n]);
for(const field of fields){
field.classList.remove('is-invalid');
if(field.name==='vat'&&!field.value.trim())continue;
if(field.name==='phone'){field.value=field.value.replace(/[\u0660-\u0669]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[\u06f0-\u06f9]/g,c=>String(c.charCodeAt(0)-1776));}
if(!field.checkValidity()){field.classList.add('is-invalid');field.focus();field.reportValidity();return false;}
}
if(n===3&&$('#password').value!==$('#confirmPassword').value){msg('تأكيد كلمة المرور غير مطابق.','The passwords do not match.');$('#confirmPassword').focus();return false;}
return true;
}
function updateReview(){
const map=[['reviewCompany','company'],['reviewSector','sector'],['reviewRegistration','registration'],['reviewVat','vat'],['reviewAddress','address'],['reviewName','name'],['reviewEmail','email'],['reviewPhone','phone']];
map.forEach(([target,name])=>{const el=$('#'+target),field=form.elements.namedItem(name);if(!el||!field)return;let value=field.value||'—';if(name==='sector'){value=field.selectedOptions[0]?.textContent||value;}el.textContent=value;});
}
updateStep=()=>{
sections.forEach((s,i)=>{s.hidden=i!==step;});dots.forEach((d,i)=>d.classList.toggle('active',i<=step));stepTitle.textContent=(step+1)+' / '+sections.length;
back.hidden=step===0;next.hidden=step===sections.length-1;submit.hidden=step!==sections.length-1;resetStatus();
if(step===3)updateReview();
};
next.addEventListener('click',()=>{resetStatus();if(checkStep(step)){step++;updateStep();$('.app-card')?.scrollIntoView({behavior:'smooth',block:'start'});}});
back.addEventListener('click',()=>{if(step===0)return;step--;updateStep();});
$$('input,select,textarea',form).forEach(el=>el.addEventListener('input',()=>{el.classList.remove('is-invalid');if(status.classList.contains('error'))resetStatus();}));
const toggle=$('[data-show-pass]');if(toggle){toggle.addEventListener('click',()=>{const show=$('#password').type==='password';$('#password').type=show?'text':'password';$('#confirmPassword').type=show?'text':'password';toggle.textContent=lang==='ar'?(show?'إخفاء كلمة المرور':'إظهار كلمة المرور'):(show?'Hide passwords':'Show passwords');});}
form.addEventListener('submit',async(e)=>{
e.preventDefault();if(busy)return;
for(let i=0;i<sections.length;i++){if(!checkStep(i)){step=i;updateStep();checkStep(i);return;}}
busy=true;submit.disabled=true;submit.textContent=toastText('جاري إرسال الطلب…','Submitting…');
try{
const stateResponse=await fetch('/api.php?action=state',{method:'GET',cache:'no-store',credentials:'same-origin',headers:{'Accept':'application/json'}});
let state={};try{state=await stateResponse.json()}catch{}
if(!stateResponse.ok||!state.csrf)throw new Error('state_unavailable');
if(state.installed===false)throw new Error('not_installed');
const data={};
['name','company','email','phone','city','address','registration','vat','sector','password'].forEach(n=>{data[n]=form.elements.namedItem(n)?.value?.trim()||'';});
data.consent=$('#consent').checked;
const res=await fetch('/api.php?action=register',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','X-CSRF-Token':state.csrf,'Accept':'application/json'},body:JSON.stringify(data)});
let out={};try{out=await res.json()}catch{}
if(!res.ok||out.ok===false){
const k=out.error||'server_error';
const translations={
 email_exists:['البريد الإلكتروني مستخدم بالفعل. سجل الدخول إلى حسابك الحالي.','This email is already registered. Please sign in.'],
 rate_limited:['عدد المحاولات كبير. أعد المحاولة بعد قليل.','Too many attempts. Please try again later.'],
 consent_required:['يرجى الموافقة على سياسة الخصوصية.','Please accept the privacy policy.'],
 csrf_failed:['انتهت صلاحية الجلسة. أعد المحاولة.','Your session has expired. Please retry.'],
 invalid_email:['البريد الإلكتروني غير صحيح.','Please use a valid email address.'],
 server_error:['تعذّر إرسال الطلب حاليًا. حاول مرة أخرى.','We could not submit your request. Please try again.'],
 not_installed:['خدمة الحسابات غير مهيأة. تواصل مع فريق روما.','Account services are currently unavailable.']
};
const tr=translations[k]||translations.server_error;throw new Error(lang==='ar'?tr[0]:tr[1]);
}
form.hidden=true;$('.app-progress')?.setAttribute('hidden','hidden');$('.app-title')?.setAttribute('hidden','hidden');$('.app-note')?.setAttribute('hidden','hidden');
const done=$('#appDone');done.hidden=false;done.querySelector('[data-success-company]').textContent=data.company;done.querySelector('[data-portal-link]').href='/portal.php?lang='+lang+'#portal';
window.scrollTo({top:0,behavior:'smooth'});
}catch(err){const key=err.message;
if(key==='state_unavailable')msg('لا يمكن الاتصال بخدمة التسجيل حاليًا. حاول لاحقًا.','The registration service is temporarily unavailable.');
else if(key==='not_installed')msg('خدمة الحسابات غير مهيأة بعد.','Account services are not yet configured.');
else msg(key||'تعذر إرسال الطلب.',key||'Could not submit your application.');
}finally{busy=false;submit.disabled=false;submit.textContent=toastText('إرسال طلب فتح الحساب','Submit application');}
});
updateStep();
}
translate();
})();
