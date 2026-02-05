# Backend da Rede Social

Este backend usa **Node.js + Express + SQLite** para armazenar usuários, posts e stories.

## Como rodar

```bash
cd Playground/rede-social/backend
npm install
npm start
```

O servidor inicia em `http://localhost:3000` e serve o front-end em `http://localhost:3000/index.html`.

## Usuário administrador

Na primeira execução é criado o usuário `admin` com permissões de administrador. Para rotas administrativas, envie o parâmetro `admin_id` ou o header `x-admin-id` com o ID desse usuário.

## Autenticação básica

Este projeto usa autenticação simples por usuário/senha (sem token). O front-end armazena o usuário no `localStorage` e envia o ID em `user_id` para operações de perfil.

## Endpoints principais

### Usuários
- `GET /api/users`
- `POST /api/users` `{ "username": "ana", "name": "Ana Lima", "avatar": "AN", "password": "123456" }`
- `DELETE /api/users/:id`
- `PATCH /api/users/:id/block?admin_id=1`
- `PATCH /api/users/:id/unblock?admin_id=1`
- `GET /api/users/:id?user_id=1`
- `PATCH /api/users/:id?user_id=1`
- `DELETE /api/users/:id/self?user_id=1`

### Login/Cadastro
- `POST /api/auth/login` `{ "username": "ana", "password": "123456" }`
- `POST /api/auth/register` `{ "username": "ana", "name": "Ana Lima", "avatar": "AN", "password": "123456" }`

### Posts
- `GET /api/posts`
- `POST /api/posts` `{ "user_id": 1, "caption": "Meu post", "image_url": "gradient-1" }`
- `DELETE /api/posts/:id?admin_id=1`

### Stories
- `GET /api/stories`
- `POST /api/stories` `{ "user_id": 1, "text": "Bom dia!", "image_url": "gradient-2" }`
- `DELETE /api/stories/:id?admin_id=1`

### Moderação
- `POST /api/reports` `{ "target_type": "post", "target_id": 1, "reason": "Conteúdo indevido" }`
- `GET /api/reports?admin_id=1`
- `PATCH /api/reports/:id/resolve?admin_id=1`

### Feed completo
- `GET /api/feed`
