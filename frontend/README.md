# Frontend - Sistema de Reservas de Salas

Frontend em React para consumir o backend do projeto de reservas de salas:
[miguelPRG/WebServices](https://github.com/miguelPRG/WebServices).

O objetivo desta aplicação e oferecer uma base moderna para:
- visualizar dados de salas e reservas;
- criar novas reservas com validacao de formulario;
- manter uma arquitetura simples para crescer com novas features.

## Stack utilizada

- React + Vite (SWC)
- React Compiler (via plugin Babel)
- Tailwind CSS
- shadcn/ui (base e convencoes)
- Zod + React Hook Form
- Zustand
- React Router
- React Toastify

## Requisitos

- Node.js 20+
- npm 10+

## Como executar

1. Instalar dependencias:

```bash
npm install
```

2. Criar variavel de ambiente:

```bash
cp .env.example .env
```

3. Iniciar ambiente de desenvolvimento:

```bash
npm run dev
```

4. Build de producao:

```bash
npm run build
```

5. Preview da build:

```bash
npm run preview
```

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8000
```

`VITE_API_URL` e usada em `src/lib/api.ts` para apontar para o backend.

## Organizacao do projeto

```text
src/
  components/
    layout/        # estrutura visual base da app (casca/layout)
    ui/            # componentes de UI reutilizaveis (padrao shadcn)
  hooks/           # hooks customizados por feature
  lib/             # utilitarios e acesso a API
  pages/           # paginas mapeadas pelas rotas
  routes/          # configuracao central de roteamento
  store/           # estado global com Zustand
  types/           # tipos de dominio (Room, Reservation, etc.)
  index.css        # tokens de tema e estilos globais (Tailwind)
  main.tsx         # ponto de entrada da aplicacao
```

### Detalhe por pasta

- `src/components/layout`
  - define o shell da aplicacao (header e container principal).

- `src/components/ui`
  - componentes base (`Button`, `Input`, `Card`) seguindo estilo de composicao do shadcn.

- `src/hooks`
  - encapsula efeitos e carregamentos recorrentes (ex.: bootstrap do dashboard).

- `src/lib`
  - `api.ts`: cliente HTTP para endpoints do backend.
  - `utils.ts`: helper `cn()` para composicao de classes Tailwind.

- `src/pages`
  - telas de alto nivel (dashboard e formulario de nova reserva).

- `src/routes`
  - declaracao das rotas da aplicacao com `react-router-dom`.

- `src/store`
  - gerenciamento de estado global da feature de reservas.

- `src/types`
  - contratos de tipos do dominio.

## Tema e design system

- Estilo feito com **Tailwind CSS + tokens CSS** em `src/index.css`.
- Tema escuro aplicado por classe `dark` no documento.
- Paleta principal em **azul institucional**, adequada ao contexto academico/administrativo de reservas.
- Componentes UI seguem base compatível com o ecossistema do **shadcn/ui**.

## Dependencias e para que servem

### Dependencias de runtime (`dependencies`)

- `react`
  - biblioteca base para construir a interface declarativa.

- `react-dom`
  - renderiza a aplicacao React no DOM do browser.

- `react-router-dom`
  - roteamento client-side entre paginas (`/` e `/reservations/new`).

- `zustand`
  - gerenciamento de estado global simples para salas/reservas.

- `react-hook-form`
  - controle performatico de formularios.

- `zod`
  - schema e validacao de dados em runtime.

- `@hookform/resolvers`
  - integra validacao do Zod ao React Hook Form.

- `react-toastify`
  - toasts de feedback (sucesso/erro) para acoes de API.

- `lucide-react`
  - biblioteca de icones em componentes React.

- `clsx`
  - composicao condicional de classes CSS.

- `tailwind-merge`
  - resolve conflitos de classes Tailwind ao combinar strings.

- `class-variance-authority`
  - cria variantes tipadas para componentes de UI (ex.: `Button`).

### Dependencias de desenvolvimento (`devDependencies`)

- `vite`
  - bundler/dev server da aplicacao.

- `@vitejs/plugin-react-swc`
  - suporte a React no Vite usando SWC para transformacoes rapidas.

- `typescript`
  - tipagem estatica e seguranca durante o desenvolvimento.

- `@types/react`
  - tipos TypeScript do React.

- `@types/react-dom`
  - tipos TypeScript do React DOM.

- `tailwindcss`
  - framework utility-first para estilos.

- `@tailwindcss/vite`
  - integracao oficial do Tailwind com Vite.

- `autoprefixer`
  - adiciona prefixos CSS automaticamente para compatibilidade de browser.

- `shadcn`
  - CLI/ecossistema para composicao de componentes de UI.

- `@babel/core`
  - motor Babel usado para executar o passo do React Compiler no build.

- `babel-plugin-react-compiler`
  - plugin do React Compiler para otimizacoes de componentes.

- `@types/babel__core`
  - tipos TypeScript para `@babel/core`.

## Scripts

- `npm run dev`
  - inicia servidor local de desenvolvimento.

- `npm run build`
  - executa checagem TypeScript e gera build de producao.

- `npm run preview`
  - sobe preview local da build gerada.

## Proximos passos sugeridos

- adicionar paginas de listagem de salas e usuarios;
- mapear status de reserva com badges visuais;
- melhorar UX do formulario com `select` dinamico para salas e usuarios;
- adicionar testes de componentes e fluxo de formulario.
