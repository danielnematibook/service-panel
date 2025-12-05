# 📱 Service Panel - Multi-Device Sync System

> یک سیستم مدیریت مشتری و تنظیمات با **همگام‌سازی خودکار بین دستگاه‌های متعدد**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.8+-green.svg)](https://python.org)

## 🌟 ویژگی‌های اصلی

- ✨ **همگام‌سازی لحظه‌ای** - داده‌ها خودکار بین تمام دستگاه‌ها هم‌گام میشوند
- 📦 **بدون نیاز به تنظیمات** - فقط اجرا کنید و کار می‌کند
- 🔌 **پشتیبانی آفلاین** - تغییرات در حالت آفلاین ذخیره و سپس آپلود میشوند
- 🔐 **محفوظ و قابل‌اعتماد** - از SQLite برای ذخیره‌سازی مرکزی استفاده می‌کند
- 📱 **چند دستگاهی** - از کامپیوتر، تبلت، یا گوشی استفاده کنید
- 💾 **ذخیره‌سازی محلی** - IndexedDB برای کش کردن سریع

## 🚀 شروع سریع

### الزامات

- Python 3.8+
- مرورگر مدرن با پشتیبانی IndexedDB

### نصب و اجرا

```bash
# 1. کلون کنید یا دانلود کنید
git clone https://github.com/YOUR_USERNAME/service-panel.git
cd service-panel

# 2. سرور دیتابیس را اجرا کنید (Terminal 1)
python database_server.py

# 3. سرور فرانت‌اند را اجرا کنید (Terminal 2)
python server.py

# 4. مرورگر را باز کنید
# http://localhost:8000
```

## 📊 معماری سیستم

```
┌──────────────────┐         ┌──────────────────┐
│    Device 1      │         │    Device 2      │
│  ┌────────────┐  │         │  ┌────────────┐  │
│  │ IndexedDB  │  │         │  │ IndexedDB  │  │
│  └────────────┘  │         │  └────────────┘  │
│        ↓          │         │        ↓          │
│  ┌────────────┐  │         │  ┌────────────┐  │
│  │ CloudSync  │  │         │  │ CloudSync  │  │
│  └────────────┘  │         │  └────────────┘  │
└─────────┬────────┘         └────────┬─────────┘
          │                           │
          │        HTTP REST API      │
          └───────────┬───────────────┘
                      ↓
            ┌─────────────────────┐
            │  Database Server    │
            │   Port 5000        │
            │  ┌───────────────┐  │
            │  │   SQLite      │  │
            │  │               │  │
            │  │ - Customers   │  │
            │  │ - Settings    │  │
            │  │ - SMS History │  │
            │  └───────────────┘  │
            └─────────────────────┘
```

## 🎯 نحوه کار

### هنگام ورود اولین بار (Device 1)

1. تمام مشتریان و تنظیمات در حافظه محلی (IndexedDB) ذخیره می‌شوند
2. هنگام بستن و باز کردن دوباره، **خودکار به سرور مرکزی آپلود می‌شوند**
3. سایر دستگاه‌ها این داده‌ها را می‌بینند

### هنگام ورود از دستگاه دوم (Device 2)

1. اپلیکیشن به سرور مرکزی متصل می‌شود
2. تمام داده‌های قبلی از Device 1 دانلود می‌شوند
3. سپس هر 30 ثانیه تغییرات را بررسی می‌کند

## 📁 ساختار پروژه

```
service-panel/
├── app.js                    # منطق اصلی اپلیکیشن
├── sync.js                   # CloudSync class برای همگام‌سازی
├── db.js                     # مدیریت IndexedDB
├── auth.js                   # سیستم احراز هویت
├── index.html                # رابط کاربری
├── server.py                 # سرور فرانت‌اند (پورت 8000)
├── database_server.py        # سرور دیتابیس (پورت 5000)
├── service_panel.db          # دیتابیس SQLite
├── test_e2e.py               # تست‌های جامع
└── README.md                 # این فایل
```

## 🧪 تست‌ها

### اجرای تمام تست‌ها

```bash
python test_e2e.py
```

### بررسی وضعیت دیتابیس

```bash
python check_db.py
```

### افزودن داده‌های تستی

```bash
python add_test_data.py
```

## 📊 داده‌های پشتیبانی شده

### مشتریان (Customers)

- کد مشتری
- نام
- شماره موبایل
- میزان حجم
- وضعیت (فعال/غیرفعال)
- تاریخ تمدید
- و بیشتر...

### تنظیمات (Settings)

- قیمت حجم اضافی
- قیمت کاربر اضافی
- کلید API پیامک
- شماره خط پیامک
- و دیگر تنظیمات

### تاریخچه پیامک (SMS History)

- گیرنده
- متن پیام
- وضعیت ارسال
- تاریخ و زمان

## 🔧 تنظیمات پیشرفته

### تغییر بازه همگام‌سازی

در `sync.js`:

```javascript
this.syncInterval = 30000; // میلی‌ثانیه (پیش‌فرض: 30 ثانیه)
```

### تغییر پورت سرور دیتابیس

در `database_server.py`:

```python
PORT = 5000  # تغییر دهید
```

### تغییر پورت سرور فرانت‌اند

در `server.py`:

```python
PORT = 8000  # تغییر دهید
```

## 🐛 رفع مشکلات

### داده‌ها همگام نمی‌شوند؟

```bash
# 1. بررسی کنید که هر دو سرور اجرا می‌شوند
python check_db.py

# 2. صفحه را تازه کنید (F5)

# 3. کنسول مرورگر را باز کنید (F12) و خطاها را بررسی کنید
```

### دیتابیس خراب شده است؟

```bash
# دیتابیس را حذف کنید و دوباره شروع کنید
rm service_panel.db
python database_server.py
```

## 📝 لاگ‌ها

### لاگ‌های سرور دیتابیس

```
✅ Database initialized
╔════════════════════════════════════════════════════════════╗
║         🗄️  Central Database Server Started               ║
║  Server: http://localhost:5000                           ║
```

### لاگ‌های فرانت‌اند

```
📤 Uploading X customers...
✅ Customer uploaded: CODE
✅ Sync completed at HH:MM:SS
```

## 🌐 API Endpoints

### مشتریان

```
POST   /api/customers/add      - افزودن مشتری
POST   /api/customers/update   - ویرایش مشتری
POST   /api/customers/delete   - حذف مشتری
GET    /api/customers/sync     - دریافت تغییرات
```

### تنظیمات

```
POST   /api/settings/save      - ذخیره تنظیمات
GET    /api/settings           - دریافت تنظیمات
```

### دستگاه

```
POST   /api/device/register    - ثبت دستگاه
GET    /api/health             - وضعیت سرور
```

## 📱 تست بر روی دستگاه‌های متعدد

### در شبکه محلی

```
Device 1: http://192.168.X.X:8000
Device 2: http://192.168.X.X:8000
Device 3: http://192.168.X.X:8000
```

تنها نیاز است که همه دستگاه‌ها متصل به شبکه یکسانی باشند.

## 📦 پیش‌نیازها

```
Python 3.8+
sqlite3 (معمولاً با Python نصب شده)
مرورگر: Chrome, Firefox, Edge, Safari (معاصر)
```

## 🚀 استقرار در پروداکشن

برای استقرار در محیط پروداکشن:

1. **استفاده از Gunicorn**

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 database_server:app
```

2. **استفاده از Nginx**

```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:8000;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
    }
}
```

3. **HTTPS**

```bash
# با Let's Encrypt
sudo certbot certonly --standalone -d your_domain.com
```

## 📄 مجوز

MIT License - [مشاهده مجوز](LICENSE)

## 👨‍💻 نویسنده

Created by Daniel Nemati

## 🤝 مشارکت

دریافت پول برای بهبود:

1. Fork کنید
2. شاخه جدید بسازید (`git checkout -b feature/AmazingFeature`)
3. تغییرات را Commit کنید (`git commit -m 'Add AmazingFeature'`)
4. به شاخه Push کنید (`git push origin feature/AmazingFeature`)
5. Pull Request باز کنید

## 📞 تماس

- 📧 Email: [ایمیل شما]
- 🐙 GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- 💬 Telegram: [@YOUR_TELEGRAM]

## 🎓 یادگیری بیشتر

- [مستندات کامل](MULTI-DEVICE-SYNC-COMPLETE.md)
- [شروع سریع](QUICK-START.md)
- [API Documentation](README-SYNC.md)

---

**نسخه**: 1.0.0  
**آخرین بروز‌رسانی**: December 5, 2025  
**وضعیت**: ✅ تکمیل و آماده برای استفاده

**اگر این پروژه برای شما مفید بود، لطفاً یک ⭐ به آن دهید!**
