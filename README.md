# HotelFinance

İki şubeli otel işletmeleri için Türkçe finans ve idari yönetim uygulaması.

## Teknoloji
- Next.js 15 / React 19
- PostgreSQL
- Prisma ORM
- TypeScript
- XLSX içe/dışa aktarma kütüphanesi

## Geliştirme ortamı
1. Node.js LTS ve PostgreSQL kurun.
2. .env.example dosyasını .env olarak kopyalayın.
3. Veritabanı bağlantısını ve güçlü AUTH_SECRET değerini girin.
4. Bağımlılıkları yükleyin: npm install
5. Prisma istemcisini üretin: npm run db:generate
6. İlk şemayı uygulayın: npm run db:migrate
7. Geliştirme sunucusunu başlatın: npm run dev

## Veri modeli
Şube, kullanıcı, rol, finansal hesap, gelir/gider hareketi, kategori, cari, personel, puantaj, demirbaş ve denetim kaydı modelleri tanımlanmıştır.

## Güvenlik
- Gerçek .env dosyası Git'e eklenmemelidir.
- PostgreSQL portu internete açılmamalıdır.
- Dış erişim HTTPS ve VPN veya güvenli tünel üzerinden sağlanmalıdır.
- Üretim kullanımı öncesinde kimlik doğrulama, rol/şube yetkilendirmesi, yedekleme ve denetim kayıtları test edilmelidir.

## Geliştirme durumu
İlk temel sürüm: uygulama iskeleti, yönetim paneli arayüzü ve ilişkisel veri modeli. Finans API'leri, kimlik doğrulama, Excel aktarım ekranları ve bordro hesaplama akışları sonraki geliştirme adımlarıdır.