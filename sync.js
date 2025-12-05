/**
 * Central Database Synchronization System
 * Handles real-time sync with central database server
 */

class CloudSync {
  constructor(serverUrl = "http://localhost:5000") {
    this.serverUrl = serverUrl;
    this.deviceId = this.generateDeviceId();
    this.lastSyncTime = localStorage.getItem("lastSyncTime") || "2000-01-01";
    this.syncInterval = 30000; // 30 seconds
    this.isSyncing = false;
    this.syncQueue = [];
    this.offline = false;

    this.initSync();
  }

  /**
   * Generate unique device ID based on browser fingerprint
   */
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

  /**
   * Simple hash function for device ID
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Initialize synchronization
   */
  initSync() {
    // Check server availability
    this.checkServerStatus();

    // Register device
    this.registerDevice();

    // Start periodic sync
    this.startPeriodicSync();

    // Listen for online/offline events
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

  /**
   * Check if database server is available
   */
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

  /**
   * Register device with server
   */
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

  /**
   * Start periodic synchronization
   */
  startPeriodicSync() {
    setInterval(async () => {
      if (!this.offline && !this.isSyncing) {
        await this.syncNow();
      }
    }, this.syncInterval);
  }

  /**
   * Perform immediate sync
   */
  async syncNow() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // 1. Process queue of pending changes
      if (this.syncQueue.length > 0) {
        await this.processSyncQueue();
      }

      // 2. Fetch updates from server
      if (!this.offline) {
        await this.fetchUpdates();
      }

      // 3. Update last sync time
      this.lastSyncTime = new Date().toISOString();
      localStorage.setItem("lastSyncTime", this.lastSyncTime);

      console.log("✅ Sync completed at", this.lastSyncTime);
    } catch (error) {
      console.error("❌ Sync error:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Add operation to sync queue
   */
  queueChange(operation) {
    this.syncQueue.push({
      ...operation,
      queuedAt: new Date().toISOString(),
      deviceId: this.deviceId,
    });

    localStorage.setItem("syncQueue", JSON.stringify(this.syncQueue));

    // Try to sync immediately if online
    if (!this.offline && !this.isSyncing) {
      this.syncNow();
    }
  }

  /**
   * Process all queued operations
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
        } else {
          break; // Stop if operation fails
        }
      } catch (error) {
        console.error("❌ Queue processing error:", error);
        break;
      }
    }
  }

  /**
   * Add customer to central database
   */
  async addCustomer(customer) {
    if (this.offline) {
      this.queueChange({
        type: "addCustomer",
        customer,
      });
      return false;
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/customers/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          device_id: this.deviceId,
        }),
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
   * Update customer in central database
   */
  async updateCustomer(customer) {
    if (this.offline) {
      this.queueChange({
        type: "updateCustomer",
        customer,
      });
      return false;
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/customers/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          device_id: this.deviceId,
        }),
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
   * Delete customer from central database
   */
  async deleteCustomer(code) {
    if (this.offline) {
      this.queueChange({
        type: "deleteCustomer",
        code,
      });
      return false;
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/customers/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          device_id: this.deviceId,
        }),
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
   * Save setting to central database
   */
  async saveSetting(key, value) {
    if (this.offline) {
      this.queueChange({
        type: "saveSetting",
        key,
        value,
      });
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
   * Log SMS to central database
   */
  async logSms(mobile, message, status = "sent") {
    try {
      await fetch(`${this.serverUrl}/api/sms/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          message,
          status,
          device_id: this.deviceId,
        }),
      });
    } catch (error) {
      console.error("❌ SMS logging error:", error);
    }
  }

  /**
   * Fetch updates from server
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
        // Update local cache with server data
        await this.applyRemoteUpdates(data);
        return true;
      }
    } catch (error) {
      console.error("❌ Fetch updates error:", error);
    }

    return false;
  }

  /**
   * Apply remote updates to local database
   */
  async applyRemoteUpdates(syncData) {
    try {
      // Update customers
      if (syncData.customers && syncData.customers.length > 0) {
        for (const customer of syncData.customers) {
          await vpnDB.addCustomer(customer);
        }
        console.log(`📥 Updated ${syncData.customers.length} customers`);
      }

      // Update settings
      if (syncData.settings && Object.keys(syncData.settings).length > 0) {
        for (const [key, value] of Object.entries(syncData.settings)) {
          await vpnDB.saveSetting(key, value);
        }
        console.log(
          `📥 Updated ${Object.keys(syncData.settings).length} settings`
        );
      }

      // Trigger UI update
      if (window.refreshUIFromDatabase) {
        await window.refreshUIFromDatabase();
      }
    } catch (error) {
      console.error("❌ Error applying remote updates:", error);
    }
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      deviceId: this.deviceId,
      isOnline: !this.offline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      queuedChanges: this.syncQueue.length,
      serverUrl: this.serverUrl,
    };
  }

  /**
   * Restore queue from localStorage
   */
  restoreQueue() {
    const stored = localStorage.getItem("syncQueue");
    if (stored) {
      this.syncQueue = JSON.parse(stored);
      console.log(`📋 Restored ${this.syncQueue.length} queued operations`);
    }
  }
}

// Initialize cloud sync
let cloudSync = null;

function initializeCloudSync(serverUrl = "http://localhost:5000") {
  cloudSync = new CloudSync(serverUrl);
  cloudSync.restoreQueue();
  console.log(
    "🌐 Cloud synchronization initialized with device ID:",
    cloudSync.deviceId
  );
  return cloudSync;
}
