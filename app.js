// --- PWA Service Worker Registration ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.log("Service Worker Registered"))
      .catch((err) => console.log("SW Fail:", err));
  });
}

// --- SECURITY: Authentication System ---
async function handleLogin() {
  const usernameInput = document.getElementById("usernameInput").value.trim();
  const passwordInput = document.getElementById("passwordInput").value;
  const errorDiv = document.getElementById("loginError");

  if (!usernameInput || !passwordInput) {
    errorDiv.innerText = "نام کاربری و رمز را وارد کنید";
    errorDiv.style.display = "block";
    return;
  }

  // احراز هویت
  const result = await authManager.verifyCredentials(
    usernameInput,
    passwordInput
  );

  if (result.success) {
    errorDiv.style.display = "none";
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-window").classList.remove("hidden");
    showToast("✅ خوش آمدید " + usernameInput, "success");
  } else {
    errorDiv.innerText = result.message;
    errorDiv.style.display = "block";
    document.getElementById("passwordInput").value = "";
  }
}

// امکان فشار دادن Enter برای ورود
document.addEventListener("DOMContentLoaded", function () {
  const usernameInput = document.getElementById("usernameInput");
  const passwordInput = document.getElementById("passwordInput");

  if (usernameInput && passwordInput) {
    usernameInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") handleLogin();
    });

    passwordInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") handleLogin();
    });
  }
});

// بررسی احراز هویت در بارگذاری صفحه
// (این قطعه به startApp منتقل شد)

// تابع خروج
function handleLogout() {
  const confirmed = confirm("آیا می‌خواهید خارج شوید؟");
  if (!confirmed) return;

  authManager.logout();
  document.getElementById("app-window").classList.add("hidden");
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("usernameInput").value = "";
  document.getElementById("passwordInput").value = "";
  document.getElementById("loginError").style.display = "none";

  showToast("خروج موفق بود", "success");
  console.log("✅ کاربر خارج شد");
}

// --- Helper: SVGs ---
const linkIconSvg = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.16488 17.6505C8.92513 17.8743 8.73958 18.0241 8.54996 18.1336C7.62175 18.6695 6.47816 18.6695 5.54996 18.1336C5.20791 17.9361 4.87912 17.6073 4.22153 16.9498C3.56394 16.2922 3.23514 15.9634 3.03767 15.6213C2.50177 14.6931 2.50177 13.5495 3.03767 12.6213C3.23514 12.2793 3.56394 11.9505 4.22153 11.2929L7.04996 8.46448C7.70755 7.80689 8.03634 7.47809 8.37838 7.28062C9.30659 6.74472 10.4502 6.74472 11.3784 7.28061C11.7204 7.47809 12.0492 7.80689 12.7068 8.46448C13.3644 9.12207 13.6932 9.45086 13.8907 9.7929C14.4266 10.7211 14.4266 11.8647 13.8907 12.7929C13.7812 12.9825 13.6314 13.1681 13.4075 13.4078M10.5919 10.5922C10.368 10.8319 10.2182 11.0175 10.1087 11.2071C9.57284 12.1353 9.57284 13.2789 10.1087 14.2071C10.3062 14.5492 10.635 14.878 11.2926 15.5355C11.9502 16.1931 12.279 16.5219 12.621 16.7194C13.5492 17.2553 14.6928 17.2553 15.621 16.7194C15.9631 16.5219 16.2919 16.1931 16.9495 15.5355L19.7779 12.7071C20.4355 12.0495 20.7643 11.7207 20.9617 11.3787C21.4976 10.4505 21.4976 9.30689 20.9617 8.37869C20.7643 8.03665 20.4355 7.70785 19.7779 7.05026C19.1203 6.39267 18.7915 6.06388 18.4495 5.8664C17.5212 5.3305 16.3777 5.3305 15.4495 5.8664C15.2598 5.97588 15.0743 6.12571 14.8345 6.34955" stroke="#000000" stroke-width="2" stroke-linecap="round"></path></svg>`;

const whatsappIcon = `<svg fill="#000000" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>whatsapp</title> <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"></path> </g></svg>`;

const telegramIcon = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M41.4193 7.30899C41.4193 7.30899 45.3046 5.79399 44.9808 9.47328C44.8729 10.9883 43.9016 16.2908 43.1461 22.0262L40.5559 39.0159C40.5559 39.0159 40.3401 41.5048 38.3974 41.9377C36.4547 42.3705 33.5408 40.4227 33.0011 39.9898C32.5694 39.6652 24.9068 34.7955 22.2086 32.4148C21.4531 31.7655 20.5897 30.4669 22.3165 28.9519L33.6487 18.1305C34.9438 16.8319 36.2389 13.8019 30.8426 17.4812L15.7331 27.7616C15.7331 27.7616 14.0063 28.8437 10.7686 27.8698L3.75342 25.7055C3.75342 25.7055 1.16321 24.0823 5.58815 22.459C16.3807 17.3729 29.6555 12.1786 41.4193 7.30899Z" fill="#000000"></path> </g></svg>`;

const smsIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12C20 16.4183 16.4183 20 12 20C10.9506 20 9.9472 19.7986 9.01831 19.4314L5.5 20.5L6.65852 17.1756C4.99827 15.8926 4 14.055 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// --- Helpers for Date & Numbers ---
const toEnglishDigits = (str) => {
  if (!str) return "";
  return str.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
};

