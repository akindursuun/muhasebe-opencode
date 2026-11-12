# HotelFinance

İki şubeli otel işletmeleri için Türkçe finans ve idari yönetim uygulaması. Uygulama, otelin Windows ana bilgisayarında barındırılacak şekilde tasarlanmaktadır.

## Teknoloji
- Next.js 15 / React 19 / TypeScript
- PostgreSQL ve Prisma ORM
- E-posta + parola oturumu (HttpOnly cookie, JWT)
- XLSX / XLS / CSV banka-kasa hareketi içe aktarma altyapısı
- TL ve Türkçe arayüz

## Depodaki mevcut temel
- İki şube için veri modeli ve ilk kurulum seed'i
- Rol tabanlı kullanıcı, şube, finans hesabı, gelir/gider ve kategori modelleri
- Yönetim paneli ve canlı özet API'si
- Giriş / çıkış API'leri
- Şube, finans hesabı, kategori, işlem ve Excel aktarım API'leri
- Personel, puantaj, aylık bordro kaydı ve demirbaş veri modelleri
- Kullanıcı, personel, puantaj ve bordro API'leri
- İşlem denetim kayıtları
- Windows sunucu kurulum notları ve örnek banka-kasa CSV şablonu

## Windows geliştirme ortamı
1. Node.js 22 LTS, PostgreSQL ve Git for Windows kurun.
2. Depoyu klonlayın: git clone https://github.com/akindursuun/muhasebe-opencode.git
3. .env.example dosyasını .env olarak kopyalayın.
4. DATABASE_URL, AUTH_SECRET ve ilk yönetici bilgilerini girin.
5. npm install
6. npm run db:generate
7. npm run db:migrate
8. npm run db:seed
9. npm run dev

Ayrıntılı yönergeler: docs/WINDOWS-SERVER-KURULUM.md

## Excel aktarım şablonu
public/templates/banka-kasa-hareketleri.csv dosyasındaki başlıklar kullanılabilir:
Tarih, Tür, Tutar, Açıklama, Belge No.
Tür alanı Gelir veya Gider olmalıdır. Aktarım API'si aynı hareketin tekrarlı yüklenmesini hash kontrolüyle engeller.

## Güvenlik
- Gerçek .env dosyası Git'e eklenmemelidir.
- PostgreSQL portu internete açılmamalıdır.
- İnternet erişimi HTTPS üzerinden Cloudflare Tunnel veya eşdeğer güvenli tünelle sağlanmalıdır.
- Gerçek personel ve finans verileriyle kullanımdan önce rol/şube izinleri, yedekleme ve geri yükleme testleri tamamlanmalıdır.
- Bordro modülü şu aşamada bordro kalemlerini kaydetme ve takip içindir; yasal bordro/SGK/vergi hesaplamalarının doğruluğu için mevzuat kuralları, parametre tarihçesi ve mali müşavir kontrolü ayrıca geliştirilip test edilmelidir.

## Henüz tamamlanmayanlar
- Kullanıcı arayüzünden tüm modüllerin yönetimi
- Banka ekstresi için farklı banka formatlarına özel eşleştirme profilleri
- Banka-kasa virmanlarının çift taraflı muhasebeleştirilmesi
- Bordro mevzuat hesap motoru ve puantajdan otomatik bordro üretimi
- Demirbaş amortisman hesaplama ve zimmet ekranları
- Parola sıfırlama, davet e-postaları ve çok faktörlü doğrulama
- Otomatik yedekleme, izleme, kabul testleri ve üretim kurulumu

Bu depo geliştirme aşamasındadır; canlı otel operasyonunda kullanılmadan önce yukarıdaki maddeler tamamlanmalı ve gerçek ortamda test edilmelidir.