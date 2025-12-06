#!/usr/bin/env python3
"""
Central Database Server for Service Panel
Provides REST API for all devices to sync data in real-time
"""

import http.server
import json
import sqlite3
import os
import sys
import io
import threading
import hashlib
import time
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs
from http import HTTPStatus

# Fix encoding for Windows
if sys.platform.startswith('win'):
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Configuration
PORT = 5000
DB_FILE = "service_panel.db"
SYNC_TIMEOUT = 300  # 5 minutes
CLEANUP_INTERVAL = 3600  # 1 hour

# In-memory cache for active sessions
active_sessions = {}
sessions_lock = threading.Lock()


class HybridHandler(http.server.SimpleHTTPRequestHandler):
    """This handler uses SimpleHTTPRequestHandler to serve static files
    and forwards API requests to APIHandler."""
    def do_GET(self):
        if self.path.startswith('/api'):
            APIHandler(self.request, self.client_address, self.server)
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api'):
            APIHandler(self.request, self.client_address, self.server)
        else:
            self.send_error(HTTPStatus.NOT_FOUND, "Only API endpoints support POST.")

    def do_OPTIONS(self):
        if self.path.startswith('/api'):
            APIHandler(self.request, self.client_address, self.server)
        else:
            super().do_OPTIONS()


