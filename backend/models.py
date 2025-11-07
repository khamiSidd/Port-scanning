# backend/models.py
import sqlite3
import bcrypt
import random
import time
import datetime

DB_NAME = 'port_scanner.db'


def init_db():
    """Initializes the database and creates the users table."""
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            is_verified INTEGER DEFAULT 0,
            otp TEXT,
            otp_expiry INTEGER,
            last_login TEXT
        )
    ''')
    conn.commit()
    conn.close()
    print("Database initialized.")


def add_user(email, password):
    """Hashes password, generates OTP, and adds a new user to the DB."""
    try:
        conn = sqlite3.connect(DB_NAME, check_same_thread=False)
        cursor = conn.cursor()

        pw_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(pw_bytes, salt).decode('utf-8')

        otp = str(random.randint(100000, 999999))
        otp_expiry = int(time.time()) + 600  # 10 minutes

        cursor.execute(
            "INSERT INTO users (email, hashed_password, otp, otp_expiry) "
            "VALUES (?, ?, ?, ?)",
            (email, hashed_password, otp, otp_expiry)
        )
        conn.commit()
        conn.close()
        return otp
    except sqlite3.IntegrityError:
        conn.close()
        return None  # Email already exists


def verify_user_otp(email, otp):
    """Checks if the OTP is valid and not expired."""
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT otp, otp_expiry FROM users WHERE email = ?", (email,))
    user_data = cursor.fetchone()

    if not user_data:
        conn.close()
        return False

    db_otp, db_expiry = user_data

    if db_otp == otp and int(time.time()) < db_expiry:
        cursor.execute(
            "UPDATE users SET is_verified = 1, otp = NULL, "
            "otp_expiry = NULL WHERE email = ?",
            (email,)
        )
        conn.commit()
        conn.close()
        return True

    conn.close()
    return False


def check_user_credentials(email, password):
    """
    Checks email, verification, and password.
    Returns a dict with status and last_login on success.
    """
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    cursor = conn.cursor()

    # --- MODIFIED ---
    cursor.execute(
        "SELECT hashed_password, is_verified, last_login "
        "FROM users WHERE email = ?", (email,))
    user_data = cursor.fetchone()

    if not user_data:
        conn.close()
        return {'status': False}  # User not found

    hashed_password, is_verified, last_login = user_data

    if not is_verified:
        conn.close()
        return {'status': False}  # User not verified

    if bcrypt.checkpw(password.encode('utf-8'),
                      hashed_password.encode('utf-8')):
        conn.close()
        # Return status and the user's last login time
        return {'status': True, 'last_login': last_login}  # <-- MODIFIED

    conn.close()
    return {'status': False}  # Invalid password
    # --- END MODIFIED ---


def update_last_login(email):
    """Updates the last_login time for a user to now (UTC)."""
    # --- NEW FUNCTION ---
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    cursor = conn.cursor()

    # Get current time in ISO format (standard and easy to parse)
    now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()

    cursor.execute(
        "UPDATE users SET last_login = ? WHERE email = ?",
        (now_utc, email))
    conn.commit()
    conn.close()


def delete_unverified_users():
    """Deletes all users who failed to verify before their OTP expired."""
    conn = None
    try:
        conn = sqlite3.connect(DB_NAME, check_same_thread=False)
        cursor = conn.cursor()

        current_time = int(time.time())

        # This query deletes users who are not verified AND
        # whose OTP expiry time has passed
        cursor.execute(
            "DELETE FROM users WHERE is_verified = 0 AND otp_expiry < ?",
            (current_time,)
        )

        rows_deleted = cursor.rowcount
        conn.commit()

    except Exception as e:
        print(f"[Scheduler] Error deleting unverified users: {e}")
    finally:
        if conn:
            conn.close()
