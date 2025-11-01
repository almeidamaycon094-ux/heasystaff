from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import sqlite3
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# SQLite Database
DB_PATH = ROOT_DIR / 'heasy_mc.db'

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'heasy-mc-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 24  # hours

security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Database Helper Functions
def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    conn = get_db()
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS roles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            "order" INTEGER NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS players (
            id TEXT PRIMARY KEY,
            minecraft_username TEXT NOT NULL,
            role_id TEXT NOT NULL,
            status TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (role_id) REFERENCES roles(id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id TEXT PRIMARY KEY,
            contact_link TEXT
        )
    ''')
    
    # Insert default admin if not exists
    cursor.execute('SELECT COUNT(*) FROM admins WHERE email = ?', ('japonegro296@gmail.com',))
    if cursor.fetchone()[0] == 0:
        password_hash = bcrypt.hashpw('@Maycon2023'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        admin_id = str(uuid.uuid4())
        cursor.execute('INSERT INTO admins (id, email, password_hash) VALUES (?, ?, ?)',
                      (admin_id, 'japonegro296@gmail.com', password_hash))
    
    # Insert default roles if not exists
    cursor.execute('SELECT COUNT(*) FROM roles')
    if cursor.fetchone()[0] == 0:
        default_roles = [
            ('CEO', '#9333EA', 1),
            ('Admin', '#A855F7', 2),
            ('Moderador', '#3B82F6', 3),
            ('Suporte', '#06B6D4', 4),
            ('Estagiário', '#EAB308', 5),
            ('Builder', '#F97316', 6),
        ]
        for name, color, order in default_roles:
            role_id = str(uuid.uuid4())
            created_at = datetime.now(timezone.utc).isoformat()
            cursor.execute('INSERT INTO roles (id, name, color, "order", created_at) VALUES (?, ?, ?, ?, ?)',
                          (role_id, name, color, order, created_at))
    
    # Insert default settings if not exists
    cursor.execute('SELECT COUNT(*) FROM settings WHERE id = ?', ('settings',))
    if cursor.fetchone()[0] == 0:
        cursor.execute('INSERT INTO settings (id, contact_link) VALUES (?, ?)',
                      ('settings', 'https://discord.gg/heasymc'))
    
    conn.commit()
    conn.close()

# Models
class Role(BaseModel):
    id: str
    name: str
    color: str
    order: int
    created_at: str

class RoleCreate(BaseModel):
    name: str
    color: str
    order: int

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    order: Optional[int] = None

class Player(BaseModel):
    id: str
    minecraft_username: str
    role_id: str
    status: str
    description: str = ""
    created_at: str

class PlayerCreate(BaseModel):
    minecraft_username: str
    role_id: str
    status: str
    description: str = ""

class PlayerUpdate(BaseModel):
    minecraft_username: Optional[str] = None
    role_id: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class Settings(BaseModel):
    id: str = "settings"
    contact_link: str = ""

class SettingsUpdate(BaseModel):
    contact_link: str

# Auth Functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Auth Routes
@api_router.post("/auth/login")
async def login(credentials: AdminLogin):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM admins WHERE email = ?', (credentials.email,))
    admin = cursor.fetchone()
    conn.close()
    
    if not admin:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), admin['password_hash'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = create_access_token({"email": admin['email']})
    return {"access_token": token, "token_type": "bearer"}

# Role Routes
@api_router.get("/roles", response_model=List[Role])
async def get_roles():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM roles ORDER BY "order" ASC')
    roles = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return roles

@api_router.post("/roles", response_model=Role)
async def create_role(role: RoleCreate, email: str = Depends(verify_token)):
    role_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO roles (id, name, color, "order", created_at) VALUES (?, ?, ?, ?, ?)',
                  (role_id, role.name, role.color, role.order, created_at))
    conn.commit()
    conn.close()
    
    return Role(id=role_id, name=role.name, color=role.color, order=role.order, created_at=created_at)

@api_router.put("/roles/{role_id}", response_model=Role)
async def update_role(role_id: str, role_update: RoleUpdate, email: str = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM roles WHERE id = ?', (role_id,))
    role = cursor.fetchone()
    
    if not role:
        conn.close()
        raise HTTPException(status_code=404, detail="Cargo não encontrado")
    
    update_data = {k: v for k, v in role_update.model_dump().items() if v is not None}
    if update_data:
        set_clause = ', '.join([f'"{k}" = ?' for k in update_data.keys()])
        values = list(update_data.values()) + [role_id]
        cursor.execute(f'UPDATE roles SET {set_clause} WHERE id = ?', values)
        conn.commit()
    
    cursor.execute('SELECT * FROM roles WHERE id = ?', (role_id,))
    updated_role = dict(cursor.fetchone())
    conn.close()
    
    return Role(**updated_role)

@api_router.delete("/roles/{role_id}")
async def delete_role(role_id: str, email: str = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM roles WHERE id = ?', (role_id,))
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cargo não encontrado")
    return {"message": "Cargo deletado com sucesso"}

# Player Routes
@api_router.get("/players", response_model=List[Player])
async def get_players():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM players')
    players = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return players

@api_router.post("/players", response_model=Player)
async def create_player(player: PlayerCreate, email: str = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Verificar se o cargo existe
    cursor.execute('SELECT * FROM roles WHERE id = ?', (player.role_id,))
    role = cursor.fetchone()
    if not role:
        conn.close()
        raise HTTPException(status_code=404, detail="Cargo não encontrado")
    
    player_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    cursor.execute('INSERT INTO players (id, minecraft_username, role_id, status, description, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                  (player_id, player.minecraft_username, player.role_id, player.status, player.description, created_at))
    conn.commit()
    conn.close()
    
    return Player(id=player_id, minecraft_username=player.minecraft_username, role_id=player.role_id,
                 status=player.status, description=player.description, created_at=created_at)

@api_router.put("/players/{player_id}", response_model=Player)
async def update_player(player_id: str, player_update: PlayerUpdate, email: str = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM players WHERE id = ?', (player_id,))
    player = cursor.fetchone()
    
    if not player:
        conn.close()
        raise HTTPException(status_code=404, detail="Player não encontrado")
    
    update_data = {k: v for k, v in player_update.model_dump().items() if v is not None}
    if update_data:
        # Verificar se o cargo existe se estiver sendo atualizado
        if 'role_id' in update_data:
            cursor.execute('SELECT * FROM roles WHERE id = ?', (update_data['role_id'],))
            role = cursor.fetchone()
            if not role:
                conn.close()
                raise HTTPException(status_code=404, detail="Cargo não encontrado")
        
        set_clause = ', '.join([f'{k} = ?' for k in update_data.keys()])
        values = list(update_data.values()) + [player_id]
        cursor.execute(f'UPDATE players SET {set_clause} WHERE id = ?', values)
        conn.commit()
    
    cursor.execute('SELECT * FROM players WHERE id = ?', (player_id,))
    updated_player = dict(cursor.fetchone())
    conn.close()
    
    return Player(**updated_player)

@api_router.delete("/players/{player_id}")
async def delete_player(player_id: str, email: str = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM players WHERE id = ?', (player_id,))
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Player não encontrado")
    return {"message": "Player deletado com sucesso"}

# Settings Routes
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM settings WHERE id = ?', ('settings',))
    settings = cursor.fetchone()
    conn.close()
    
    if not settings:
        return Settings(id="settings", contact_link="")
    return Settings(**dict(settings))

@api_router.put("/settings", response_model=Settings)
async def update_settings(settings_update: SettingsUpdate, email: str = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE settings SET contact_link = ? WHERE id = ?',
                  (settings_update.contact_link, 'settings'))
    conn.commit()
    cursor.execute('SELECT * FROM settings WHERE id = ?', ('settings',))
    settings = dict(cursor.fetchone())
    conn.close()
    
    return Settings(**settings)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    init_database()
    logger.info(f"SQLite Database initialized at {DB_PATH}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down")