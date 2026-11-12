"use client";
import { useEffect,useMemo,useState } from "react";
import Link from "next/link";
import { ArrowDownLeft,ArrowUpRight,Plus,RefreshCw,Upload,Building2 } from "lucide-react";
type Branch={id:string;code:string;name:string};
type Account={id:string;name:string;type:string;branchId:string};
type Category={id:string;name:string;type:string;branchId:string|null};
type Tx={id:string;transactionDate:string;type:string;amount:string|number;description:string;documentNo?:string|null;branch:{name:string};account?:{name:string}|null;category?:{name:string}|null};
const money=(v:number)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(v);
export default function TransactionsPage(){
 const [branches,setBranches]=useState<Branch[]>([]);const [accounts,setAccounts]=useState<Account[]>([]);const [categories,setCategories]=useState<Category[]>([]);const [rows,setRows]=useState<Tx[]>([]);
 const [branchId,setBranchId]=useState("");const [accountId,setAccountId]=useState("");const [categoryId,setCategoryId]=useState("");const [type,setType]=useState<"INCOME"|"EXPENSE">("INCOME");const [date,setDate]=useState(new Date().toISOString().slice(0,10));const [amount,setAmount]=useState("");const [description,setDescription]=useState("");const [documentNo,setDocumentNo]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
 async function load(){
  const [b,a,c,t]=await Promise.all([fetch("/api/branches"),fetch("/api/accounts"),fetch("/api/categories"),fetch("/api/transactions")]);
  const [bd,ad,cd,td]=await Promise.all([b.json(),a.json(),c.json(),t.json()]);
  setBranches(bd.branches||[]);setAccounts(ad.accounts||[]);setCategories(cd.categories||[]);setRows(td.transactions||[]);
  if(!branchId&&bd.branches?.[0])setBranchId(bd.branches[0].id);
 }
 useEffect(()=>{load().catch(()=>setMessage("Veriler yüklenemedi. Oturumunuzu ve sunucu bağlantısını kontrol edin."));},[]);
 const branchAccounts=useMemo(()=>accounts.filter(a=>a.branchId===branchId),[accounts,branchId]);
 const branchCategories=useMemo(()=>categories.filter(c=>(c.branchId===branchId||!c.branchId)&&c.type===type),[categories,branchId,type]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const res=await fetch("/api/transactions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({branchId,accountId:accountId||null,categoryId:categoryId||null,type,transactionDate:new Date(date+"T12:00:00").toISOString(),amount:Number(amount),description,documentNo})});const data=await res.json();if(!res.ok)throw new Error(data.error||"Kayıt oluşturulamadı.");setAmount("");setDescription("");setDocumentNo("");setMessage("İşlem kaydedildi.");await load();}catch(err){setMessage(err instanceof Error?err.message:"Bir hata oluştu.");}finally{setBusy(false);}}
 return <main className="module-page"><header className="module-header"><div><Link href="/" className="back-link">← Yönetim paneli</Link><div className="eyebrow">FİNANS YÖNETİMİ</div><h1>Gelir & Gider</h1><p>Şube bazında finansal hareketleri kaydedin ve takip edin.</p></div><Link href="/transactions/import" className="button secondary"><Upload size={16}/> Excel aktarımı</Link></header>
 {message&&<div className="module-message">{message}</div>}
 <section className="module-card"><h2><Plus size={17}/> Yeni finansal hareket</h2><form className="transaction-form" onSubmit={submit}>
 <label>Şube<select required value={branchId} onChange={e=>{setBranchId(e.target.value);setAccountId("");setCategoryId("");}}>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
 <label>İşlem türü<select value={type} onChange={e=>{setType(e.target.value as "INCOME"|"EXPENSE");setCategoryId("");}}><option value="INCOME">Gelir</option><option value="EXPENSE">Gider</option></select></label>
 <label>Tarih<input type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label>
 <label>Tutar (₺)<input type="number" min="0.01" step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0,00"/></label>
 <label>Hesap<select value={accountId} onChange={e=>setAccountId(e.target.value)}><option value="">Hesap seçin</option>{branchAccounts.map(a=><option key={a.id} value={a.id}>{a.name} ({a.type==="BANK"?"Banka":a.type==="CASH"?"Kasa":a.type})</option>)}</select></label>
 <label>Kategori<select value={categoryId} onChange={e=>setCategoryId(e.target.value)}><option value="">Kategori seçin</option>{branchCategories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <label className="wide-field">Açıklama<input required minLength={2} value={description} onChange={e=>setDescription(e.target.value)} placeholder="İşlem açıklaması"/></label>
 <label>Belge / Fiş No<input value={documentNo} onChange={e=>setDocumentNo(e.target.value)} placeholder="İsteğe bağlı"/></label>
 <div className="form-actions"><button className="button primary" disabled={busy||!branchId}>{busy?"Kaydediliyor…":"İşlemi kaydet"}</button></div>
 </form></section>
 <section className="module-card"><div className="table-heading"><div><h2>Son finansal hareketler</h2><p>En son 500 kayıt</p></div><button className="icon-button" onClick={()=>load()}><RefreshCw size={16}/></button></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Tarih</th><th>Şube</th><th>Tür</th><th>Açıklama</th><th>Hesap</th><th>Belge No</th><th className="align-right">Tutar</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{new Intl.DateTimeFormat("tr-TR").format(new Date(row.transactionDate))}</td><td>{row.branch?.name}</td><td><span className={row.type==="INCOME"?"type-pill income":"type-pill expense"}>{row.type==="INCOME"?"Gelir":"Gider"}</span></td><td>{row.description}</td><td>{row.account?.name||"—"}</td><td>{row.documentNo||"—"}</td><td className={"align-right amount "+(row.type==="INCOME"?"income-text":"expense-text")}>{row.type==="INCOME"?"+":"−"}{money(Number(row.amount))}</td></tr>)}{!rows.length&&<tr><td colSpan={7} className="empty-cell">Henüz finansal hareket kaydı yok.</td></tr>}</tbody></table></div></section>
 </main>;
}