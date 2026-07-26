import { DatabaseSync, StatementSync } from "node:sqlite";

/**
 * Adapter yang meniru API better-sqlite3 menggunakan SQLite bawaan Node.js
 * (node:sqlite). Node.js 22.5+ menyertakan SQLite secara native, sehingga
 * project tidak memerlukan build tools C++ untuk menjalankan database.
 */

class StatementAdapter {
  constructor(statement) {
    if (!(statement instanceof StatementSync)) {
      throw new TypeError("StatementAdapter menerima instance StatementSync");
    }
    this._stmt = statement;
  }

  run(...params) {
    const result = this._stmt.run(...params);
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid,
    };
  }

  get(...params) {
    return this._stmt.get(...params);
  }

  all(...params) {
    return this._stmt.all(...params);
  }

  *[Symbol.iterator](...params) {
    // StatementSync node:sqlite tidak punya iterator bawaan, jadi gunakan all()
    for (const row of this._stmt.all(...params)) {
      yield row;
    }
  }

  iterate(...params) {
    return this[Symbol.iterator](...params);
  }

  pluck(enabled = true) {
    // better-sqlite3 memiliki .pluck(). node:sqlite belum, jadi kita mock
    // dengan mengembalikan this agar chaining tidak error.
    return this;
  }

  get sourceSQL() {
    return this._stmt.sourceSQL;
  }
}

export class DatabaseAdapter {
  constructor(path) {
    this._db = new DatabaseSync(path);
  }

  prepare(sql) {
    return new StatementAdapter(this._db.prepare(sql));
  }

  exec(sql) {
    this._db.exec(sql);
  }

  pragma(sql) {
    // better-sqlite3: db.pragma("journal_mode = WAL")
    // node:sqlite: jalankan sebagai PRAGMA dan ambil nilai
    const match = sql.match(/^(\w+)\s*=\s*(.+)$/);
    if (match) {
      const name = match[1];
      const value = match[2].trim().replace(/^['"]|['"]$/g, "");
      this._db.exec(`PRAGMA ${name} = ${value}`);
      return [{ [name]: value }];
    }
    const stmt = this._db.prepare(`PRAGMA ${sql}`);
    const result = stmt.get();
    return result ? [result] : [];
  }

  close() {
    this._db.close();
  }

  transaction(fn) {
    // better-sqlite3: db.transaction(fn)(). Jalankan manual BEGIN/COMMIT/ROLLBACK.
    return (...args) => {
      this._db.exec("BEGIN");
      try {
        const result = fn(...args);
        this._db.exec("COMMIT");
        return result;
      } catch (err) {
        this._db.exec("ROLLBACK");
        throw err;
      }
    };
  }
}

export default { DatabaseAdapter };
