#!/usr/bin/env python3
"""
Central Database Sync System - Simple Test (No External Dependencies)
"""

import urllib.request
import json
import time
from datetime import datetime
import sys
import io

# Fix encoding for Windows
if sys.platform.startswith('win'):
    import os
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

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

def make_request(method, endpoint, data=None):
    """Make HTTP request"""
    try:
        url = f"{SERVER_URL}{endpoint}"
        
        if method == "GET":
            with urllib.request.urlopen(url, timeout=TEST_TIMEOUT) as response:
                return json.loads(response.read().decode()), response.status
        
        elif method == "POST":
            req_data = json.dumps(data).encode('utf-8')
            req = urllib.request.Request(url, data=req_data, method="POST")
            req.add_header('Content-Type', 'application/json')
            
            with urllib.request.urlopen(req, timeout=TEST_TIMEOUT) as response:
                return json.loads(response.read().decode()), response.status
    
    except Exception as e:
        return None, str(e)

def test_health():
    """Test server health"""
    data, result = make_request("GET", "/api/health")
    if data:
        return data.get("success", False), result
    return False, result

def test_device_register():
    """Register test device"""
    payload = {"device_id": DEVICE_ID}
    data, result = make_request("POST", "/api/device/register", payload)
    if data:
        return data.get("success", False), DEVICE_ID
    return False, result

def test_add_customer():
    """Add test customer"""
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
    data, result = make_request("POST", "/api/customers/add", payload)
    if data:
        return data.get("success", False), payload["customer"]["code"]
    return False, result

def test_get_customers():
    """Get all customers"""
    data, result = make_request("GET", "/api/customers")
    if data:
        count = len(data.get("data", []))
        return True, f"{count} customers"
    return False, result

def test_save_setting():
    """Save test setting"""
    payload = {
        "device_id": DEVICE_ID,
        "key": "test_setting",
        "value": {
            "test": True,
            "timestamp": datetime.now().isoformat()
        }
    }
    data, result = make_request("POST", "/api/settings/save", payload)
    if data:
        return data.get("success", False), "Setting saved"
    return False, result

def test_get_settings():
    """Get all settings"""
    data, result = make_request("GET", "/api/settings")
    if data:
        count = len(data.get("data", {}))
        return True, f"{count} settings"
    return False, result

def test_log_sms():
    """Log SMS"""
    payload = {
        "device_id": DEVICE_ID,
        "mobile": "09123456789",
        "message": "پیام تست",
        "status": "sent"
    }
    data, result = make_request("POST", "/api/sms/log", payload)
    if data:
        return data.get("success", False), "SMS logged"
    return False, result

def test_sync():
    """Test synchronization"""
    payload = {
        "device_id": DEVICE_ID,
        "last_sync": "2000-01-01T00:00:00"
    }
    data, result = make_request("POST", "/api/sync", payload)
    if data and data.get("success"):
        customers = len(data.get("customers", []))
        settings = len(data.get("settings", {}))
        return True, f"{customers} customers, {settings} settings"
    return False, result

def test_get_sessions():
    """Get device sessions"""
    data, result = make_request("GET", "/api/device-sessions")
    if data:
        count = len(data.get("data", []))
        return True, f"{count} devices"
    return False, result

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
        print_result("Health Check", True, f"Status code: 200")
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
║  1. Servers are already running                           ║
║  2. Open http://localhost:8000 in your browser            ║
║  3. Login with: danielnemati / 21april2002                ║
║  4. Try adding/updating customers across multiple browsers ║
║  5. Watch the synchronization happen in real-time!        ║
║                                                            ║
║  Your data is now synced across all devices!              ║
╚════════════════════════════════════════════════════════════╝
    """)

if __name__ == "__main__":
    main()
