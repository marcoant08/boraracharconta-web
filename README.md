# Divisão de Contas - Frontend

Frontend Next.js 14+ para aplicação de divisão de contas entre amigos.

## Tecnologias

- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- Zustand (gerenciamento de estado)
- Socket.io Client (WebSocket)
- React Hook Form + Zod (formulários e validação)
- Axios (requisições HTTP)
- React Hot Toast (notificações)

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure a variável de ambiente:
```bash
cp .env.local.example .env.local
```

Edite `.env.local` e configure:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Estrutura do Projeto

```
src/
├── app/                    # Páginas Next.js (App Router)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   └── bills/             # Páginas de contas
├── components/            # Componentes React
│   ├── auth/              # Componentes de autenticação
│   ├── bills/             # Componentes de contas
│   └── ui/                # Componentes UI reutilizáveis
├── hooks/                 # Hooks customizados
├── services/              # Serviços de API
├── store/                 # Stores Zustand
├── types/                 # Tipos TypeScript
└── utils/                 # Utilitários
```

## Funcionalidades

- ✅ Autenticação (login, registro, verificação de email)
- ✅ Criação de contas
- ✅ Entrada por código
- ✅ Gerenciamento de participantes
- ✅ Gerenciamento de itens
- ✅ Marcação de consumos
- ✅ Cálculo automático de divisão
- ✅ Atualizações em tempo real via WebSocket
- ✅ Interface responsiva

## Scripts

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linter

## Notas

- O token JWT é armazenado no localStorage
- O mesmo token é usado para autenticação HTTP e WebSocket
- Visitantes têm `userId === name`
- Apenas participantes verificados (`userId !== name`) podem gerenciar itens e consumos
