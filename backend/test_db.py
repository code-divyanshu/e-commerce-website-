from db import get_db_connection

try:
    conn = get_db_connection()

    if conn.is_connected():
        print("Connected to MySQL successfully!")

        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")

        print("\nTables in ecommerce_db:")
        for table in cursor.fetchall():
            print(table[0])

        cursor.close()
        conn.close()

except Exception as e:
    print("Database connection failed:", e)