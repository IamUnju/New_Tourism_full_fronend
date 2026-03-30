import psycopg2

conn = psycopg2.connect(host='localhost', user='postgres', password='kennyngoe', dbname='postgres')
conn.autocommit = True
cur = conn.cursor()
cur.execute("SELECT 1 FROM pg_database WHERE datname='karibu_safari'")
if cur.fetchone():
    print("Database 'karibu_safari' already exists.")
else:
    cur.execute("CREATE DATABASE karibu_safari")
    print("Database 'karibu_safari' created successfully.")
conn.close()
