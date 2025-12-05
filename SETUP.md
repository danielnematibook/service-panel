# 🚀 راهنمای راه‌اندازی سیستم دیتابیس مرکزی

## 📋 نیازمندی‌ها

- Python 3.7+
- دسترسی به 2 پورت: `5000` (دیتابیس) و `8000` (فرانت‌اند)
- مرورگر مدرن (Chrome, Firefox, Safari, Edge)

## 🏗️ معماری سیستم

```
Client Devices (Phone, Tablet, Desktop, Laptop)
         ↓
      sync.js (CloudSync)
         ↓
   REST API (HTTP)
         ↓
database_server.py (Port 5000)
         ↓
    SQLite DB
  (service_panel.db)
```

## 📦 فایل‌های نیاز

### سرور (Backend)

```
database_server.py    - سرور دیتابیس مرکزی
server.py            - سرور فرانت‌اند (بدون کش)
```

### فرانت‌اند (Frontend)

```
index.html          - رابط کاربری
styles.css          - استایل‌ها
app.js              - لاجیک اصلی
sync.js             - سیستم همگام‌سازی
auth.js             - احراز هویت
db.js               - مدیریت IndexedDB
sw.js               - Service Worker
manifest.json       - PWA تنظیمات
```

## 🚀 راه‌اندازی مرحله به مرحله

### مرحله 1: بازکردن دو ترمینال

**ترمینال اول** - سرور دیتابیس:

```bash
cd c:\Users\DanielNemati\Desktop\Project
python database_server.py
```

منتظر بمانید تا این پیام نمایش داده شود:

```
╔════════════════════════════════════════════════════════════╗
║         🗄️  Central Database Server Started               ║
║                                                            ║
║  Server: http://localhost:5000                            ║
║  Database: service_panel.db                               ║
║  Mode: REST API with Real-time Sync                       ║
╚════════════════════════════════════════════════════════════╝
```

**ترمینال دوم** - سرور فرانت‌اند:

```bash
cd c:\Users\DanielNemati\Desktop\Project
python server.py
```

منتظر بمانید تا این پیام نمایش داده شود:

```
Serving on port 8000
http://localhost:8000
```

### مرحله 2: باز کردن مرورگر

سه یا چهار مرورگر را باز کنید:

```
http://localhost:8000
```

در هرکدام وارد شوید:

- نام‌کاربری: `danielnemati`
- رمز عبور: `21april2002`

### مرحله 3: تست همگام‌سازی

اضافه کردن یک مشتری درایک مرورگر:

1. روی **+ اضافه کردن** کلیک کنید
2. فرم را پر کنید
3. **ذخیره** را کلیک کنید

🔄 دو پنجره دیگر باید خودکار بروزرسانی شوند!

## ✅ ویژگی‌های سیستم

### ✨ Offline Support

- اگر اینترنت قطع شود، تغییرات موضعی ذخیره می‌شوند
- وقتی اتصال برقرار شود، خودکار ارسال می‌شود

### 🔄 Automatic Sync

- ہر 30 ثانیه خودکار بررسی
- فقط تغییرات جدید ارسال می‌شوند
- بدون تأثیر بر عملکرد

### 📱 Multi-Device Support

- تمام دستگاه‌ها یک دیتابیس را دید نمی‌کنند
- تغییرات بر روی تمام دستگاه‌ها فوری نمایش داده می‌شوند

### 🔐 Device Identification

- هر دستگاه خودکار شناسایی می‌شود
- شناسه دستگاه: `device_[browserFingerprint]`

### 💾 Data Safety

- محلی: IndexedDB (نسخه‌ پشتیبان محلی)
- سرور: SQLite (نسخه‌ عمومی)
- صف: Offline تغییرات تا اتصال

## 🧪 تست سیستم

برای تست خودکار:

```bash
python test_sync.py
```

این نتیجه‌ای مشابه را نشان می‌دهد:

```
✅ Health Check                                  Status code: 200
✅ Register Device                                device_001
✅ Add Customer                                  TEST_1234567890
✅ Get Customers                                 5 customers
✅ Save Setting                                  Setting saved
✅ Get Settings                                  12 settings
✅ Log SMS                                       SMS logged
✅ Sync Data                                     5 customers, 12 settings
✅ Get Sessions                                  3 devices
```

## 🔧 تنظیمات قابل تغییر

در فایل `sync.js`:

