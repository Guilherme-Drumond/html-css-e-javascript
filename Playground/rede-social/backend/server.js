const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "database.sqlite");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function handleResult(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });

const ensureColumn = async (table, column, definition) => {
  const columns = await all(`PRAGMA table_info(${table})`);
  const exists = columns.some((col) => col.name === column);
  if (!exists) {
    await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

const isAdminRequest = async (req) => {
  const adminId = req.query.admin_id || req.headers["x-admin-id"];
  if (!adminId) {
    return false;
  }
  const adminUser = await get("SELECT * FROM users WHERE id = ?", [adminId]);
  return adminUser?.is_admin === 1;
};

const getUserFromRequest = async (req) => {
  const userId = req.query.user_id || req.headers["x-user-id"];
  if (!userId) {
    return null;
  }
  return get("SELECT * FROM users WHERE id = ?", [userId]);
};

async function seed() {
  await run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      password TEXT,
      is_admin INTEGER DEFAULT 0,
      is_blocked INTEGER DEFAULT 0
    )`
  );
  await ensureColumn("users", "password", "TEXT");
  await ensureColumn("users", "is_admin", "INTEGER DEFAULT 0");
  await ensureColumn("users", "is_blocked", "INTEGER DEFAULT 0");
  await run(
    `CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      caption TEXT NOT NULL,
      image_url TEXT,
      likes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      text TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_type TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  const users = await all("SELECT * FROM users LIMIT 1");
  if (users.length === 0) {
    const seedUsers = [
      {
        username: "admin",
        name: "Administrador",
        avatar: "AD",
        password: "admin123",
        is_admin: 1
      },
      { username: "aline", name: "Aline Duarte", avatar: "AL" },
      { username: "moraes", name: "Bruno Moraes", avatar: "MO" },
      { username: "rafa", name: "Rafa Silva", avatar: "RA" },
      { username: "leticia", name: "Letícia Souza", avatar: "LE" },
      { username: "caique", name: "Caique Mendes", avatar: "CA" }
    ];

    for (const user of seedUsers) {
      await run(
        "INSERT INTO users (username, name, avatar, password, is_admin) VALUES (?, ?, ?, ?, ?)",
        [
          user.username,
          user.name,
          user.avatar,
          user.password || "123456",
          user.is_admin || 0
        ]
      );
    }

    await run(
      "INSERT INTO posts (user_id, caption, image_url, likes) VALUES (?, ?, ?, ?)",
      [2, "Sol de fim de tarde com vista incrível. #vida #paisagem", "gradient-1", 1284]
    );
    await run(
      "INSERT INTO posts (user_id, caption, image_url, likes) VALUES (?, ?, ?, ?)",
      [3, "Café, laptop e ideias novas para o projeto de hoje.", "gradient-2", 980]
    );
    await run(
      "INSERT INTO stories (user_id, text, image_url) VALUES (?, ?, ?)",
      [2, "Tarde leve", "gradient-1"]
    );
    await run(
      "INSERT INTO stories (user_id, text, image_url) VALUES (?, ?, ?)",
      [3, "Trabalho em dia", "gradient-2"]
    );
  }
}

app.get("/api/users", async (_req, res) => {
  try {
    const users = await all(
      "SELECT id, username, name, avatar, is_admin, is_blocked FROM users ORDER BY id"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/users", async (req, res) => {
  const { username, name, avatar, is_admin, password } = req.body;
  if (!username || !name || !password) {
    res.status(400).json({ error: "username, name e password são obrigatórios" });
    return;
  }
  try {
    const canSetAdmin = is_admin && (await isAdminRequest(req));
    const result = await run(
      "INSERT INTO users (username, name, avatar, password, is_admin) VALUES (?, ?, ?, ?, ?)",
      [
        username,
        name,
        avatar || username.slice(0, 2).toUpperCase(),
        password,
        canSetAdmin ? 1 : 0
      ]
    );
    const user = await get("SELECT * FROM users WHERE id = ?", [result.id]);
    res
      .status(201)
      .json({
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        is_admin: user.is_admin,
        is_blocked: user.is_blocked
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const requester = await getUserFromRequest(req);
    if (!requester || Number(requester.id) !== Number(req.params.id)) {
      res.status(403).json({ error: "Acesso negado" });
      return;
    }
    const user = await get(
      "SELECT id, username, name, avatar, is_admin, is_blocked FROM users WHERE id = ?",
      [req.params.id]
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/users/:id", async (req, res) => {
  try {
    const requester = await getUserFromRequest(req);
    if (!requester || Number(requester.id) !== Number(req.params.id)) {
      res.status(403).json({ error: "Acesso negado" });
      return;
    }
    const { name, avatar, password } = req.body;
    await run(
      "UPDATE users SET name = ?, avatar = ?, password = ? WHERE id = ?",
      [
        name || requester.name,
        avatar || requester.avatar,
        password || requester.password,
        req.params.id
      ]
    );
    const user = await get(
      "SELECT id, username, name, avatar, is_admin, is_blocked FROM users WHERE id = ?",
      [req.params.id]
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/users/:id/self", async (req, res) => {
  try {
    const requester = await getUserFromRequest(req);
    if (!requester || Number(requester.id) !== Number(req.params.id)) {
      res.status(403).json({ error: "Acesso negado" });
      return;
    }
    const result = await run("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    if (!(await isAdminRequest(req))) {
      res.status(403).json({ error: "Apenas administradores podem excluir usuários" });
      return;
    }
    const result = await run("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/users/:id/block", async (req, res) => {
  try {
    if (!(await isAdminRequest(req))) {
      res.status(403).json({ error: "Apenas administradores podem bloquear usuários" });
      return;
    }
    const result = await run("UPDATE users SET is_blocked = 1 WHERE id = ?", [
      req.params.id
    ]);
    res.json({ blocked: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/users/:id/unblock", async (req, res) => {
  try {
    if (!(await isAdminRequest(req))) {
      res.status(403).json({ error: "Apenas administradores podem desbloquear usuários" });
      return;
    }
    const result = await run("UPDATE users SET is_blocked = 0 WHERE id = ?", [
      req.params.id
    ]);
    res.json({ unblocked: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/posts", async (_req, res) => {
  try {
    const posts = await all(
      `SELECT posts.*, users.username, users.avatar
       FROM posts
       JOIN users ON posts.user_id = users.id
       WHERE users.is_blocked = 0
       ORDER BY posts.created_at DESC`
    );
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/posts", async (req, res) => {
  const { user_id, caption, image_url } = req.body;
  if (!user_id || !caption) {
    res.status(400).json({ error: "user_id e caption são obrigatórios" });
    return;
  }
  try {
    const result = await run(
      "INSERT INTO posts (user_id, caption, image_url) VALUES (?, ?, ?)",
      [user_id, caption, image_url || "gradient-1"]
    );
    const post = await get("SELECT * FROM posts WHERE id = ?", [result.id]);
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  try {
    if (!(await isAdminRequest(req))) {
      res.status(403).json({ error: "Apenas administradores podem remover posts" });
      return;
    }
    const result = await run("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stories", async (_req, res) => {
  try {
    const stories = await all(
      `SELECT stories.*, users.username, users.avatar
       FROM stories
       JOIN users ON stories.user_id = users.id
       WHERE users.is_blocked = 0
       ORDER BY stories.created_at DESC`
    );
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/stories", async (req, res) => {
  const { user_id, text, image_url } = req.body;
  if (!user_id) {
    res.status(400).json({ error: "user_id é obrigatório" });
    return;
  }
  try {
    const result = await run(
      "INSERT INTO stories (user_id, text, image_url) VALUES (?, ?, ?)",
      [user_id, text || "", image_url || "gradient-1"]
    );
    const story = await get("SELECT * FROM stories WHERE id = ?", [result.id]);
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/stories/:id", async (req, res) => {
  try {
    if (!(await isAdminRequest(req))) {
      res.status(403).json({ error: "Apenas administradores podem remover stories" });
      return;
    }
    const result = await run("DELETE FROM stories WHERE id = ?", [req.params.id]);
    res.json({ deleted: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "username e password são obrigatórios" });
    return;
  }
  try {
    const user = await get(
      "SELECT id, username, name, avatar, is_admin, is_blocked FROM users WHERE username = ? AND password = ?",
      [username, password]
    );
    if (!user) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }
    if (user.is_blocked) {
      res.status(403).json({ error: "Usuário bloqueado" });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { username, name, avatar, password } = req.body;
  if (!username || !name || !password) {
    res.status(400).json({ error: "username, name e password são obrigatórios" });
    return;
  }
  try {
    const result = await run(
      "INSERT INTO users (username, name, avatar, password, is_admin) VALUES (?, ?, ?, ?, 0)",
      [username, name, avatar || username.slice(0, 2).toUpperCase(), password]
    );
    const user = await get(
      "SELECT id, username, name, avatar, is_admin, is_blocked FROM users WHERE id = ?",
      [result.id]
    );
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/reports", async (req, res) => {
  const { target_type, target_id, reason } = req.body;
  if (!target_type || !target_id || !reason) {
    res.status(400).json({ error: "target_type, target_id e reason são obrigatórios" });
    return;
  }
  try {
    const result = await run(
      "INSERT INTO reports (target_type, target_id, reason) VALUES (?, ?, ?)",
      [target_type, target_id, reason]
    );
    const report = await get("SELECT * FROM reports WHERE id = ?", [result.id]);
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/reports", async (req, res) => {
  try {
    if (!(await isAdminRequest(req))) {
      res.status(403).json({ error: "Apenas administradores podem ver denúncias" });
      return;
    }
    const reports = await all("SELECT * FROM reports ORDER BY created_at DESC");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/reports/:id/resolve", async (req, res) => {
  try {
    if (!(await isAdminRequest(req))) {
      res.status(403).json({ error: "Apenas administradores podem resolver denúncias" });
      return;
    }
    const result = await run("UPDATE reports SET status = 'resolved' WHERE id = ?", [
      req.params.id
    ]);
    res.json({ resolved: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/feed", async (_req, res) => {
  try {
    const currentUser = await get(
      "SELECT * FROM users WHERE is_admin = 0 AND is_blocked = 0 ORDER BY id LIMIT 1"
    );
    const posts = await all(
      `SELECT posts.*, users.username, users.avatar
       FROM posts
       JOIN users ON posts.user_id = users.id
       WHERE users.is_blocked = 0
       ORDER BY posts.created_at DESC`
    );
    const stories = await all(
      `SELECT stories.*, users.username, users.avatar
       FROM stories
       JOIN users ON stories.user_id = users.id
       WHERE users.is_blocked = 0
       ORDER BY stories.created_at DESC`
    );
    const suggestions = await all(
      "SELECT * FROM users WHERE id != ? AND is_admin = 0 AND is_blocked = 0 ORDER BY id LIMIT 3",
      [currentUser?.id || 0]
    );
    res.json({ currentUser, posts, stories, suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

seed().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
  });
});
