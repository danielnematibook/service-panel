#!/usr/bin/env python3
import sqlite3
import json

# Test database operations directly
db_file = "service_panel.db"

try:
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    
    # Create customers table if not exists
    c.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            name TEXT,
            mobile TEXT,
            volume INTEGER
        )
    ''')
    
    # Insert test customer
    test_customer = {
        "code": "TEST001",
        "name": "Test Customer",
        "mobile": "09123456789",
        "volume": 100
    }
    
    c.execute("INSERT INTO customers (code, name, mobile, volume) VALUES (?, ?, ?, ?)",
              (test_customer["code"], test_customer["name"], test_customer["mobile"], test_customer["volume"]))
    
    conn.commit()
    
    # Verify insert
    c.execute("SELECT COUNT(*) FROM customers")
    count = c.fetchone()[0]
    
    print(f"✅ Database test successful!")
    print(f"Total customers: {count}")
    
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
