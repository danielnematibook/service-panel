/**
 * Bidirectional Cloud Sync System
 * Ensures real-time synchronization across all devices
 * - Push: Local changes → Central Server
 * - Pull: Central Server → Local changes
 */

class BidirectionalCloudSync {
  constructor(serverUrl = null) {
    // Auto-detect server URL
    if (!serverUrl) {
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        serverUrl = "http://localhost:5000";
      } else {
        serverUrl = `http://${window.location.hostname}:5000`;
      }
    }

    this.serverUrl = serverUrl;
    this.deviceId = this.generateDeviceId();
    this.lastSyncTime = localStorage.getItem("lastSyncTime") || "2000-01-01";
    this.syncInterval = 3000; // 3 seconds for real-time sync
    this.isSyncing = false;
    this.syncQueue = JSON.parse(localStorage.getItem("syncQueue")) || [];
    this.offline = false;

    console.log(`🔗 BidirectionalCloudSync configured to: ${this.serverUrl}`);
    this.initSync();
  }

  generateDeviceId() {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      const navigator_data = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        screen.width + "x" + screen.height,
      ].join("|");
      deviceId = "device_" + this.hashCode(navigator_data);
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  initSync() {
    this.checkServerStatus();
    this.registerDevice();
    this.startPeriodicSync();

    window.addEventListener("online", () => {
      this.offline = false;
      console.log("📡 Back online - syncing...");
      this.syncNow();
    });

    window.addEventListener("offline", () => {
      this.offline = true;
      console.log("⚠️ Offline mode - queuing changes");
    });
  }

  async checkServerStatus() {
    try {
      const response = await fetch(`${this.serverUrl}/api/health`);
      const data = await response.json();
      if (data.success) {
        console.log("✅ Connected to central database");
        return true;
      }
    } catch (error) {
      console.warn(
        "⚠️ Central database unavailable - using local cache",
        error
      );
      this.offline = true;
      return false;
    }
  }

  async registerDevice() {
    if (this.offline) return false;
    try {
      const response = await fetch(`${this.serverUrl}/api/device/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: this.deviceId }),
      });
      const data = await response.json();
      if (data.success) {
        console.log("✅ Device registered:", this.deviceId);
        return true;
      }
    } catch (error) {
      console.error("❌ Device registration failed:", error);
    }
    return false;
  }

  startPeriodicSync() {
    setInterval(async () => {
      if (!this.offline && !this.isSyncing) {
        await this.syncNow();
      }
    }, this.syncInterval);
  }

  /**
   * Complete bidirectional sync:
   * 1. PUSH: Send local changes to server
   * 2. PULL: Fetch updates from server
   */
  async syncNow() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      console.log("🔄 Starting bidirectional sync...");

      // Step 1: PUSH - Process local queue (send changes to server)
      if (this.syncQueue.length > 0) {
        console.log(
          `📤 PUSH: Sending ${this.syncQueue.length} changes to server...`
        );
        await this.processSyncQueue();
      }

      // Step 2: PULL - Fetch updates from server
      if (!this.offline) {
        console.log("📥 PULL: Fetching updates from server...");
        await this.fetchUpdates();
      }

      this.lastSyncTime = new Date().toISOString();
      localStorage.setItem("lastSyncTime", this.lastSyncTime);
      console.log("✅ Sync completed");
    } catch (error) {
      console.error("❌ Sync error:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * PUSH: Send queued changes to server
   */
  async processSyncQueue() {
    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue[0];
      try {
        let success = false;
        if (operation.type === "addCustomer") {
          success = await this.addCustomer(operation.customer);
        } else if (operation.type === "updateCustomer") {
          success = await this.updateCustomer(operation.customer);
        } else if (operation.type === "deleteCustomer") {
          success = await this.deleteCustomer(operation.code);
        } else if (operation.type === "saveSetting") {
          success = await this.saveSetting(operation.key, operation.value);
        }
        if (success) {
          this.syncQueue.shift();
          localStorage.setItem("syncQueue", JSON.stringify(this.syncQueue));
          console.log(`✅ Queued operation sent: ${operation.type}`);
        } else {
          console.warn("⚠️ Operation failed, will retry");
          break;
        }
      } catch (error) {
        console.error("❌ Queue processing error:", error);
        break;
      }
    }
  }

  /**
   * Queue a change for later processing (used when offline)
   */
  queueChange(operation) {
    this.syncQueue.push({
      ...operation,
      queuedAt: new Date().toISOString(),
      deviceId: this.deviceId,
    });
    localStorage.setItem("syncQueue", JSON.stringify(this.syncQueue));
    console.log(`⏳ Operation queued (offline): ${operation.type}`);

    if (!this.offline && !this.isSyncing) {
      this.syncNow();
    }
  }

  /**
   * PUSH: Add customer to server
   */
  async addCustomer(customer) {
    if (this.offline) {
      this.queueChange({ type: "addCustomer", customer });
      return false;
    }
    try {
      const response = await fetch(`${this.serverUrl}/api/customers/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, device_id: this.deviceId }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("❌ Add customer error:", error);
      this.queueChange({ type: "addCustomer", customer });
      return false;
    }
  }

  /**
   * PUSH: Update customer on server
   */
  async updateCustomer(customer) {
    if (this.offline) {
      this.queueChange({ type: "updateCustomer", customer });
      return false;
    }
    try {
      const response = await fetch(`${this.serverUrl}/api/customers/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, device_id: this.deviceId }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("❌ Update customer error:", error);
      this.queueChange({ type: "updateCustomer", customer });
      return false;
    }
  }

  /**
   * PUSH: Delete customer from server
   */
  async deleteCustomer(code) {
    if (this.offline) {
      this.queueChange({ type: "deleteCustomer", code });
      return false;
    }
    try {
      const response = await fetch(`${this.serverUrl}/api/customers/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, device_id: this.deviceId }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("❌ Delete customer error:", error);
      this.queueChange({ type: "deleteCustomer", code });
      return false;
    }
  }

  /**
   * PUSH: Save setting on server
   */
  async saveSetting(key, value) {
    if (this.offline) {
      this.queueChange({ type: "saveSetting", key, value });
      return false;
    }
    try {
      const response = await fetch(`${this.serverUrl}/api/settings/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          value,
          device_id: this.deviceId,
        }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("❌ Save setting error:", error);
      this.queueChange({ type: "saveSetting", key, value });
      return false;
    }
  }

  /**
   * PULL: Fetch updates from server
   * Get all changes since last sync and apply to local device
   */
  async fetchUpdates() {
    try {
      const response = await fetch(`${this.serverUrl}/api/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: this.deviceId,
          last_sync: this.lastSyncTime,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Dispatch event with all updates
        if (data.customers && data.customers.length > 0) {
          console.log(
            `📥 Received ${data.customers.length} customers from server`
          );
          window.dispatchEvent(
            new CustomEvent("syncUpdate", {
              detail: { customers: data.customers, source: "server" },
            })
          );
        }
        if (data.settings && Object.keys(data.settings).length > 0) {
          console.log("📥 Received settings from server");
          window.dispatchEvent(
            new CustomEvent("syncUpdate", {
              detail: { settings: data.settings, source: "server" },
            })
          );
        }
        return true;
      }
    } catch (error) {
      console.error("❌ Fetch updates error:", error);
    }
    return false;
  }

  /**
   * Log SMS to server
   */
  async logSms(mobile, message, status = "pending", response = "") {
    if (this.offline) return false;
    try {
      const response_obj = await fetch(`${this.serverUrl}/api/sms/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          message,
          status,
          response,
          device_id: this.deviceId,
        }),
      });
      const data = await response_obj.json();
      return data.success;
    } catch (error) {
      console.error("❌ Log SMS error:", error);
      return false;
    }
  }
}
