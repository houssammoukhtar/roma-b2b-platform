<?php
declare(strict_types=1);
/* Private print-friendly record: browser "Print > Save as PDF". */
ini_set('display_errors','0');
$romaRoot=is_file(__DIR__.'/app/core.php')?__DIR__:dirname(__DIR__);
require $romaRoot.'/app/core.php';
$secure=(!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off')||($_SERVER['SERVER_PORT']??'')==443;
session_name('ROMAB2B_'.substr(hash('sha256',$romaRoot),0,10));
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$secure,'httponly'=>true,'samesite'=>'Strict']);
session_start();
header('Cache-Control: no-store,private');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'");
function pEscape(mixed $s):string{return htmlspecialchars((string)$s,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function pFields(array $value,string $title=''):string{
    $html='';
    foreach($value as $key=>$part){
        if($part===null || $part==='' || $part===[])continue;
        $name=$title!==''?$title.' / '.$key:$key;
        if(is_array($part)){
           if(array_is_list($part)&&!array_filter($part,'is_array'))$html.='<tr><th>'.pEscape($name).'</th><td>'.pEscape(implode('، ',$part)).'</td></tr>';
           else $html.=pFields($part,$name);
        }else $html.='<tr><th>'.pEscape($name).'</th><td>'.pEscape($part).'</td></tr>';
    }
    return $html;
}
try{
 $app=transaction(function($db){
    $u=auth($db);
    $id=(string)($_GET['id']??($db['b2b_application_by_user'][$u['id']]??''));
    $a=$db['b2b_applications'][$id]??null;
    requireThat(is_array($a),'not_found',404);
    $role=$u['role']==='admin'?'admin':($db['b2b_staff_roles'][$u['id']]??'');
    requireThat($a['user_id']===$u['id']||in_array($role,['admin','reviewer','accountant'],true),'forbidden',403);
    return $a;
 },false);
}catch(Throwable $e){http_response_code(403);header('Content-Type: text/plain; charset=utf-8');echo "Access denied / يلزم تسجيل الدخول أو صلاحية المراجعة";exit;}
header('Content-Type: text/html; charset=utf-8');
$name=$app['data']['legal']['company']??'Roma Business';
?>
<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>طلب حساب <?=pEscape($app['id'])?> — <?=pEscape($name)?></title>
<style>
*{box-sizing:border-box}body{font-family:Tahoma,'Arial',sans-serif;color:#152e22;margin:0;background:#eff3ed;line-height:1.6}main{background:white;max-width:850px;margin:40px auto;padding:48px;box-shadow:0 10px 40px #12332720}h1{font-size:27px;margin:10px 0}h2{font-size:19px;background:#eff5ef;padding:12px 14px;margin-top:30px}p{margin:8px 0}header{border-bottom:3px solid #1e7b50;padding-bottom:22px}small{color:#67806b}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border-bottom:1px solid #e0e9de;text-align:right;vertical-align:top;padding:9px 8px;overflow-wrap:anywhere;font-size:13px}th{width:44%;background:#f8faf6;color:#34533c}footer{border-top:1px solid #dde8df;margin-top:35px;padding-top:16px;font-size:12px;color:#5d7562}.print-help{text-align:center;padding:15px;background:#dff0dc;color:#1e663a;max-width:850px;margin:30px auto;border-radius:11px}.warning{font-size:12px;color:#805c2c;background:#fff6e5;padding:12px;margin-top:20px}@page{size:A4;margin:16mm}@media print{body{background:white}main{max-width:none;margin:0;padding:0;box-shadow:none}.print-help{display:none}h2{break-after:avoid}tr{break-inside:avoid}}
</style></head><body>
<div class="print-help">لطباعة الملف أو حفظه PDF: افتح أمر الطباعة في المتصفح واختر «Save as PDF». هذا ملخص الطلب ولا يُعد موافقة ائتمانية أو عقدًا مُوقّعًا.</div>
<main>
<header><b>ROMA TRADING GROUP</b><h1>ملخص طلب فتح حساب أعمال</h1><p>رقم الطلب: <b dir="ltr"><?=pEscape($app['id'])?></b></p><p>اسم المنشأة: <?=pEscape($name)?></p><p>نوع الحساب: <?=($app['account_type']==='credit'?'آجل':'نقدي')?> · الحالة: <?=pEscape($app['status'])?></p><small>التاريخ: <?=pEscape($app['created_at'])?></small></header>
<h2>بيانات الطلب التجارية والشخصية</h2><table><?=pFields($app['data'])?></table>
<h2>المستندات المستلمة</h2><table><?php foreach(($app['documents']??[]) as $slot=>$doc): ?><tr><th><?=pEscape($slot)?></th><td><?=pEscape($doc['name']??$doc['id'])?> · <?=pEscape($doc['uploaded_at']??'')?></td></tr><?php endforeach; ?></table>
<h2>ملاحظات الإدارة والحالة</h2><p><?=pEscape($app['review_note']??'لا توجد ملاحظات')?></p>
<div class="warning">هذه الوثيقة ملخص إلكتروني للبيانات المقدمة، وليست تأكيدًا للاعتماد أو منح الائتمان. تخضع سياسات وشروط روما ومعلومات الطلب للمراجعة.</div>
<footer>سياسة الخصوصية والشروط متاحتان على موقع مجموعة روما. التوقيع (إن طُلب): ____________________ &nbsp; التاريخ: ____________________</footer>
</main></body></html>
