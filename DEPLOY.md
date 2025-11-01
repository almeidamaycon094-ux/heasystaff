# 🚀 Guia de Deploy - Heasy MC

## 📦 Subir para o GitHub

### 1. Inicializar Git
```bash
cd /app
git init
git add .
git commit -m "Initial commit: Heasy MC - Sistema de gerenciamento de equipe"
```

### 2. Criar Repositório no GitHub
1. Acesse https://github.com/new
2. Crie um repositório (ex: `heasy-mc-site`)
3. **NÃO** inicialize com README (já temos um)

### 3. Conectar e Push
```bash
git remote add origin https://github.com/SEU_USUARIO/heasy-mc-site.git
git branch -M main
git push -u origin main
```

## 💻 Clonar e Rodar em Outro Computador

### 1. Clonar Repositório
```bash
git clone https://github.com/SEU_USUARIO/heasy-mc-site.git
cd heasy-mc-site
```

### 2. Instalar Dependências

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
yarn install
```

### 3. Configurar Variáveis de Ambiente

**Backend** (`backend/.env`):
```
JWT_SECRET=heasy-mc-secret-key-2024
CORS_ORIGINS=*
```

**Frontend** (`frontend/.env`):
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 4. Executar

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

Acesse: `http://localhost:3000`

## 🗄️ Banco de Dados

- ✅ O arquivo `heasy_mc.db` é criado **automaticamente** na primeira execução
- ✅ Admin padrão já é configurado
- ✅ 6 cargos pré-criados
- ✅ Sem necessidade de configuração adicional

## 🔐 Credenciais Padrão

**Admin:**
- Email: `japonegro296@gmail.com`
- Senha: `@Maycon2023`

⚠️ **Importante:** Altere essas credenciais em produção!

## 📝 Arquivos Importantes

### ✅ Commitados no Git
- Código fonte (backend/frontend)
- README.md e documentação
- requirements.txt / package.json
- .gitignore

### ❌ NÃO Commitados (estão no .gitignore)
- `heasy_mc.db` - Banco SQLite local
- `node_modules/` - Dependências Node
- `__pycache__/` - Cache Python
- Arquivos de build

## 🌐 Deploy em Produção (Opcional)

### Opção 1: Heroku
```bash
# Adicionar Procfile
echo "web: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT" > Procfile
git push heroku main
```

### Opção 2: VPS (DigitalOcean, AWS, etc)
1. SSH no servidor
2. Clone o repositório
3. Configure reverse proxy (Nginx)
4. Use PM2 ou systemd para manter rodando
5. Configure HTTPS com Let's Encrypt

### Opção 3: Vercel (Frontend) + Railway (Backend)
- Frontend: Deploy no Vercel
- Backend: Deploy no Railway com SQLite persistente

## 🔧 Troubleshooting

### Backend não inicia
```bash
# Verificar se a porta 8001 está livre
lsof -i :8001

# Reinstalar dependências
pip install -r requirements.txt --force-reinstall
```

### Frontend não conecta no backend
1. Verifique se `REACT_APP_BACKEND_URL` está correto no `.env`
2. Certifique-se que o backend está rodando
3. Verifique CORS no backend

### Banco de dados corrompido
```bash
# Deletar e recriar
rm backend/heasy_mc.db
# Reinicie o backend - será recriado automaticamente
```

## 📚 Comandos Úteis

### Ver dados do banco
```bash
cd backend
python3 -c "import sqlite3; conn = sqlite3.connect('heasy_mc.db'); cursor = conn.cursor(); cursor.execute('SELECT * FROM players'); print(cursor.fetchall())"
```

### Resetar banco completamente
```bash
rm backend/heasy_mc.db
# Reinicie o backend
```

### Atualizar dependências
```bash
# Backend
pip freeze > requirements.txt

# Frontend
yarn upgrade
```

## 🎯 Próximos Passos

- [ ] Trocar credenciais de admin padrão
- [ ] Adicionar seu link de contato nas configurações
- [ ] Começar a adicionar membros da equipe
- [ ] Personalizar cores dos cargos se necessário
- [ ] Fazer backup regular do `heasy_mc.db`

---

🎮 Bom uso e boa gestão da equipe do Heasy MC!