function jalaliToGregorian(jy, jm, jd) {
  jy = parseInt(jy);
  jm = parseInt(jm);
  jd = parseInt(jd);
  var gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  var days =
    365 * jy +
    parseInt(jy / 33) * 8 +
    parseInt(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * parseInt(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * parseInt(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * parseInt(days / 1461);
  days %= 1461;
  gy += parseInt((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  var gd = days + 1;
  var sal_a = [
    0,
    31,
    (gy % 4 == 0 && gy % 100 != 0) || gy % 400 == 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  var gm;
  for (gm = 0; gm < 13; gm++) {
    var v = sal_a[gm];
    if (gd <= v) break;
    gd -= v;
  }
  return new Date(gy, gm - 1, gd);
}

function gregorianToJalali(gy, gm, gd) {
  var g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  var jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  var gy2 = gm > 2 ? gy + 1 : gy;
  var days =
    365 * gy +
    parseInt((gy2 + 3) / 4) -
    parseInt((gy2 + 99) / 100) +
    parseInt((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * parseInt(days / 12053);
  days %= 12053;
  jy += 4 * parseInt(days / 1461);
  days %= 1461;
  jy += parseInt((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  var jm =
    days < 186 ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
  var jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy: jy, jm: jm, jd: jd };
}

function calculateSubscriptionStatus(dateStr, durationMonths) {
  if (!dateStr)
    return {
      activeMonthIndex: -1,
      daysLeftInCurrentMonth: 0,
      isExpired: true,
    };
  try {
    const engDate = toEnglishDigits(dateStr);
    const parts = engDate.split("/");
    if (parts.length !== 3)
      return {
        activeMonthIndex: -1,
        daysLeftInCurrentMonth: 0,
        isExpired: true,
      };

    const startDate = jalaliToGregorian(parts[0], parts[1], parts[2]);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let activeMonthIndex = -1;
    let daysLeftInCurrentMonth = 0;
    let isExpired = false;

    for (let i = 0; i < durationMonths; i++) {
      let cycleStart = new Date(startDate);
      cycleStart.setMonth(cycleStart.getMonth() + i);
      let cycleEnd = new Date(cycleStart);
      cycleEnd.setMonth(cycleEnd.getMonth() + 1);
      cycleStart.setHours(0, 0, 0, 0);
      cycleEnd.setHours(0, 0, 0, 0);

      if (now >= cycleStart && now < cycleEnd) {
        activeMonthIndex = i;
        const diffTime = cycleEnd - now;
        daysLeftInCurrentMonth = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        break;
      }
    }
    const totalEndDate = new Date(startDate);
    totalEndDate.setMonth(totalEndDate.getMonth() + parseInt(durationMonths));
    totalEndDate.setHours(0, 0, 0, 0);

    if (now >= totalEndDate) {
      isExpired = true;
    }
    return { activeMonthIndex, daysLeftInCurrentMonth, isExpired };
  } catch (e) {
    return {
      activeMonthIndex: -1,
      daysLeftInCurrentMonth: 0,
      isExpired: true,
    };
  }
}

// --- Date Conv ---
function updateConvPlaceholders() {
  const type = document.getElementById("convType").value;
  const cy = document.getElementById("cYear");
  if (type === "s2m") cy.placeholder = "مثلا 1403";
  else cy.placeholder = "مثلا 2024";
}
function performConversion() {
  const type = document.getElementById("convType").value;
  const d = parseInt(document.getElementById("cDay").value);
  const m = parseInt(document.getElementById("cMonth").value);
  const y = parseInt(document.getElementById("cYear").value);
  const resBox = document.getElementById("convResult");
  if (!d || !m || !y) {
    resBox.innerText = "لطفا تاریخ را کامل وارد کنید";
    resBox.classList.remove("hidden");
    return;
  }
  let result = "";
  if (type === "s2m") {
    const gDate = jalaliToGregorian(y, m, d);
    result = `تاریخ میلادی: ${gDate.getFullYear()}/${
      gDate.getMonth() + 1
    }/${gDate.getDate()}`;
  } else {
    const jDate = gregorianToJalali(y, m, d);
    result = `تاریخ شمسی: ${jDate.jy}/${jDate.jm}/${jDate.jd}`;
  }
  resBox.innerText = result;
  resBox.classList.remove("hidden");
}

// --- Data ---
const defaultSettings = {
  extraVolumePrice: 16000,
  extraUserPrice: 20000,
  basePrices: { 25: 45000 },
  smsApiKey: "af5IT9T5J3AAR5fDoFeN3xc1AIJ7Z4ScqnUdVpn5rrnXNFBI",
  smsLineNumber: "30002101007931",
  smsService: "S services",
  autoSmsEnabled: true,
  autoSmsInterval: 24, // ساعت
  // پیام‌های شخصی
  customMessages: {
    expired:
      "{CONFIG_CODE} عزیز؛\n⛔️سرویس اشتراک شما، منقضی شده است!\n\n- اطلاعات سرویس شما:\n📅تاریخ خرید: {DATE}\n⌛️مدت زمان: {DURATION}\n🎚حجم خریداری شده ماهانه: {VOLUME}\n\n♻️برای تمدید اشتراک خود، به پشتیبانی سرویس اطلاع دهید.\n\nلغو 11",
    expiringSoon:
      "{CONFIG_CODE} عزیز؛\n⛔️سرویس اشتراک شما، فردا منقضی خواهد شد!\n\n- اطلاعات سرویس شما:\n📅تاریخ خرید: {DATE}\n⌛️مدت زمان: {DURATION}\n🎚حجم خریداری شده ماهانه: {VOLUME}\n\n♻️برای تمدید اشتراک خود، به پشتیبانی سرویس اطلاع دهید.\n\nلغو 11",
    custom: "", // برای پیام‌های دستی
  },
};
let settings =
  JSON.parse(localStorage.getItem("serviceSettings")) || defaultSettings;
let customers = JSON.parse(localStorage.getItem("serviceCustomers")) || [];

// Global CloudSync instance
let cloudSync = null;

/**
 * Initialize CloudSync for real-time multi-device synchronization
 */
function initializeCloudSync() {
  try {
    // CloudSync will auto-detect the correct server URL
    cloudSync = new CloudSync();
    console.log("✅ CloudSync initialized successfully");
    return cloudSync;
  } catch (error) {
    console.error("❌ Failed to initialize CloudSync:", error);
    cloudSync = null;
    showToast("⚠️ سینک مرکزی دسترسی ندارد - تنها ذخیره محلی", "warning");
    return null;
  }
}

// --- Database Initialization with Cloud Sync ---
async function initializeDatabase() {
  try {
    await vpnDB.init();

    // بارگذاری اطلاعات از دیتا‌بیس
    const dbCustomers = await vpnDB.getAllCustomers();
    const dbSettings = await vpnDB.getAllSettings();

    if (dbCustomers && dbCustomers.length > 0) {
      customers = dbCustomers;
      console.log(`✅ ${customers.length} مشتری از دیتا‌بیس بارگذاری شدند`);
    } else if (customers.length > 0) {
      // اگر مشتریان در localStorage وجود دارند، آنها را به دیتا‌بیس انتقال بده
      for (const customer of customers) {
        await vpnDB.addCustomer(customer);
      }
      console.log("✅ مشتریان موجود به دیتا‌بیس انتقال داده شدند");
    }

    if (dbSettings && Object.keys(dbSettings).length > 0) {
      settings = { ...defaultSettings, ...dbSettings };
      console.log("✅ تنظیمات از دیتا‌بیس بارگذاری شدند");
    } else {
      // تنظیمات پیش‌فرض را ذخیره کن
      for (const [key, value] of Object.entries(defaultSettings)) {
        await vpnDB.saveSetting(key, value);
      }
      console.log("✅ تنظیمات پیش‌فرض ذخیره شدند");
    }

    console.log("✅ دیتا‌بیس آماده است");

    // Initialize cloud synchronization
    initializeCloudSync();
    if (cloudSync) {
      console.log("☁️ Cloud sync initialized");

      // Upload local data to central server on first sync
      await uploadLocalDataToServer();
    }
  } catch (err) {
    console.error("❌ خطا در مقدار دهی دیتا‌بیس:", err);
    showToast("خطا در اتصال به دیتا‌بیس", "error");
  }
}

/**
 * Upload local IndexedDB data to central server
 * This ensures that when a user logs in from a new device,
 * they see all their previous data
 */
async function uploadLocalDataToServer() {
  if (!cloudSync) {
    console.log("⚠️ CloudSync not ready yet");
    return;
  }

  try {
    // Get all local customers and settings
    const localCustomers = await vpnDB.getAllCustomers();
    const localSettings = await vpnDB.getAllSettings();

    if (
      localCustomers.length === 0 &&
      Object.keys(localSettings).length === 0
    ) {
      console.log("✅ No local data to upload (fresh install)");
      return;
    }

    console.log(
      `📤 Uploading ${localCustomers.length} customers and settings...`
    );

    // Upload each customer to server
    for (const customer of localCustomers) {
      const result = await cloudSync.addCustomer(customer);
      if (result) {
        console.log(`✅ Customer uploaded: ${customer.code}`);
      } else {
        console.warn(`⚠️ Customer queued (offline): ${customer.code}`);
      }
    }

    // Upload settings to server
    for (const [key, value] of Object.entries(localSettings)) {
      const result = await cloudSync.saveSetting(key, value);
      if (result) {
        console.log(`✅ Setting uploaded: ${key}`);
      } else {
        console.warn(`⚠️ Setting queued (offline): ${key}`);
      }
    }

    // If we queued items, trigger a sync immediately
    if (cloudSync.syncQueue && cloudSync.syncQueue.length > 0) {
      console.log(
        `📡 Triggering immediate sync for ${cloudSync.syncQueue.length} queued items...`
      );
      await cloudSync.syncNow();
    }

    console.log("✅ Local data upload completed");
  } catch (err) {
    console.error("❌ Error uploading local data:", err);
  }
}

/**
 * Refresh UI from database (called after remote updates)
 */
async function refreshUIFromDatabase() {
  try {
    customers = await vpnDB.getAllCustomers();
    settings = await vpnDB.getAllSettings();

    // Refresh current tab's display
    const activeTab = document.querySelector(".main-content:not(.hidden)");
    if (activeTab && activeTab.id === "customers") {
      renderTable();
    } else if (activeTab && activeTab.id === "settings") {
      loadSettings();
    } else if (activeTab && activeTab.id === "database") {
      refreshDatabaseStats();
    }

    console.log("🔄 UI refreshed from database");
  } catch (err) {
    console.error("❌ Error refreshing UI:", err);
  }
}

// Make refreshUIFromDatabase globally accessible for sync module
window.refreshUIFromDatabase = refreshUIFromDatabase;

// --- Auto SMS Scheduler ---
let autoSmsTimer = null;

function startAutoSmsScheduler() {
  // چک کن هر ساعت
  autoSmsTimer = setInterval(() => {
    checkAndSendAutoSms();
  }, settings.autoSmsInterval * 60 * 60 * 1000); // تبدیل ساعت به میلی‌ثانیه

  // اول بار رو فوری چک کن
  checkAndSendAutoSms();
}

function checkAndSendAutoSms() {
  if (!settings.autoSmsEnabled) return;

  const now = new Date();
  const today = now.toLocaleDateString("fa-IR");
  const lastSentDate = localStorage.getItem("lastAutoSmsSentDate");

  // اگر امروز قبلا ارسال شده، دوباره ارسال نکن
  if (lastSentDate === today) return;

  const expiring = customers.filter((c) => {
    const s = calculateSubscriptionStatus(c.date, c.duration);
    return (
      s.isExpired ||
      (s.activeMonthIndex !== -1 && s.daysLeftInCurrentMonth <= 7)
    );
  });

  if (expiring.length === 0) return;

  const mobiles = [];
  const messages = [];

  expiring.forEach((c) => {
    if (c.mobile && c.mobile.length > 9) {
      let m = toEnglishDigits(c.mobile.trim());
      if (!m.startsWith("98")) {
        m = m.startsWith("0") ? "98" + m.substring(1) : "98" + m;
      }
      mobiles.push(m);
      messages.push(generateAutoMessage(c));
    }
  });

  if (mobiles.length === 0) return;

  // ارسال پیام اتوماتیک
  sendAutoSms(mobiles, messages);
}

function generateAutoMessage(c) {
  const status = calculateSubscriptionStatus(c.date, c.duration);
  let template = "";

  if (status.isExpired) {
    template = settings.customMessages.expired;
  } else if (status.daysLeftInCurrentMonth <= 1) {
    template = settings.customMessages.expiringSoon;
  } else {
    template =
      settings.customMessages.custom || settings.customMessages.expiringSoon;
  }

  // جایگزین کردن متغیرها
  let msg = template
    .replace(/{DATE}/g, c.date)
    .replace(/{DURATION}/g, c.duration + " ماه")
    .replace(/{VOLUME}/g, c.volume + "GB")
    .replace(/{NAME}/g, c.name)
    .replace(/{CONFIG_CODE}/g, c.configCode || "نامشخص");

  return msg;
}

function sendAutoSms(mobiles, messages) {
  fetch("https://api.sms.ir/v1/send/likeToLike", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": settings.smsApiKey,
    },
    body: JSON.stringify({
      lineNumber: parseInt(settings.smsLineNumber),
      messageTexts: messages,
      mobiles: mobiles,
      sendDateTime: null,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 1) {
        const today = new Date().toLocaleDateString("fa-IR");
        localStorage.setItem("lastAutoSmsSentDate", today);
        localStorage.setItem("lastAutoSmsSentCount", mobiles.length);

        showToast(`✅ ارسال اتوماتیک موفق: ${mobiles.length} پیام`, "success");
        console.log(
          `✅ ارسال خودکار موفق: ${mobiles.length} پیام - هزینه: ${data.data.cost} ریال`
        );

        // بروز رسانی وضعیت UI
        updateAutoSmsStatus();
      } else {
        showToast(
          `❌ خطا: ${data.message || "مشکلی در ارسال پیش آمد"}`,
          "error"
        );
        console.error("❌ خطا در ارسال خودکار:", data.message);
      }
    })
    .catch((err) => {
      showToast("❌ خطای ارتباط با سرور", "error");
      console.error("❌ خطای ارتباط:", err);
    });
}

// --- Core ---
function saveData() {
  // ذخیره در localStorage (برای سازگاری)
  localStorage.setItem("serviceCustomers", JSON.stringify(customers));
  localStorage.setItem("serviceSettings", JSON.stringify(settings));

  // ذخیره در IndexedDB
  customers.forEach((customer) => {
    vpnDB.addCustomer(customer).catch((err) => {
      console.error("❌ خطا در ذخیره مشتری:", err);
    });

    // Sync with central database
    if (cloudSync && !cloudSync.offline) {
      cloudSync.addCustomer(customer).catch((err) => {
        console.warn("⚠️ خطا در ارسال به سرور:", err);
      });
    }
  });

  Object.entries(settings).forEach(([key, value]) => {
    vpnDB.saveSetting(key, value).catch((err) => {
      console.error("❌ خطا در ذخیره تنظیمات:", err);
    });

    // Sync with central database
    if (cloudSync && !cloudSync.offline) {
      cloudSync.saveSetting(key, value).catch((err) => {
        console.warn("⚠️ خطا در ارسال به سرور:", err);
      });
    }
  });

  updateStats();
  renderRenewalTable();

  // 🔄 INSTANT SYNC: Trigger immediate sync to all devices
  if (cloudSync && !cloudSync.offline) {
    console.log("⚡ Triggering instant sync to all devices...");
    cloudSync.syncNow().catch((err) => {
      console.warn("⚠️ Instant sync failed:", err);
    });
  }

  // دوباره شماتیک را شروع کن اگر فعال باشد
  if (settings.autoSmsEnabled) {
    if (autoSmsTimer) clearInterval(autoSmsTimer);
    startAutoSmsScheduler();
  }
}

function updateStats() {
  document.getElementById(
    "statsSubtitle"
  ).innerText = `تعداد کل مشتریان: ${customers.length} اکانت`;

  // Update Badge
  let urgentCount = 0;
  customers.forEach((c) => {
    const s = calculateSubscriptionStatus(c.date, c.duration);
    if (
      s.isExpired ||
      (s.activeMonthIndex !== -1 && s.daysLeftInCurrentMonth <= 3)
    ) {
      urgentCount++;
    }
  });
  const badge = document.getElementById("notifyBadge");
  badge.innerText = urgentCount;
  if (urgentCount > 0) badge.classList.remove("empty");
  else badge.classList.add("empty");
}

function showToast(msg, type = "info") {
  const box = document.getElementById("toastBox");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = (type === "success" ? "✅ " : "ℹ️ ") + msg;
  box.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// --- Render ---
function renderTable(data = customers) {
  const tbody = document.querySelector("#customerTable tbody");
  tbody.innerHTML = "";
  if (data.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" style="text-align:center; padding:20px; color:#999;">موردی یافت نشد</td></tr>';
    return;
  }

  data.forEach((c, index) => {
    const status = calculateSubscriptionStatus(c.date, c.duration);
    let monthsHtml = '<div class="month-tracker">';
    for (let i = 0; i < c.duration; i++) {
      let dotClass = "";
      if (status.isExpired) {
        dotClass = "passed";
      } else {
        if (i < status.activeMonthIndex) dotClass = "passed";
        else if (i === status.activeMonthIndex) dotClass = "current";
      }
      monthsHtml += `<div class="month-dot ${dotClass}" title="ماه ${
        i + 1
      }"></div>`;
    }
    monthsHtml += "</div>";

    let daysHtml = '<span class="text-sec">-</span>';
    if (status.isExpired) {
      daysHtml = `<span class="days-badge days-crit">منقضی</span>`;
    } else if (status.activeMonthIndex !== -1) {
      let daysLeft = status.daysLeftInCurrentMonth;
      let badgeClass = "days-ok";
      if (daysLeft <= 3) badgeClass = "days-crit";
      else if (daysLeft <= 7) badgeClass = "days-warn";
      daysHtml = `<span class="days-badge ${badgeClass}">${daysLeft} روز</span>`;
    } else {
      daysHtml = `<span class="days-badge days-warn">شروع نشده</span>`;
    }

    const realIndex = customers.indexOf(c);
    const subLinkBtn = c.subLink
      ? `<button class="btn-icon" title="کپی لینک" onclick="copyText('${c.subLink}', 'لینک')">${linkIconSvg}</button>`
      : "";

    const row = document.createElement("tr");
    row.innerHTML = `
          <td style="font-weight:600">${c.name}</td>
          <td>${daysHtml}</td>
          <td>
              <div style="display:flex; align-items:center; gap:5px;">
                  <span>${c.volume}</span>
                  <button class="btn btn-sm btn-secondary" onclick="addVolume(${realIndex})">+10</button>
              </div>
          </td>
          <td>${monthsHtml}</td>
          <td>
              <div class="user-control">
                  <span style="cursor:pointer" onclick="changeUser(${realIndex}, -1)">-</span>
                  ${c.users}
                  <span style="cursor:pointer" onclick="changeUser(${realIndex}, 1)">+</span>
              </div>
          </td>
          <td><span class="price-tag">${
            c.price ? parseInt(c.price).toLocaleString() : "0"
          }</span></td>
          <td>
              <div style="display:flex; align-items:center; gap:5px;">
                  <span class="service-code" onclick="copyText('${
                    c.configCode || c.code
                  }', 'کانفیگ')" title="کپی کد">${
      c.configCode || c.code || "---"
    }</span>
                  ${subLinkBtn}
              </div>
              <div style="font-size:10px; color:#999; margin-top:2px;">${
                c.date || ""
              }</div>
          </td>
          <td>
              <div style="display:flex; gap:5px; flex-wrap:wrap; align-items:center;">
                  <button class="btn btn-sm btn-warning" onclick="openModal(${realIndex})">ویرایش</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${realIndex})">حذف</button>
              </div>
          </td>
      `;
    tbody.appendChild(row);
  });
}

// --- RENEWAL TABLE (Notifications) ---
function renderRenewalTable() {
  const tbody = document.querySelector("#renewalTable tbody");
  tbody.innerHTML = "";
  const expiring = customers.filter((c) => {
    const s = calculateSubscriptionStatus(c.date, c.duration);
    return (
      s.isExpired ||
      (s.activeMonthIndex !== -1 && s.daysLeftInCurrentMonth <= 3)
    );
  });

  if (expiring.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">همه چیز مرتب است! موردی برای پیگیری نیست. ✅</td></tr>';
    return;
  }

  expiring.forEach((c) => {
    const realIndex = customers.indexOf(c);
    const s = calculateSubscriptionStatus(c.date, c.duration);
    let statusText = "";
    if (s.isExpired)
      statusText = '<span class="days-badge days-crit">منقضی شده</span>';
    else
      statusText = `<span class="days-badge days-warn">${s.daysLeftInCurrentMonth} روز مانده</span>`;

    const subLinkBtn = c.subLink
      ? `<button class="btn-icon" title="کپی لینک" onclick="copyText('${c.subLink}', 'لینک')">${linkIconSvg}</button>`
      : "";

    const row = document.createElement("tr");
    row.innerHTML = `
          <td style="font-weight:bold">${c.name}</td>
          <td>${statusText}</td>
          <td>
              <div style="display:flex; align-items:center; gap:5px;">
                  <span class="service-code" onclick="copyText('${
                    c.code
                  }', 'کانفیگ')">${c.code || "---"}</span>
                  ${subLinkBtn}
              </div>
          </td>
          <td>
              <div style="display:flex; gap:10px;">
                  <button class="btn-icon btn-wa" onclick="copyAndOpen('wa', ${realIndex})" title="واتسپ">${whatsappIcon}</button>
                  <button class="btn-icon btn-tg" onclick="copyAndOpen('tg', ${realIndex})" title="تلگرام">${telegramIcon}</button>
                  <button class="btn-icon btn-sms" onclick="sendSms(${realIndex})" title="پیامک تکی">${smsIcon}</button>
              </div>
          </td>
           <td>
              <button class="btn btn-sm btn-warning" onclick="openModal(${realIndex})">تمدید/ویرایش</button>
          </td>
      `;
    tbody.appendChild(row);
  });
}

// --- Logic ---
function filterTable() {
  const term = document.getElementById("searchInput").value.toLowerCase();
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(term) ||
      (c.code && c.code.toLowerCase().includes(term))
  );
  renderTable(filtered);
}

function copyText(text, type) {
  if (!text || text === "---") return;
  navigator.clipboard
    .writeText(text)
    .then(() => showToast(`${type} کپی شد`, "success"));
}

// --- SMS Logic ---
function generateMessage(c) {
  const status = calculateSubscriptionStatus(c.date, c.duration);
  let msg = `سلام ${c.name} عزیز\n`;

  msg += `وضعیت سرویس اشتراک شما: `;
  if (status.isExpired) {
    msg += `منقضی شده ❌\n`;
  } else {
    msg += `${status.daysLeftInCurrentMonth} روز مانده ⏳\n`;
  }
  msg += `تاریخ شروع سرویس: ${c.date}\n`;
  msg += `لطفا جهت تمدید اقدام کنید.\nلغو=11`;
  return msg;
}

function sendSms(idx) {
  // Fallback to single send using bulk endpoint for single button
  const c = customers[idx];
  if (!c.mobile) return alert("شماره موبایل وارد نشده است");
  if (confirm("ارسال پیامک تکی؟")) {
    // Use sendBatchSms logic but for one person to keep it simple or standard bulk
    const mobile = c.mobile.trim().startsWith("0")
      ? toEnglishDigits(c.mobile.trim())
      : toEnglishDigits(c.mobile.trim());
    const msg = generateMessage(c);

    fetch("https://api.sms.ir/v1/send/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": settings.smsApiKey,
      },
      body: JSON.stringify({
        lineNumber: parseInt(settings.smsLineNumber),
        messageTexts: [msg],
        mobiles: [mobile],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 1) showToast("ارسال شد", "success");
        else alert(data.message);
      });
  }
}

// --- NEW BATCH SENDING (Like To Like) ---
function sendBatchSms() {
  const expiring = customers.filter((c) => {
    const s = calculateSubscriptionStatus(c.date, c.duration);
    return (
      s.isExpired ||
      (s.activeMonthIndex !== -1 && s.daysLeftInCurrentMonth <= 3)
    );
  });

  if (expiring.length === 0)
    return alert("مشتری با وضعیت قرمز یا زرد برای ارسال وجود ندارد.");

  const mobiles = [];
  const messages = [];
  let count = 0;

  expiring.forEach((c) => {
    if (c.mobile && c.mobile.length > 9) {
      let m = toEnglishDigits(c.mobile.trim());
      mobiles.push(m);
      messages.push(generateMessage(c));
      count++;
    }
  });

  if (count === 0) return alert("شماره موبایل معتبری یافت نشد.");

  if (confirm(`آیا مطمئنید؟\nارسال پیامک به ${count} نفر به صورت همزمان.`)) {
    showToast("در حال ارسال گروهی...", "info");

    fetch("https://api.sms.ir/v1/send/likeToLike", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": settings.smsApiKey,
      },
      body: JSON.stringify({
        lineNumber: parseInt(settings.smsLineNumber),
        messageTexts: messages,
        mobiles: mobiles,
        sendDateTime: null, // Instant send
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 1) {
          showToast(`موفق! هزینه: ${data.data.cost} ریال`, "success");
        } else {
          console.error(data);
          alert("خطا در ارسال: " + data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        alert("خطای ارتباط با سرور sms.ir (ممکن است محدودیت مرورگر باشد)");
      });
  }
}

function copyAndOpen(app, idx) {
  const c = customers[idx];
  const status = calculateSubscriptionStatus(c.date, c.duration);

  let msg = `سلام ${c.name} عزیز 🌸\n`;
  if (status.isExpired) {
    msg += `⚠️ سرویس اشتراک شما منقضی شده است.\n`;
    msg += `لطفا جهت وصل مجدد سرویس اقدام نمایید. 🔴\n`;
  } else {
    msg += `⏳ اعتبار سرویس اشتراک شما رو به اتمام است.\n`;
    msg += `📅 باقی‌مانده: ${status.daysLeftInCurrentMonth} روز\n`;
  }
  if (c.subLink) msg += `\n🔗 لینک اشتراک:\n${c.subLink}\n`;
  msg += `\nلطفا جهت تمدید پیام دهید. با تشکر 🙏`;

  navigator.clipboard.writeText(msg).then(() => {
    showToast("متن پیام کپی شد", "success");
    setTimeout(() => {
      if (app === "wa") {
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
      } else if (app === "tg") {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(msg)}`,
          "_blank"
        );
      }
    }, 500);
  });
}

function addVolume(idx) {
  if (
    confirm(
      `افزودن 10 گیگ؟ (${settings.extraVolumePrice.toLocaleString()} تومان)`
    )
  ) {
    customers[idx].volume = parseInt(customers[idx].volume) + 10;
    customers[idx].desc = (customers[idx].desc || "") + " | +10G";
    saveData();
    filterTable();
    showToast("حجم اضافه شد", "success");
  }
}

function changeUser(idx, delta) {
  const newCount = parseInt(customers[idx].users) + delta;
  if (newCount < 1) return;
  if (
    confirm(
      delta > 0
        ? `افزودن کاربر؟ (${settings.extraUserPrice.toLocaleString()} ت)`
        : "کاهش کاربر؟"
    )
  ) {
    customers[idx].users = newCount;
    saveData();
    filterTable();
    showToast("تعداد کاربر تغییر کرد", "success");
  }
}

function deleteCustomer(idx) {
  if (confirm("آیا مطمئن هستید؟")) {
    const customerToDelete = customers[idx];

    // حذف از IndexedDB
    if (customerToDelete.id) {
      vpnDB.deleteCustomer(customerToDelete.id).catch((err) => {
        console.error("❌ خطا در حذف از دیتا‌بیس:", err);
      });
    }

    // 🔄 Sync deletion immediately with all devices
    if (cloudSync && customerToDelete.code) {
      cloudSync.deleteCustomer(customerToDelete.code).catch((err) => {
        console.warn("⚠️ خطا در ارسال حذف به سرور:", err);
      });
    }

    customers.splice(idx, 1);
    saveData();
    filterTable();
    showToast("✅ حذف و سینک شد", "success");
  }
}

// --- Modal & Init ---
function calculateSuggestedPrice() {
  const vol = parseInt(document.getElementById("inpVolume").value) || 0;
  const users = parseInt(document.getElementById("inpUsers").value) || 1;
  const dur = parseInt(document.getElementById("inpDuration").value) || 1;

  let base = 45000;
  let extraVol = Math.max(0, vol - 25);
  let volCost = (extraVol / 10) * settings.extraVolumePrice;
  let userCost = (users - 1) * settings.extraUserPrice;

  let total = (base + volCost + userCost) * dur;

  // Rules
  if (dur === 1) {
    if (vol === 25 && users === 1) total = 45000;
    if (vol === 50 && users === 2) total = 90000;
    if (vol === 75 && users === 2) total = 120000;
    if (vol === 100 && users === 3) total = 140000;
    if (vol === 105 && users === 1) total = 160000;
  }
  if (dur === 4 && vol === 100 && users === 1) total = 185000;

  const el = document.getElementById("priceSuggestion");
  el.innerText = `پیشنهاد: ${total.toLocaleString()} تومان (کلیک کنید)`;
  el.dataset.value = total;
}

function useSuggestedPrice() {
  const val = document.getElementById("priceSuggestion").dataset.value;
  if (val) document.getElementById("inpPrice").value = val;
}

function openModal(index = null) {
  const overlay = document.getElementById("modalOverlay");
  overlay.style.display = "flex";
  void overlay.offsetWidth;
  overlay.classList.add("open");

  const isEdit = index !== null;
  document.getElementById("editIndex").value = isEdit ? index : "-1";
  document.getElementById("modalTitle").innerText = isEdit
    ? "ویرایش اکانت"
    : "اکانت جدید";

  if (isEdit) {
    const c = customers[index];
    document.getElementById("inpName").value = c.name;
    document.getElementById("inpMobile").value = c.mobile || "";
    document.getElementById("inpCode").value = c.code || "";
    document.getElementById("inpSub").value = c.subLink || "";
    document.getElementById("inpVolume").value = c.volume;
    document.getElementById("inpUsers").value = c.users;
    document.getElementById("inpDuration").value = c.duration;
    document.getElementById("inpDate").value = c.date;
    document.getElementById("inpDesc").value = c.desc || "";
    document.getElementById("inpPrice").value = c.price || "";
  } else {
    document.getElementById("inpDate").value = new Date().toLocaleDateString(
      "fa-IR"
    );
    document.getElementById("inpName").value = "";
    document.getElementById("inpMobile").value = "";
    document.getElementById("inpCode").value = "";
    document.getElementById("inpSub").value = "";
    document.getElementById("inpVolume").value = "25";
    document.getElementById("inpUsers").value = "1";
    document.getElementById("inpDuration").value = "1";
    document.getElementById("inpDesc").value = "";
    document.getElementById("inpPrice").value = "";
  }
  calculateSuggestedPrice();
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  overlay.classList.remove("open");
  setTimeout(() => {
    overlay.style.display = "none";
  }, 300);
}

function saveCustomer() {
  const idxStr = document.getElementById("editIndex").value;
  const index = parseInt(idxStr);
  const name = document.getElementById("inpName").value;
  if (!name) return showToast("نام الزامی است");

  const customerData = {
    name,
    mobile: document.getElementById("inpMobile").value,
    code: document.getElementById("inpCode").value,
    configCode: document.getElementById("inpCode").value,
    subLink: document.getElementById("inpSub").value,
    volume: parseInt(document.getElementById("inpVolume").value) || 0,
    users: parseInt(document.getElementById("inpUsers").value) || 1,
    duration: parseInt(document.getElementById("inpDuration").value) || 1,
    date: document.getElementById("inpDate").value,
    desc: document.getElementById("inpDesc").value,
    price: document.getElementById("inpPrice").value,
    monthsPassed: [],
    updatedAt: new Date().toISOString(),
  };

  let isNew = false;
  if (index >= 0) {
    // Update existing customer
    customerData.id = customers[index].id;
    customers[index] = customerData;

    // 🔄 Sync update immediately to server and all devices
    if (cloudSync) {
      cloudSync.updateCustomer(customerData).catch((err) => {
        console.warn("⚠️ خطا در ارسال آپدیت:", err);
      });
    }
    showToast("✅ تغییرات ذخیره و سینک شدند", "success");
  } else {
    // Add new customer
    isNew = true;
    customers.push(customerData);

    // 🔄 Sync new customer immediately to server and all devices
    if (cloudSync) {
      cloudSync.addCustomer(customerData).catch((err) => {
        console.warn("⚠️ خطا در ارسال:", err);
      });
    }
    showToast("✅ مشتری جدید اضافه و سینک شد", "success");
  }

  saveData();
  closeModal();
  filterTable();
}

function saveSettings() {
  settings.extraVolumePrice = parseInt(
    document.getElementById("setVolPrice").value
  );
  settings.extraUserPrice = parseInt(document.getElementById("inpUsers").value);
  settings.smsApiKey = document.getElementById("smsApiKey").value;
  settings.smsLineNumber = document.getElementById("smsLineNumber").value;
  settings.autoSmsEnabled = document.getElementById("autoSmsToggle").checked;
  settings.autoSmsInterval =
    parseInt(document.getElementById("autoSmsInterval").value) || 24;

  saveData();

  // 🔄 Sync settings immediately to all devices
  if (cloudSync) {
    Object.entries(settings).forEach(([key, value]) => {
      cloudSync.saveSetting(key, value).catch((err) => {
        console.warn(`⚠️ خطا در ارسال تنظیم ${key}:`, err);
      });
    });
  }

  showToast("✅ تنظیمات ذخیره و سینک شدند", "success");
}

function toggleAutoSms() {
  const enabled = document.getElementById("autoSmsToggle").checked;
  settings.autoSmsEnabled = enabled;
  saveData();

  if (enabled) {
    if (autoSmsTimer) clearInterval(autoSmsTimer);
    startAutoSmsScheduler();
    showToast("ارسال اتوماتیک فعال شد", "success");
  } else {
    if (autoSmsTimer) clearInterval(autoSmsTimer);
    showToast("ارسال اتوماتیک غیرفعال شد", "success");
  }
}

function testAutoSms() {
  if (!settings.autoSmsEnabled) {
    showToast("ابتدا فرستادن اتوماتیک را فعال کنید", "error");
    return;
  }

  if (!settings.smsApiKey || !settings.smsLineNumber) {
    showToast("ابتدا تنظیمات SMS را مکمل کنید", "error");
    return;
  }

  showToast("🧪 درحال تست...");
  checkAndSendAutoSms();
  setTimeout(() => {
    updateAutoSmsStatus();
  }, 2000);
}

function updateAutoSmsStatus() {
  const lastSentDate = localStorage.getItem("lastAutoSmsSentDate");
  const lastSentCount = localStorage.getItem("lastAutoSmsSentCount") || "0";
  const el = document.getElementById("lastAutoSmsSent");

  if (lastSentDate) {
    el.textContent = `آخرین ارسال: ${lastSentDate} (${lastSentCount} پیام)`;
  } else {
    el.textContent = "آخرین ارسال: هنوز ارسال نشده";
  }
}

function exportData() {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify({ customers, settings }));
  const a = document.createElement("a");
  a.href = dataStr;
  a.download =
    "service_backup_" +
    new Date().toLocaleDateString("fa-IR").replace(/\//g, "-") +
    ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast("✅ بکاپ دانلود شد", "success");
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      const data = JSON.parse(e.target.result);

      // وارد کردن اطلاعات به IndexedDB
      const success = await vpnDB.importAllData(data);

      if (success) {
        // بارگذاری مجدد اطلاعات
        customers = await vpnDB.getAllCustomers();
        const dbSettings = await vpnDB.getAllSettings();
        settings = { ...defaultSettings, ...dbSettings };

        renderTable();
        renderRenewalTable();
        updateStats();

        showToast("✅ بازیابی موفق بود!", "success");
        setTimeout(() => location.reload(), 1500);
      } else {
        showToast("❌ خطا در وارد کردن اطلاعات", "error");
      }
    } catch (err) {
      console.error("❌ خطا:", err);
      showToast("❌ فایل نامعتبر است!", "error");
    }
  };
  reader.readAsText(file);
}

function switchTab(id, el) {
  document
    .querySelectorAll(".main-content")
    .forEach((d) => d.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document
    .querySelectorAll(".menu-item")
    .forEach((m) => m.classList.remove("active"));
  el.classList.add("active");
  if (id === "renewal") renderRenewalTable();
}

function openDatabaseManagement() {
  const databaseContent = document.getElementById("database");
  if (databaseContent) {
    document
      .querySelectorAll(".main-content")
      .forEach((d) => d.classList.add("hidden"));
    databaseContent.classList.remove("hidden");
  }
}

// --- Init ---
// مقدار دهی دیتا‌بیس و سپس شروع برنامه
async function startApp() {
  try {
    // بررسی احراز هویت در ابتدا
    if (authManager.checkAuthentication()) {
      document.getElementById("login-screen").style.display = "none";
      document.getElementById("app-window").classList.remove("hidden");
      console.log("✅ کاربر قبلاً احراز شده");
    }

    await initializeDatabase();

    document.getElementById("setVolPrice").value = settings.extraVolumePrice;
    document.getElementById("setUserPrice").value = settings.extraUserPrice;

    // Init SMS Inputs
    document.getElementById("smsApiKey").value = settings.smsApiKey || "";
    document.getElementById("smsLineNumber").value =
      settings.smsLineNumber || "";

    // Init Auto-SMS Inputs
    document.getElementById("autoSmsToggle").checked =
      settings.autoSmsEnabled || false;
    document.getElementById("autoSmsInterval").value =
      settings.autoSmsInterval || 24;
    updateAutoSmsStatus();

    // Init Custom Messages
    initializeCustomMessages();

    // Add search listener for custom user
    const searchInput = document.getElementById("selectCustomUser");
    if (searchInput) {
      searchInput.addEventListener("input", updateCustomUserList);
    }

    document.getElementById("modalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "modalOverlay") closeModal();
    });

    // 🔄 LISTEN FOR REAL-TIME SYNC UPDATES FROM OTHER DEVICES
    window.addEventListener("syncUpdate", async (event) => {
      const { customers: updatedCustomers, settings: updatedSettings } =
        event.detail;

      if (updatedCustomers && updatedCustomers.length > 0) {
        console.log(
          "⚡ Syncing customers from other device:",
          updatedCustomers
        );
        for (const customer of updatedCustomers) {
          await vpnDB.addCustomer(customer);
        }
        customers = await vpnDB.getAllCustomers();
        renderTable();
        renderRenewalTable();
        updateStats();
        showToast("📡 آپدیت از دستگاه دیگر دریافت شد", "success");
      }

      if (updatedSettings && Object.keys(updatedSettings).length > 0) {
        console.log("⚡ Syncing settings from other device:", updatedSettings);
        for (const [key, value] of Object.entries(updatedSettings)) {
          await vpnDB.saveSetting(key, value);
        }
        settings = await vpnDB.getAllSettings();
        showToast("⚙️ تنظیمات از دستگاه دیگر بروز شد", "success");
      }
    });

    renderTable();
    renderRenewalTable();
    updateStats();

    // بروز رسانی وضعیت دیتا‌بیس
    refreshDatabaseStats();

    // شماتیک اتوماتیک را شروع کن
    if (settings.autoSmsEnabled) {
      startAutoSmsScheduler();
    }

    // 🔄 Listen for real-time sync updates from other devices
    window.addEventListener("syncUpdate", async (event) => {
      try {
        const { customers: updatedCustomers, settings: updatedSettings } =
          event.detail;

        if (updatedCustomers && Array.isArray(updatedCustomers)) {
          for (const customer of updatedCustomers) {
            await vpnDB.addCustomer(customer);
          }
          customers = await vpnDB.getAllCustomers();
          renderTable();
          renderRenewalTable();
          updateStats();
          showToast("📡 آپدیت از دستگاه دیگر دریافت شد", "success");
        }

        if (updatedSettings && typeof updatedSettings === "object") {
          for (const [key, value] of Object.entries(updatedSettings)) {
            await vpnDB.saveSetting(key, value);
          }
          const dbSettings = await vpnDB.getAllSettings();
          settings = { ...defaultSettings, ...dbSettings };
          console.log("✅ تنظیمات از دستگاه دیگر بروز شد");
        }
      } catch (err) {
        console.error("❌ خطا در بروز رسانی سینک:", err);
      }
    });

    console.log("✅ برنامه آماده است");
  } catch (err) {
    console.error("❌ خطا در شروع برنامه:", err);
    showToast("خطا در بارگذاری اطلاعات", "error");
  }
}

// --- Database Management Functions ---
async function refreshDatabaseStats() {
  try {
    const allCustomers = await vpnDB.getAllCustomers();
    const allSettings = await vpnDB.getAllSettings();

    // نمایش تعداد مشتریان
    document.getElementById("dbCustomerCount").innerText = allCustomers.length;

    // محاسبه اندازه تقریبی
    const dataSize =
      JSON.stringify(allCustomers).length + JSON.stringify(allSettings).length;
    const sizeMB = (dataSize / 1024).toFixed(2);
    document.getElementById("dbStorageSize").innerText = `${sizeMB} KB`;

    console.log("✅ آمار دیتا‌بیس بروز شد");
  } catch (err) {
    console.error("❌ خطا در بروز رسانی آمار:", err);
  }
}

async function exportDatabaseData() {
  try {
    const allData = await vpnDB.exportAllData();

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(allData, null, 2));

    const a = document.createElement("a");
    a.href = dataStr;
    a.download =
      "service_database_backup_" +
      new Date().toLocaleDateString("fa-IR").replace(/\//g, "-") +
      ".json";

    document.body.appendChild(a);
    a.click();
    a.remove();

    showToast("✅ دیتا‌بیس صادر شد", "success");
    updateDatabaseActionStatus("صادرات موفق");
  } catch (err) {
    console.error("❌ خطا در صادرات:", err);
    showToast("❌ خطا در صادرات اطلاعات", "error");
  }
}

async function importDatabaseData(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      const data = JSON.parse(e.target.result);

      if (!data.customers || !Array.isArray(data.customers)) {
        throw new Error("فرمت فایل نامعتبر است");
      }

      const success = await vpnDB.importAllData(data);

      if (success) {
        customers = await vpnDB.getAllCustomers();
        const dbSettings = await vpnDB.getAllSettings();
        settings = { ...defaultSettings, ...dbSettings };

        renderTable();
        renderRenewalTable();
        updateStats();
        refreshDatabaseStats();

        showToast("✅ اطلاعات وارد شد", "success");
        updateDatabaseActionStatus("واردات موفق");
      } else {
        showToast("❌ خطا در وارد کردن", "error");
      }
    } catch (err) {
      console.error("❌ خطا:", err);
      showToast("❌ فایل نامعتبر است: " + err.message, "error");
    }
  };

  reader.readAsText(file);

  input.value = "";
}

async function clearDatabaseData() {
  const confirmed = confirm(
    "⚠️ آیا مطمئن هستید؟\n\nتمام اطلاعات (مشتریان، تنظیمات، تاریخچه) حذف خواهند شد."
  );

  if (!confirmed) return;

  const confirmed2 = confirm(
    "⚠️ اخطار نهایی!\n\nاین عملیات قابل بازگشت نیست. ادامه می‌دهید؟"
  );

  if (!confirmed2) return;

  try {
    await vpnDB.clearAllData();

    customers = [];
    settings = { ...defaultSettings };

    renderTable();
    renderRenewalTable();
    updateStats();
    refreshDatabaseStats();

    showToast("✅ دیتا‌بیس پاک شد", "success");
    updateDatabaseActionStatus("حذف کامل");
  } catch (err) {
    console.error("❌ خطا در حذف:", err);
    showToast("❌ خطا در حذف اطلاعات", "error");
  }
}

function updateDatabaseActionStatus(action) {
  const now = new Date().toLocaleString("fa-IR");
  document.getElementById(
    "dbLastAction"
  ).innerText = `آخرین عملیات: ${action} (${now})`;
}

// --- Custom Messages Management ---
function initializeCustomMessages() {
  document.getElementById("msgExpired").value =
    settings.customMessages.expired || "";
  document.getElementById("msgExpiringSoon").value =
    settings.customMessages.expiringSoon || "";
  document.getElementById("customMessage").value = "";
}

function saveCustomMessages() {
  settings.customMessages.expired = document.getElementById("msgExpired").value;
  settings.customMessages.expiringSoon =
    document.getElementById("msgExpiringSoon").value;

  localStorage.setItem("vpnSettings", JSON.stringify(settings));

  vpnDB.saveSetting("customMessages", settings.customMessages);

  // Sync with central database
  if (cloudSync) {
    cloudSync
      .saveSetting("customMessages", settings.customMessages)
      .catch((err) => {
        console.warn("⚠️ خطا در ارسال به سرور:", err);
      });
  }

  showToast("✅ پیام‌ها ذخیره شدند", "success");
}

function updateCustomUserList() {
  const searchInput = document
    .getElementById("selectCustomUser")
    .value.toLowerCase();
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchInput) ||
      c.mobile.includes(searchInput) ||
      c.configCode.toLowerCase().includes(searchInput)
  );

  const listDiv = document.getElementById("customUserList");
  if (filtered.length === 0) {
    listDiv.innerHTML = "کاربری پیدا نشد";
    return;
  }

  listDiv.innerHTML = filtered
    .map(
      (c) =>
        `<div onclick="selectCustomUser('${c.mobile}', '${c.name}')" style="cursor: pointer; padding: 5px; background: #f0f0f0; margin: 2px; border-radius: 4px;">${c.name} (${c.mobile})</div>`
    )
    .join("");
}

let selectedCustomUser = null;

function selectCustomUser(mobile, name) {
  selectedCustomUser = customers.find((c) => c.mobile === mobile);
  document.getElementById("selectCustomUser").value = name;
  document.getElementById("customUserList").innerHTML = "";

  let msg = document.getElementById("customMessage").value.trim();
  if (!msg) {
    msg = settings.customMessages.expiringSoon || "";
  }

  const template = msg
    .replace(/{NAME}/g, selectedCustomUser.name)
    .replace(/{DATE}/g, selectedCustomUser.date)
    .replace(/{DURATION}/g, selectedCustomUser.duration + " ماه")
    .replace(/{VOLUME}/g, selectedCustomUser.volume + "GB")
    .replace(/{CONFIG_CODE}/g, selectedCustomUser.configCode || "نامشخص");

  document.getElementById("customMessage").value = template;
}

function sendCustomMessage() {
  if (!selectedCustomUser) {
    showToast("❌ لطفا یک کاربر انتخاب کنید", "error");
    return;
  }

  let customMsg = document.getElementById("customMessage").value.trim();

  // اگر پیام خالی است، از پیام پیش‌فرض استفاده کن
  if (!customMsg) {
    customMsg = settings.customMessages.expiringSoon || "";
  }

  // تمیز کردن خطوط خالی چندگانه
  customMsg = customMsg.replace(/\n\s*\n/g, "\n").trim();

  if (!customMsg) {
    showToast("❌ پیام خالی است - پیام پیش‌فرض را تنظیم کنید", "error");
    return;
  }

  let mobile = toEnglishDigits(selectedCustomUser.mobile.trim());
  if (!mobile.startsWith("98")) {
    mobile = mobile.startsWith("0")
      ? "98" + mobile.substring(1)
      : "98" + mobile;
  }

  console.log("📤 درحال ارسال پیام به", selectedCustomUser.name);

  fetch("https://api.sms.ir/v1/send/likeToLike", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": settings.smsApiKey,
    },
    body: JSON.stringify({
      lineNumber: parseInt(settings.smsLineNumber),
      messageTexts: [customMsg],
      mobiles: [mobile],
      sendDateTime: null,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("📨 پاسخ API:", data);
      if (data.status === 1) {
        showToast(
          `✅ پیام برای ${selectedCustomUser.name} ارسال شد`,
          "success"
        );

        // Log SMS to central database
        if (cloudSync) {
          cloudSync.logSms(mobile, customMsg, "sent").catch((err) => {
            console.warn("⚠️ خطا در ثبت در سرور:", err);
          });
        }

        // Log SMS locally
        vpnDB.logSms(mobile, customMsg, "sent").catch((err) => {
          console.error("❌ خطا در ثبت محلی:", err);
        });

        document.getElementById("customMessage").value = "";
        document.getElementById("selectCustomUser").value = "";
        selectedCustomUser = null;
      } else {
        showToast(
          `❌ خطا: ${data.message || "مشکلی در ارسال پیش آمد"}`,
          "error"
        );
        console.error("❌ خطای API:", data);
      }
    })
    .catch((err) => {
      showToast("❌ خطای ارتباط با سرور", "error");
      console.error("❌ خطای ارتباط:", err);
    });
}

// Start the application when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await startApp();
  } catch (err) {
    console.error("❌ خطا در راه‌اندازی برنامه:", err);
    showToast("خطا در راه‌اندازی برنامه", "error");
  }
});
