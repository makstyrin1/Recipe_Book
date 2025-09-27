const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "recipes",
  password: "M9188t9188",
  port: 5432,
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Ошибка подключения к PostgreSQL:", err.stack);
    process.exit(1);
  } else {
    console.log("✅ Подключено к PostgreSQL");
  }
});

app.get("/api/recipes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipes ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Ошибка:", err.message);
    res.status(500).json({ error: "Не удалось получить рецепты" });
  }
});

app.post("/api/recipes", async (req, res) => {
  const { title, ingredients, instructions, category } = req.body;

  if (!title || !ingredients || !instructions) {
    return res.status(400).json({ error: "Заполните все обязательные поля" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO recipes (title, ingredients, instructions, category) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, ingredients, instructions, category || "Без категории"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Ошибка:", err.message);
    res.status(500).json({ error: "Не удалось добавить рецепт" });
  }
});

app.get("/api/recipes/search", async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Параметр 'name' обязателен" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM recipes WHERE title ILIKE $1 ORDER BY id ASC",
      [`%${name}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Ошибка:", err.message);
    res.status(500).json({ error: "Ошибка поиска" });
  }
});

app.get("/api/recipes/category", async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ error: "Параметр 'category' обязателен" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM recipes WHERE category = $1 ORDER BY id ASC",
      [category]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Ошибка:", err.message);
    res.status(500).json({ error: "Ошибка фильтрации" });
  }
});

app.delete("/api/recipes/:id", async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID должен быть числом" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM recipes WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Рецепт не найден" });
    }

    res.json({ message: "Рецепт успешно удалён", deleted: result.rows[0] });
  } catch (err) {
    console.error("❌ Ошибка:", err.message);
    res.status(500).json({ error: "Не удалось удалить рецепт" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${port}`);
});

// 🟢 Отдаём index.html по корневому пути
const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🟢 Отдаём статические файлы (CSS, JS и т.д.)
app.use(express.static(path.join(__dirname)));
