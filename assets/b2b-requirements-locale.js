/* Roma B2B v6: business account documents & numeric rules — localizations */
window.ROMA_B2B_FLOW_LANG=window.ROMA_B2B_FLOW_LANG||{};
const romaBusinessV6={
 en:{
 cashTitle:'Cash purchase / cash account',cashDesc:'Open a business account and request supply under agreed cash payment terms.',
 legalTitle:'Company details and legal documents',legalDesc:'Both account types require four PDF certificates and a storefront photograph.',
 registration:'Commercial registration (10 digits) *',vat:'VAT number (15 digits ending in 3) *',docHint:'Official documents (commercial register, VAT, licence, national address) must be PDF. Storefront can be JPG, PNG, WebP, HEIC, GIF or PDF. Maximum 5 MB per file.',
 docCommercial:'Commercial registration (PDF) *',docMunicipal:'Municipal / operating licence (PDF) *',docNational:'National address certificate (PDF) *',docVat:'VAT certificate (PDF) *',storeSign:'Storefront photograph (image or PDF) *',
 facadeTitle:'Storefront photograph',facadePhotoNote:'Upload a clear photo of the premises as JPG, PNG, WebP, HEIC, GIF or PDF. Required for both cash and credit accounts.',buildingNumber:'Building number *',buildingRule:'Exactly 4 digits.',postalRule:'Exactly 5 digits.',crRule:'Exactly 10 digits.',vatRule:'15 digits, ending in 3.',
 postalCode:'Postal code *',sitePhotos:'Additional premises pictures (optional for credit)',ownerIdFile:'Account holder identity (PDF) *',personIdentity:'Identity document (PDF)'
 },
 fr:{
 cashTitle:'Compte / demande au comptant',registration:'Registre du commerce (10 chiffres) *',vat:'Numéro de TVA (15 chiffres, finit par 3) *',docHint:'Documents officiels : PDF uniquement. Photo de la façade : JPG, PNG, WebP, HEIC, GIF ou PDF. Maximum 5 Mo par fichier.',
 docCommercial:'Registre du commerce (PDF) *',docMunicipal:'Licence municipale (PDF) *',docNational:'Adresse nationale (PDF) *',docVat:'Attestation TVA (PDF) *',storeSign:'Photographie de la façade (image ou PDF) *',
 facadeTitle:'Photographie de la façade',facadePhotoNote:'Joignez une photo claire de la façade au format image ou PDF.',buildingNumber:'Numéro du bâtiment *',buildingRule:'4 chiffres.',postalRule:'5 chiffres.',crRule:'10 chiffres.',vatRule:'15 chiffres, terminant par 3.',sitePhotos:'Photographies supplémentaires (facultatives)'
 },
 de:{
 cashTitle:'Barkonto / Lieferanfrage',registration:'Handelsregisternummer (10 Ziffern) *',vat:'Steuernummer (15 Ziffern, endet mit 3) *',docHint:'Offizielle Unterlagen nur als PDF; das Ladenfrontfoto als JPG, PNG, WebP, HEIC, GIF oder PDF. Maximal 5 MB pro Datei.',
 docCommercial:'Handelsregister (PDF) *',docMunicipal:'Betriebslizenz (PDF) *',docNational:'Nationale Anschrift (PDF) *',docVat:'Steuerbescheinigung (PDF) *',storeSign:'Foto der Ladenfront (Bild oder PDF) *',
 facadeTitle:'Foto der Ladenfront',facadePhotoNote:'Bitte laden Sie ein klares Frontfoto als Bilddatei oder PDF hoch.',buildingNumber:'Gebäudenummer *',buildingRule:'4 Ziffern.',postalRule:'5 Ziffern.',crRule:'10 Ziffern.',vatRule:'15 Ziffern, endet mit 3.',sitePhotos:'Weitere Fotos (optional)'
 },
 es:{
 cashTitle:'Cuenta / solicitud al contado',registration:'Registro mercantil (10 dígitos) *',vat:'Identificación fiscal (15 dígitos, termina en 3) *',docHint:'Los documentos oficiales deben ser PDF. La foto de la fachada puede ser JPG, PNG, WebP, HEIC, GIF o PDF. Máximo 5 MB.',
 docCommercial:'Registro mercantil (PDF) *',docMunicipal:'Licencia municipal (PDF) *',docNational:'Dirección nacional (PDF) *',docVat:'Certificado fiscal (PDF) *',storeSign:'Foto de la fachada (imagen o PDF) *',
 facadeTitle:'Fotografía de la fachada',facadePhotoNote:'Adjunte una fotografía clara de la fachada en una imagen o PDF.',buildingNumber:'Número de edificio *',buildingRule:'4 dígitos.',postalRule:'5 dígitos.',crRule:'10 dígitos.',vatRule:'15 dígitos, termina en 3.',sitePhotos:'Fotos adicionales (opcionales)'
 }
};
for(const [lang,values] of Object.entries(romaBusinessV6)){
 Object.assign(window.ROMA_B2B_FLOW_LANG[lang]||(window.ROMA_B2B_FLOW_LANG[lang]={}),values);
}
