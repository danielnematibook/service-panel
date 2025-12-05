// --- Secure Authentication System ---
// استفاده از رمزگذاری Base64 برای امنیت

class AuthManager {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    // اطلاعات کاربر (رمز با Base64 رمزگذاری شده)
    // نام کاربری: danielnemati
    // رمز عبور: 21april2002 -> Base64: MjFhcHJpbDIwMDI=
    this.credentials = {
      username: "danielnemati",
      passwordEncoded: "MjFhcHJpbDIwMDI=", // Base64 of "21april2002"
    };
  }

  // رمزگشایی Base64
  decodeBase64(str) {
    try {
      return atob(str);
    } catch (e) {
      console.error("خطا در رمزگشایی:", e);
      return null;
    }
  }

  // رمزگذاری Base64
  encodeBase64(str) {
    return btoa(str);
  }

  // اعتبارسنجی ورود
  async verifyCredentials(username, password) {
    try {
      console.log("🔍 تلاش برای ورود:", username);

      // بررسی نام کاربری
      if (username !== this.credentials.username) {
        console.warn("❌ نام کاربری اشتباه:", username);
        return {
          success: false,
          message: "نام کاربری یا رمز اشتباه است",
        };
      }

      // رمزگشایی رمز ذخیره‌شده و مقایسه
      const storedPassword = this.decodeBase64(
        this.credentials.passwordEncoded
      );
      console.log("🔍 نام کاربری درست:", username);
      console.log("🔍 رمز وارد‌شده:", password);
      console.log("🔍 رمز ذخیره‌شده:", storedPassword);

      if (password !== storedPassword) {
        console.warn("❌ رمز اشتباه");
        return {
          success: false,
          message: "نام کاربری یا رمز اشتباه است",
        };
      }

      // موفقیت‌آمیز
      this.isAuthenticated = true;
      this.currentUser = username;
      localStorage.setItem("service_auth_token", this.generateToken());
      localStorage.setItem("service_auth_user", username);

      console.log("✅ احراز هویت موفق:", username);

      return {
        success: true,
        message: "ورود موفق بود",
      };
    } catch (err) {
      console.error("❌ خطا در احراز هویت:", err);
      return {
        success: false,
        message: "خطا در فرآیند احراز هویت",
      };
    }
  }

  // تولید توکن جلسه
  generateToken() {
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `token_${timestamp}_${randomStr}`;
  }

  // بررسی احراز هویت از localStorage
  checkAuthentication() {
    const token = localStorage.getItem("service_auth_token");
    const user = localStorage.getItem("service_auth_user");

    if (token && user) {
      this.isAuthenticated = true;
      this.currentUser = user;
      return true;
    }

    return false;
  }

  // خروج
  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    localStorage.removeItem("service_auth_token");
    localStorage.removeItem("service_auth_user");
  }

  // دریافت اطلاعات کاربر فعلی
  getCurrentUser() {
    return this.currentUser;
  }

  // بررسی اینکه کاربر احراز هویت شده است یا نه
  isLoggedIn() {
    return this.isAuthenticated;
  }
}

// ایجاد نمونه از مدیر احراز هویت
const authManager = new AuthManager();

// بررسی احراز هویت در هنگام بارگذاری صفحه
if (authManager.checkAuthentication()) {
  console.log("✅ کاربر قبلاً احراز شده:", authManager.getCurrentUser());
}
