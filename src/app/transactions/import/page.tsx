"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { FileSpreadsheet,Upload,ArrowLeft } from "lucide-react";
type Branch={id:string;name:string};type Account={id:string;name:string;branchId:string};
export default function ImportPage(){
 const [branches,setBranches]=useState<Branch[]>([]);const [accounts,setAccounts]=useState<Account[]>([]);const [branchId,setBranchId]=useState("");const [accountId,setAccountId]=useState("");const [file,setFile]=useState<File|null>(null);const [message,setMessage]=useState("");const [result,setResult]=useState<any>(null);const [busy,setBusy]=useState(false);
 useEffect(()=>{Promise.all([fetch("/api/branches").then(r=>r.json()),fetch("/api/accounts").then(r=>r.json())]).then(([b,a])=>{setBranches(b.branches||[]);setAccounts(a.accounts||[]);if(b.branches?.[0])setBranchId(b.branches[0].id);}).catch(()=>setMessage("Şube ve hesap bilgileri alınamadı."));},[]);
 const filtered=accounts.filter(a=>a.branchId===branchId);
 async function submit(e:React.FormEvent){e.preventDefault();if(!file||!branchId||!accountId)return;setBusy(true);setMessage("");setResult(null);const form=new FormData();form.set("file",file);form.set("branchId",branchId);form.set("accountId",accountId);try{const res=await fetch("/api/transactions/import",{method:"POST",body:form});const data=await res.json();if(!res.ok&&res.status!==422)throw new Error(data.error||"Aktarım başarısız.");setResult(data);setMessage("Dosya işlendi.");}catch(err){setMessage(err instanceof Error?err.message:"Aktarım sırasında hata oluştu.");}finally{setBusy(false);}}
 return <main className="module-page"><header className="module-header"><div><Link href="/transactions" className="back-link"><ArrowLeft size={14}/> Gelir & gider</Link><div className="eyebrow">TOPLU VERİ AKTARIMI</div><h1>Banka / Kasa Excel aktarımı</h1><p>Excel veya CSV hareketlerini seçtiğiniz şube hesabına aktarın.</p></div></header>
 <section className="module-card import-card"><h2><FileSpreadsheet size={18}/> Dosya ve hesap seçimi</h2><p className="helper-text">Dosyada Tarih, Tür, Tutar ve Açıklama sütunları bulunmalıdır. Tür değeri Gelir veya Gider olmalıdır.</p><form onSubmit={submit} className="import-form">
 <label>Şube<select required value={branchId} onChange={e=>{setBranchId(e.target.value);setAccountId("");}}>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
 <label>Hesap<select required value={accountId} onChange={e=>setAccountId(e.target.value)}><option value="">Hesap seçin</option>{filtered.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
 <label className="file-drop"><Upload size={22}/><strong>{file?file.name:"Excel / CSV dosyası seçin"}</strong><span>En fazla 10 MB · XLSX, XLS, CSV</span><input type="file" accept=".xlsx,.xls,.csv" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
 <button className="button primary" disabled={busy||!file||!accountId}>{busy?"Aktarılıyor…":"Aktarımı başlat"}</button></form>
 <a className="template-link" href="/templates/banka-kasa-hareketleri.csv" download>Örnek CSV şablonunu indir</a>
 {message&&<div className="module-message">{message}</div>}
 {result&&<div className="import-result"><strong>Aktarım özeti</strong><div>Eklenen: {result.imported??0} · Yinelenen: {result.duplicates??0} · Hatalı satır: {result.rejected??0}</div>{result.errors?.length>0&&<ul>{result.errors.map((e:{row:number;reason:string},i:number)=><li key={i}>Satır {e.row}: {e.reason}</li>)}</ul>}</div>}
 </section></main>;
}