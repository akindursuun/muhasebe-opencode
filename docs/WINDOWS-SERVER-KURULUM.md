# HotelFinance — Windows sunucu kurulum notları

Bu doküman, uygulamanın otelin ana Windows bilgisayarında çalıştırılması içindir. Kurulum tamamlanmadan gerçek personel veya finans verisi girmeyin.

## Önerilen sunucu
- Windows 11 Pro veya Windows Server
- En az 16 GB RAM; mümkünse 32 GB
- SSD ve ayrı yedekleme diski
- Kesintisiz güç kaynağı (UPS)
- Sabit yerel IP veya DHCP rezervasyonu

## Gerekli yazılımlar
1. Node.js 22 LTS
2. PostgreSQL 16 veya desteklenen güncel sürüm
3. Git for Windows
4. PowerShell 7 önerilir

## Projeyi indirme
PowerShell açın ve proje klasörünü oluşturun:

    git clone https://github.com/akindursuun/muhasebe-opencode.git C:\HotelFinance
    cd C:\HotelFinance
    npm install

## PostgreSQL veritabanı
PostgreSQL yönetim konsolunda güçlü ve benzersiz parola kullanarak uygulama kullanıcısı ve veritabanı oluşturun:

    CREATE USER hotel_user WITH PASSWORD 'BURAYA_GUCLU_BIR_PAROLA';
    CREATE DATABASE hotel_finance OWNER hotel_user;

PostgreSQL portunu (varsayılan 5432) internete açmayın. Uygulama ile aynı bilgisayarda çalışıyorsa yalnızca yerel bağlantıya izin verin.

## Ortam değişkenleri
1. .env.example dosyasını .env olarak kopyalayın.
2. DATABASE_URL değerini kendi PostgreSQL kullanıcı/parolanızla güncelleyin.
3. AUTH_SECRET için en az 32 karakterlik rastgele bir gizli anahtar üretin.
4. INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_NAME ve güçlü INITIAL_ADMIN_PASSWORD değerlerini belirleyin.
5. Gerçek .env dosyasını GitHub'a yüklemeyin ve kimseyle paylaşmayın.

PowerShell ile rastgele anahtar üretme örneği:

    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    [Convert]::ToHexString($bytes).ToLower()

## İlk kurulum
    npm run db:generate
    npm run db:migrate
    npm run db:seed
    npm run build
    npm start

İlk kurulum yöneticisi yalnızca seed komutunda oluşturulur. Giriş e-postası ve parolası .env dosyasındaki ilk yönetici değişkenlerinden alınır. Kurulumdan sonra bu parolayı değiştirin ve .env dosyasındaki ilk kurulum parolasını kaldırın.

## İnternet erişimi
Önerilen yöntem Cloudflare Tunnel veya eşdeğer güvenli bir ters tüneldir:
- Alan adınızın DNS kaydını güvenli tünel üzerinden yönlendirin.
- Tünel hedefi uygulamanın yerel adresi olsun (ör. http://localhost:3000).
- Router üzerinde 3000 veya 5432 portlarını internete yönlendirmeyin.
- HTTPS kullanın.
- Uygulama oturum açma, rol ve şube yetkileriyle korunmalıdır.
- Yönetici hesaplarında çok faktörlü doğrulama eklenmeden genel internet erişimini canlı finans verisiyle açmayın.

## Yedekleme
- Her gün PostgreSQL yedeği alın.
- Yedekleri sunucu diskinden ayrı bir diske ve tercihen şifreli uzak bir konuma kopyalayın.
- Geri yükleme tatbikatı yapmadan yedekleri güvenilir kabul etmeyin.
- Uygulama dosyalarını, .env dosyasını ve veritabanını ayrı ayrı yedekleyin.

## Önemli
Bu depo şu anda geliştirme temelidir. Kullanıcı daveti, parola sıfırlama, iki aşamalı doğrulama, ayrıntılı rol/şube izin matrisi, bordro mevzuat kontrolleri, Excel şablon doğrulaması, otomatik yedekleme ve canlıya geçiş testleri tamamlanmadan üretim kullanımına açılmamalıdır.