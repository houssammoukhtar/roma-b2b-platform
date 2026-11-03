/* Roma Group B2B v3 — identity-first, locale-aware, accessible frontend. */
(()=>{"use strict";
const supported=["ar","en","fr","de","es"];
const root=document.documentElement;
const page=document.body.dataset.page||"home";
const dictionary=window.ROMA_B2B_I18N||{};
const originalMarkup=new WeakMap();
const $$=(s,base=document)=>[...base.querySelectorAll(s)];
const $=(s,base=document)=>base.querySelector(s);
for(const el of $$("[data-i18n]"))originalMarkup.set(el,el.innerHTML);
let lang=(new URLSearchParams(location.search).get("lang")||"").toLowerCase();
if(!supported.includes(lang)){try{lang=localStorage.getItem("roma_b2b_lang")||"ar"}catch{lang="ar"}}
if(!supported.includes(lang))lang="ar";
const translations=(code)=>dictionary[code]||{};
const tr=(key)=>lang==="ar"?null:(translations(lang)[key]||translations("en")?.[key]||null);
function translatedError(key){
 const messages={
 email_exists:{ar:"البريد الإلكتروني مسجل بالفعل. يمكنك تسجيل الدخول لحسابك الحالي.",en:"This email is already registered. Please sign in.",fr:"Cette adresse e-mail est déjà enregistrée. Connectez-vous.",de:"Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.",es:"Este correo ya está registrado. Inicia sesión."},
 rate_limited:{ar:"تم تجاوز عدد المحاولات المسموح. أعد المحاولة لاحقًا.",en:"Too many attempts. Please try again later.",fr:"Trop de tentatives. Réessayez plus tard.",de:"Zu viele Versuche. Bitte versuchen Sie es später erneut.",es:"Demasiados intentos. Inténtalo más tarde."},
 csrf_failed:{ar:"انتهت صلاحية الجلسة. أعد المحاولة.",en:"Session expired. Please retry.",fr:"La session a expiré. Réessayez.",de:"Die Sitzung ist abgelaufen. Bitte erneut versuchen.",es:"La sesión ha caducado. Vuelve a intentarlo."},
 invalid_email:{ar:"تحقق من البريد الإلكتروني.",en:"Please enter a valid email address.",fr:"Veuillez saisir une adresse e-mail valide.",de:"Bitte geben Sie eine gültige E-Mail-Adresse ein.",es:"Introduce un correo electrónico válido."},
 consent_required:{ar:"يرجى الموافقة على سياسة الخصوصية.",en:"Please agree to the privacy policy.",fr:"Veuillez accepter la politique de confidentialité.",de:"Bitte stimmen Sie den Datenschutzbestimmungen zu.",es:"Acepta la política de privacidad."},
 not_installed:{ar:"خدمة حسابات الأعمال غير مهيأة حاليًا.",en:"Business account service is temporarily unavailable.",fr:"Le service de comptes professionnels est momentanément indisponible.",de:"Der Geschäftskundenservice ist vorübergehend nicht verfügbar.",es:"El servicio de cuentas empresariales no está disponible temporalmente."},
 password_mismatch:{ar:"كلمتا المرور غير متطابقتين.",en:"Passwords do not match.",fr:"Les mots de passe ne correspondent pas.",de:"Die Passwörter stimmen nicht überein.",es:"Las contraseñas no coinciden."},
 state_unavailable:{ar:"تعذّر الاتصال بنظام الحسابات. حاول مرة أخرى.",en:"Unable to connect to the account service. Please retry.",fr:"Connexion au service impossible. Réessayez.",de:"Verbindung zum Kontoservice fehlgeschlagen. Bitte erneut versuchen.",es:"No se puede conectar con el servicio. Inténtalo de nuevo."},
 generic:{ar:"تعذّر إتمام الطلب حاليًا. تحقق من البيانات وحاول مرة أخرى.",en:"We could not complete your application. Please check the information and retry.",fr:"Impossible d'envoyer la demande. Vérifiez vos informations et réessayez.",de:"Der Antrag konnte nicht gesendet werden. Bitte prüfen Sie Ihre Angaben.",es:"No se pudo enviar la solicitud. Revisa los datos e inténtalo de nuevo."}
 };
 return (messages[key]||messages.generic)[lang]||messages.generic.en;
}
function applyTranslations(){
 root.lang=lang;root.dir=lang==="ar"?"rtl":"ltr";
 $$("[data-i18n]").forEach(el=>{
  const k=el.dataset.i18n;
  if(lang==="ar"){el.innerHTML=originalMarkup.get(el);return;}
  const value=tr(k);if(!value)return;
  if(value.includes("<span>")||value.includes("<em>")){el.innerHTML=value;return;}
  if(el.querySelector("svg")){const node=[...el.childNodes].find(x=>x.nodeType===Node.TEXT_NODE&&x.textContent.trim());if(node){node.textContent=value+" ";return;}}
  el.textContent=value;
 });
 $$("[data-placeholder]").forEach(el=>{
  if(!el.dataset.arPlaceholder)el.dataset.arPlaceholder=el.placeholder;
  el.placeholder=lang==="ar"?el.dataset.arPlaceholder:(tr(el.dataset.placeholder)||el.dataset.arPlaceholder);
 });
 $$("[data-local-link]").forEach(a=>{
  const target=a.getAttribute("href");
  if(!target||target.startsWith("#"))return;
  const u=new URL(target,location.href);
  u.searchParams.set("lang",lang);
  a.setAttribute("href",u.pathname+u.search+u.hash);
 });
 $$("[data-portal-link]").forEach(a=>{
  const h=a.getAttribute("href")?.split("#")[1]||"login";
  a.href="/portal.php?lang="+lang+"#"+h;
 });
 $$("a[href$='/catalog'],[data-catalog-link]").forEach(a=>a.href="/"+lang+"/catalog");
 $$("a[href$='/privacy'],a[href$='/terms']").forEach(a=>{
  const suffix=a.getAttribute("href").endsWith("privacy")?"privacy":"terms";
  a.href="/"+lang+"/"+suffix;
 });
 const selector=$("#langSelect");if(selector)selector.value=lang;
 const name={ar:page==="apply"?"طلب فتح حساب أعمال | مجموعة روما التجارية":"روما للأعمال | مجموعة روما التجارية",en:page==="apply"?"Business Account Application | Roma Trading Group":"Roma Group | Business & Wholesale",fr:page==="apply"?"Ouverture de compte pro | Roma Trading Group":"Roma Group | Vente aux professionnels",de:page==="apply"?"Geschäftskonto beantragen | Roma Trading Group":"Roma Group | Großhandel & B2B",es:page==="apply"?"Solicitar cuenta de empresa | Roma Trading Group":"Roma Group | Negocios y mayoristas"};
 document.title=name[lang]||name.ar;
 if(formState)formState.refreshReview();
}
let formState=null;
const selector=$("#langSelect");
if(selector)selector.addEventListener("change",e=>{
 lang=supported.includes(e.target.value)?e.target.value:"ar";
 try{localStorage.setItem("roma_b2b_lang",lang)}catch{}
 const url=new URL(location.href);url.searchParams.set("lang",lang);history.replaceState(null,"",url.pathname+url.search+url.hash);
 applyTranslations();
});
const menu=$("#mobileMenu"),toggle=$("#mobileToggle");
if(menu&&toggle){
 toggle.addEventListener("click",()=>{const opening=menu.hidden;menu.hidden=!opening;toggle.setAttribute("aria-expanded",String(opening));});
 $$("a",menu).forEach(a=>a.addEventListener("click",()=>{menu.hidden=true;toggle.setAttribute("aria-expanded","false")}));
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!menu.hidden){menu.hidden=true;toggle.setAttribute("aria-expanded","false");toggle.focus();}});
}
const buttons=$$("[data-filter]"),products=$$(".product-card[data-category]");
buttons.forEach(button=>button.addEventListener("click",()=>{
 const category=button.dataset.filter;
 buttons.forEach(b=>{const active=b===button;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
 products.forEach(p=>{p.hidden=category!=="all"&&p.dataset.category!==category;});
}));
/* Registration uses the original Roma backend; no extra customer data store. */
const form=$("#businessApplication");
if(form){
 const steps=$$("[data-step]",form),dots=$$("#progress span"),counter=$("#stepCount"),next=$("#formNext"),back=$("#formBack"),submit=$("#formSubmit"),status=$("#formStatus");
 let step=0,busy=false;
 const normalized=(value)=>value.replace(/[\u0660-\u0669]/g,x=>String(x.charCodeAt(0)-1632)).replace(/[\u06F0-\u06F9]/g,x=>String(x.charCodeAt(0)-1776));
 function showError(key){
  status.textContent=translatedError(key);status.classList.add("visible");status.scrollIntoView({behavior:"smooth",block:"nearest"});
 }
 function clearError(){status.classList.remove("visible");status.textContent="";}
 function review(){
  const names={reviewCompany:"company",reviewCR:"registration",reviewCity:"city",reviewName:"name",reviewEmail:"email",reviewSector:"sector"};
  for(const [id,name] of Object.entries(names)){const field=form.elements.namedItem(name),target=$("#"+id);if(!field||!target)continue;target.textContent=name==="sector"?(field.selectedOptions?.[0]?.textContent||"—"):(field.value.trim()||"—");}
 }
 function update(){
  steps.forEach((x,i)=>x.hidden=i!==step);
  dots.forEach((x,i)=>x.classList.toggle("active",i<=step));
  counter.textContent=String(step+1).padStart(2,"0")+" / "+String(steps.length).padStart(2,"0");
  back.hidden=step===0;next.hidden=step===steps.length-1;submit.hidden=step!==steps.length-1;
  clearError();if(step===3)review();
 }
 function validStep(i){
  for(const field of $$("input,select,textarea",steps[i])){
   field.classList.remove("is-invalid");
   if(["phone","registration","vat"].includes(field.name))field.value=normalized(field.value);
   if(!field.checkValidity()){field.classList.add("is-invalid");field.focus();field.reportValidity();return false;}
  }
  if(i===3&&$("#password").value!==$("#confirmPassword").value){$("#confirmPassword").classList.add("is-invalid");showError("password_mismatch");$("#confirmPassword").focus();return false;}
  return true;
 }
 next.addEventListener("click",()=>{clearError();if(validStep(step)){step+=1;update();$("#formMain").scrollIntoView({behavior:"smooth",block:"start"});}});
 back.addEventListener("click",()=>{if(step===0)return;step-=1;update();});
 $$("input,select,textarea",form).forEach(el=>el.addEventListener("input",()=>{el.classList.remove("is-invalid");clearError();}));
 const show=$("#togglePasswords");
 if(show)show.addEventListener("click",()=>{
  const visible=$("#password").type==="password";
  $("#password").type=$("#confirmPassword").type=visible?"text":"password";
  show.textContent=lang==="ar"?(visible?"إخفاء كلمة المرور":"إظهار كلمة المرور"):(translations(lang)?.[visible?"hidePassword":"showPassword"]||"Show password");
 });
 form.addEventListener("submit",async e=>{
  e.preventDefault();if(busy)return;
  for(let i=0;i<steps.length;i++){if(!validStep(i)){step=i;update();validStep(i);return;}}
  busy=true;submit.disabled=true;clearError();
  try{
   const stateResponse=await fetch("/api.php?action=state",{method:"GET",credentials:"same-origin",cache:"no-store",headers:{"Accept":"application/json"}});
   const state=await stateResponse.json().catch(()=>({}));
   if(!stateResponse.ok||typeof state.csrf!=="string"||!state.csrf)throw new Error("state_unavailable");
   if(state.installed===false)throw new Error("not_installed");
   const payload={};
   ["name","company","email","phone","city","address","registration","vat","sector","password"].forEach(key=>{payload[key]=form.elements.namedItem(key)?.value?.trim()||""});
   payload.consent=$("#consent").checked;
   const response=await fetch("/api.php?action=register",{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json","X-CSRF-Token":state.csrf,"Accept":"application/json"},body:JSON.stringify(payload)});
   const data=await response.json().catch(()=>({}));
   if(!response.ok||data.ok!==true)throw new Error(data.error||"generic");
   $("#completeCompany").textContent=payload.company;
   $("#formMain").hidden=true;$("#completePanel").hidden=false;
   $("#completePanel").scrollIntoView({behavior:"smooth",block:"center"});
  }catch(err){showError(["email_exists","rate_limited","csrf_failed","invalid_email","consent_required","not_installed","state_unavailable"].includes(err.message)?err.message:"generic");}
  finally{busy=false;submit.disabled=false;}
 });
 formState={refreshReview:review,goToStep:n=>{step=n;update();}};
 update();
}
applyTranslations();
})();
