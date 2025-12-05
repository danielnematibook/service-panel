#!/usr/bin/env python3
"""
Simulate adding test data to IndexedDB by directly manipulating the database
"""
import sqlite3
import json
from datetime import datetime, timedelta

DB_FILE = "service_panel.db"

# Test data
test_customers = [
    {
        "code": "CUST001",
        "name": "علی احمدی",
        "mobile": "09123456789",
        "duration": 30,
        "volume": 100,
        "date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
        "status": "active",
        "price": 50000,
        "start_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "end_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d %H:%M:%S"),
    },
    {
        "code": "CUST002",
        "name": "فاطمه علی",
        "mobile": "09198765432",
        "duration": 30,
        "volume": 200,
        "date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
        "status": "active",
        "price": 100000,
        "start_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "end_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d %H:%M:%S"),
    }
]

test_settings = {
    "extraVolumePrice": "1000",
    "extraUserPrice": "10000",
    "smsApiKey": "test-sms-key-12345",
    "smsLineNumber": "1000"
}

print("🧪 Adding test data to IndexedDB...\n")

try:
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # Clear existing test customers (keep the previous TEST001)
    c.execute("DELETE FROM customers WHERE code LIKE 'CUST%'")
    conn.commit()
    
    # Add test customers
    print("📝 Adding test customers...")
    for customer in test_customers:
        c.execute("""
            INSERT INTO customers (code, name, mobile, duration, volume, date, status, price, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            customer["code"],
            customer["name"],
            customer["mobile"],
            customer["duration"],
            customer["volume"],
            customer["date"],
            customer["status"],
            customer["price"],
            customer["start_date"],
            customer["end_date"]
        ))
        print(f"  ✅ {customer['name']} ({customer['code']})")
    
    conn.commit()
    
    # Add test settings
    print("\n📝 Adding test settings...")
    for key, value in test_settings.items():
        c.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))
        print(f"  ✅ {key} = {value}")
    
    conn.commit()
    
    # Verify
    c.execute("SELECT COUNT(*) FROM customers")
    customer_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM settings")
    setting_count = c.fetchone()[0]
    
    print(f"\n{'='*50}")
    print(f"✅ Test data added successfully!")
    print(f"Total Customers: {customer_count}")
    print(f"Total Settings: {setting_count}")
    print(f"{'='*50}")
    
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
