/* Roma B2B - protected application status & reviewer desk */
(()=>{"use strict";
const page=document.body.dataset.page;
if(!['status','review'].includes(page))return;
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const apiURL='b2b-api.php?action=';
const fmtDate=x=>{try{return new Date(x).toLocaleString(document.documentElement.lang||'ar',{dateStyle:'medium',timeStyle:'short'})}catch{return x||'—'}};
const stateName={draft_documents:'مسودة / استكمال المستندات',submitted:'بانتظار المراجعة',under_review:'قيد مراجعة الإدارة',changes_requested:'مطلوب تعديل البيانات',approved_pending_signature:'انتظار السند الإلكتروني المعتمد',signed_submitted:'استلام السند الإلكتروني للمراجعة',accounting_pending:'مراجعة الحسابات',active:'حساب مفعل',rejected:'الطلب مرفوض'};
const fieldNames={company:'اسم المنشأة',registration:'السجل التجاري',sector:'النشاط',activity_other:'نشاط آخر',issue_date:'تاريخ الإصدار',issue_region:'منطقة الإصدار',civil_number:'رقم السجل المدني',expiry_date:'انتهاء السجل',vat:'الرقم الضريبي',name:'الاسم',phone:'الجوال',email:'البريد الإلكتروني',identity_number:'رقم الهوية',city:'المدينة',address:'العنوان',street:'الشارع',postal_code:'الرمز البريدي',building_number:'رقم المبنى',unified_national_number:'الرقم الوطني الموحد',latitude:'خط العرض',longitude:'خط الطول',categories:'المنتجات المطلوبة',estimated_value:'قيمة المشتريات',requested_credit_limit:'الحد الائتماني المطلوب',notes:'ملاحظات',account_holder:'صاحب الحساب',purchasers:'مفوّضو الشراء',receivers:'مفوّضو الاستلام',accountants:'مسؤولو الحسابات',branches:'الفروع'};
let csrf='',viewer=null,selected=null,records=[],staffRole=null;
const statusError=$('#statusError')||$('#reviewError');
function showError(message){statusError.textContent=message;statusError.classList.add('visible');statusError.scrollIntoView({block:'nearest'});}
function clearError(){statusError.textContent='';statusError.classList.remove('visible');}
async function api(action,body=null,file=null,slot=null,extra=''){
 const options={cache:'no-store',credentials:'same-origin',headers:{Accept:'application/json'}};
 if(body!==null||file){options.method='POST';options.headers['X-CSRF-Token']=csrf;
  if(file){const data=new FormData();data.append('slot',slot);data.append('file',file,file.name);options.body=data;}
  else{options.headers['Content-Type']='application/json';options.body=JSON.stringify(body);}
 }
 const res=await fetch(apiURL+action+extra,options);
 const out=await res.json().catch(()=>({}));
 if(!res.ok||!out.ok)throw new Error(out.error||'server_error');
 return out;
}
function row(label,text){
 const div=document.createElement('div');div.className='flow-review-row';
 const title=document.createElement('b');title.textContent=label;
 const body=document.createElement('span');body.textContent=String(text??'—');div.append(title,body);return div;
}
function docLink(doc){
 const a=document.createElement('a');
 a.href='b2b-api.php?action=download&doc='+encodeURIComponent(doc.id);
 a.textContent='تحميل المستند';a.target='_blank';a.rel='noopener noreferrer';return a;
}
const docNames={commercial_register:'السجل التجاري',vat_registration:'الشهادة الضريبية',municipal_license:'رخصة البلدية',national_address:'العنوان الوطني',store_sign:'صورة الواجهة',owner_identity:'هوية صاحب الحساب',electronic_promissory_note:'السند الإلكتروني',signed_agreement:'الاتفاق الموقّع'};
function documents(container,docs){
 const items=Object.entries(docs||{});
 container.replaceChildren();
 if(!items.length){container.textContent='لم تُرفع مستندات لهذا الطلب بعد.';return;}
 for(const [slot,doc] of items){
   const div=document.createElement('div');div.className='flow-doc';
   const s=document.createElement('span');s.textContent=(docNames[slot]||slot.replace(/_/g,' '))+' · '+(doc.name||'ملف')+(doc.customer_code?' · كود العميل '+doc.customer_code:'');
   div.append(s,docLink(doc));container.append(div);
 }
}
function timeline(container,events){
 container.replaceChildren();
 if(!(events||[]).length){container.textContent='لا توجد إجراءات حتى الآن.';return;}
 for(const event of [...events].reverse()){
  const div=document.createElement('div');div.className='flow-event';
  const title=document.createElement('strong');title.textContent=event.action.replace(/_/g,' ');
  const meta=document.createElement('small');meta.textContent=fmtDate(event.at);
  div.append(title,meta);
  const note=event.detail?.reason;
  if(note){const p=document.createElement('p');p.textContent=note;p.style.margin='8px 0 0';div.append(p);}
  container.append(div);
 }
}
function flatten(data,prefix='',out=[]){
 if(!data||typeof data!=='object')return out;
 for(const [key,v] of Object.entries(data)){
  const title=(prefix?prefix+' / ':'')+(fieldNames[key]||key);
  if(v===null||v==='')continue;
  if(Array.isArray(v)){
   if(!v.length)continue;
   if(v.every(x=>typeof x!=='object'))out.push([title,v.join('، ')]);
   else v.forEach((x,i)=>flatten(x,title+' '+(i+1),out));
  }else if(typeof v==='object'){flatten(v,title,out);}
  else out.push([title,String(v)]);
 }
 return out;
}
function miniSummary(app){
 return [
  ['رقم الطلب',app.id],['نوع الحساب',app.account_type==='credit'?'آجل':'نقدي'],
  ['اسم العميل',app.data?.owner?.name],['البريد الإلكتروني',app.data?.owner?.email],
  ['المدينة',app.data?.location?.city],['أنشئ بتاريخ',fmtDate(app.created_at)],
  ['آخر تحديث',fmtDate(app.updated_at)],
  ...(app.accounting?.customer_code?[['كود العميل',app.accounting.customer_code]]:[]),
  ...(app.approved_credit_limit?[['الحد الائتماني المعتمد',app.approved_credit_limit+' ر.س']]:[])
 ];
}
async function session(){
 const s=await api('session');csrf=s.csrf;viewer=s.user;staffRole=s.staff_role;if($('#workflowPreview'))$('#workflowPreview').hidden=true;return s;
}
async function showStatus(){
 $('#statusLoading').hidden=false;$('#statusLogin').hidden=true;$('#statusEmpty').hidden=true;$('#statusApp').hidden=true;
 const who=await session();
 $('#statusLoading').hidden=true;
 if(!who.authenticated){$('#statusLogin').hidden=false;return;}
 const response=await api('my');const app=response.application;
 if(!app){$('#statusEmpty').hidden=false;return;}
 $('#statusApp').hidden=false;
 $('#statusCompany').textContent=app.data.legal.company;
 $('#statusPill').textContent=stateName[app.status]||app.status;
 $('#statusCode').textContent=app.id;
 const note=$('#statusNote');note.hidden=!app.review_note;note.textContent=app.review_note||'';
 const info=$('#statusMainFields');info.replaceChildren(...miniSummary(app).map(r=>row(r[0],r[1])));
 documents($('#statusDocs'),app.documents);
 timeline($('#statusTimeline'),app.history);
 const canEdit=['draft_documents','changes_requested'].includes(app.status);
 $('#statusEdit').hidden=!canEdit;
 $('#docUploadPanel').hidden=!canEdit;
 $('#signPanel').hidden=app.status!=='approved_pending_signature';
 if($('#approvedCreditNote'))$('#approvedCreditNote').textContent=app.approved_credit_limit?'الحد المعتمد: '+app.approved_credit_limit+' ريال. يجب أن يساوي مبلغ السند هذا الحد.':'يرجى التواصل مع الإدارة لتحديد الحد المعتمد قبل إصدار السند.';
 $('#statusResubmit').hidden=!canEdit;
}
function syncDocFormat(){
 const select=$('#statusDocSlot'),file=$('#statusDocFile'),hint=$('#statusDocHelp');
 if(!select||!file)return;
 const image=['store_sign','store_inside_1','store_inside_2','store_outside'].includes(select.value);
 file.accept=image?'.jpg,.jpeg,.png,.webp,.gif,.heic,.heif,.pdf,image/*,application/pdf':'.pdf,application/pdf';
 file.value='';
 if(hint)hint.textContent=image?'صورة المبنى: JPG أو PNG أو WebP أو HEIC أو GIF أو PDF، بحد أقصى 5 ميجابايت.':'المستند الرسمي PDF فقط، بحد أقصى 5 ميجابايت.';
}
$('#statusDocSlot')?.addEventListener('change',syncDocFormat);
if(page==='status')syncDocFormat();
$('#statusUpload')?.addEventListener('click',async()=>{
 clearError();
 const f=$('#statusDocFile')?.files?.[0],slot=$('#statusDocSlot')?.value;
 if(!f){showError('اختار ملفًا قبل الرفع.');return;}
 if(f.size>5242880){showError('حد الملف 5 ميجابايت.');return;}
 const photoSlots=['store_sign','store_inside_1','store_inside_2','store_outside'],photo=photoSlots.includes(slot);
 const extOk=photo?/\.(jpe?g|png|webp|gif|heic|heif|pdf)$/i.test(f.name):/\.pdf$/i.test(f.name);
 const head=new Uint8Array(await f.slice(0,24).arrayBuffer()),sig=(i,j)=>String.fromCharCode(...head.slice(i,j));
 const pdf=sig(0,5)==='%PDF-'&&/\.pdf$/i.test(f.name);
 const pic=photo&&((/\.jpe?g$/i.test(f.name)&&head[0]===255&&head[1]===216&&head[2]===255)||(/\.png$/i.test(f.name)&&[137,80,78,71,13,10,26,10].every((v,i)=>head[i]===v))||(/\.webp$/i.test(f.name)&&sig(0,4)==='RIFF'&&sig(8,12)==='WEBP')||(/\.gif$/i.test(f.name)&&['GIF87a','GIF89a'].includes(sig(0,6)))||(/\.(heic|heif)$/i.test(f.name)&&sig(4,8)==='ftyp'&&/^(heic|heix|hevc|hevx|mif1|msf1|heif)/.test(sig(8,12))));
 if(!extOk||!(pdf||pic)){showError('المستندات الرسمية PDF فقط. صور المبنى تُقبل كصورة عادية أو PDF.');return;}
 const btn=$('#statusUpload');btn.disabled=true;
 try{await api('upload',null,f,slot);$('#statusDocFile').value='';await showStatus();}
 catch(e){showError('تعذر رفع الملف: '+e.message);}finally{btn.disabled=false;}
});
$('#statusResubmit')?.addEventListener('click',async()=>{
 clearError();const btn=$('#statusResubmit');btn.disabled=true;
 try{await api('submit',{});await showStatus();}catch(e){showError('لم يتم إرسال الطلب: '+e.message);}finally{btn.disabled=false;}
});
$('#submitSigned')?.addEventListener('click',async()=>{
 clearError();const file=$('#signedFile')?.files?.[0];
 if(!file){showError('اختار المستند الموقع أولًا.');return;}
 if(file.size>5242880){showError('حد الملف 5 ميجابايت.');return;}
 if(!/\.pdf$/i.test(file.name)||file.type&&file.type!=='application/pdf'||await file.slice(0,5).text()!=='%PDF-'){showError('السند الإلكتروني يجب أن يكون ملف PDF صالحًا.');return;}
 const btn=$('#submitSigned');btn.disabled=true;
 try{await api('upload',null,file,'electronic_promissory_note');await api('signed_submit',{});await showStatus();}
 catch(e){showError('تعذر إرسال التوقيع: '+e.message);}finally{btn.disabled=false;}
});
function renderRows(){
 const query=$('#reviewSearch').value.trim().toLowerCase(),status=$('#reviewFilter').value;
 const shown=records.filter(x=>(!status||x.status===status)&&(!query||(x.company+' '+x.email+' '+x.id).toLowerCase().includes(query)));
 const target=$('#reviewRows');target.replaceChildren();
 if(!shown.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.textContent='لا توجد طلبات مطابقة.';tr.append(td);target.append(tr);return;}
 for(const app of shown){
  const tr=document.createElement('tr');
  const cols=[app.id,app.company,app.type==='credit'?'آجل':'نقدي',stateName[app.status]||app.status,fmtDate(app.updated_at)];
  for(const txt of cols){const td=document.createElement('td');td.textContent=txt;tr.append(td);}
  const td=document.createElement('td'),button=document.createElement('button');
  button.className='flow-secondary';button.textContent='فتح';button.addEventListener('click',()=>detail(app.id));
  td.append(button);tr.append(td);target.append(tr);
 }
}
async function list(){
 clearError();const out=await api('staff_list');records=out.applications;staffRole=out.role;
 $('#reviewLoading').hidden=true;$('#reviewMain').hidden=false;$('#reviewDenied').hidden=true;
 if($('#staffGrantPanel'))$('#staffGrantPanel').hidden=staffRole!=='admin';
 $('#notificationWarning').textContent='إشعارات البريد في قائمة انتظار الإرسال: '+out.notifications_queued+'. لا يتم اعتبار أي رسالة مُرسلة قبل توصيل خدمة SMTP معتمدة.';
 renderRows();
}
function allowedButtons(status,role){
 const allowed={
 submitted:['begin_review','request_changes','reject','approve'],
 under_review:['request_changes','reject','approve'],
 signed_submitted:['request_changes','reject','send_to_accounting'],
 accounting_pending:['activate']
 };
 return (allowed[status]||[]).filter(act=>(act==='activate'?['admin','accountant'].includes(role):['admin','reviewer'].includes(role)));
}
async function detail(id){
 clearError();
 const response=await api('staff_detail',null,null,null,'&id='+encodeURIComponent(id));
 selected=response.application;
 $('#reviewDetail').hidden=false;$('#detailTitle').textContent=selected.data.legal.company+' · '+selected.id;
 $('#detailOverview').replaceChildren(...miniSummary(selected).map(([a,b])=>row(a,b)));
 $('#detailData').replaceChildren(...flatten(selected.data).map(([a,b])=>row(a,b)));
 documents($('#detailDocuments'),selected.documents);timeline($('#detailTimeline'),selected.history);
 const buttons=allowedButtons(selected.status,staffRole);
 $$('[data-decision]').forEach(button=>button.hidden=!buttons.includes(button.dataset.decision));
 $('#decisionPanel').hidden=!buttons.some(x=>x!=='activate');
 $('#accountingPanel').hidden=!buttons.includes('activate');
 const accounts=selected.accounting||{};
 $('#accountCustomerCode').value=accounts.customer_code||'';
 $('#accountRepresentative').value=accounts.representative||'';
 $('#accountSupplier').value=accounts.supplier||'';
 $('#accountNotes').value=accounts.notes||'';
 $('#decisionNote').value='';
 const credit=selected.account_type==='credit';
 if($('#creditLimitPanel'))$('#creditLimitPanel').hidden=!(credit&&['submitted','under_review'].includes(selected.status)&&buttons.includes('approve'));
 if($('#approvedCreditLimit'))$('#approvedCreditLimit').value=selected.approved_credit_limit||selected.data?.purchasing?.requested_credit_limit||'';
 if($('#creditNoteVerification'))$('#creditNoteVerification').hidden=!(credit&&buttons.includes('send_to_accounting'));
 if($('#verifiedPromissoryAmount'))$('#verifiedPromissoryAmount').value=selected.approved_credit_limit||'';
 if($('#promissoryVerified'))$('#promissoryVerified').checked=false;
 $('#reviewDetail').scrollIntoView({block:'start',behavior:'smooth'});
}
$$('[data-decision]').forEach(button=>button.addEventListener('click',async()=>{
 clearError();if(!selected)return;
 const decision=button.dataset.decision,note=$('#decisionNote').value.trim();
 if(['request_changes','reject'].includes(decision)&&note.length<8){showError('اكتب سببًا واضحًا لا يقل عن 8 أحرف.');return;}
 if(decision==='activate'&&(!$('input#accountCustomerCode').value.trim()||!$('#accountRepresentative').value.trim())){showError('أدخل كود العميل ومسؤول الحساب قبل التفعيل.');return;}
 if(!confirm('تأكيد الإجراء: '+button.textContent.trim()+'؟'))return;
 const body={id:selected.id,decision,reason:note};
 if(decision==='approve'&&selected.account_type==='credit'){
   const limit=Number($('#approvedCreditLimit')?.value||0);
   if(!Number.isFinite(limit)||limit<=0){showError('أدخل الحد الائتماني المعتمد أولًا.');return;}
   body.approved_credit_limit=limit.toFixed(2);
 }
 if(decision==='send_to_accounting'&&selected.account_type==='credit'){
   const amount=Number($('#verifiedPromissoryAmount')?.value||0);
   if(!Number.isFinite(amount)||amount<=0||!$('#promissoryVerified')?.checked){showError('راجع قيمة السند الإلكتروني وأكّد المطابقة قبل الإرسال للحسابات.');return;}
   body.promissory_amount=amount.toFixed(2);body.promissory_verified=true;
 }
 if(decision==='activate')body.accounting={customer_code:$('#accountCustomerCode').value.trim(),representative:$('#accountRepresentative').value.trim(),supplier:$('#accountSupplier').value.trim(),notes:$('#accountNotes').value.trim()};
 button.disabled=true;
 try{await api('decision',body);await list();await detail(selected.id);}catch(e){showError('تعذر حفظ القرار: '+e.message);}finally{button.disabled=false;}
}));
$('#grantStaff')?.addEventListener('click',async()=>{
 clearError();const email=$('#staffEmail').value.trim(),role=$('#staffRole').value;
 if(!email){showError('أدخل البريد الإلكتروني لموظف روما.');return;}
 const button=$('#grantStaff');button.disabled=true;
 try{await api('staff_assign',{email,role});$('#staffEmail').value='';alert('تم حفظ صلاحية الموظف.');}
 catch(e){showError('تعذر حفظ الصلاحية: '+e.message);}
 finally{button.disabled=false;}
});
$('#reviewRefresh')?.addEventListener('click',()=>list().catch(e=>showError(e.message)));
$('#reviewSearch')?.addEventListener('input',renderRows);
$('#reviewFilter')?.addEventListener('change',renderRows);
$('#detailClose')?.addEventListener('click',()=>{$('#reviewDetail').hidden=true;});
if(page==='status')showStatus().catch(()=>{$('#statusLoading').hidden=true;showError('متابعة الطلبات غير مفعّلة في نسخة المعاينة إلى حين نشر خدمة الحسابات الآمنة.');});
if(page==='review')session().then(s=>{if(!s.authenticated||!['admin','reviewer','accountant'].includes(s.staff_role)){ $('#reviewLoading').hidden=true;$('#reviewDenied').hidden=false;return;}return list();}).catch(()=>{$('#reviewLoading').hidden=true;$('#reviewDenied').hidden=true;showError('خدمة مراجعة الطلبات غير منشورة في نسخة المعاينة.');});
})();
