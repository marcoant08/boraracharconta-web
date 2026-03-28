# Divisão de Contas - Frontend

Frontend Next.js 14+ para aplicação de divisão de contas entre amigos.

## Tecnologias

- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- Zustand (gerenciamento de estado)
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

Opcional — intervalo do polling da conta no ecrã de detalhe (em milissegundos, entre 2000 e 5000; predefinido 3500):
```
NEXT_PUBLIC_BILL_POLL_INTERVAL_MS=3500
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

- Autenticação (login, registro, verificação de email)
- Criação de contas
- Entrada por código
- Gerenciamento de participantes
- Gerenciamento de itens
- Marcação de consumos
- Cálculo automático de divisão
- Sincronização com o backend via REST: após mutações é feito refetch de `GET /bills/:id`; com o ecrã da conta aberto, há polling periódico (e pausa quando a aba está em segundo plano)
- Interface responsiva

## Scripts

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linter

## Notas

- O token JWT é armazenado no `localStorage` e enviado em todas as rotas protegidas como `Authorization: Bearer <token>`.
- Visitantes podem ter `userId` igual ao `name` ou apenas `name` como identificador resolvido nas chamadas à API.
- Apenas participantes verificados (`userId` definido e diferente de `name`) podem gerenciar itens e consumos, conforme regras da API.
