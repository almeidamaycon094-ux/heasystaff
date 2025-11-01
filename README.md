# Heasy MC - Site da Equipe

🎮 Site para gerenciamento da equipe do servidor de Minecraft Heasy MC

## 📋 Descrição

Sistema web para exibir e gerenciar a equipe (staff) do servidor, com diferentes cargos, status e descrições personalizadas. Basicamente uma "planilha visual" bonita!

## ✨ Funcionalidades

- **Página Principal**: Exibição pública dos membros da equipe organizados por cargo
- **Painel Admin** (`/admin`): Gerenciamento completo de players, cargos e configurações
- **Status Automático**: Ordenação por Ativo (verde) → Pendente (amarelo) → Inativo (vermelho)
- **Avatares Minecraft**: Busca automática das skins dos players via API mc-heads.net
- **Design Parallax**: Tema roxo e azul com efeitos visuais modernos
- **SQLite**: Banco de dados local, sem necessidade de servidor externo

## 🚀 Como Rodar

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- Yarn

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/heasy-mc-site.git
cd heasy-mc-site
```

2. **Backend (FastAPI)**
```bash
cd backend
pip install -r requirements.txt
```

3. **Frontend (React)**
```bash
cd frontend
yarn install
```

### Executar

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

O site estará disponível em `http://localhost:3000`

## 🔐 Acesso Admin

- **URL**: `http://localhost:3000/admin`
- **Email**: `japonegro296@gmail.com`
- **Senha**: `@Maycon2023`

## 💾 Banco de Dados

Utiliza **SQLite** (arquivo local `backend/heasy_mc.db`). 

- ✅ Criado automaticamente na primeira execução
- ✅ Sem necessidade de configurar servidor de banco de dados
- ✅ Todos os dados ficam salvos localmente
- ✅ Para resetar: delete o arquivo `.db` e reinicie o servidor

### Estrutura:
- `admins`: Credenciais de acesso ao painel
- `roles`: Cargos da equipe (CEO, Admin, Moderador, etc)
- `players`: Membros da equipe com suas informações
- `settings`: Configurações gerais (link de contato)

## 🎨 Cargos Padrão

1. **CEO** - Roxo Escuro (#9333EA)
2. **Admin** - Roxo (#A855F7)
3. **Moderador** - Azul (#3B82F6)
4. **Suporte** - Ciano (#06B6D4)
5. **Estagiário** - Amarelo (#EAB308)
6. **Builder** - Laranja (#F97316)

## 📂 Estrutura do Projeto

```
.
├── backend/
│   ├── server.py          # API FastAPI com SQLite
│   ├── heasy_mc.db        # Banco de dados (criado automaticamente)
│   ├── requirements.txt   # Dependências Python
│   └── .env              # Configurações (JWT_SECRET)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js          # Página principal pública
│   │   │   └── AdminPanel.js    # Painel administrativo
│   │   ├── components/ui/       # Componentes Shadcn UI
│   │   └── App.js
│   ├── package.json
│   └── .env              # REACT_APP_BACKEND_URL
├── .gitignore
└── README.md
```

## 🛠️ Stack Tecnológico

### Backend
- **FastAPI**: Framework web Python moderno e rápido
- **SQLite**: Banco de dados relacional local
- **JWT**: Autenticação via JSON Web Tokens
- **bcrypt**: Hash seguro de senhas
- **Pydantic**: Validação de dados

### Frontend
- **React 19**: Biblioteca JavaScript para UI
- **React Router**: Navegação entre páginas
- **Tailwind CSS**: Framework CSS utility-first
- **Shadcn UI**: Componentes React acessíveis e estilizados
- **Axios**: Cliente HTTP para chamadas à API
- **Sonner**: Sistema de notificações toast

### Integrações
- **mc-heads.net API**: Avatares dos players do Minecraft

## 🎯 Funcionalidades do Admin

### Gerenciamento de Players
- ✅ Criar novo player (username do Minecraft)
- ✅ Atribuir cargo
- ✅ Definir status (Ativo/Pendente/Inativo)
- ✅ Adicionar descrição personalizada
- ✅ Editar informações
- ✅ Remover da equipe

### Gerenciamento de Cargos
- ✅ Criar novos cargos
- ✅ Definir cor personalizada (hex)
- ✅ Ordenar hierarquia de exibição
- ✅ Editar e remover cargos

### Configurações
- ✅ Link de contato configurável (Discord, Instagram, etc)

## 📸 Screenshots

### Página Principal
- Hero section com logo animada e efeito parallax
- Equipe organizada por cargos com cores distintas
- Status visual com indicadores coloridos
- Design moderno e responsivo

### Painel Admin
- Interface intuitiva para gerenciamento
- Tabs organizadas (Players, Cargos, Configurações)
- Modais para criação e edição
- Sistema de autenticação seguro

## 🔒 Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Autenticação JWT com expiração
- ✅ Rotas protegidas no backend
- ✅ Validação de dados com Pydantic

## 📝 Notas Importantes

- O arquivo `heasy_mc.db` é criado automaticamente na primeira execução
- Não faça commit do arquivo `.db` no Git (já está no `.gitignore`)
- Altere as credenciais de admin em produção
- O banco SQLite é ideal para uso local/pequeno porte
- Para produção em larga escala, considere PostgreSQL/MySQL

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📄 Licença

MIT License - Sinta-se livre para usar este projeto!

## 👨‍💻 Desenvolvido por

**Maycon** - Heasy MC Team

---

⭐ Se gostou do projeto, deixe uma estrela no GitHub!