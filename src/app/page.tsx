import { Activity, ArrowDownLeft, ArrowUpRight, Banknote, Building2, CalendarDays, ChevronDown, CircleHelp, FileSpreadsheet, LayoutDashboard, LogOut, Package, Settings2, Users, Wallet, Landmark, ClipboardList, ReceiptText, TrendingUp, Clock3, ShieldCheck } from "lucide-react";
const nav = [
 {label:"Genel Bakış",icon:LayoutDashboard,active:true},{label:"Gelir & Gider",icon:ReceiptText},{label:"Banka Hareketleri",icon:Landmark},{label:"Kasa Yönetimi",icon:Wallet},{label:"Personel",icon:Users},{label:"Puantaj & Bordro",icon:ClipboardList},{label:"Demirbaşlar",icon:Package},{label:"Raporlar",icon:FileSpreadsheet}
];
const metrics = [
 {label:"Bugünkü Gelir",value:"₺ 0,00",change:"Henüz kayıt yok",icon:ArrowDownLeft,tone:"green"},
 {label:"Bugünkü Gider",value:"₺ 0,00",change:"Henüz kayıt yok",icon:ArrowUpRight,tone:"red"},
 {label:"Banka Bakiyesi",value:"₺ 0,00",change:"Hesaplar tanımlanmadı",icon:Landmark,tone:"blue"},
 {label:"Kasa Bakiyesi",value:"₺ 0,00",change:"Açılış bakiyesi bekleniyor",icon:Banknote,tone:"amber"}
];
export default function Home() {
 return <main className="app-shell">
  <aside className="sidebar">
   <div className="brand"><div className="brand-mark"><Building2 size={21}/></div><div><strong>HotelFinance</strong><span>YÖNETİM PLATFORMU</span></div></div>
   <div className="workspace-label">ÇALIŞMA ALANI</div><button className="branch-switch"><span className="branch-dot"/> Tüm Şubeler <ChevronDown size={15}/></button>
   <div className="nav-list">{nav.map(item=>{const Icon=item.icon;return <a key={item.label} className={item.active?"nav-item active":"nav-item"} href="#"><Icon size={18}/><span>{item.label}</span></a>})}</div>
   <div className="sidebar-bottom"><a className="nav-item" href="#"><Settings2 size={18}/><span>Ayarlar</span></a><a className="nav-item" href="#"><CircleHelp size={18}/><span>Yardım Merkezi</span></a><div className="user-card"><div className="avatar">SY</div><div><strong>Sistem Yöneticisi</strong><span>Kurulum bekleniyor</span></div><LogOut size={16}/></div></div>
  </aside>
  <section className="main-area">
   <header className="topbar"><div className="breadcrumb">HotelFinance <span>/</span> Genel Bakış</div><div className="top-actions"><span className="secure-label"><ShieldCheck size={15}/> Güvenli oturum</span><button className="date-button"><CalendarDays size={16}/> 12 Kasım 2026</button><div className="avatar small">SY</div></div></header>
   <div className="content">
    <div className="page-heading"><div><div className="eyebrow">YÖNETİM PANELİ</div><h1>Genel Bakış</h1><p>İki şubenizin mali ve idari durumunu tek ekrandan takip edin.</p></div><div className="heading-actions"><button className="button secondary"><FileSpreadsheet size={16}/> Excel aktarımı</button><button className="button primary"><span>＋</span> Yeni işlem</button></div></div>
    <div className="notice"><Activity size={17}/><div><strong>Kurulum aşaması</strong><span>Bu panelin verileri henüz veritabanına bağlanmadı. Önce şubeleri, kullanıcıları ve finans hesaplarını tanımlayacağız.</span></div></div>
    <div className="section-row"><h2>Finansal özet</h2><div className="period-select">Bugün <ChevronDown size={15}/></div></div>
    <div className="metric-grid">{metrics.map(m=>{const Icon=m.icon;return <article className="metric-card" key={m.label}><div className="metric-top"><span>{m.label}</span><div className={"metric-icon "+m.tone}><Icon size={18}/></div></div><strong>{m.value}</strong><small>{m.change}</small></article>})}</div>
    <div className="section-row branch-title"><div><h2>Şube performansı</h2><p>Şubelerin ayrı ve konsolide görünümü</p></div><span className="live-tag"><span/> İki şube</span></div>
    <div className="branch-grid">{["1. Şube","2. Şube"].map((name,i)=><article className="branch-card" key={name}><div className="branch-card-head"><div className="branch-symbol"><Building2 size={19}/></div><div><strong>{name}</strong><span>{i===0?"BR-001":"BR-002"} · Kurulum bekliyor</span></div><ChevronDown size={16}/></div><div className="branch-stats"><div><span>Gelir</span><strong>₺ 0,00</strong></div><div><span>Gider</span><strong>₺ 0,00</strong></div><div><span>Net sonuç</span><strong>₺ 0,00</strong></div></div></article>)}</div>
    <div className="lower-grid"><article className="panel"><div className="panel-heading"><div><h2>Gelir / gider trendi</h2><p>Son 7 gün · Tüm şubeler</p></div><TrendingUp size={18}/></div><div className="empty-chart"><div className="chart-lines"><i/><i/><i/><i/></div><div className="chart-empty-icon"><Activity size={23}/></div><strong>Henüz finansal hareket yok</strong><span>İlk gelir veya gider kaydınızı eklediğinizde grafik burada oluşacak.</span></div></article><article className="panel"><div className="panel-heading"><div><h2>Son işlemler</h2><p>En son kaydedilen hareketler</p></div><Clock3 size={18}/></div><div className="empty-activity"><div className="empty-activity-icon"><ReceiptText size={20}/></div><strong>Kayıt bulunmuyor</strong><span>Banka, kasa veya gelir-gider işlemleri burada listelenecek.</span></div></article></div>
    <footer className="footer"><span>HotelFinance · Otel Finans ve Yönetim Sistemi</span><span>Kurulum sürümü 0.1.0</span></footer>
   </div>
  </section>
 </main>;
}