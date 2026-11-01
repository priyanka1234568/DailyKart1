import fs from "fs"
import mysql from "mysql2/promise"

const env = {}
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue
  const i = line.indexOf("=")
  if (i < 0) continue
  env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
}

const connection = await mysql.createConnection({
  host: env.MYSQL_HOST || "127.0.0.1",
  port: Number(env.MYSQL_PORT || 3306),
  user: env.MYSQL_USER || "root",
  password: env.MYSQL_PASSWORD ?? "",
  database: env.MYSQL_DATABASE || "dailykart",
})

const [cols] = await connection.query(
  "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'",
)
const names = new Set(cols.map((row) => row.COLUMN_NAME))

if (!names.has("minimum_stock")) {
  await connection.query("ALTER TABLE products ADD COLUMN minimum_stock INT NOT NULL DEFAULT 10 AFTER quantity")
  console.log("added minimum_stock")
} else {
  console.log("minimum_stock already exists")
}

if (!names.has("expiry_date")) {
  await connection.query("ALTER TABLE products ADD COLUMN expiry_date DATE NULL AFTER minimum_stock")
  console.log("added expiry_date")
} else {
  console.log("expiry_date already exists")
}

const [cols2] = await connection.query(
  "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'",
)
console.log("columns=" + cols2.map((row) => row.COLUMN_NAME).join(","))
await connection.end()
