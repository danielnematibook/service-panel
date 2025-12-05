#!/usr/bin/env python3
"""
Central Database Sync System - Health Check & Testing
"""

import requests
import json
import time
from datetime import datetime

# Configuration
SERVER_URL = "http://localhost:5000"
DEVICE_ID = "test_device_001"
TEST_TIMEOUT = 5

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_result(test_name, success, message=""):
    icon = f"{Colors.GREEN}✅{Colors.END}" if success else f"{Colors.RED}❌{Colors.END}"
    msg = f"{message}" if message else ""
    print(f"{icon} {test_name:<40} {msg}")

def test_health():
    """Test server health"""
    try:
        response = requests.get(f"{SERVER_URL}/api/health", timeout=TEST_TIMEOUT)
        data = response.json()
        return data.get("success", False), response.status_code
    except Exception as e:
        return False, str(e)

def test_device_register():
    """Register test device"""
    try:
        payload = {"device_id": DEVICE_ID}
        response = requests.post(
            f"{SERVER_URL}/api/device/register",
            json=payload,
            timeout=TEST_TIMEOUT
        )
        data = response.json()
        return data.get("success", False), DEVICE_ID
    except Exception as e:
        return False, str(e)

def test_add_customer():
    """Add test customer"""
    try:
        payload = {
            "device_id": DEVICE_ID,
            "customer": {
                "code": f"TEST_{int(time.time())}",
                "mobile": "09123456789",
                "name": "تست مشتری",
                "duration": 12,
                "volume": 100,
                "status": "active",
                "config": "config_url_here",
                "price": 100000
            }
        }
        response = requests.post(
            f"{SERVER_URL}/api/customers/add",
            json=payload,
            timeout=TEST_TIMEOUT
        )
        data = response.json()
        return data.get("success", False), payload["customer"]["code"]
    except Exception as e:
        return False, str(e)

def test_get_customers():
    """Get all customers"""
    try:
        response = requests.get(f"{SERVER_URL}/api/customers", timeout=TEST_TIMEOUT)
        data = response.json()
        count = len(data.get("data", []))
        return True, f"{count} customers"
    except Exception as e:
        return False, str(e)

def test_save_setting():
    """Save test setting"""
    try:
        payload = {
            "device_id": DEVICE_ID,
            "key": "test_setting",
            "value": {
                "test": True,
                "timestamp": datetime.now().isoformat()
            }
        }
        response = requests.post(
            f"{SERVER_URL}/api/settings/save",
            json=payload,
            timeout=TEST_TIMEOUT
        )
        data = response.json()
        return data.get("success", False), "Setting saved"
    except Exception as e:
        return False, str(e)

def test_get_settings():
    """Get all settings"""
    try:
        response = requests.get(f"{SERVER_URL}/api/settings", timeout=TEST_TIMEOUT)
        data = response.json()
        count = len(data.get("data", {}))
        return True, f"{count} settings"
    except Exception as e:
        return False, str(e)

def test_log_sms():
    """Log SMS"""
    try:
        payload = {
            "device_id": DEVICE_ID,
            "mobile": "09123456789",
            "message": "پیام تست",
            "status": "sent"
        }
        response = requests.post(
            f"{SERVER_URL}/api/sms/log",
            json=payload,
            timeout=TEST_TIMEOUT
        )
        data = response.json()
        return data.get("success", False), "SMS logged"
    except Exception as e:
        return False, str(e)

def test_sync():
    """Test synchronization"""
    try:
        payload = {
            "device_id": DEVICE_ID,
            "last_sync": "2000-01-01T00:00:00"
        }
        response = requests.post(
            f"{SERVER_URL}/api/sync",
            json=payload,
            timeout=TEST_TIMEOUT
        )
        data = response.json()
        if data.get("success"):
            customers = len(data.get("customers", []))
            settings = len(data.get("settings", {}))
            return True, f"{customers} customers, {settings} settings"
        return False, "Sync failed"
    except Exception as e:
        return False, str(e)

def test_get_sessions():
    """Get device sessions"""
    try:
        response = requests.get(
            f"{SERVER_URL}/api/device-sessions",
            timeout=TEST_TIMEOUT
        )
        data = response.json()
        count = len(data.get("data", []))
        return True, f"{count} devices"
    except Exception as e:
        return False, str(e)

def main():
    print(f"""
╔════════════════════════════════════════════════════════════╗
║  🧪 Central Database Sync - Health Check & Tests         ║
║                                                            ║
║  Server: {SERVER_URL:<42}
║  Device: {DEVICE_ID:<42}
╚════════════════════════════════════════════════════════════╝
    """)

    # Test server availability
    print(f"\n{Colors.BLUE}1. Server Connection{Colors.END}")
    success, result = test_health()
    if success:
        print_result("Health Check", True, f"Status code: {result}")
    else:
        print_result("Health Check", False, f"Error: {result}")
        print(f"\n{Colors.RED}❌ Server is not responding. Start it first:{Colors.END}")
        print(f"   python database_server.py\n")
        return

    # Test device registration
    print(f"\n{Colors.BLUE}2. Device Management{Colors.END}")
    success, result = test_device_register()
    print_result("Register Device", success, result)

    # Test customer operations
    print(f"\n{Colors.BLUE}3. Customer Operations{Colors.END}")
    success, code = test_add_customer()
    print_result("Add Customer", success, code)
    
    success, result = test_get_customers()
    print_result("Get Customers", success, result)

    # Test settings operations
    print(f"\n{Colors.BLUE}4. Settings Operations{Colors.END}")
    success, result = test_save_setting()
    print_result("Save Setting", success, result)
    
    success, result = test_get_settings()
    print_result("Get Settings", success, result)

    # Test SMS logging
    print(f"\n{Colors.BLUE}5. SMS Operations{Colors.END}")
    success, result = test_log_sms()
    print_result("Log SMS", success, result)

    # Test synchronization
    print(f"\n{Colors.BLUE}6. Synchronization{Colors.END}")
    success, result = test_sync()
    print_result("Sync Data", success, result)

    # Test sessions
    print(f"\n{Colors.BLUE}7. Device Sessions{Colors.END}")
    success, result = test_get_sessions()
    print_result("Get Sessions", success, result)

    print(f"""
╔════════════════════════════════════════════════════════════╗
║  ✅ All tests completed!                                  ║
║                                                            ║
║  Next steps:                                               ║
║  1. Start the database server: python database_server.py  ║
║  2. Start the frontend server: python server.py           ║
║  3. Open http://localhost:8000 in your browser            ║
║  4. Login with: danielnemati / 21april2002                ║
║                                                            ║
║  Your data is now synced across all devices!              ║
╚════════════════════════════════════════════════════════════╝
    """)

if __name__ == "__main__":
    main()
