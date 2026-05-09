import sys
sys.path.append('C:\\Users\\ziyad\\Air-Plane details')
import db
try:
    conn = db.get_db_connection()
    if conn:
        with conn.cursor() as cur:
            cur.execute("SELECT email FROM user_accounts")
            users = cur.fetchall()
            print(f"USERS: {users}")
    else:
        print("COULD NOT CONNECT")
except Exception as e:
    print(f"ERROR: {e}")
