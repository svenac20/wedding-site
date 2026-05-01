import fs from "node:fs";
import path from "node:path";
import mariadb from "mariadb";

const connStr = process.env.DB_URL || process.argv[2];
if (!connStr) {
  console.error("Usage: node scripts/import-guests-local.mjs <mysql-url>");
  process.exit(1);
}

const url = new URL(connStr);
const csvPath = path.resolve("wedding-list.csv");
const text = fs.readFileSync(csvPath, "utf8");

function parseCSV(input) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parseCSV(text).filter(r => r.length > 0 && (r[0] || r[1]));
rows.shift();

const guests = rows.map(r => ({
  name: (r[0] || "").trim(),
  surname: (r[1] || "").trim(),
  guestOf: (r[2] || "").trim().toUpperCase(),
}));

const invalid = guests.filter(g => g.guestOf !== "SVEN" && g.guestOf !== "TINA");
if (invalid.length) {
  console.error("Invalid guestOf for rows:", invalid);
  process.exit(1);
}

const pool = mariadb.createPool({
  host: url.hostname,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  port: Number(url.port) || 3306,
  connectionLimit: 1,
  allowPublicKeyRetrieval: true,
});

const conn = await pool.getConnection();
try {
  const values = guests.map(g => [g.name, g.surname, g.guestOf]);
  const sql = "INSERT INTO `Guest` (`name`, `surname`, `guestOf`) VALUES " +
    values.map(() => "(?, ?, ?)").join(", ");
  const res = await conn.query(sql, values.flat());
  console.log("Inserted:", res.affectedRows);
} finally {
  conn.release();
  await pool.end();
}
