# Central Database Synchronization System

## نمای کلی

یک سیستم **دیتابیس مرکزی** که تمام دستگاه‌ها از آن استفاده می‌کنند و تمام تغییرات به‌صورت خودکار هم‌گام‌سازی می‌شوند.

## معماری

```
┌─────────────────────────────────────────────────────────┐
│           Central Database Server (SQLite)              │
│         database_server.py (Port 5000)                  │
│  - Customers, Settings, SMS History, Sync Log           │
└────────────────────────────────┬────────────────────────┘
         ↕ REST API ↕ (HTTP Sync)
     ┌───┴───┬───────┬───────┬───────┐
     │       │       │       │       │
   Device1 Device2 Device3 Device4 Device5
  (Phone1) (Phone2)(Tablet)(Desktop)(Laptop)
   Local   Local   Local   Local    Local
  Cache +  Cache + Cache + Cache +  Cache +
 IndexedDB IndexedDB IndexedDB ... IndexedDB
```

## اجزای سیستم

### 1. **database_server.py** - سرور دیتابیس مرکزی

- **پورت**: 5000
- **نوع**: REST API بر اساس HTTP
- **دیتابیس**: SQLite برای ذخیره سازی دائمی
- **جداول**:
  - `customers` - اطلاعات مشتریان
  - `settings` - تنظیمات سیستم
  - `sms_history` - تاریخچه ارسال پیامک
  - `sync_log` - گزارش همگام‌سازی
  - `device_sessions` - جلسات دستگاه‌ها

### 2. **sync.js** - سیستم همگام‌سازی کلاینت

- **کلاس**: `CloudSync`
- **وظایف**:
  - شناسایی دستگاه (Device ID)
  - مدیریت صف تغییرات (Offline Queue)
  - همگام‌سازی دوری (Periodic Sync)
  - مدیریت اتصالات آنلاین/آفلاین

### 3. **app.js** - پیکربندی اپلیکیشن

- فراخوانی `initializeCloudSync()` بعد از بارگذاری دیتابیس
- فراخوانی `cloudSync` هنگام ذخیره تغییرات
- بروزرسانی رابط کاربری با داده‌های سرور

## API Endpoints

### GET Endpoints

#### `/api/health`

بررسی وضعیت سرور

```
Response: { success: true, status: "Database server online" }
```

#### `/api/customers`

دریافت تمام مشتریان

```
Response: { success: true, data: [...customers] }
```

#### `/api/settings`

دریافت تمام تنظیمات

```
Response: { success: true, data: {...settings} }
```

#### `/api/sms-history?limit=100`

دریافت تاریخچه پیامک‌ها

```
Response: { success: true, data: [...sms_records] }
```

#### `/api/device-sessions`

دریافت فهرست دستگاه‌های فعال

```
Response: { success: true, data: [...devices] }
```

### POST Endpoints

#### `/api/customers/add`

افزودن مشتری جدید

```json
{
  "device_id": "device_xxx",
  "customer": {
    "code": "USER001",
    "mobile": "09123456789",
    "name": "محمد",
    "duration": 12,
    "volume": 100,
    "status": "active"
  }
}
```

#### `/api/customers/update`

بروزرسانی اطلاعات مشتری

```json
{
  "device_id": "device_xxx",
  "customer": {
    "code": "USER001",
    "name": "محمد علی",
    "duration": 13
  }
}
```

#### `/api/customers/delete`

حذف مشتری

```json
{
  "device_id": "device_xxx",
  "code": "USER001"
}
```

#### `/api/settings/save`

ذخیره تنظیمات

```json
{
  "device_id": "device_xxx",
  "key": "smsApiKey",
  "value": "your_api_key_here"
}
```

#### `/api/sms/log`

ثبت ارسال پیامک

```json
{
  "device_id": "device_xxx",
  "mobile": "989123456789",
  "message": "متن پیام",
  "status": "sent",
  "response": "API response"
}
```

#### `/api/device/register`

ثبت‌نام دستگاه جدید

```json
{
  "device_id": "device_xxx"
}
```

#### `/api/sync` (POST)

دریافت به‌روزرسانی‌های جدید

```json
{
  "device_id": "device_xxx",
  "last_sync": "2024-01-01T12:00:00"
}
```

Response:

```json
{
  "success": true,
  "customers": [...],
  "settings": {...},
  "changes": [...],
  "timestamp": "2024-01-01T12:05:00"
}
```

## روند همگام‌سازی

### 1. هنگام شروع اپلیکیشن

```
1. Load local IndexedDB cache
2. Initialize CloudSync
3. Register device with server
4. Fetch updates from server
5. Apply remote updates to local cache
6. Render UI with merged data
```

### 2. هنگام تغییر داده‌ها

