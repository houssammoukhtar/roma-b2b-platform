/**
 * Roma B2B / Account Opening Workflow
 * Handles Cash/Credit branching, conditional validation, location pinning,
 * private per-document uploads, resume, and review.
 * No sensitive form content is stored in localStorage/sessionStorage.
 */
(()=>{'use strict';
const form=document.getElementById('b2bApplication');
if(!form)return;
const $=(q,base=document)=>base.querySelector(q), $$=(q,base=document)=>[...base.querySelectorAll(q)];
const fields=(name)=>form.elements.namedItem(name);
const value=(name)=>fields(name)?.value?.trim()||'';
const isCredit=()=>fields('account_type')?.value==='credit'||!!$('input[name=account_type]:checked[value=credit]');
const getType=()=>$('input[name=account_type]:checked')?.value||'';
const show=(el,yes)=>{if(el)el.hidden=!yes;};
const errorBox=$('#flowError'),bar=$('#uploadProgressBar'),uploadBox=$('#uploadProgress'),progressText=$('#uploadProgressText');
const flowCounter=$('#flowCounter'),progress=$('#flowProgress'),next=$('#flowNext'),back=$('#flowBack'),submit=$('#flowSubmit');
const mapEl=$('#mapCanvas');
let current='choose',activeSequence=[],csrf='',session=null,existingApp=null,uploaded={},busy=false,map=null,marker=null,backendAvailable=false;
const localLang=()=>document.documentElement.lang||'ar';
const ftx=(k,fallback)=>{
  const langs=window.ROMA_B2B_FLOW_LANG||{};
  if(localLang()==='ar')return fallback||k;
  return langs[localLang()]?.[k]||langs.en?.[k]||fallback||k;
};
const errorLabels={
  invalid_input:'البيانات المدخلة غير صالحة. راجع الحقول وأعد المحاولة.',
  invalid_email:'البريد الإلكتروني غير صحيح.',
  email_mismatch:'تأكيد البريد الإلكتروني غير مطابق.',
  email_exists:'البريد الإلكتروني مستخدم بالفعل. سجل الدخول لمتابعة الطلب.',
  invalid_account_type:'اختر نوع الحساب أولًا.',
  missing_credit_legal:'أكمل بيانات السجل المدني وتواريخ ومكان الإصدار.',
  missing_credit_details:'أكمل رقم الهوية والبيانات الوطنية للعنوان.',
  missing_purchase_details:'أكمل فئات المنتجات وقيمة المشتريات والحد الائتماني.',
  missing_authorized_people:'أضف بيانات المفوضين بالشراء والاستلام والحسابات.',
  missing_required_documents:'مستندات مطلوبة لم ترفع. راجع السجل التجاري والعنوان الوطني وهوية صاحب الحساب.',
  password_too_short:'كلمة المرور يجب أن تكون 12 حرفًا على الأقل.',
  csrf_failed:'انتهت جلسة الحماية. أعد المحاولة.',
  upload_failed:'تعذر رفع أحد الملفات. حاول مرة أخرى.',
  invalid_file:'ملف غير مسموح. استخدم PDF أو صورة واضحة.',
  file_too_large:'الملف أكبر من 5 ميجابايت.',
  rate_limited:'محاولات كثيرة. أعد المحاولة لاحقًا.',
  login_required:'سجّل الدخول أولًا لمتابعة طلبك.',
  application_already_submitted:'طلبك قيد المراجعة بالفعل. انتقل إلى متابعة الطلب.',
  storage_error:'خدمة حفظ المستندات غير متاحة حاليًا.',
  server_error:'حصل خطأ بالخادم. لم يتم تأكيد إرسال الطلب، راجع حالة الطلب ثم حاول ثانية.',
  account_email_mismatch:'البريد الإلكتروني لازم يطابق البريد المسجل في الحساب الحالي.',
  invalid_transition:'لا يمكن تغيير الطلب في حالته الحالية.'
};
const currentError=(key)=>ftx('error_'+key,errorLabels[key]||'تعذر إكمال العملية. تحقق من الحقول وحاول مرة أخرى.');
const warn=(text)=>{errorBox.textContent=text;errorBox.classList.add('visible');errorBox.scrollIntoView({block:'nearest',behavior:'smooth'});};
const clear=()=>{errorBox.textContent='';errorBox.classList.remove('visible');};
const digit=(s)=>s.replace(/[\u0660-\u0669]/g,x=>String(x.charCodeAt(0)-1632)).replace(/[\u06f0-\u06f9]/g,x=>String(x.charCodeAt(0)-1776));
function applyLanguage(){
  $$('.flow-step-label').forEach(x=>x.dir='ltr');
  $$('[data-flow-t]').forEach(el=>{
   const k=el.dataset.flowT,v=ftx(k,el.dataset.arOriginal||el.innerHTML);
   if(!el.dataset.arOriginal)el.dataset.arOriginal=el.innerHTML;
   if(v.includes('<em>'))el.innerHTML=v;else el.textContent=v;
  });
  document.querySelectorAll('.flow-person-section .repeat-card').forEach((card)=>{const label=$('.repeat-header strong',card);if(label)label.textContent=ftx('personNumber','شخص')+' '+(Number(card.dataset.index)+1)});
  renderStep();
  const notice=$('#previewNotice');if(notice&&!notice.hidden)notice.textContent=ftx('previewOnly','نسخة معاينة فقط: استقبال الطلبات والمستندات غير مفعل حتى اكتمال اختبار الخدمة الآمنة.');
}
document.getElementById('langSelect')?.addEventListener('change',()=>{queueMicrotask(applyLanguage);});
function sequence(){
 return getType()==='credit'
 ?['choose','legal','owner','location','purchasing','people','review']
 :['choose','legal','owner','location','review'];
}
function setType(){
 const credit=isCredit();
 $$('[data-credit-only]').forEach(el=>el.hidden=!credit);
 $$('[data-credit-required]').forEach(el=>{
  const slot=el.dataset.uploadSlot;
  el.required=credit&&(!(slot&&uploaded[slot]));
 });
 const other=$('[data-other-sector]');show(other,value('sector')==='other');
 const activity=fields('activity_other');if(activity)activity.required=value('sector')==='other';
 activeSequence=sequence();
 if(!activeSequence.includes(current))current='legal';
 renderStep();
}
function renderStep(){
 activeSequence=sequence();
 const idx=Math.max(0,activeSequence.indexOf(current));
 $$('.flow-screen').forEach(el=>el.hidden=el.dataset.screen!==current);
 progress.innerHTML=activeSequence.map((_,i)=>'<span class="'+(i<=idx?'active':'')+'"></span>').join('');
 progress.style.gridTemplateColumns='repeat('+activeSequence.length+',1fr)';
 flowCounter.textContent=String(idx+1).padStart(2,'0')+' / '+String(activeSequence.length).padStart(2,'0');
 back.hidden=idx===0;next.hidden=current==='review';submit.hidden=current!=='review';
 const nav= document.querySelector('.flow-layout .flow-card');
 if(current==='location')setTimeout(initMap,70);
 if(current==='people')preparePeople();
 if(current==='review')review();
}
function validateCurrent(){
 clear();
 const section=$('[data-screen='+current+']');if(!section)return false;
 if(current==='choose'){
  if(!getType()){warn(ftx('chooseAccountError','اختر حساب نقدي أو آجل للمتابعة.'));return false;}
 }
 if(current==='legal'&&value('sector')==='other'&&!value('activity_other')){warn(ftx('activityError','وضح النشاط التجاري.'));fields('activity_other').focus();return false;}
 if(current==='purchasing'&&!$$('input[name=categories]:checked').length){warn(ftx('purchaseCategoryError','اختار صنفًا واحدًا على الأقل.'));return false;}
 if(current==='people'){
   for(const role of ['purchasers','receivers','accountants']){
      const cards=$$('[data-person-role='+role+']');
      if(cards.length===0){warn(ftx('peopleError','أضف شخصًا مسؤولًا لكل فئة.'));return false;}
      for(const card of cards){
        if(!$('[data-pfield=name]',card)?.value.trim()||!$('[data-pfield=nationality]',card)?.value.trim()||!$('[data-pfield=identity_number]',card)?.value.trim()){
         warn(ftx('peopleDetailsError','أكمل اسم وهوية وجنسية كل شخص مضاف.'));card.scrollIntoView({behavior:'smooth',block:'center'});return false;
        }
      }
   }
 }
 if(current==='owner'){
  if(value('owner_email').toLowerCase()!==value('owner_email_confirmation').toLowerCase()){warn(ftx('emailMismatch','البريد الإلكتروني وتأكيده غير متطابقين.'));fields('owner_email_confirmation').focus();return false;}
 }
 for(const el of $$('input,select,textarea',section)){
  if(el.closest('[hidden]'))continue;
  if(el.type==='file'&&el.required&&el.dataset.uploadSlot&&uploaded[el.dataset.uploadSlot])continue;
  el.classList.remove('is-invalid');
  if(el.type==='file'&&el.files?.[0]&&el.files[0].size>5242880){warn(ftx('sizeError','حد الملف الواحد 5 ميجابايت.'));el.classList.add('is-invalid');el.focus();return false;}
  if(!el.checkValidity()){el.classList.add('is-invalid');el.focus();el.reportValidity();return false;}
 }
 return true;
}
function nextStep(){
 if(busy||!validateCurrent())return;
 const at=activeSequence.indexOf(current);
 if(at<activeSequence.length-1){current=activeSequence[at+1];renderStep();$('.flow-card')?.scrollIntoView({block:'start',behavior:'smooth'});}
}
next.addEventListener('click',nextStep);
back.addEventListener('click',()=>{if(busy)return;const idx=activeSequence.indexOf(current);if(idx>0){current=activeSequence[idx-1];renderStep();$('.flow-card')?.scrollIntoView({block:'start',behavior:'smooth'});}});
$$('input[name=account_type]').forEach(input=>input.addEventListener('change',setType));
fields('sector')?.addEventListener('change',setType);
function buildBranch(data={}){
 const list=$('#branchesList');if(list.children.length>=12)return;
 const card=document.createElement('div');card.className='repeat-card';card.dataset.branch='';
 card.innerHTML='<div class="repeat-header"><strong data-branch-label></strong><button type="button" class="repeat-delete" data-remove-branch>×</button></div><div class="form-fields">'+
 '<div class="field"><label data-flow-t="branchName">اسم الفرع</label><input data-branch-field="name" maxlength="120"></div>'+
 '<div class="field"><label data-flow-t="city">المدينة</label><input data-branch-field="city" maxlength="100"></div>'+
 '<div class="field full"><label data-flow-t="address">العنوان</label><input data-branch-field="address" maxlength="600"></div>'+
 '<div class="field"><label data-flow-t="postalCode">الرمز البريدي</label><input data-branch-field="postal_code" maxlength="20"></div>'+
 '<div class="field"><label data-flow-t="latitude">خط العرض</label><input data-branch-field="latitude" maxlength="24" dir="ltr"></div>'+
 '<div class="field"><label data-flow-t="longitude">خط الطول</label><input data-branch-field="longitude" maxlength="24" dir="ltr"></div></div>';
 for(const [key,val] of Object.entries(data)){const el=card.querySelector('[data-branch-field='+key+']');if(el)el.value=val||'';}
 $('button[data-remove-branch]',card).addEventListener('click',()=>{card.remove();relabelBranches();});
 list.append(card);relabelBranches();
}
function relabelBranches(){$$('#branchesList .repeat-card').forEach((el,i)=>{$('[data-branch-label]',el).textContent=ftx('branch','فرع')+' '+(i+1);});}
$('#addBranch')?.addEventListener('click',()=>buildBranch());
const roleName={purchasers:'purchaser',receivers:'receiver',accountants:'accountant'};
function buildPerson(role,row={}){
 const list=$('[data-person-list='+role+']');if(!list||list.children.length>=15)return;
 const card=document.createElement('div');
 card.className='repeat-card';card.dataset.personRole=role;card.dataset.index=list.children.length;
 card.innerHTML='<div class="repeat-header"><strong></strong><button type="button" class="repeat-delete" data-remove-person>×</button></div>'+
 '<div class="form-fields">'+
 '<div class="field"><label data-flow-t="name">الاسم</label><input data-pfield="name" maxlength="130" autocomplete="off"></div>'+
 '<div class="field"><label data-flow-t="nationality">الجنسية</label><input data-pfield="nationality" maxlength="60"></div>'+
 '<div class="field"><label data-flow-t="identityNumber">رقم الهوية</label><input data-pfield="identity_number" maxlength="80" dir="ltr"></div>'+
 '<div class="field"><label data-flow-t="phone">رقم الهاتف</label><input data-pfield="phone" maxlength="40" dir="ltr"></div></div>'+
 '<label class="upload-field"><span data-flow-t="personIdentity">صورة الهوية / البطاقة الشخصية</span><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" data-person-file></label>';
 for(const [key,val] of Object.entries(row)){const el=$('[data-pfield='+key+']',card);if(el)el.value=val||'';}
 $('[data-remove-person]',card).addEventListener('click',()=>{if(list.children.length<=1)return;card.remove();relabelPersons(role);});
 list.append(card);relabelPersons(role);
}
function relabelPersons(role){
 const list=$('[data-person-list='+role+']');
 $$('[data-person-role='+role+']',list).forEach((el,i)=>{
  el.dataset.index=String(i);$('.repeat-header strong',el).textContent=ftx('personNumber','شخص')+' '+(i+1);
  const file=$('[data-person-file]',el);file.dataset.uploadSlot=roleName[role]+'_identity_'+i;
 });
}
$$('[data-add-person]').forEach(btn=>btn.addEventListener('click',()=>buildPerson(btn.dataset.addPerson)));
function preparePeople(){
 if(!value('account_holder_name'))fields('account_holder_name').value=value('owner_name');
 if(!value('account_holder_phone'))fields('account_holder_phone').value=value('owner_phone');
 for(const role of ['purchasers','receivers','accountants'])if(!$('[data-person-role='+role+']'))buildPerson(role);
}
let mapInitialized=false;
function setCoords(lat,lng){
 fields('latitude').value=Number(lat).toFixed(6);fields('longitude').value=Number(lng).toFixed(6);
 if(map&&marker){marker.setLatLng([lat,lng]);map.panTo([lat,lng]);}
}
function initMap(){
 if(mapInitialized){if(map)map.invalidateSize();return;}
 if(typeof window.L==='undefined')return;
 mapInitialized=true;
 try{
  const lat=parseFloat(value('latitude'))||24.7136,lng=parseFloat(value('longitude'))||46.6753;
  map=window.L.map(mapEl,{scrollWheelZoom:false}).setView([lat,lng],11);
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
  marker=window.L.marker([lat,lng],{draggable:true}).addTo(map);
  marker.on('dragend',()=>{const a=marker.getLatLng();setCoords(a.lat,a.lng);});
  map.on('click',e=>setCoords(e.latlng.lat,e.latlng.lng));
  setTimeout(()=>map.invalidateSize(),250);
 }catch(e){mapInitialized=false;console.warn('map_unavailable',e.message);}
}
$('#myLocation')?.addEventListener('click',()=>{
 if(!navigator.geolocation){warn(ftx('geoUnavailable','الموقع الجغرافي غير متاح في هذا المتصفح.'));return;}
 navigator.geolocation.getCurrentPosition(p=>setCoords(p.coords.latitude,p.coords.longitude),()=>warn(ftx('geoDenied','تعذر تحديد الموقع. يمكنك تحديده يدويًا.')),{enableHighAccuracy:false,timeout:10000});
});
for(const k of ['latitude','longitude'])fields(k)?.addEventListener('change',()=>{const lat=Number(value('latitude')),lng=Number(value('longitude'));if(Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180&&value('latitude')!==''&&value('longitude')!=='')setCoords(lat,lng);});
function getBranchData(){
 return $$('#branchesList [data-branch]').map(card=>Object.fromEntries($$('[data-branch-field]',card).map(el=>[el.dataset.branchField,el.value.trim()])));
}
function getPersonData(role){
 return $$('[data-person-role='+role+']').map(card=>Object.fromEntries($$('[data-pfield]',card).map(el=>[el.dataset.pfield,el.value.trim()])));
}
function applicationData(){
 return {
  account_type:getType(),
  legal:{company:value('company'),registration:digit(value('registration')),sector:value('sector'),activity_other:value('activity_other'),issue_date:value('issue_date'),issue_region:value('issue_region'),civil_number:digit(value('civil_number')),expiry_date:value('expiry_date'),vat:digit(value('vat'))},
  owner:{name:value('owner_name'),phone:digit(value('owner_phone')),identity_number:digit(value('owner_identity_number')),email:value('owner_email'),email_confirmation:value('owner_email_confirmation')},
  location:{city:value('city'),address:value('address'),street:value('street'),postal_code:digit(value('postal_code')),unified_national_number:digit(value('unified_national_number')),latitude:value('latitude'),longitude:value('longitude'),branches:getBranchData()},
  purchasing:{categories:$$('input[name=categories]:checked').map(x=>x.value),estimated_value:value('estimated_value'),requested_credit_limit:value('requested_credit_limit'),notes:value('purchasing_notes')},
  people:{account_holder:{name:value('account_holder_name'),nationality:value('account_holder_nationality'),identity_number:digit(value('account_holder_identity')),phone:digit(value('account_holder_phone'))},purchasers:getPersonData('purchasers'),receivers:getPersonData('receivers'),accountants:getPersonData('accountants')}
 };
}
function review(){
 const app=applicationData();
 const rows=[
  [ftx('accountType','نوع الحساب'),ftx(app.account_type==='credit'?'creditTitle':'cashTitle',app.account_type)],
  [ftx('company','اسم المنشأة'),app.legal.company],
  [ftx('registration','السجل التجاري'),app.legal.registration],
  [ftx('ownerName','صاحب الحساب'),app.owner.name],
  [ftx('ownerEmail','البريد الإلكتروني'),app.owner.email],
  [ftx('city','المدينة'),app.location.city],
  [ftx('branchesTitle','الفروع الإضافية'),String(app.location.branches.length)],
  [ftx('uploadedDocs','المستندات'),String($$('input[type=file][data-upload-slot]').filter(el=>el.files?.length||uploaded[el.dataset.uploadSlot]).length)]
 ];
 if(app.account_type==='credit'){rows.push([ftx('estimatedValue','قيمة المشتريات'),app.purchasing.estimated_value+' SAR']);rows.push([ftx('requestedLimit','الحد الائتماني المطلوب'),app.purchasing.requested_credit_limit+' SAR']);}
 $('#reviewSummary').replaceChildren(...rows.map(([label,content])=>{const div=document.createElement('div');div.className='flow-review-row';const b=document.createElement('b');b.textContent=label;const span=document.createElement('span');span.textContent=content||'—';div.append(b,span);return div;}));
}
async function api(action,body=null,uploadFile=null,slot=null){
 const options={credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}};
 if(body!==null||uploadFile){
  options.method='POST';options.headers['X-CSRF-Token']=csrf;
  if(uploadFile){const fd=new FormData();fd.append('slot',slot);fd.append('file',uploadFile,uploadFile.name);options.body=fd;}
  else{options.headers['Content-Type']='application/json';options.body=JSON.stringify(body);}
 }
 const response=await fetch('b2b-api.php?action='+encodeURIComponent(action),options);
 let data;try{data=await response.json()}catch{throw new Error('server_error')}
 if(!response.ok||!data.ok)throw new Error(data.error||'server_error');
 return data;
}
async function loadSession(){
 const state=await api('session');
 backendAvailable=true;csrf=state.csrf;session=state;
 if(state.authenticated){const field=$('#passwordField');field.hidden=true;fields('password').required=false;try{
    const r=await api('my');existingApp=r.application;
    if(existingApp&&['draft_documents','changes_requested'].includes(existingApp.status)){
       uploaded=Object.fromEntries(Object.entries(existingApp.documents||{}).map(([slot,v])=>[slot,v]));
       prefill(existingApp.data);
       show($('#resumeHint'),true);setType();
    }else if(existingApp){
       form.innerHTML='<div class="flow-status-box"><strong>'+ftx('alreadySubmitted','لديك طلب فتح حساب موجود بالفعل.')+'</strong><p>'+ftx('visitStatus','اذهب إلى صفحة متابعة الطلب لمراجعة الحالة.')+'</p><a class="btn btn-main" href="status.html?lang='+encodeURIComponent(localLang())+'">'+ftx('trackAccount','متابعة طلبي')+'</a></div>';
    }
  }catch(e){console.warn('my_application',e.message);}
 }
 setType();
}
function prefill(data){
 if(!data)return;
 const type=form.querySelector('input[name=account_type][value='+data.account_type+']');if(type)type.checked=true;
 const groups={legal:['company','registration','sector','activity_other','issue_date','issue_region','civil_number','expiry_date','vat'],owner:['name','phone','identity_number','email'],location:['city','address','street','postal_code','unified_national_number','latitude','longitude'],purchasing:['estimated_value','requested_credit_limit','notes']};
 for(const [name,keys] of Object.entries(groups)){
  for(const key of keys){
   let fieldName=(name==='owner'?'owner_':'')+key;
   if(name==='purchasing'&&key==='notes')fieldName='purchasing_notes';
   const input=fields(fieldName);if(input)input.value=data[name]?.[key]??'';
  }
 }
 fields('owner_email_confirmation').value=data.owner?.email||'';
 for(const c of data.purchasing?.categories||[]){const check=$('input[name=categories][value='+c+']');if(check)check.checked=true;}
 for(const branch of data.location?.branches||[])buildBranch(branch);
 for(const role of ['purchasers','receivers','accountants'])for(const p of data.people?.[role]||[])buildPerson(role,p);
 for(const [key,v] of Object.entries(data.people?.account_holder||{})){
  const name={name:'account_holder_name',phone:'account_holder_phone',nationality:'account_holder_nationality',identity_number:'account_holder_identity'}[key];
  if(name&&fields(name))fields(name).value=v||'';
 }
 $$('[data-upload-slot]').forEach(input=>{if(uploaded[input.dataset.uploadSlot])input.closest('.upload-field')?.classList.add('has-upload');});
}
form.addEventListener('input',event=>{if(event.target?.classList)event.target.classList.remove('is-invalid');clear();});
form.addEventListener('submit',async event=>{
 event.preventDefault();
 if(!backendAvailable){warn(ftx('previewOnly','نسخة معاينة فقط: الإرسال غير متاح إلى أن تنتهي اختبارات التخزين الآمن.'));return;}
 if(busy||!validateCurrent())return;
 if(!$('#consent').checked){warn(ftx('consentRequired','يجب الموافقة على سياسة الخصوصية قبل الإرسال.'));return;}
 busy=true;next.disabled=back.disabled=submit.disabled=true;uploadBox.hidden=false;bar.style.width='3%';clear();
 try{
  await loadSessionRefresh();
  const payload={application:applicationData(),password:value('password'),consent:true};
  const started=await api('start',payload);
  existingApp={...(existingApp||{}),id:started.application.id,status:'draft_documents'};
  bar.style.width='15%';
  const all=$$('input[type=file][data-upload-slot]').filter(x=>x.files?.length&&!x.closest('[hidden]'));
  for(let i=0;i<all.length;i++){
   const inp=all[i],file=inp.files[0],slot=inp.dataset.uploadSlot;
   if(file.size>5242880)throw new Error('file_too_large');
   await api('upload',null,file,slot);uploaded[slot]=true;
   const pct=15+Math.round(((i+1)/Math.max(all.length,1))*70);
   bar.style.width=pct+'%';
   progressText.textContent=ftx('uploading','جاري رفع المستندات')+' ('+(i+1)+' / '+all.length+')';
  }
  const result=await api('submit',{});
  bar.style.width='100%';
  progressText.textContent=ftx('complete','تم إرسال الطلب للمراجعة.');
  location.href='status.html?lang='+encodeURIComponent(localLang());
 }catch(e){
  warn(currentError(e.message));
  progressText.textContent=ftx('uploadRetry','تم حفظ البيانات التي وصلت للنظام. تستطيع إعادة المحاولة أو متابعة طلبك.');
  if(existingApp){const link=document.createElement('a');link.href='status.html?lang='+encodeURIComponent(localLang());link.textContent=ftx('trackAccount','متابعة طلبي');link.className='flow-secondary';uploadBox.append(link);}
 }finally{busy=false;next.disabled=back.disabled=submit.disabled=false;}
});
async function loadSessionRefresh(){const state=await api('session');csrf=state.csrf;session=state;}
setType();preparePeople();applyLanguage();
loadSession().catch(()=>{
 console.warn('B2B secure workflow backend unavailable');
 backendAvailable=false;const notice=$('#previewNotice');
 notice.hidden=false;notice.textContent=ftx('previewOnly','نسخة معاينة فقط: استقبال الطلبات والمستندات غير مفعل حتى اكتمال اختبار الخدمة الآمنة.');
 submit.disabled=true;submit.setAttribute('aria-disabled','true');
});
})();
