<?php
declare(strict_types=1);
header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Robots-Tag: noindex, nofollow');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'");
?>
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>طلب فتح حساب أعمال | Roma Group B2B</title><meta name="description" content="قدّم طلب فتح حساب جملة لدى مجموعة روما التجارية.">
<meta name="theme-color" content="#0a493b">
<link rel="icon" href="/assets/branding/roma-r-64.png" type="image/png">
<style>
:root{font-family:"Segoe UI",Tahoma,Arial,sans-serif;color:#153e35;background:#f5f8f5;font-synthesis:none}
*{box-sizing:border-box}body{margin:0;min-height:100vh}a{color:inherit;text-decoration:none}
button,input,select,textarea{font:inherit}button{cursor:pointer}
.top{background:white;border-bottom:1px solid #e3ece7}.top-in{max-width:1190px;padding:15px 24px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:20px}
.logo{display:flex;align-items:center;gap:12px;font-weight:800;color:#124b3b}.logo img{height:50px;width:auto;max-width:150px;object-fit:contain}
.top-actions{display:flex;align-items:center;gap:12px}.top-actions a{font-size:13px;color:#58746c}.lang{border:1px solid #d5e4db;border-radius:12px;padding:9px 13px;background:white;font-size:13px;color:#195443}
.shell{max-width:1190px;margin:44px auto;padding:0 24px;display:grid;grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr);gap:32px;align-items:start}
.intro{background:linear-gradient(145deg,#0a4438,#14684d 70%,#25805c);border-radius:28px;min-height:555px;padding:52px 43px;color:white;position:relative;overflow:hidden}
.intro:before{content:"";height:340px;width:340px;border:1px solid #ffffff31;position:absolute;bottom:-170px;left:-140px;border-radius:50%;box-shadow:0 0 0 45px #ffffff0a,0 0 0 95px #ffffff0a}
.eyebrow{font-size:11px;letter-spacing:2.5px;text-transform:uppercase;font-weight:800;color:#b8f1c6}.intro h1{font-size:clamp(30px,3vw,46px);line-height:1.35;letter-spacing:-.6px;margin:22px 0}.intro h1 em{font-style:normal;color:#c6f7ba}
.intro p{line-height:1.95;color:#dbefe5;max-width:390px;margin:0 0 28px;font-size:15px}
.perks{display:grid;gap:16px;position:relative;z-index:1}.perk{display:flex;align-items:center;gap:12px;font-size:14px;color:#ecf7f0}.perk b{display:grid;place-items:center;min-width:29px;height:29px;border-radius:10px;background:#ffffff22;color:#d5ffcd}
.help{margin-top:48px;border-top:1px solid #ffffff35;padding-top:22px;font-size:13px;color:#c7e0d4}.help a{text-decoration:underline}
.card{background:#fff;border:1px solid #e0eae3;border-radius:28px;box-shadow:0 14px 52px #153e3512;padding:33px 37px 35px}
.card-head{display:flex;align-items:start;justify-content:space-between;gap:12px}.kicker{font-size:11px;color:#2d8754;font-weight:800;letter-spacing:1px}.card h2{font-size:25px;margin:10px 0 8px}.subtitle{color:#6b847a;font-size:13px;line-height:1.8;margin:0 0 23px}
.progress{display:flex;gap:7px;margin-bottom:26px}.progress span{height:5px;flex:1;background:#e5efe8;border-radius:20px}.progress span.on{background:#39a85e}
.step-no{font-size:12px;font-weight:700;color:#2a8a56;white-space:nowrap;padding-top:3px}
.section-title{font-size:18px;margin:0 0 18px}
.fields{display:grid;grid-template-columns:1fr 1fr;gap:16px 14px}
.field{display:flex;flex-direction:column;gap:7px;min-width:0}.field.full{grid-column:1/-1}.field label{font-size:12px;color:#415e52;font-weight:700}
.field label small{font-size:11px;color:#8a9d92;font-weight:400}
.field input,.field select,.field textarea{background:#fbfdfa;border:1px solid #dce7df;border-radius:12px;padding:13px 12px;min-width:0;min-height:47px;color:#173d31;outline:none;transition:border .2s,box-shadow .2s}
.field textarea{resize:vertical;min-height:93px}.field input:focus,.field select:focus,.field textarea:focus{border-color:#2d9959;box-shadow:0 0 0 3px #309e5719;background:white}
.field input.invalid,.field select.invalid,.field textarea.invalid{border-color:#d15f52;background:#fff8f7}
.hint{color:#879a8c;font-size:11px}.actions{display:flex;gap:10px;margin-top:26px}.btn{border:0;border-radius:12px;padding:13px 21px;min-height:48px;font-weight:800}
.primary{background:#0d6948;color:#fff;flex:1}.primary:hover{background:#095638}.primary:disabled{opacity:.6;cursor:wait}
.secondary{background:#e9f3ed;color:#235742}.footerline{margin-top:23px;padding-top:20px;border-top:1px solid #edf2ed;font-size:12px;color:#60786a;text-align:center}
.footerline a{color:#12804e;font-weight:800}.check{display:flex;gap:10px;align-items:flex-start;font-size:12px;line-height:1.8;color:#60796a;margin-top:20px}
.check input{accent-color:#168251;margin-top:5px}.check a{text-decoration:underline}.status{display:none;margin-top:18px;padding:14px 16px;border-radius:12px;font-size:13px;line-height:1.8}
.status.error{display:block;background:#fff1ee;color:#a83225}.status.success{display:block;background:#e6f7eb;color:#155934}
[hidden]{display:none!important}.done{text-align:center;padding:45px 15px}.done-icon{margin:auto;display:grid;place-items:center;background:#e4f7eb;color:#167d49;width:70px;height:70px;border-radius:50%;font-size:37px}.done h2{margin:18px 0}.done p{color:#5f7a6a;line-height:2}
@media(max-width:900px){.shell{grid-template-columns:1fr;margin:25px auto;gap:18px}.intro{min-height:auto;padding:30px}.intro h1{font-size:29px;margin:14px 0}.help{margin-top:20px}.card{padding:27px}}
@media(max-width:520px){.top-in{padding:10px 15px}.logo img{height:36px}.logo span{font-size:12px}.top-actions a{display:none}.shell{padding:0 12px;margin:13px auto}.intro{border-radius:19px;padding:25px 22px}.perks{gap:10px}.card{border-radius:19px;padding:23px 17px}.fields{grid-template-columns:1fr;gap:14px}.field.full{grid-column:auto}.intro h1{font-size:26px}.card h2{font-size:22px}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
</style>
</head>
<body>
<header class="top"><div class="top-in"><a href="/ar/" class="logo"><img src="/assets/branding/roma-group-logo.png" alt="Roma Trading Group"><span>ROMA B2B</span></a><div class="top-actions"><a href="/ar/">العودة للموقع</a><a href="/portal.php?lang=ar#login">تسجيل الدخول</a><button class="lang" type="button" id="langSwitch">English</button></div></div></header>
<main class="shell">
<aside class="intro"><div class="eyebrow">ROMA GROUP · BUSINESS PARTNERS</div><h1 data-ar="شراكتك مع روما،&#10;تبدأ من هنا." data-en="Your next business&#10;partnership starts here.">شراكتك مع روما، <em>تبدأ من هنا.</em></h1>
<p data-ar="قدّم طلب فتح حساب الأعمال لمؤسستك بخطوات واضحة. فريق روما يراجع الطلب، وبعد الاعتماد تقدر تبدأ تعاملات الجملة حسب الاتفاق." data-en="Apply for a Roma Group business account in a few clear steps. Our team reviews each request before trade access is approved.">قدّم طلب فتح حساب الأعمال لمؤسستك بخطوات واضحة. فريق روما يراجع الطلب، وبعد الاعتماد تقدر تبدأ تعاملات الجملة حسب الاتفاق.</p>
<div class="perks"><div class="perk"><b>✓</b><span data-ar="نموذج واضح ومنظّم" data-en="Simple, structured application">نموذج واضح ومنظّم</span></div><div class="perk"><b>✓</b><span data-ar="مراجعة الطلب من الفريق المختص" data-en="Review by our business team">مراجعة الطلب من الفريق المختص</span></div><div class="perk"><b>✓</b><span data-ar="أسعار وشروط الجملة بعد الاعتماد" data-en="Wholesale terms after approval">أسعار وشروط الجملة بعد الاعتماد</span></div></div>
<div class="help"><span data-ar="لديك حساب بالفعل؟" data-en="Already have an account?">لديك حساب بالفعل؟</span> <a href="/portal.php?lang=ar#login" id="signinSide" data-ar="تسجيل الدخول" data-en="Sign in">تسجيل الدخول</a></div></aside>
<section class="card" id="applicationPanel">
<div class="card-head"><div><div class="kicker">ROMA BUSINESS / APPLICATION</div><h2 data-ar="طلب فتح حساب عميل" data-en="Open a business account">طلب فتح حساب عميل</h2></div><div class="step-no" id="stepNumber">1 / 3</div></div>
<p class="subtitle" data-ar="املأ بيانات منشأتك، ثم معلومات التواصل، ثم أنشئ بيانات الدخول. الحقول المميزة بنجمة مطلوبة." data-en="Add your company, contact and login details. Fields marked * are required.">املأ بيانات منشأتك، ثم معلومات التواصل، ثم أنشئ بيانات الدخول. الحقول المميزة بنجمة مطلوبة.</p>
<div class="progress" aria-label="Application progress"><span class="on"></span><span></span><span></span></div>
<form id="accountForm" novalidate>
<section data-step="0"><h3 class="section-title" data-ar="01 — بيانات المنشأة" data-en="01 — Company details">01 — بيانات المنشأة</h3><div class="fields">
<div class="field full"><label for="company" data-ar="اسم المنشأة / الشركة *" data-en="Registered company name *">اسم المنشأة / الشركة *</label><input id="company" name="company" required minlength="2" maxlength="150" autocomplete="organization"></div>
<div class="field"><label for="registration" data-ar="رقم السجل التجاري *" data-en="Commercial registration number *">رقم السجل التجاري *</label><input id="registration" name="registration" required maxlength="80" dir="ltr" inputmode="numeric"></div>
<div class="field"><label for="vat" data-ar="الرقم الضريبي (إن وجد)" data-en="VAT number (if applicable)">الرقم الضريبي (إن وجد)</label><input id="vat" name="vat" maxlength="80" dir="ltr"></div>
<div class="field full"><label for="sector" data-ar="نوع النشاط *" data-en="Business type *">نوع النشاط *</label><select id="sector" name="sector" required><option value="" data-ar="اختر نوع النشاط" data-en="Select business type">اختر نوع النشاط</option><option value="retail" data-ar="تجارة التجزئة / المتاجر" data-en="Retail / stores">تجارة التجزئة / المتاجر</option><option value="hospitality" data-ar="مطاعم ومقاهي وضيافة" data-en="Restaurants / cafes / hospitality">مطاعم ومقاهي وضيافة</option><option value="distribution" data-ar="توزيع / جملة" data-en="Distribution / wholesale">توزيع / جملة</option></select></div>
<div class="field"><label for="city" data-ar="المدينة *" data-en="City *">المدينة *</label><input id="city" name="city" required maxlength="100" autocomplete="address-level2"></div>
<div class="field full"><label for="address" data-ar="العنوان التجاري بالتفصيل *" data-en="Full business address *">العنوان التجاري بالتفصيل *</label><textarea id="address" name="address" required minlength="5" maxlength="1000" autocomplete="street-address"></textarea></div>
</div></section>
<section data-step="1" hidden><h3 class="section-title" data-ar="02 — مسؤول التواصل" data-en="02 — Primary contact">02 — مسؤول التواصل</h3><div class="fields">
<div class="field full"><label for="name" data-ar="اسم مسؤول الحساب *" data-en="Account contact full name *">اسم مسؤول الحساب *</label><input id="name" name="name" required maxlength="150" autocomplete="name"></div>
<div class="field"><label for="phone" data-ar="رقم الجوال *" data-en="Mobile phone *">رقم الجوال *</label><input id="phone" name="phone" required type="tel" minlength="7" maxlength="30" dir="ltr" autocomplete="tel" placeholder="+966 5X XXX XXXX"></div>
<div class="field"><label for="email" data-ar="البريد الإلكتروني للعمل *" data-en="Business email address *">البريد الإلكتروني للعمل *</label><input id="email" name="email" required type="email" maxlength="200" dir="ltr" autocomplete="email"></div>
</div><p class="hint" data-ar="سنستخدم بيانات التواصل في متابعة طلبك والتواصل مع مسؤول الحساب." data-en="We will use these details to follow up on your application.">سنستخدم بيانات التواصل في متابعة طلبك والتواصل مع مسؤول الحساب.</p></section>
<section data-step="2" hidden><h3 class="section-title" data-ar="03 — بيانات الدخول والموافقة" data-en="03 — Account access & consent">03 — بيانات الدخول والموافقة</h3><div class="fields">
<div class="field full"><label for="password" data-ar="كلمة المرور * (12 حرفًا على الأقل)" data-en="Password * (minimum 12 characters)">كلمة المرور * (12 حرفًا على الأقل)</label><input id="password" name="password" required type="password" minlength="12" maxlength="72" autocomplete="new-password"></div>
<div class="field full"><label for="confirm" data-ar="تأكيد كلمة المرور *" data-en="Confirm password *">تأكيد كلمة المرور *</label><input id="confirm" name="confirm" required type="password" minlength="12" maxlength="72" autocomplete="new-password"></div>
</div><label class="check"><input type="checkbox" id="consent" required><span><span data-ar="أوافق على معالجة البيانات المقدمة بغرض مراجعة طلب حساب الأعمال، وقد اطلعت على " data-en="I agree to the processing of the submitted information for my business account application, and have read the ">أوافق على معالجة البيانات المقدمة بغرض مراجعة طلب حساب الأعمال، وقد اطلعت على </span><a href="/ar/privacy" target="_blank" rel="noopener" data-ar="سياسة الخصوصية" data-en="privacy policy">سياسة الخصوصية</a>.</span></label></section>
<div class="status" role="alert" id="status"></div><div class="actions"><button type="button" id="back" class="btn secondary" hidden data-ar="السابق" data-en="Back">السابق</button><button type="button" id="next" class="btn primary" data-ar="متابعة" data-en="Continue">متابعة</button><button type="submit" id="send" class="btn primary" hidden data-ar="إرسال طلب فتح الحساب" data-en="Submit application">إرسال طلب فتح الحساب</button></div>
</form><div class="footerline"><span data-ar="لديك حساب؟" data-en="Already registered?">لديك حساب؟</span> <a href="/portal.php?lang=ar#login" id="signinFooter" data-ar="سجّل الدخول" data-en="Sign in">سجّل الدخول</a></div>
</section></main>
<script>
(() => {'use strict';
const $=id=>document.getElementById(id), steps=[...document.querySelectorAll('[data-step]')], dots=[...document.querySelectorAll('.progress span')];
let step=0,lang=new URLSearchParams(location.search).get('lang')==='en'?'en':'ar',busy=false;
function translate(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.querySelectorAll('[data-ar][data-en]').forEach(n=>{if(n.matches('input'))return;if(n.tagName==='OPTION')n.textContent=n.dataset[lang];else if(n.tagName==='H1'&&lang==='ar')n.innerHTML='شراكتك مع روما، <em>تبدأ من هنا.</em>';else if(n.tagName==='H1')n.textContent=n.dataset.en;else n.textContent=n.dataset[lang]});$('langSwitch').textContent=lang==='ar'?'English':'العربية';$('signinSide').href='/portal.php?lang='+lang+'#login';$('signinFooter').href='/portal.php?lang='+lang+'#login';$('stepNumber').textContent=(step+1)+' / 3';document.title=lang==='ar'?'طلب فتح حساب أعمال | Roma Group B2B':'Business account application | Roma Group B2B';}
function setStep(n){step=n;steps.forEach((s,i)=>s.hidden=i!==n);dots.forEach((d,i)=>d.classList.toggle('on',i<=n));$('stepNumber').textContent=(n+1)+' / 3';$('back').hidden=n===0;$('next').hidden=n===2;$('send').hidden=n!==2;setStatus('');window.scrollTo({top:0,behavior:'smooth'});}
function setStatus(message,error=true){const s=$('status');s.textContent=message;s.className=message?'status '+(error?'error':'success'):'status';}
function validStep(n){const section=steps[n];for(const el of section.querySelectorAll('input,select,textarea')){el.classList.remove('invalid');if(!el.checkValidity()){el.classList.add('invalid');el.focus();el.reportValidity();return false;}}if(n===2&&$('password').value!==$('confirm').value){setStatus(lang==='ar'?'كلمتا المرور غير متطابقتين.':'Passwords do not match.');$('confirm').focus();return false;}return true;}
$('next').addEventListener('click',()=>{if(validStep(step))setStep(step+1);});$('back').addEventListener('click',()=>setStep(step-1));$('langSwitch').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';translate()});
$('accountForm').addEventListener('submit',async(e)=>{e.preventDefault();if(busy)return;for(let i=0;i<3;i++){if(!validStep(i)){setStep(i);validStep(i);return;}}
busy=true;$('send').disabled=true;setStatus('');try{
const stateResponse=await fetch('/api.php?action=state',{credentials:'same-origin',cache:'no-store'}),state=await stateResponse.json();if(!stateResponse.ok||!state.csrf)throw Error('state_unavailable');
const form=Object.fromEntries(new FormData($('accountForm')).entries());delete form.confirm;form.consent=$('consent').checked;
const response=await fetch('/api.php?action=register',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','X-CSRF-Token':state.csrf},body:JSON.stringify(form)}),result=await response.json();
if(!response.ok||result.ok===false){const errors={email_exists:lang==='ar'?'البريد الإلكتروني مسجل من قبل. جرّب تسجيل الدخول.':'This email is already registered. Please sign in.',rate_limited:lang==='ar'?'طلبات كثيرة من نفس الاتصال. أعد المحاولة لاحقًا.':'Too many requests. Please try again later.',csrf_failed:lang==='ar'?'انتهت صلاحية الجلسة. أعد المحاولة.':'Session expired. Please try again.'};throw Error(errors[result.error]||(lang==='ar'?'تعذر إرسال الطلب. راجع البيانات وحاول مرة أخرى.':'Could not submit your application. Please check your details and retry.'));}
$('applicationPanel').innerHTML='<div class="done"><div class="done-icon">✓</div><h2>'+(lang==='ar'?'تم استلام طلبك':'Application received')+'</h2><p>'+(lang==='ar'?'تم إنشاء حسابك بحالة انتظار المراجعة. سيظهر لك وضع الحساب بعد تسجيل الدخول، ويمكنك متابعة اعتماد فريق روما.':'Your account has been created with a pending-review status. Sign in to check your account while the Roma team reviews your request.')+'</p><a class="btn primary" style="display:inline-block;margin-top:12px" href="/portal.php?lang='+lang+'#login">'+(lang==='ar'?'الانتقال إلى حساب الأعمال':'Go to business portal')+'</a></div>';
}catch(err){setStatus(err.message==='state_unavailable'?(lang==='ar'?'خدمة التسجيل غير متاحة مؤقتًا.':'Registration service is temporarily unavailable.'):err.message);}
finally{busy=false;if($('send'))$('send').disabled=false;}
});
translate();setStep(0);
})();
</script>
</body>
</html>
