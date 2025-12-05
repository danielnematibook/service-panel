#!/usr/bin/env python3
import sqlite3

conn = sqlite3.connect('service_panel.db')
cursor = conn.cursor()

# Check customers
cursor.execute('SELECT COUNT(*) FROM customers')
customer_count = cursor.fetchone()[0]

# Check settings
cursor.execute('SELECT COUNT(*) FROM settings')
settings_count = cursor.fetchone()[0]

# Check SMS history
cursor.execute('SELECT COUNT(*) FROM sms_history')
sms_count = cursor.fetchone()[0]

print("\n=== DATABASE STATUS ===")
print(f"Customers: {customer_count}")
print(f"Settings: {settings_count}")
print(f"SMS History: {sms_count}")

# Get sample data
if customer_count > 0:
    cursor.execute('SELECT * FROM customers LIMIT 1')
    print("\nSample Customer:")
    print(cursor.fetchone())

conn.close()