```
1. Update local IndexedDB immediately
2. Update UI
3. If online: Send to server
4. If offline: Queue the change
5. When back online: Process queue
```

### 3. دوری (هر 30 ثانیه)

```
1. Check server connection
2. Process queued changes
3. Fetch server updates
4. Apply remote updates
5. Update last_sync timestamp
```

## مدیریت Offline

اگر اتصال قطع شود:

- تغییرات محلی در `syncQueue` ذخیره می‌شوند
- UI به‌صورت محلی به‌روزرسانی می‌شود
- وقتی اتصال برقرار شود، صف خودکار عملیات می‌شود

```javascript
// مثال
if (cloudSync.offline) {
  console.log("⚠️ Offline - changes will sync when online");
}
```

## شناسایی دستگاه

هر دستگاه یک **Device ID** منحصربه‌فرد دارد:

```javascript
deviceId = "device_" + hashCode(userAgent + timezone + screen + language);
```

این ID برای:

- ردیابی منشا تغییرات
- جلوگیری از تضارب‌ها
- نمایش وضعیت دستگاه‌ها

## مثال استفاده

### شروع همگام‌سازی

```javascript
// صارف خودکار در app.js فراخوانی می‌شود
initializeCloudSync("http://localhost:5000");
```

### ارسال تغییرات

```javascript
// خودکار هنگام saveCustomer() یا saveSettings()
if (cloudSync) {
  cloudSync.addCustomer(customer);
  cloudSync.saveSetting(key, value);
}
```

### بررسی وضعیت

```javascript
const status = cloudSync.getStatus();
console.log(status.isOnline);
console.log(status.queuedChanges);
console.log(status.lastSyncTime);
```

## نصب و راه‌اندازی

### 1. سرور دیتابیس

```bash
python database_server.py
# Serving on http://localhost:5000
```

### 2. سرور Front-end

```bash
python server.py
# Serving on http://localhost:8000
```

### 3. دسترسی

```
کاربر: danielnemati
رمز: 21april2002
```

## جلوگیری از باگ‌ها

### ✅ تضارب‌های داده

- **Timestamp**: هر رکورد `last_updated` دارد
- **Device ID**: منشا تغییر ثبت می‌شود
- **Conflict Resolution**: آخرین تغییر برنده است

### ✅ از دست دادن داده‌ها

- **محلی**: IndexedDB برای ذخیره سازی دائمی
- **سرور**: SQLite برای پشتیبان‌گیری
- **Queue**: تغییرات offline تا بازگشت اتصال منتظر

### ✅ تناسق شامل

- **Validation**: هر عملیات تائید می‌شود
- **Transaction**: عملیات دیتابیسی atomic هستند
- **Error Handling**: تمام خطاها ثبت و مدیریت می‌شوند

### ✅ عملکرد

- **Compression**: فقط تغییرات زیر 30 ثانیه اخیر ارسال می‌شوند
- **Batch**: چندین عملیات به‌صورت دسته‌ای ارسال می‌شوند
- **Throttling**: درخواست‌های تکراری لغو می‌شوند

## Debugging

### کنسول مرورگر

```javascript
// وضعیت همگام‌سازی
cloudSync.getStatus();

// اجبار همگام‌سازی فوری
cloudSync.syncNow();

// بررسی صف
cloudSync.syncQueue;

// شناسه دستگاه
cloudSync.deviceId;
```

### Log سرور

```
[2024-01-01 12:00:00] Device registered: device_abc123
[2024-01-01 12:00:05] Customer added: USER001
[2024-01-01 12:00:10] Settings updated: smsApiKey
```

## نکات مهم

⚠️ **شماره دستگاه**: ہر دستگاه خودکار شناسایی می‌شود
⚠️ **Sync Interval**: 30 ثانیه - قابل تنظیم
⚠️ **Server URL**: پیش‌فرض `http://localhost:5000`
⚠️ **Timeout**: 5 دقیقه برای جلسات دستگاه
⚠️ **Thread Safety**: سرور thread-safe است

## مسائل احتمالی و حل‌ها

### مسئله: تغییرات بر روی یک دستگاه دیده نمی‌شوند

```
حل: F5 را فشار دهید یا refreshUIFromDatabase() را فراخوانی کنید
```

### مسئله: دستگاه‌ها هم‌گام نیستند

```
حل: اتصال اینترنت را بررسی کنید - cloudSync.getStatus().isOnline
```

### مسئله: صف ارسال شنی نمی‌شود

```
حل: Offline اپلیکیشن را بازیابی کنید - Browser Console: cloudSync.syncNow()
```

## نسخه‌بندی

- **v1.0**: سیستم اولیه
  - Customers sync
  - Settings sync
  - SMS History logging
  - Device registration
  - Offline queue

## License

استفاده برای پروژه شخصی آزاد است.
