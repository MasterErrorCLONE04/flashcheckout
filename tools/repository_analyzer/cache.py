import os
import json
import sqlite3
import threading

# Global database path resolved during initialization
_db_path = None
_local = threading.local()

def _get_conn():
    """
    Get a thread-local SQLite connection to avoid opening/closing
    overhead on every query, while remaining thread-safe.
    """
    global _db_path
    if not _db_path:
        return None
        
    if not hasattr(_local, 'conn') or _local.conn is None:
        # Create thread-local connection
        _local.conn = sqlite3.connect(_db_path, check_same_thread=False)
    return _local.conn

def close_connections():
    """
    Manually close the current thread's connection (optional).
    """
    if hasattr(_local, 'conn') and _local.conn is not None:
        try:
            _local.conn.close()
        except Exception:
            pass
        _local.conn = None

def init_cache(base_dir):
    """
    Initializes the cache database inside the .cache folder of the project root.
    Recreates the 'files' table with extended columns if the schema is updated.
    """
    global _db_path
    
    cache_dir = os.path.join(base_dir, '.cache')
    os.makedirs(cache_dir, exist_ok=True)
    _db_path = os.path.join(cache_dir, 'repository.db')
    
    close_connections()
    
    conn = sqlite3.connect(_db_path)
    try:
        cursor = conn.cursor()
        
        # Check if table schema matches. We check if 'language_metrics' column is present;
        # if not, we drop the old table and recreate it with the modular JSON schema.
        cursor.execute("PRAGMA table_info(files)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if columns and 'language_metrics' not in columns:
            cursor.execute("DROP TABLE IF EXISTS files")
            
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS files (
                path TEXT PRIMARY KEY,
                sha256 TEXT,
                size INTEGER,
                modified_time INTEGER,
                extension TEXT,
                language TEXT,
                lines INTEGER,
                characters INTEGER,
                tokens INTEGER,
                imports INTEGER DEFAULT 0,
                exports INTEGER DEFAULT 0,
                language_metrics TEXT, -- Serialized JSON dictionary for language metrics
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Snapshots table for historical metrics
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT UNIQUE,
                files INTEGER,
                lines INTEGER,
                tokens INTEGER,
                cost REAL
            )
        ''')
        conn.commit()
    finally:
        conn.close()

def get_cached_file_by_mtime(rel_path, size, mtime):
    """
    Check if the file details exist in the cache and match the size and modification time.
    If matching, returns cached stats (including deserialized language metrics).
    """
    conn = _get_conn()
    if conn is None:
        return None
        
    try:
        cursor = conn.cursor()
        cursor.execute(
            '''SELECT sha256, extension, language, lines, characters, tokens, 
                      imports, exports, language_metrics
               FROM files 
               WHERE path = ? AND size = ? AND modified_time = ?''',
            (rel_path, size, mtime)
        )
        row = cursor.fetchone()
        if row:
            metrics_str = row[8]
            try:
                lang_metrics = json.loads(metrics_str) if metrics_str else {}
            except Exception:
                lang_metrics = {}
                
            return {
                'sha256': row[0],
                'extension': row[1],
                'language': row[2],
                'lines': row[3],
                'characters': row[4],
                'tokens': row[5],
                'imports': row[6],
                'exports': row[7],
                'language_metrics': lang_metrics,
                'cached_by': 'mtime'
            }
    except sqlite3.Error:
        pass
    return None

def get_cached_file_by_hash(rel_path, sha256):
    """
    Check if a file exists in cache matching its SHA-256 content hash.
    """
    conn = _get_conn()
    if conn is None:
        return None
        
    try:
        cursor = conn.cursor()
        cursor.execute(
            '''SELECT size, modified_time, extension, language, lines, characters, tokens,
                      imports, exports, language_metrics
               FROM files 
               WHERE path = ? AND sha256 = ?''',
            (rel_path, sha256)
        )
        row = cursor.fetchone()
        if row:
            metrics_str = row[9]
            try:
                lang_metrics = json.loads(metrics_str) if metrics_str else {}
            except Exception:
                lang_metrics = {}
                
            return {
                'size': row[0],
                'modified_time': row[1],
                'extension': row[2],
                'language': row[3],
                'lines': row[4],
                'characters': row[5],
                'tokens': row[6],
                'imports': row[7],
                'exports': row[8],
                'language_metrics': lang_metrics,
                'cached_by': 'hash'
            }
    except sqlite3.Error:
        pass
    return None

def save_cached_file(rel_path, sha256, size, mtime, extension, language, lines, characters, tokens,
                     imports=0, exports=0, language_metrics=None):
    """
    Saves or updates a file analysis record in the cache database.
    """
    conn = _get_conn()
    if conn is None:
        return
        
    lang_metrics_str = json.dumps(language_metrics or {})
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO files (
                path, sha256, size, modified_time, extension, language, lines, characters, tokens,
                imports, exports, language_metrics, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (rel_path, sha256, size, mtime, extension, language, lines, characters, tokens,
              imports, exports, lang_metrics_str))
        conn.commit()
    except sqlite3.Error:
        pass

def save_cached_file_batch(records):
    """
    Saves a list of records in a single database transaction.
    Each record must be a tuple in the format:
    (path, sha256, size, modified_time, extension, language, lines, characters, tokens,
     imports, exports, language_metrics_json_str)
    """
    conn = _get_conn()
    if conn is None or not records:
        return
        
    try:
        cursor = conn.cursor()
        cursor.executemany('''
            INSERT OR REPLACE INTO files (
                path, sha256, size, modified_time, extension, language, lines, characters, tokens,
                imports, exports, language_metrics, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', records)
        conn.commit()
    except sqlite3.Error:
        pass

def save_snapshot(files, lines, tokens, cost):
    """
    Save codebase metrics snapshot for today. Overwrites if it already exists for YYYY-MM-DD.
    """
    conn = _get_conn()
    if conn is None:
        return
        
    import time
    today = time.strftime("%Y-%m-%d")
    
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO snapshots (date, files, lines, tokens, cost)
            VALUES (?, ?, ?, ?, ?)
        ''', (today, files, lines, tokens, cost))
        conn.commit()
    except sqlite3.Error:
        pass

def get_snapshots():
    """
    Retrieve all snapshots sorted by date.
    """
    conn = _get_conn()
    if conn is None:
        return []
        
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT date, files, lines, tokens, cost FROM snapshots ORDER BY date ASC')
        rows = cursor.fetchall()
        return [
            {
                'date': row[0],
                'files': row[1],
                'lines': row[2],
                'tokens': row[3],
                'cost': row[4]
            } for row in rows
        ]
    except sqlite3.Error:
        return []
