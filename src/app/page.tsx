"use client";
import { useEffect, useState } from "react";
import { Activity, ArrowDownLeft, ArrowUpRight, Banknote, Building2, CalendarDays, ChevronDown, CircleHelp, FileSpreadsheet, LayoutDashboard, LogOut, Package, Settings2, Users, Wallet, Landmark, ClipboardList, ReceiptText, TrendingUp, Clock3, ShieldCheck } from "lucide-react";
const nav = [
 {label:"Genel Bakış",icon:LayoutDashboard,active:true,href:"/"},{label:"Gelir & Gider",icon:ReceiptText,href:"/transactions"},{label:"Banka Hareketleri",icon:Landmark,href:"/accounts"},{label:"Kasa Yönetimi",icon:Wallet,href:"/accounts"},{label:"Personel",icon:Users},{label:"Puantaj & Bordro",icon:ClipboardList},{label:"Demirbaşlar",icon:Package},{label:"Raporlar",icon:FileSpreadsheet}
];
const metrics = [
 {label:"Bugünkü Gelir",value:"₺ 0,00",change:"Henüz kayıt yok",icon:ArrowDownLeft,tone:"green"},
 {label:"Bugünkü Gider",value:"₺ 0,00",change:"Henüz kayıt yok",icon:ArrowUpRight,tone:"red"},
 {label:"Banka Bakiyesi",value:"₺ 0,00",change:"Hesaplar tanımlanmadı",icon:Landmark,tone:"blue"},
 {label:"Kasa Bakiyesi",value:"₺ 0,00",change:"Açılış bakiyesi bekleniyor",icon:Banknote,tone:"amber"}
];
type Summary = {
 today: { income:number; expense:number; net:number };
 week: { income:number; expense:number; net:number };
 month: { income:number; expense:number; net:number };
 balances: { bank:number; cash:number };
 branchPerformance: Array<{id:string;code:string;name:string;income:number;expense:number;net:number}>;
 recentTransactions: Array<{id:string;date:string;type:string;amount:number;description:string;branch:string;account:string}>;
};
const money = (value:number) => new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:2}).format(value);
export default function Home() {
 const [summary,setSummary] = useState<Summary | null>(null);
 const [period,setPeriod] = useState<"today"|"week"|"month">("today");
 const [loadError,setLoadError] = useState("");
 useEffect(() => {
  fetch("/api/dashboard/summary").then(async response => {
   if (!response.ok) throw new Error("Özet verileri alınamadı.");
   return response.json();
  }).then(setSummary).catch(() => setLoadError("Canlı veriler yüklenemedi. Veritabanı ve oturum ayarlarını kontrol edin."));
 }, []);
 const periodData = summary?.[period];
 const liveMetrics = periodData ? [
  {label:"Bugünkü Gelir",value:money(periodData.income),change:"Kayıtlı hareketlerden",icon:ArrowDownLeft,tone:"green"},
  {label:"Bugünkü Gider",value:money(periodData.expense),change:"Kayıtlı hareketlerden",icon:ArrowUpRight,tone:"red"},
  {label:"Banka Bakiyesi",value:money(summary.balances.bank),change:"Açılış bakiyesi + hareketler",icon:Landmark,tone:"blue"},
  {label:"Kasa Bakiyesi",value:money(summary.balances.cash),change:"Açılış bakiyesi + hareketler",icon:Banknote,tone:"amber"}
 ] : metrics;
 return <main className="app-shell">
  <aside className="sidebar">
   <div className="brand"><div className="brand-mark"><Building2 size={21}/></div><div><strong>HotelFinance</strong><span>YÖNETİM PLATFORMU</span></div></div>
   <div className="workspace-label">ÇALIŞMA ALANI</div><button className="branch-switch"><span className="branch-dot"/> Tüm Şubeler <ChevronDown size={15}/></button>
   <div className="nav-list">{nav.map(item=>{const Icon=item.icon;return <a key={item.label} className={item.active?"nav-item active":"nav-item"} href={item.href || "#"}><Icon size={18}/><span>{item.label}</span></a>})}</div>
   <div className="sidebar-bottom"><a className="nav-item" href="#"><Settings2 size={18}/><span>Ayarlar</span></a><a className="nav-item" href="#"><CircleHelp size={18}/><span>Yardım Merkezi</span></a><div className="user-card"><div className="avatar">SY</div><div><strong>Sistem Yöneticisi</strong><span>Kurulum bekleniyor</span></div><LogOut size={16}/></div></div>
  </aside>
  <section className="main-area">
   <header className="topbar"><div className="breadcrumb">HotelFinance <span>/</span> Genel Bakış</div><div className="top-actions"><span className="secure-label"><ShieldCheck size={15}/> Güvenli oturum</span><button className="date-button"><CalendarDays size={16}/> {new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",year:"numeric"}).format(new Date())}</button><div className="avatar small">SY</div></div></header>
   <div className="content">
    <div className="page-heading"><div><div className="eyebrow">YÖNETİM PANELİ</div><h1>Genel Bakış</h1><p>İki şubenizin mali ve idari durumunu tek ekrandan takip edin.</p></div><div className="heading-actions"><button className="button secondary"><FileSpreadsheet size={16}/> Excel aktarımı</button><button className="button primary"><span>＋</span> Yeni işlem</button></div></div>
    <div className="notice"><Activity size={17}/><div><strong>{summary ? "Canlı veriler bağlı" : "Veri bağlantısı"}</strong><span>{summary ? "Özetler veritabanındaki kayıtlı hareketlerden hesaplanıyor." : loadError || "Finansal veriler yükleniyor; ilk kurulumda şube ve hesaplar tanımlanmalıdır."}</span></div></div>
    <div className="section-row"><h2>Finansal özet</h2><select className="period-select" value={period} onChange={e=>setPeriod(e.target.value as "today"|"week"|"month")}><option value="today">Bugün</option><option value="week">Bu hafta</option><option value="month">Bu ay</option></select></div>
    <div className="metric-grid">{liveMetrics.map(m=>{const Icon=m.icon;return <article className="metric-card" key={m.label}><div className="metric-top"><span>{m.label}</span><div className={"metric-icon "+m.tone}><Icon size={18}/></div></div><strong>{m.value}</strong><small>{m.change}</small></article>})}</div>
    <div className="section-row branch-title"><div><h2>Şube performansı</h2><p>Şubelerin ayrı ve konsolide görünümü</p></div><span className="live-tag"><span/> İki şube</span></div>
    <div className="branch-grid">{(summary?.branchPerformance || [{id:"one",code:"BR-001",name:"1. Şube",income:0,expense:0,net:0},{id:"two",code:"BR-002",name:"2. Şube",income:0,expense:0,net:0}]).map(branch=><article className="branch-card" key={branch.id}><div className="branch-card-head"><div className="branch-symbol"><Building2 size={19}/></div><div><strong>{branch.name}</strong><span>{branch.code} · Bu ay</span></div><ChevronDown size={16}/></div><div className="branch-stats"><div><span>Gelir</span><strong>{money(branch.income)}</strong></div><div><span>Gider</span><strong>{money(branch.expense)}</strong></div><div><span>Net sonuç</span><strong>{money(branch.net)}</strong></div></div></article>)}</div>
    <div className="lower-grid"><article className="panel"><div className="panel-heading"><div><h2>Gelir / gider trendi</h2><p>Son 7 gün · Tüm şubeler</p></div><TrendingUp size={18}/></div><div className="empty-chart"><div className="chart-lines"><i/><i/><i/><i/></div><div className="chart-empty-icon"><Activity size={23}/></div><strong>Henüz finansal hareket yok</strong><span>İlk gelir veya gider kaydınızı eklediğinizde grafik burada oluşacak.</span></div></article><article className="panel"><div className="panel-heading"><div><h2>Son işlemler</h2><p>En son kaydedilen hareketler</p></div><Clock3 size={18}/></div>{summary?.recentTransactions?.length ? <div className="activity-list">{summary.recentTransactions.slice(0,5).map(tx=><div className="activity-row" key={tx.id}><div className={tx.type==="INCOME"?"activity-dot income":"activity-dot expense"}></div><div className="activity-copy"><strong>{tx.description}</strong><span>{tx.branch} · {tx.account} · {new Intl.DateTimeFormat("tr-TR").format(new Date(tx.date))}</span></div><b className={tx.type==="INCOME"?"income-text":"expense-text"}>{tx.type==="INCOME"?"+":"−"}{money(tx.amount)}</b></div>)}</div> : <div className="empty-activity"><div className="empty-activity-icon"><ReceiptText size={20}/></div><strong>Kayıt bulunmuyor</strong><span>Banka, kasa veya gelir-gider işlemleri burada listelenecek.</span></div>}</article></div>
    <footer className="footer"><span>HotelFinance · Otel Finans ve Yönetim Sistemi</span><span>Kurulum sürümü 0.1.0</span></footer>
   </div>
  </section>
 </main>;
}