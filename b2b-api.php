<?php
declare(strict_types=1);
/**
 * Roma B2B / Account Opening Workflow (v1.0)
 * Extends the EXISTING Roma encrypted-state engine. No credentials, customer
 * files, or database exports live in this Git repository.
 */
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
$romaRoot=is_file(__DIR__.'/app/core.php')?__DIR__:dirname(__DIR__);
require $romaRoot.'/app/core.php';

$secure=(!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off')||($_SERVER['SERVER_PORT']??'')==443;
$dev=getenv('ROMA_DEV')==='1'&&in_array($_SERVER['REMOTE_ADDR']??'', ['127.0.0.1','::1'],true);
session_name('ROMAB2B_'.substr(hash('sha256',$romaRoot),0,10));
ini_set('session.use_strict_mode','1');
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$secure,'httponly'=>true,'samesite'=>'Strict']);
session_start();
$_SESSION['csrf']??=bin2hex(random_bytes(24));

/** Small, strictly typed helpers to protect the legacy state from malformed submissions. */
function b2bValue(mixed $v,int $max=200,bool $required=false): string {
    requireThat(is_string($v)||is_numeric($v),'invalid_input');
    $s=trim((string)$v);
    requireThat(mb_strlen($s,'UTF-8')<=$max && (!$required || $s!==''),'invalid_input');
    return $s;
}
function b2bObj(mixed $value):array {requireThat(is_array($value),'invalid_input'); return $value;}
function b2bArray(mixed $value,int $max=12):array {
    requireThat(is_array($value) && array_is_list($value) && count($value)<=$max,'invalid_input');
    return $value;
}
function b2bOptionalDate(mixed $value): string {
    $v=b2bValue($value??'',10);
    requireThat($v==='' || preg_match('/^\d{4}-\d\d-\d\d$/D',$v)===1,'invalid_input');
    return $v;
}
function b2bText(mixed $v,int $max=300):string {return b2bValue($v??'',$max);}
function b2bMoney(mixed $v):string {
    $s=b2bValue($v??'',70,true);
    requireThat(is_numeric($s) && (float)$s>0 && (float)$s<=100000000,'invalid_amount');
    return $s;
}
function b2bDigits(mixed $input,int $length,string $error,bool $endWithThree=false):string {
    $raw=b2bValue($input??'',$length*4,true);
    $raw=strtr($raw,['٠'=>'0','١'=>'1','٢'=>'2','٣'=>'3','٤'=>'4','٥'=>'5','٦'=>'6','٧'=>'7','٨'=>'8','٩'=>'9','۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9']);
    requireThat(preg_match('/^[0-9]{'.$length.'}$/D',$raw)===1 && (!$endWithThree || str_ends_with($raw,'3')),$error,422);
    return $raw;
}
function b2bOptionalPostal(mixed $input):string {
    $v=trim((string)($input??''));
    return $v===''?'':b2bDigits($v,5,'invalid_postal_code');
}
function b2bCoordinate(mixed $v,bool $latitude):string {
    $s=b2bValue($v??'',24);
    if($s==='')return '';
    requireThat(is_numeric($s) && abs((float)$s)<=($latitude?90:180),'invalid_coordinate');
    return $s;
}
function b2bPerson(array $row):array {
    return [
      'name'=>b2bText($row['name']??'',130),
      'nationality'=>b2bText($row['nationality']??'',60),
      'identity_number'=>b2bText($row['identity_number']??'',80),
      'phone'=>b2bText($row['phone']??'',40),
    ];
}
function b2bSanitizeApplication(array $raw):array {
    $type=b2bValue($raw['account_type']??'',12,true);
    requireThat(in_array($type,['cash','credit'],true),'invalid_account_type');
    $legal=b2bObj($raw['legal']??[]);
    $owner=b2bObj($raw['owner']??[]);
    $location=b2bObj($raw['location']??[]);
    $purchasing=b2bObj($raw['purchasing']??[]);
    $people=b2bObj($raw['people']??[]);
    $company=b2bValue($legal['company']??'',150,true);
    $registration=b2bDigits($legal['registration']??'',10,'invalid_registration');
    $vat=b2bDigits($legal['vat']??'',15,'invalid_vat',true);
    $sector=b2bValue($legal['sector']??'',80,true);
    requireThat(in_array($sector,['retail','hospitality','distribution','other'],true),'invalid_input');
    $name=b2bValue($owner['name']??'',150,true);
    $phone=b2bValue($owner['phone']??'',35,true);
    $email=strtolower(b2bValue($owner['email']??'',200,true));
    requireThat(filter_var($email,FILTER_VALIDATE_EMAIL)!==false,'invalid_email');
    requireThat($email===strtolower(b2bValue($owner['email_confirmation']??'',200,true)),'email_mismatch');
    $city=b2bValue($location['city']??'',100,true);
    $address=b2bValue($location['address']??'',1000,true);
    $building=b2bDigits($location['building_number']??'',4,'invalid_building_number');
    $postal=b2bDigits($location['postal_code']??'',5,'invalid_postal_code');
    $branchItems=[];
    foreach(b2bArray($location['branches']??[],12) as $branch) {
       $branch=b2bObj($branch);
       $branchItems[]=[
          'name'=>b2bText($branch['name']??'',120),
          'city'=>b2bText($branch['city']??'',100),
          'address'=>b2bText($branch['address']??'',600),
          'postal_code'=>b2bOptionalPostal($branch['postal_code']??''),
          'latitude'=>b2bText($branch['latitude']??'',24),
          'longitude'=>b2bText($branch['longitude']??'',24),
       ];
    }
    $purchasers=[];$receivers=[];$accountants=[];
    foreach(['purchasers','receivers','accountants'] as $key) {
      $tmp=[];
      foreach(b2bArray($people[$key]??[],15) as $p)$tmp[]=b2bPerson(b2bObj($p));
      if($key==='purchasers')$purchasers=$tmp;
      elseif($key==='receivers')$receivers=$tmp;
      else $accountants=$tmp;
    }
    $out=[
       'account_type'=>$type,
       'legal'=>[
           'company'=>$company, 'registration'=>$registration,
           'sector'=>$sector,'activity_other'=>b2bText($legal['activity_other']??'',120),
           'issue_date'=>b2bOptionalDate($legal['issue_date']??''),
           'issue_region'=>b2bText($legal['issue_region']??'',120),
           'civil_number'=>b2bText($legal['civil_number']??'',80),
           'expiry_date'=>b2bOptionalDate($legal['expiry_date']??''),
           'vat'=>$vat,
       ],
       'owner'=>[
           'name'=>$name,'phone'=>$phone,'email'=>$email,
           'identity_number'=>b2bText($owner['identity_number']??'',80),
       ],
       'location'=>[
           'city'=>$city,'address'=>$address,
           'street'=>b2bText($location['street']??'',120),
           'postal_code'=>$postal,'building_number'=>$building,
           'unified_national_number'=>b2bText($location['unified_national_number']??'',80),
           'latitude'=>b2bCoordinate($location['latitude']??'',true),
           'longitude'=>b2bCoordinate($location['longitude']??'',false),
           'branches'=>$branchItems
       ],
       'purchasing'=>[
           'categories'=>array_values(array_filter(array_map(
             fn($x)=>b2bText($x,70),b2bArray($purchasing['categories']??[],12)), fn($x)=>$x!==''
           )),
           'estimated_value'=>$type==='credit'?b2bMoney($purchasing['estimated_value']??''):b2bText($purchasing['estimated_value']??'',70),
           'requested_credit_limit'=>$type==='credit'?b2bMoney($purchasing['requested_credit_limit']??''):b2bText($purchasing['requested_credit_limit']??'',70),
           'notes'=>b2bText($purchasing['notes']??'',1300),
       ],
       'people'=>[
           'account_holder'=>b2bPerson(b2bObj($people['account_holder']??[])),
           'purchasers'=>$purchasers,'receivers'=>$receivers,'accountants'=>$accountants,
       ]
    ];
    if($type==='credit'){
      requireThat($out['legal']['issue_date']!=='' && $out['legal']['issue_region']!=='' && $out['legal']['civil_number']!=='' && $out['legal']['expiry_date']!=='','missing_credit_legal');
      requireThat($out['owner']['identity_number']!=='' && $out['location']['postal_code']!=='' && $out['location']['unified_national_number']!=='','missing_credit_details');
      requireThat(count($out['purchasing']['categories'])>0 && $out['purchasing']['estimated_value']!=='' && $out['purchasing']['requested_credit_limit']!=='','missing_purchase_details');
      requireThat(count($purchasers)>0 && count($receivers)>0 && count($accountants)>0,'missing_authorized_people');
      foreach(array_merge($purchasers,$receivers,$accountants) as $person){
          requireThat($person['name']!=='' && $person['nationality']!=='' && $person['identity_number']!=='','missing_authorized_people');
      }
      requireThat($out['people']['account_holder']['name']!=='' && $out['people']['account_holder']['nationality']!=='' && $out['people']['account_holder']['identity_number']!=='','missing_authorized_people');
    }
    return $out;
}
function b2bRole(array $db):string {
    $u=auth($db);
    if($u['role']==='admin')return 'admin';
    return (string)($db['b2b_staff_roles'][$u['id']]??'');
}
function b2bStaff(array $db,array $allowed=['admin','reviewer','accountant']):array {
    $u=auth($db);requireThat(in_array(b2bRole($db),$allowed,true),'forbidden',403);
    return $u;
}
function b2bGetMine(array $db):?array {
    $u=auth($db);$id=$db['b2b_application_by_user'][$u['id']]??null;
    return $id?($db['b2b_applications'][$id]??null):null;
}
function b2bRecord(array $db,string $id):array {
    $r=$db['b2b_applications'][$id]??null;requireThat(is_array($r),'not_found',404);return $r;
}
function b2bAudit(array &$db,string $appId,string $actor,string $action,array $detail=[]):void {
    $entry=['at'=>gmdate(DATE_ATOM),'actor'=>$actor,'action'=>$action,'detail'=>$detail];
    $db['b2b_applications'][$appId]['history'][]=$entry;
    $db['b2b_applications'][$appId]['updated_at']=$entry['at'];
    audit($db,$actor,'b2b_'.$action,['application'=>$appId]+$detail);
}
function b2bRateLimit(array &$db,string $action,int $limit=15):void {
    $key='b2b-'.hash('sha256',($_SERVER['REMOTE_ADDR']??'').'|'.$action);
    $now=time();$row=$db['attempts'][$key]??['start'=>$now,'count'=>0];
    if($now-$row['start']>900)$row=['start'=>$now,'count'=>0];
    requireThat($row['count']<$limit,'rate_limited',429);
    $row['count']++;$db['attempts'][$key]=$row;
}
function b2bQueueNotification(array &$db,string $appId,string $event,string $text):void {
    $app=$db['b2b_applications'][$appId];
    $db['b2b_notifications'][]=[
      'id'=>uid('MSG'),'application'=>$appId,'event'=>$event,
      'recipient'=>$app['data']['owner']['email'],'subject'=>'Roma B2B: '.$event,
      'message'=>$text,'status'=>'queued','created_at'=>gmdate(DATE_ATOM)
    ];
    // Delivery must be wired to a verified SMTP provider; queue does not mean sent.
}
function b2bSummary(array $r):array {
    return [
      'id'=>$r['id'],'user_id'=>$r['user_id'],'company'=>$r['data']['legal']['company'],
      'contact'=>$r['data']['owner']['name'],'email'=>$r['data']['owner']['email'],
      'type'=>$r['account_type'],'status'=>$r['status'],
      'created_at'=>$r['created_at'],'updated_at'=>$r['updated_at'],
      'documents_count'=>count($r['documents']??[]),
      'customer_code'=>$r['accounting']['customer_code']??null,
      'approved_credit_limit'=>$r['approved_credit_limit']??null,
    ];
}
function b2bHandleStart(array &$db,array $in):array {
    b2bRateLimit($db,'start',8);
    requireThat(($in['consent']??false)===true,'consent_required');
    $data=b2bSanitizeApplication(b2bObj($in['application']??[]));
    $u=user($db);$newAccount=false;
    if(!$u){
       $password=b2bValue($in['password']??'',72,true);
       requireThat(strlen($password)>=12,'password_too_short');
       perform($db,'register',[
          'name'=>$data['owner']['name'],'company'=>$data['legal']['company'],
          'email'=>$data['owner']['email'],'phone'=>$data['owner']['phone'],
          'city'=>$data['location']['city'],'address'=>$data['location']['address'],
          'registration'=>$data['legal']['registration'],'vat'=>$data['legal']['vat'],
          'sector'=>$data['legal']['sector'],'password'=>$password,'consent'=>true
       ]);
       $u=user($db);$newAccount=true;
    }
    requireThat($u!==null && $u['role']==='customer','forbidden',403);
    requireThat($u['status']!=='rejected' && $u['status']!=='suspended','account_not_eligible',403);
    requireThat(strtolower($u['email'])===$data['owner']['email'],'account_email_mismatch');
    $existingId=$db['b2b_application_by_user'][$u['id']]??null;
    if($existingId){
       $record=b2bRecord($db,$existingId);
       requireThat(in_array($record['status'],['draft_documents','changes_requested'],true),'application_already_submitted',409);
       $db['b2b_applications'][$existingId]['data']=$data;
       $db['b2b_applications'][$existingId]['account_type']=$data['account_type'];
       $db['b2b_applications'][$existingId]['status']='draft_documents';
       b2bAudit($db,$existingId,$u['id'],'application_edited');
       return ['ok'=>true,'application'=>b2bSummary($db['b2b_applications'][$existingId]),'new_account'=>$newAccount];
    }
    $appId=uid('B2BA');
    $db['b2b_applications'][$appId]=[
      'id'=>$appId,'user_id'=>$u['id'],'account_type'=>$data['account_type'],
      'data'=>$data,'documents'=>[],'status'=>'draft_documents',
      'review_note'=>'','history'=>[], 'accounting'=>[],
      'created_at'=>gmdate(DATE_ATOM),'updated_at'=>gmdate(DATE_ATOM)
    ];
    $db['b2b_application_by_user'][$u['id']]=$appId;
    b2bAudit($db,$appId,$u['id'],'draft_created',['type'=>$data['account_type']]);
    return ['ok'=>true,'application'=>b2bSummary($db['b2b_applications'][$appId]),'new_account'=>$newAccount];
}
function b2bValidateFile(array $file,string $slot):array {
    requireThat(($file['error']??UPLOAD_ERR_NO_FILE)===UPLOAD_ERR_OK,'upload_failed',422);
    $size=(int)($file['size']??0);
    requireThat($size>32 && $size<=5242880,'file_too_large',413);
    $tmp=(string)($file['tmp_name']??'');
    requireThat(is_uploaded_file($tmp),'invalid_file');
    $data=file_get_contents($tmp);
    requireThat(is_string($data)&&strlen($data)===$size,'invalid_file');
    $mime=(new finfo(FILEINFO_MIME_TYPE))->buffer($data);
    $name=(string)($file['name']??'');
    if($mime==='application/pdf'&&str_starts_with($data,'%PDF-')&&preg_match('/\.pdf$/iD',$name)===1){
      return ['bytes'=>$data,'mime'=>'application/pdf'];
    }
    $photoSlots=['store_sign','store_inside_1','store_inside_2','store_outside'];
    requireThat(in_array($slot,$photoSlots,true),'invalid_file',422);
    $formats=[
      'image/jpeg'=>['jpg','jpeg'],
      'image/png'=>['png'],
      'image/webp'=>['webp'],
      'image/gif'=>['gif'],
      'image/heic'=>['heic'],
      'image/heif'=>['heif','heic']
    ];
    if(in_array($mime,['image/heic','image/heif','application/octet-stream'],true)
       && substr($data,4,4)==='ftyp'
       && in_array(substr($data,8,4),['heic','heix','hevc','hevx','mif1','msf1','heif'],true)
       && preg_match('/\.(heic|heif)$/iD',$name)===1){
       return ['bytes'=>$data,'mime'=>str_ends_with(strtolower($name),'.heif')?'image/heif':'image/heic'];
    }
    requireThat(isset($formats[$mime]),'invalid_file',422);
    $ext=strtolower((string)pathinfo($name,PATHINFO_EXTENSION));
    requireThat(in_array($ext,$formats[$mime],true),'invalid_file',422);
    $dimensions=@getimagesizefromstring($data);
    requireThat($dimensions!==false&&$dimensions[0]>0&&$dimensions[1]>0
      &&$dimensions[0]<=8000&&$dimensions[1]<=8000
      &&$dimensions[0]*$dimensions[1]<=24000000,'invalid_file',422);
    return ['bytes'=>$data,'mime'=>$mime];
}
function b2bDocSlot(string $slot):bool {
    $fixed=[
      'commercial_register','civil_register','municipal_license','national_address',
      'vat_registration','chamber_certificate','owner_identity',
      'store_sign','store_inside_1','store_inside_2','store_outside',
      'signed_agreement','electronic_promissory_note','additional_document'
    ];
    return in_array($slot,$fixed,true) || preg_match('/^(account_holder|purchaser|receiver|accountant)_identity_(?:[0-9]|1[0-4])$/D',$slot)===1;
}
function b2bHandleUpload(array &$db,string $slot,array $file):array {
    $u=auth($db,['customer']);$id=$db['b2b_application_by_user'][$u['id']]??'';
    $record=b2bRecord($db,$id);
    requireThat(in_array($record['status'],['draft_documents','changes_requested','approved_pending_signature'],true),'upload_closed',409);
    requireThat(b2bDocSlot($slot),'invalid_document_slot');
    if($record['status']==='approved_pending_signature')requireThat(in_array($slot,['signed_agreement','electronic_promissory_note'],true),'upload_closed',409);
    if($slot==='electronic_promissory_note')requireThat($record['account_type']==='credit' && $record['status']==='approved_pending_signature','upload_closed',409);
    requireThat(count($record['documents'])<32||isset($record['documents'][$slot]),'too_many_documents');
    $validated=b2bValidateFile($file,$slot);
    $docId=saveDocument($db,$validated,$u['id'],'b2b_'.$slot);
    $db['b2b_applications'][$id]['documents'][$slot]=[
      'id'=>$docId,'mime'=>$validated['mime'],'name'=>b2bValue($file['name']??'document',160),'uploaded_at'=>gmdate(DATE_ATOM)
    ];
    b2bAudit($db,$id,$u['id'],'document_uploaded',['slot'=>$slot]);
    return ['ok'=>true,'slot'=>$slot,'document'=>$docId];
}
function b2bSubmit(array &$db):array {
    $u=auth($db,['customer']);$id=$db['b2b_application_by_user'][$u['id']]??'';
    $record=b2bRecord($db,$id);requireThat(in_array($record['status'],['draft_documents','changes_requested'],true),'invalid_transition',409);
    $required=['commercial_register','vat_registration','municipal_license','national_address','store_sign'];
    if($record['account_type']==='credit')$required[]='owner_identity';
    foreach($required as $slot){
      requireThat(isset($record['documents'][$slot]),'missing_required_documents');
      $mime=(string)($record['documents'][$slot]['mime']??'');
      if($slot==='store_sign')requireThat(in_array($mime,['application/pdf','image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif'],true),'invalid_file');
      else requireThat($mime==='application/pdf','invalid_file');
    }
    $db['b2b_applications'][$id]['status']='submitted';
    $db['b2b_applications'][$id]['review_note']='';
    b2bAudit($db,$id,$u['id'],'application_submitted');
    b2bQueueNotification($db,$id,'application_received','تم استلام طلب حساب الأعمال بنجاح، وهو قيد المراجعة.');
    return ['ok'=>true,'application'=>b2bSummary($db['b2b_applications'][$id])];
}
function b2bDecision(array &$db,array $in):array {
    $u=b2bStaff($db,['admin','reviewer','accountant']);
    $role=b2bRole($db);
    $id=b2bValue($in['id']??'',100,true);
    $record=b2bRecord($db,$id);
    $decision=b2bValue($in['decision']??'',50,true);
    $reason=b2bText($in['reason']??'',1500);
    $status=$record['status'];
    $next='';
    if(in_array($decision,['begin_review','request_changes','reject','approve'],true)){
       requireThat(in_array($role,['admin','reviewer'],true),'forbidden',403);
       if($decision==='begin_review'){requireThat($status==='submitted','invalid_transition');$next='under_review';}
       if($decision==='request_changes'){requireThat(in_array($status,['submitted','under_review','signed_submitted'],true),'invalid_transition');requireThat(mb_strlen($reason,'UTF-8')>=8,'reason_required');$next='changes_requested';}
       if($decision==='reject'){requireThat(in_array($status,['submitted','under_review','signed_submitted'],true),'invalid_transition');requireThat(mb_strlen($reason,'UTF-8')>=8,'reason_required');$next='rejected';}
       if($decision==='approve'){requireThat(in_array($status,['submitted','under_review'],true),'invalid_transition');
          if($record['account_type']==='credit'){
             requireThat(isset($in['approved_credit_limit']) && (string)$in['approved_credit_limit']!=='','approved_credit_limit_required');
             $limit=b2bMoney($in['approved_credit_limit']);
             $db['b2b_applications'][$id]['approved_credit_limit']=$limit;
          }
          $next=$record['account_type']==='credit'?'approved_pending_signature':'accounting_pending';
       }
    }elseif($decision==='send_to_accounting'){
       requireThat(in_array($role,['admin','reviewer'],true),'forbidden',403);
       requireThat($status==='signed_submitted','invalid_transition');
       requireThat(isset($record['documents']['electronic_promissory_note']),'promissory_note_required');
       requireThat(($record['documents']['electronic_promissory_note']['mime']??'')==='application/pdf','invalid_file');
       requireThat(($in['promissory_verified']??false)===true,'promissory_verification_required');
       $approved=(string)($record['approved_credit_limit']??'');
       requireThat($approved!=='','approved_credit_limit_required');
       requireThat(isset($in['promissory_amount'])&&$in['promissory_amount']!=='','promissory_amount_required');
       requireThat((int)round((float)b2bMoney($in['promissory_amount'])*100)===(int)round((float)$approved*100),'promissory_limit_mismatch');
       $db['b2b_applications'][$id]['promissory_verified_at']=gmdate(DATE_ATOM);
       $db['b2b_applications'][$id]['promissory_verified_by']=$u['id'];
       $next='accounting_pending';
    }elseif($decision==='activate'){
       requireThat(in_array($role,['admin','accountant'],true),'forbidden',403);
       requireThat($status==='accounting_pending','invalid_transition');
       $account=b2bObj($in['accounting']??[]);
       $code=b2bValue($account['customer_code']??'',100,true);
       foreach($db['b2b_applications']??[] as $existing){
         if(($existing['id']??'')!==$id && ($existing['status']??'')==='active' && ($existing['accounting']['customer_code']??null)===$code)throw new AppError('duplicate_customer_code',409);
       }
       if($record['account_type']==='credit'){
         requireThat(!empty($record['approved_credit_limit']) && isset($record['documents']['electronic_promissory_note']) && !empty($record['promissory_verified_at']),'promissory_verification_required');
       }
       $representative=b2bValue($account['representative']??'',150,true);
       $supplier=b2bText($account['supplier']??'',150);
       $notes=b2bText($account['notes']??'',1000);
       $db['b2b_applications'][$id]['accounting']=['customer_code'=>$code,'representative'=>$representative,'supplier'=>$supplier,'notes'=>$notes];
       $indexed=[];
       foreach($db['b2b_applications'][$id]['documents'] as $slot=>$entry){
          $docId=(string)($entry['id']??'');
          if($docId==='' || !isset($db['documents'][$docId]))continue;
          $db['documents'][$docId]['customer_code']=$code;
          $db['b2b_applications'][$id]['documents'][$slot]['customer_code']=$code;
          $indexed[$slot]=$docId;
       }
       $db['b2b_customer_document_index'][$code]=['application'=>$id,'user_id'=>$record['user_id'],'documents'=>$indexed,'linked_at'=>gmdate(DATE_ATOM)];
       $next='active';
       $db['users'][$record['user_id']]['status']='approved';
       $db['users'][$record['user_id']]['decision_at']=now();
    }else throw new AppError('invalid_action',422);
    $db['b2b_applications'][$id]['status']=$next;
    $db['b2b_applications'][$id]['review_note']=$reason;
    if($next==='rejected'){
       $db['users'][$record['user_id']]['status']='rejected';
       $db['users'][$record['user_id']]['decision_note']=$reason;
    }
    b2bAudit($db,$id,$u['id'],$decision,['status'=>$next,'reason'=>$reason]);
    b2bQueueNotification($db,$id,$decision,'تم تحديث طلب حساب الأعمال. يمكنك تسجيل الدخول لمتابعة حالته وملاحظات المراجعة.');
    return ['ok'=>true,'application'=>b2bSummary($db['b2b_applications'][$id])];
}
function b2bAssignStaff(array &$db,array $in):array {
    $actor=auth($db,['admin']);
    $email=strtolower(b2bValue($in['email']??'',200,true));
    $role=b2bValue($in['role']??'',20,true);
    requireThat(in_array($role,['reviewer','accountant','none'],true),'invalid_input');
    $found=null;
    foreach($db['users'] as $u){if(strtolower((string)$u['email'])===$email){$found=$u;break;}}
    requireThat($found!==null && in_array($found['role'],['rep','admin'],true),'staff_user_not_found',404);
    requireThat($found['role']!=='admin','cannot_change_admin_role',403);
    if($role==='none')unset($db['b2b_staff_roles'][$found['id']]);
    else $db['b2b_staff_roles'][$found['id']]=$role;
    audit($db,$actor['id'],'b2b_staff_role_updated',['user'=>$found['id'],'role'=>$role]);
    return ['ok'=>true,'email'=>$email,'role'=>$role];
}
function b2bStaffList(array $db):array {
    b2bStaff($db);
    $records=array_map('b2bSummary',array_values($db['b2b_applications']??[]));
    usort($records,fn($a,$b)=>strcmp($b['updated_at'],$a['updated_at']));
    return ['ok'=>true,'applications'=>array_slice($records,0,500),'role'=>b2bRole($db),'notifications_queued'=>count(array_filter($db['b2b_notifications']??[],fn($n)=>($n['status']??'')==='queued'))];
}
try{
  requireThat(PHP_VERSION_ID>=80200,'php_version',503);
  requireThat($secure||$dev,'https_required',426);
  if(isset($_SESSION['last_seen']) && time()-$_SESSION['last_seen']>3600){unset($_SESSION['uid'],$_SESSION['auth_version']);session_regenerate_id(true);}
  $_SESSION['last_seen']=time();
  $action=(string)($_GET['action']??'session');
  if($_SERVER['REQUEST_METHOD']==='GET'){
     if($action==='session'){
        $result=transaction(function($db) {
            $u=user($db);
            return ['ok'=>true,'csrf'=>$_SESSION['csrf'],'authenticated'=>$u!==null,
             'user'=>$u?['name'=>$u['name'],'email'=>$u['email'],'role'=>$u['role'],'status'=>$u['status']]:null,
             'staff_role'=>$u?b2bRole($db):null,'version'=>'b2b-flow-1.1-cash-credit-pdf'];
        },false);
     }elseif($action==='my'){
        $result=transaction(function($db){$app=b2bGetMine($db);return ['ok'=>true,'application'=>$app];},false);
     }elseif($action==='download'){
        $docId=b2bValue($_GET['doc']??'',120,true);
        $doc=transaction(function($db)use($docId){
           $u=auth($db);$allowed=false;
           foreach($db['b2b_applications']??[] as $application){
              foreach($application['documents']??[] as $entry){
                 if(($entry['id']??'')!==$docId)continue;
                 $allowed=$application['user_id']===$u['id'] || in_array(b2bRole($db),['admin','reviewer','accountant'],true);
                 break 2;
              }
           }
           requireThat($allowed,'forbidden',403);
           $d=$db['documents'][$docId]??null;requireThat(is_array($d),'not_found',404);
           return $d;
        },false);
        $ext=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/gif'=>'gif','image/heic'=>'heic','image/heif'=>'heif','application/pdf'=>'pdf'][$doc['mime']]??'bin';
        $path=config()['dir'].'/'.$doc['id'].'.php';requireThat(is_file($path),'not_found',404);
        header('Content-Type: '.$doc['mime']);
        header('Content-Disposition: attachment; filename="'.preg_replace('/[^A-Za-z0-9-]/','',$doc['id']).'.'.$ext.'"');
        echo decryptBytes((string)file_get_contents($path));exit;
     }elseif($action==='staff_list'){
        $result=transaction(fn($db)=>b2bStaffList($db),false);
     }elseif($action==='staff_detail'){
        $result=transaction(function($db){b2bStaff($db);return ['ok'=>true,'application'=>b2bRecord($db,b2bValue($_GET['id']??'',100,true))];},false);
     }else throw new AppError('not_found',404);
  }elseif($_SERVER['REQUEST_METHOD']==='POST'){
     requireThat(hash_equals($_SESSION['csrf'],(string)($_SERVER['HTTP_X_CSRF_TOKEN']??'')),'csrf_failed',403);
     requireThat((int)($_SERVER['CONTENT_LENGTH']??0)<=20000000,'file_too_large',413);
     if($action==='upload'){
        requireThat(isset($_FILES['file'])&&is_array($_FILES['file']),'invalid_file');
        $slot=b2bValue($_POST['slot']??'',90,true);
        $file=$_FILES['file'];
        $result=transaction(function(&$db)use($slot,$file){b2bRateLimit($db,'upload',100);return b2bHandleUpload($db,$slot,$file);});
     }else{
        requireThat(str_starts_with($_SERVER['CONTENT_TYPE']??'','application/json'),'invalid_input');
        $raw=file_get_contents('php://input',false,null,0,700000);
        requireThat(is_string($raw)&&strlen($raw)<=650000,'invalid_input');
        $payload=json_decode($raw,true,40,JSON_THROW_ON_ERROR);
        requireThat(is_array($payload),'invalid_input');
        if($action==='start')$result=transaction(fn(&$db)=>b2bHandleStart($db,$payload));
        elseif($action==='submit')$result=transaction(fn(&$db)=>b2bSubmit($db));
        elseif($action==='decision')$result=transaction(fn(&$db)=>b2bDecision($db,$payload));
        elseif($action==='staff_assign')$result=transaction(fn(&$db)=>b2bAssignStaff($db,$payload));
        elseif($action==='signed_submit')$result=transaction(function(&$db){
           $u=auth($db,['customer']);$id=$db['b2b_application_by_user'][$u['id']]??'';
           $app=b2bRecord($db,$id);
           requireThat($app['status']==='approved_pending_signature','invalid_transition');
           requireThat($app['account_type']==='credit','invalid_transition',409);
           requireThat(!empty($app['approved_credit_limit']),'approved_credit_limit_required');
           requireThat(isset($app['documents']['electronic_promissory_note']),'promissory_note_required');
           requireThat(($app['documents']['electronic_promissory_note']['mime']??'')==='application/pdf','invalid_file');
           $db['b2b_applications'][$id]['status']='signed_submitted';
           b2bAudit($db,$id,$u['id'],'signed_documents_submitted');
           b2bQueueNotification($db,$id,'signed_received','تم استلام المستندات الموقعة للمراجعة.');
           return ['ok'=>true,'application'=>b2bSummary($db['b2b_applications'][$id])];
        });
        else throw new AppError('not_found',404);
     }
  }else throw new AppError('method_not_allowed',405);
  echo json_encode($result,JSON_THROW_ON_ERROR|JSON_UNESCAPED_UNICODE);
}catch(AppError $e){http_response_code($e->status);echo json_encode(['ok'=>false,'error'=>$e->key],JSON_UNESCAPED_UNICODE);}
catch(JsonException $e){http_response_code(422);echo json_encode(['ok'=>false,'error'=>'invalid_input']);}
catch(Throwable $e){error_log('Roma B2B workflow: '.$e->getMessage());http_response_code(500);echo json_encode(['ok'=>false,'error'=>'server_error']);}
