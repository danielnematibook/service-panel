// --- IndexedDB Management System ---
class ServiceDatabase {
  constructor() {
    this.dbName = "servicePanelDB";
    this.version = 1;
    this.db = null;
  }

  // اتصال به دیتا‌بیس
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("❌ خطای دیتا‌بیس:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("✅ دیتا‌بیس متصل شد");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;

        // جدول مشتریان
        if (!this.db.objectStoreNames.contains("customers")) {
          const customerStore = this.db.createObjectStore("customers", {
            keyPath: "id",
            autoIncrement: true,
          });
          customerStore.createIndex("mobile", "mobile", { unique: false });
          customerStore.createIndex("code", "code", { unique: true });
          customerStore.createIndex("name", "name", { unique: false });
        }

        // جدول تنظیمات
        if (!this.db.objectStoreNames.contains("settings")) {
          this.db.createObjectStore("settings", { keyPath: "key" });
        }

        // جدول تاریخچه ارسال پیامک
        if (!this.db.objectStoreNames.contains("smsHistory")) {
          const smsStore = this.db.createObjectStore("smsHistory", {
            keyPath: "id",
            autoIncrement: true,
          });
          smsStore.createIndex("timestamp", "timestamp", { unique: false });
          smsStore.createIndex("mobile", "mobile", { unique: false });
        }

        console.log("✅ جداول دیتا‌بیس ایجاد شدند");
      };
    });
  }

  // افزودن/بروز رسانی مشتری
  async addCustomer(customerData) {
    const store = this.db
      .transaction(["customers"], "readwrite")
      .objectStore("customers");

    return new Promise((resolve, reject) => {
      const request = customerData.id
        ? store.put(customerData)
        : store.add(customerData);

      request.onsuccess = () => {
        console.log("✅ مشتری ذخیره شد:", customerData.name);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("❌ خطا در ذخیره مشتری:", request.error);
        reject(request.error);
      };
    });
  }

  // دریافت تمام مشتریان
  async getAllCustomers() {
    const store = this.db.transaction(["customers"]).objectStore("customers");

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        console.log(`✅ ${request.result.length} مشتری دریافت شد`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("❌ خطا در دریافت مشتریان:", request.error);
        reject(request.error);
      };
    });
  }

  // دریافت مشتری بر اساس کد
  async getCustomerByCode(code) {
    const store = this.db.transaction(["customers"]).objectStore("customers");
    const index = store.index("code");

    return new Promise((resolve, reject) => {
      const request = index.get(code);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // حذف مشتری
  async deleteCustomer(id) {
    const store = this.db
      .transaction(["customers"], "readwrite")
      .objectStore("customers");

    return new Promise((resolve, reject) => {
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log("✅ مشتری حذف شد");
        resolve();
      };

      request.onerror = () => {
        console.error("❌ خطا در حذف مشتری:", request.error);
        reject(request.error);
      };
    });
  }

  // ذخیره تنظیمات
  async saveSetting(key, value) {
    const store = this.db
      .transaction(["settings"], "readwrite")
      .objectStore("settings");

    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // دریافت تنظیمات
  async getSetting(key) {
    const store = this.db.transaction(["settings"]).objectStore("settings");

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // دریافت تمام تنظیمات
  async getAllSettings() {
    const store = this.db.transaction(["settings"]).objectStore("settings");

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const settings = {};
        request.result.forEach((item) => {
          settings[item.key] = item.value;
        });
        resolve(settings);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // ثبت پیامک ارسالی
  async logSms(mobile, message, status) {
    const store = this.db
      .transaction(["smsHistory"], "readwrite")
      .objectStore("smsHistory");

    return new Promise((resolve, reject) => {
      const request = store.add({
        mobile,
        message,
        status,
        timestamp: new Date().toLocaleString("fa-IR"),
      });

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // دریافت تاریخچه پیامک‌های ارسالی
  async getSmsHistory(limit = 100) {
    const store = this.db.transaction(["smsHistory"]).objectStore("smsHistory");
    const index = store.index("timestamp");

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, "prev");
      const results = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // صادرات تمام اطلاعات
  async exportAllData() {
    const customers = await this.getAllCustomers();
    const settings = await this.getAllSettings();
    const smsHistory = await this.getSmsHistory(500);

    return {
      customers,
      settings,
      smsHistory,
      exportDate: new Date().toLocaleString("fa-IR"),
    };
  }

  // وارد کردن اطلاعات
  async importAllData(data) {
    try {
      // وارد کردن مشتریان
      if (data.customers && Array.isArray(data.customers)) {
        for (const customer of data.customers) {
          await this.addCustomer(customer);
        }
      }

      // وارد کردن تنظیمات
      if (data.settings && typeof data.settings === "object") {
        for (const [key, value] of Object.entries(data.settings)) {
          await this.saveSetting(key, value);
        }
      }

      console.log("✅ اطلاعات وارد شدند");
      return true;
    } catch (err) {
      console.error("❌ خطا در وارد کردن اطلاعات:", err);
      return false;
    }
  }

  // تخلیه دیتا‌بیس (شروع از نو)
  async clearAllData() {
    try {
      const transaction = this.db.transaction(
        ["customers", "settings", "smsHistory"],
        "readwrite"
      );

      transaction.objectStore("customers").clear();
      transaction.objectStore("settings").clear();
      transaction.objectStore("smsHistory").clear();

      return new Promise((resolve, reject) => {
        transaction.onsuccess = () => {
          console.log("✅ دیتا‌بیس پاک شد");
          resolve();
        };

        transaction.onerror = () => {
          reject(transaction.error);
        };
      });
    } catch (err) {
      console.error("❌ خطا در پاک کردن دیتا‌بیس:", err);
      throw err;
    }
  }
}

// ایجاد نمونه دیتا‌بیس
const vpnDB = new ServiceDatabase();
