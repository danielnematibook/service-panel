#!/usr/bin/env python3
"""
Test the initial upload mechanism by making direct API calls
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000/api"

# Test data
test_customer = {
    "code": "TEST001",
    "name": "Test Customer",
    "mobile": "09123456789",
    "ip": "192.168.1.1",
    "volume": 100,
    "renewal_date": datetime.now().isoformat(),
    "status": "active",
    "extra_users": 0,
    "extra_volume": 0,
    "users": ["user1"],
}

test_settings = {
    "apiKey": "test-api-key",
    "smsApiKey": "test-sms-key",
}

print("🧪 Testing Initial Upload Mechanism\n")
print("=" * 50)

# 1. Check server health
print("\n1️⃣ Checking database server health...")
try:
    response = requests.get(f"{BASE_URL}/health")
    print(f"✅ Server health: {response.json()}")
except Exception as e:
    print(f"❌ Server error: {e}")
    exit(1)

# 2. Add test customer
print("\n2️⃣ Adding test customer...")
try:
    response = requests.post(
        f"{BASE_URL}/customers/add",
        json={"customer": test_customer, "device_id": "test_device_001"},
        timeout=5
    )
    result = response.json()
    if result.get("success"):
        print(f"✅ Customer added: {test_customer['code']}")
    else:
        print(f"❌ Failed to add customer: {result}")
except Exception as e:
    print(f"❌ Error: {e}")

# 3. Save test settings
print("\n3️⃣ Saving test settings...")
try:
    for key, value in test_settings.items():
        response = requests.post(
            f"{BASE_URL}/settings/save",
            json={"key": key, "value": value, "device_id": "test_device_001"},
            timeout=5
        )
        result = response.json()
        if result.get("success"):
            print(f"✅ Setting saved: {key}")
        else:
            print(f"❌ Failed to save setting: {key}")
except Exception as e:
    print(f"❌ Error: {e}")

# 4. Verify data in database
print("\n4️⃣ Verifying data in database...")
try:
    import sqlite3
    conn = sqlite3.connect('c:\\Users\\DanielNemati\\Desktop\\Project\\service_panel.db')
    c = conn.cursor()
    
    c.execute('SELECT COUNT(*) FROM customers')
    customer_count = c.fetchone()[0]
    
    c.execute('SELECT COUNT(*) FROM settings')
    setting_count = c.fetchone()[0]
    
    conn.close()
    
    print(f"✅ Customers in DB: {customer_count}")
    print(f"✅ Settings in DB: {setting_count}")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 50)
print("✅ Test completed!")