class DatabaseManager:
    """SQLite Database Manager"""

    def __init__(self, db_file):
        self.db_file = db_file
        self.init_database()

    def init_database(self):
        """Initialize database with required tables"""
        conn = sqlite3.connect(self.db_file)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Customers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT UNIQUE NOT NULL,
                mobile TEXT NOT NULL,
                name TEXT NOT NULL,
                duration INTEGER DEFAULT 0,
                volume INTEGER DEFAULT 0,
                date TEXT DEFAULT '',
                status TEXT DEFAULT 'active',
                config TEXT DEFAULT '',
                price INTEGER DEFAULT 0,
                start_date TEXT,
                end_date TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                device_sync_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Settings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_by TEXT
            )
        """)

        # SMS History table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sms_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mobile TEXT NOT NULL,
                message TEXT,
                status TEXT DEFAULT 'pending',
                response TEXT,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                device_id TEXT
            )
        """)

        # Sync Log table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sync_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT NOT NULL,
                action TEXT,
                table_name TEXT,
                record_id INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Device Sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS device_sessions (
                device_id TEXT PRIMARY KEY,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                user_agent TEXT,
                status TEXT DEFAULT 'active'
            )
        """)

        conn.commit()
        conn.close()
        print("✅ Database initialized")

    def execute(self, query, params=(), fetch_one=False):
        """Execute a query and return results"""
        try:
            conn = sqlite3.connect(self.db_file)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)

            if "SELECT" in query.upper():
                result = cursor.fetchone() if fetch_one else cursor.fetchall()
                conn.close()
                return result

            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"❌ Database error: {e}")
            return None

    def execute_many(self, query, params_list):
        """Execute multiple queries"""
        try:
            conn = sqlite3.connect(self.db_file)
            cursor = conn.cursor()
            cursor.executemany(query, params_list)
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"❌ Database error: {e}")
            return False


class APIHandler(http.server.BaseHTTPRequestHandler):
    """HTTP Request Handler for API endpoints"""

    db = None  # Will be set by server

    def do_GET(self):
        """Handle GET requests"""
        try:
            parsed_path = urlparse(self.path)
            path = parsed_path.path
            query_params = parse_qs(parsed_path.query)

            # API routes
            if path.startswith("/api/"):
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()

                if path == "/api/customers":
                    customers = self.db.execute("SELECT * FROM customers")
                    self.wfile.write(
                        json.dumps(
                            {
                                "success": True,
                                "data": [dict(c) for c in customers] if customers else [],
                            }
                        ).encode()
                    )

                elif path == "/api/settings":
                    settings = self.db.execute("SELECT key, value FROM settings")
                    result = {}
                    if settings:
                        for row in settings:
                            result[row["key"]] = json.loads(row["value"])
                    self.wfile.write(
                        json.dumps({"success": True, "data": result}).encode()
                    )

                elif path == "/api/sms-history":
                    limit = query_params.get("limit", ["100"])[0]
                    sms_history = self.db.execute(
                        f"SELECT * FROM sms_history ORDER BY sent_at DESC LIMIT {limit}"
                    )
                    self.wfile.write(
                        json.dumps(
                            {
                                "success": True,
                                "data": [dict(s) for s in sms_history] if sms_history else [],
                            }
                        ).encode()
                    )

                elif path == "/api/device-sessions":
                    sessions = self.db.execute("SELECT * FROM device_sessions")
                    self.wfile.write(
                        json.dumps(
                            {
                                "success": True,
                                "data": [dict(s) for s in sessions] if sessions else [],
                            }
                        ).encode()
                    )

                elif path == "/api/health":
                    self.wfile.write(
                        json.dumps(
                            {"success": True, "status": "Database server online"}
                        ).encode()
                    )
                
                else:
                    self.send_error(HTTPStatus.NOT_FOUND, "API endpoint not found")
            else:
                # Serve static files
                return http.server.SimpleHTTPRequestHandler.do_GET(self)

        except Exception as e:
            print(f"❌ GET Error: {e}")
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR)

    def do_POST(self):
        """Handle POST requests"""
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode()
            data = json.loads(body) if body else {}

            parsed_path = urlparse(self.path)
            path = parsed_path.path

            if not path.startswith("/api/"):
                self.send_error(HTTPStatus.NOT_FOUND, "Endpoint not found")
                return

            # Enable CORS for API responses
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            device_id = data.get("device_id", "unknown")

            # Routes
            if path == "/api/customers/add":
                customer = data.get("customer", {})
                query = """
                    INSERT OR REPLACE INTO customers 
                    (code, mobile, name, duration, volume, date, status, config, price, start_date, end_date, device_sync_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """
                params = (
                    customer.get("code"),
                    customer.get("mobile"),
                    customer.get("name"),
                    customer.get("duration", 0),
                    customer.get("volume", 0),
                    customer.get("date", ""),
                    customer.get("status", "active"),
                    customer.get("config", ""),
                    customer.get("price", 0),
                    customer.get("start_date"),
                    customer.get("end_date"),
                    device_id,
                )
                result = self.db.execute(query, params)
                self.log_sync(device_id, "add", "customers", customer.get("code"))
                self.wfile.write(
                    json.dumps(
                        {"success": result is not None, "message": "Customer saved"}
                    ).encode()
                )

            elif path == "/api/customers/update":
                customer = data.get("customer", {})
                query = """
                    UPDATE customers SET
                    mobile=?, name=?, duration=?, volume=?, date=?, status=?, config=?, price=?, end_date=?, device_sync_id=?, last_updated=CURRENT_TIMESTAMP
                    WHERE code=?
                """
                params = (
                    customer.get("mobile"),
                    customer.get("name"),
                    customer.get("duration", 0),
                    customer.get("volume", 0),
                    customer.get("date", ""),
                    customer.get("status", "active"),
                    customer.get("config", ""),
                    customer.get("price", 0),
                    customer.get("end_date"),
                    device_id,
                    customer.get("code"),
                )
                result = self.db.execute(query, params)
                self.log_sync(device_id, "update", "customers", customer.get("code"))
                self.wfile.write(
                    json.dumps(
                        {"success": result is not None, "message": "Customer updated"}
                    ).encode()
                )

            elif path == "/api/customers/delete":
                code = data.get("code")
                result = self.db.execute(
                    "DELETE FROM customers WHERE code=?", (code,)
                )
                self.log_sync(device_id, "delete", "customers", code)
                self.wfile.write(
                    json.dumps(
                        {"success": result is not None, "message": "Customer deleted"}
                    ).encode()
                )

            elif path == "/api/settings/save":
                key = data.get("key")
                value = data.get("value")
                query = """
                    INSERT OR REPLACE INTO settings (key, value, updated_by)
                    VALUES (?, ?, ?)
                """
                result = self.db.execute(query, (key, json.dumps(value), device_id))
                self.log_sync(device_id, "update", "settings", key)
                self.wfile.write(
                    json.dumps(
                        {"success": result is not None, "message": "Setting saved"}
                    ).encode()
                )

            elif path == "/api/sms/log":
                mobile = data.get("mobile")
                message = data.get("message")
                status = data.get("status", "pending")
                response = data.get("response", "")
                query = """
                    INSERT INTO sms_history (mobile, message, status, response, device_id)
                    VALUES (?, ?, ?, ?, ?)
                """
                result = self.db.execute(query, (mobile, message, status, response, device_id))
                self.wfile.write(
                    json.dumps(
                        {"success": result is not None, "message": "SMS logged"}
                    ).encode()
                )

            elif path == "/api/device/register":
                device_id = data.get("device_id", "unknown")
                ip_address = self.client_address[0]
                user_agent = self.headers.get("User-Agent", "")
                query = """
                    INSERT OR REPLACE INTO device_sessions (device_id, ip_address, user_agent, last_seen, status)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'active')
                """
                result = self.db.execute(
                    query, (device_id, ip_address, user_agent)
                )
                self.wfile.write(
                    json.dumps(
                        {"success": result is not None, "device_id": device_id}
                    ).encode()
                )

            elif path == "/api/sync":
                # Get only updates since last sync
                last_sync = data.get("last_sync", "2000-01-01")
                customers = self.db.execute(
                    "SELECT * FROM customers WHERE last_updated > ?", (last_sync,)
                )
                settings = self.db.execute(
                    "SELECT key, value FROM settings WHERE last_updated > ?",
                    (last_sync,),
                )
                sync_log = self.db.execute(
                    "SELECT * FROM sync_log WHERE timestamp > ? AND device_id != ?",
                    (last_sync, device_id),
                )

                settings_dict = {}
                if settings:
                    for row in settings:
                        settings_dict[row["key"]] = json.loads(row["value"])

                self.wfile.write(
                    json.dumps(
                        {
                            "success": True,
                            "customers": [dict(c) for c in customers]
                            if customers
                            else [],
                            "settings": settings_dict,
                            "changes": [dict(s) for s in sync_log] if sync_log else [],
                            "timestamp": datetime.now().isoformat(),
                        }
                    ).encode()
                )

            else:
                self.send_error(HTTPStatus.NOT_FOUND)

        except Exception as e:
            print(f"❌ POST Error: {e}")
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR)

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(HTTPStatus.OK)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_sync(self, device_id, action, table_name, record_id):
        """Log synchronization activity"""
        query = """
            INSERT INTO sync_log (device_id, action, table_name, record_id)
            VALUES (?, ?, ?, ?)
        """
        self.db.execute(query, (device_id, action, table_name, record_id))

    def log_message(self, format, *args):
        """Custom logging"""
        # Suppress default logging for static files to reduce noise
        if not self.path.startswith("/api"):
            return
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args if args else format}")


def cleanup_sessions():
    """Periodically cleanup old sessions"""
    while True:
        time.sleep(CLEANUP_INTERVAL)
        with sessions_lock:
            now = datetime.now()
            expired = [
                sid
                for sid, session in active_sessions.items()
                if (now - session["last_seen"]).seconds > SYNC_TIMEOUT
            ]
            for sid in expired:
                del active_sessions[sid]
                print(f"🗑️ Expired session: {sid}")


def run_server():
    """Start the database server"""
    global db_manager
    try:
        db_manager = DatabaseManager(DB_FILE)
        print("✅ Database initialized", flush=True)
    except Exception as e:
        print(f"❌ Database error: {e}", flush=True)
        return

    # Set the database manager for the handler
    APIHandler.db = db_manager

    # Start cleanup thread
    cleanup_thread = threading.Thread(target=cleanup_sessions, daemon=True)
    cleanup_thread.start()

    # Create server
    try:
        # Use APIHandler which now also serves static files
        httpd = http.server.HTTPServer(("0.0.0.0", PORT), APIHandler)
        print(f"""
╔════════════════════════════════════════════════════════════╗
║         🚀  Hybrid Server Started (API + Static)          ║
║                                                            ║
║  Server: http://localhost:{PORT}                           ║
║  Database: {DB_FILE}                              
║  Mode: REST API with Real-time Sync                       ║
╚════════════════════════════════════════════════════════════╝
        """, flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped", flush=True)
    except Exception as e:
        print(f"❌ Server error: {e}", flush=True)


if __name__ == "__main__":
    run_server()
