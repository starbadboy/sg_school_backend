import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Load environment variables from .env file BEFORE importing modules
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, send_from_directory, Response
from flask_cors import CORS
import mimetypes
from src.models.user import db, School
from src.routes.user import user_bp
from src.routes.schools import schools_bp
from src.routes.strategy import strategy_bp
from src.initialize_db import initialize_database_if_empty

# Ensure proper MIME types are registered
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('text/html', '.html')

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Production-ready configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

# Enable CORS for all routes
CORS(app)

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(schools_bp, url_prefix='/api/schools')
app.register_blueprint(strategy_bp, url_prefix='/api/strategy')

# Database configuration with Railway deployment support
def get_database_url():
    """Get database URL with Railway deployment support"""
    # Check for Railway PostgreSQL database URL first (recommended for production)
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        # Fix PostgreSQL URL format for SQLAlchemy compatibility
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        print(f"🔗 Using Railway DATABASE_URL (PostgreSQL): {database_url[:50]}...")
        return database_url
    
    # Fallback to SQLite for local development and Railway with file system
    db_dir = os.path.join(os.path.dirname(__file__), 'database')
    db_path = os.path.join(db_dir, 'app.db')
    
    # Create database directory if it doesn't exist
    try:
        os.makedirs(db_dir, exist_ok=True)
        print(f"📁 Database directory: {db_dir}")
    except Exception as e:
        print(f"⚠️  Could not create database directory: {e}")
        # Try using a writable temporary location
        import tempfile
        db_dir = tempfile.gettempdir()
        db_path = os.path.join(db_dir, 'sg_school_app.db')
        print(f"📁 Using temporary database: {db_path}")
    
    sqlite_url = f"sqlite:///{db_path}"
    print(f"🗄️  Using SQLite database: {sqlite_url}")
    return sqlite_url

app.config['SQLALCHEMY_DATABASE_URI'] = get_database_url()
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Initialize database within app context
with app.app_context():
    try:
        db.create_all()
        print("✅ Database tables created successfully")
        
        # Auto-initialize database with P1 data if empty (for production deployment)
        print("🔍 Checking database initialization...")
        initialize_database_if_empty(db, School)
        
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
        print("💡 Consider using Railway's PostgreSQL service for production")
        # Don't fail the app startup - let it continue without database
        pass

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        # Get the file extension and determine MIME type
        file_path = os.path.join(static_folder_path, path)
        mime_type, _ = mimetypes.guess_type(file_path)
        
        # Explicit MIME type handling for common web assets
        if path.endswith('.js'):
            mime_type = 'application/javascript'
        elif path.endswith('.css'):
            mime_type = 'text/css'
        elif path.endswith('.html'):
            mime_type = 'text/html'
        elif path.endswith('.ico'):
            mime_type = 'image/x-icon'
        
        # Send file with correct MIME type
        response = send_from_directory(static_folder_path, path)
        if mime_type:
            response.headers['Content-Type'] = mime_type
        
        return response
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            response = send_from_directory(static_folder_path, 'index.html')
            response.headers['Content-Type'] = 'text/html'
            return response
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    # Production-ready settings
    port = int(os.getenv('PORT', 5002))
    debug = os.getenv('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)