```javascript
// تغییر دهید اگر سرور در پورت دیگری باشد
initializeCloudSync("http://localhost:5000");

// تغییر interval همگام‌سازی (به میلی‌ثانیه)
this.syncInterval = 30000; // 30 ثانیه
```

## 📊 مدیریت دیتابیس

### مشاهده اطلاعات

```bash
# بزرگ‌نمایی دیتابیس
python -m sqlite3 service_panel.db

# دستورات مفید
.tables                    # تمام جداول
SELECT * FROM customers;   # تمام مشتریان
SELECT * FROM settings;    # تمام تنظیمات
.quit                      # خروج
```

### صادرات اطلاعات

```bash
# Backup دیتابیس
copy service_panel.db service_panel_backup.db
```

## 🐛 حل‌ مسائل

### مسئله: "Connection refused"

```
❌ Server is not running
✅ راه‌حل: python database_server.py را فراخوانی کنید
```

### مسئله: دستگاه‌ها هم‌گام نیستند

```
❌ Sync not working
✅ راه‌حل:
   1. اتصال اینترنت را بررسی کنید
   2. F5 را فشار دهید
   3. Sync status را بررسی کنید: cloudSync.getStatus()
```

### مسئله: تغییرات در هر دستگاه متفاوت است

```
❌ Data conflict
✅ راه‌حل:
   1. Server قطع شده است
   2. Offline mode فعال است
   3. صف تغییرات منتظر است
```

## 🎯 نکات کاربردی

### کنسول توسعه‌دهنده (F12)

```javascript
// وضعیت همگام‌سازی
cloudSync.getStatus();

// اجبار همگام‌سازی
cloudSync.syncNow();

// شناسه دستگاه
cloudSync.deviceId;

// بررسی صف تغییرات
cloudSync.syncQueue;

// ورود به offline mode
cloudSync.offline = true;
```

## 📈 نمایش‌های جدید

### وضعیت همگام‌سازی

وقتی معرّف دستگاه را بررسی کنید:

```
Device ID: device_abc123def456
Last Sync: 2024-01-15 12:34:56
Online: ✅
Queued Changes: 0
```

### صف Offline

اگر offline شود:

```
⚠️ Offline - changes will sync when online
Queued: 3 operations
Waiting for: Connection restore
```

## 🔒 امنیت

- تمام اتصالات HTTP است (توصیه: HTTPS برای Production)
- احراز هویت: Base64 (نیازمند بهبود برای Production)
- Validation: تمام input‌ها تأیید می‌شوند

## 📝 لاگ‌گذاری

### سرور

```
[2024-01-15 12:00:00] Device registered: device_abc123
[2024-01-15 12:00:05] Customer added: USER001
[2024-01-15 12:00:10] Settings updated: smsApiKey
```

### کلاینت (Console)

```
✅ Connected to central database
☁️ Cloud sync initialized
📡 Sync completed at 2024-01-15T12:00:15.123Z
📥 Updated 5 customers
```

## 🎓 مثال کامل

### 1. یک مشتری را اضافه کنید

```
Device 1: + اضافه کردن → نام "احمد" → ✔️ ذخیره
```

### 2. بررسی Device 2

```
Device 2: خودکار بروزرسانی می‌شود
          "احمد" دیده می‌شود
```

### 3. Offline کنید Device 1

```
Device 1: اینترنت را ببند
          مشتری جدید "علی" اضافه کن
          تغییرات محلی ذخیره شود
```

### 4. Reconnect کنید

```
Device 1: اینترنت را برقرار کن
          خودکار به سرور ارسال می‌شود
```

### 5. تصدیق در Device 2 و 3

```
Device 2: "علی" ظاهر می‌شود
Device 3: "علی" ظاهر می‌شود
```

## 📞 پشتیبانی

اگر مشکل پیدا کردید:

1. **لاگ‌های سرور را بررسی کنید**

   ```bash
   # دو ترمینالی که سرور در آن اجرا می‌شود را ببینید
   ```

2. **Browser Console را بررسی کنید** (F12)

   ```javascript
   console.log(cloudSync.getStatus());
   ```

3. **Database را بررسی کنید**
   ```bash
   python -m sqlite3 service_panel.db "SELECT * FROM customers;"
   ```

## ✨ نتیجه‌گیری

حالا سیستم شما:

- ✅ تمام دستگاه‌ها یک دیتابیس دارند
- ✅ تغییرات خودکار همگام‌سازی می‌شوند
- ✅ Offline کار می‌کند
- ✅ هیچ داده‌ای از دست نمی‌رود

🎉 **سیستم آماده است!**
