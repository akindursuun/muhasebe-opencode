"use client";
import { useState } from "react";
import { Building2, LockKeyhole, Mail } from "lucide-react";

export default function LoginPage() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Giriş yapılamadı.");
      window.location.href = "/";
    } catch (err) { setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu."); }
    finally { setLoading(false); }
  }
  return <main className="login-screen"><section className="login-card"><div className="login-brand"><div className="brand-mark"><Building2 size={22}/></div><div><strong>HotelFinance</strong><span>OTEL FİNANS YÖNETİMİ</span></div></div><h1>Tekrar hoş geldiniz</h1><p>Devam etmek için kurumsal hesabınızla giriş yapın.</p><form onSubmit={submit}><label>E-posta adresi</label><div className="login-input"><Mail size={17}/><input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="ornek@otel.com"/></div><label>Şifre</label><div className="login-input"><LockKeyhole size={17}/><input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Şifreniz"/></div>{error&&<div className="login-error">{error}</div>}<button disabled={loading}>{loading?"Giriş yapılıyor…":"Giriş Yap"}</button></form><small>Yetkisiz erişim engellenir. Oturumlar güvenli çerez ile korunur.</small></section></main>;
}