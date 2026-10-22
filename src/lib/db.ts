import Database from "better-sqlite3";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { z } from "zod";
z.config(z.locales.pl());
const path = process.env.DATABASE_PATH || "./data/lista.sqlite";
mkdirSync(dirname(path), { recursive: true });
export const db = new Database(path);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");
db.exec(`CREATE TABLE IF NOT EXISTS lists(id TEXT PRIMARY KEY, owner TEXT UNIQUE NOT NULL,title TEXT NOT NULL,occasion TEXT NOT NULL,date TEXT,message TEXT, demo INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS gifts(id TEXT PRIMARY KEY,list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,name TEXT NOT NULL,url TEXT,image TEXT,price REAL,notes TEXT,priority TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS reservations(gift_id TEXT PRIMARY KEY REFERENCES gifts(id) ON DELETE CASCADE,token TEXT UNIQUE NOT NULL,name TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'reserved');`);
export const occasions = [
  "Narodziny",
  "Baby shower",
  "Chrzciny",
  "Roczek",
  "Urodziny",
  "Inna okazja",
] as const;
const short = z.string().trim().max(200);
const link = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (v) =>
      !v ||
      (() => {
        try {
          return ["http:", "https:"].includes(new URL(v).protocol);
        } catch {
          return false;
        }
      })(),
    "Podaj poprawny adres http lub https.",
  );
export const listSchema = z.object({
  title: short.min(1, "Podaj tytuł listy."),
  occasion: z.enum(occasions),
  date: z
    .string()
    .refine(
      (v) =>
        !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))),
      "Podaj poprawną datę.",
    ),
  message: z.string().trim().max(2000),
});
export const giftSchema = z.object({
  name: short.min(1, "Podaj nazwę prezentu."),
  url: link,
  image: link,
  price: z.union([
    z.literal(""),
    z.coerce.number().finite().min(0).max(1000000),
  ]),
  notes: z.string().trim().max(1000),
  priority: z.enum(["Najbardziej potrzebne", "Miło mieć"]),
});
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const token = () => randomBytes(32).toString("hex");
export function createList(input: unknown) {
  const v = listSchema.parse(input),
    id = token(),
    owner = token();
  db.prepare(
    "INSERT INTO lists(id,owner,title,occasion,date,message) VALUES(?,?,?,?,?,?)",
  ).run(id, owner, v.title, v.occasion, v.date, v.message);
  return { id, owner };
}
export function ownerList(key: string) {
  const l = db
    .prepare("SELECT * FROM lists WHERE owner=? AND demo=0")
    .get(key) as any;
  if (!l)
    throw new AppError(404, "Nie znaleziono listy. Sprawdź prywatny link.");
  return l;
}
export function publicList(id: string) {
  const l = db
    .prepare("SELECT id,title,occasion,date,message,demo FROM lists WHERE id=?")
    .get(id) as any;
  if (!l) throw new AppError(404, "Nie znaleziono listy. Sprawdź link.");
  return {
    ...l,
    gifts: db
      .prepare(
        `SELECT g.*,COALESCE(r.status,'available') status FROM gifts g LEFT JOIN reservations r ON g.id=r.gift_id WHERE list_id=? ORDER BY g.rowid`,
      )
      .all(id),
  };
}
export function addGift(key: string, input: unknown, id?: string) {
  const l = ownerList(key),
    v = giftSchema.parse(input);
  if (id) {
    const result = db
      .prepare(
        "UPDATE gifts SET name=?,url=?,image=?,price=?,notes=?,priority=? WHERE id=? AND list_id=?",
      )
      .run(
        v.name,
        v.url,
        v.image,
        v.price === "" ? null : v.price,
        v.notes,
        v.priority,
        id,
        l.id,
      );
    if (!result.changes) throw new AppError(404, "Nie znaleziono prezentu.");
  } else
    db.prepare("INSERT INTO gifts VALUES(?,?,?,?,?,?,?,?)").run(
      randomUUID(),
      l.id,
      v.name,
      v.url,
      v.image,
      v.price === "" ? null : v.price,
      v.notes,
      v.priority,
    );
}
export const reserve = db.transaction((id: string, name: unknown) => {
  const first = z
    .string()
    .trim()
    .min(1, "Podaj imię.")
    .max(60, "Imię może mieć do 60 znaków.")
    .parse(name);
  const g = db
    .prepare(
      "SELECT g.id,l.demo FROM gifts g JOIN lists l ON l.id=g.list_id WHERE g.id=?",
    )
    .get(id) as any;
  if (!g) throw new AppError(404, "Nie znaleziono prezentu.");
  if (g.demo)
    throw new AppError(
      403,
      "To lista pokazowa. Stwórz własną, aby rezerwować prezenty.",
    );
  if (db.prepare("SELECT 1 FROM reservations WHERE gift_id=?").get(id))
    throw new AppError(
      409,
      "Ktoś już zarezerwował ten prezent. Wybierz inny — lista została odświeżona.",
    );
  const key = token();
  db.prepare("INSERT INTO reservations(gift_id,token,name) VALUES(?,?,?)").run(
    id,
    key,
    first,
  );
  return { token: key };
}).immediate;
export function reservation(key: string) {
  const r = db
    .prepare(
      "SELECT r.name guest_name,r.status,g.*,l.title list_title FROM reservations r JOIN gifts g ON g.id=r.gift_id JOIN lists l ON l.id=g.list_id WHERE r.token=?",
    )
    .get(key);
  if (!r)
    throw new AppError(404, "Rezerwacja nie istnieje lub została anulowana.");
  return r;
}
db.transaction(() => {
  if (db.prepare("SELECT 1 FROM lists WHERE id=?").get("demo")) return;
  db.prepare("INSERT INTO lists VALUES(?,?,?,?,?,?,1)").run(
    "demo",
    token(),
    "Witaj na świecie, Zosiu!",
    "Narodziny",
    "2026-12-12",
    "Małe rzeczy na wielki początek. Dziękujemy, że jesteście z nami w tym wyjątkowym czasie! Ceny są wyłącznie przykładowe.",
  );
  [
    "Śpiworek do spania",
    "Mata edukacyjna",
    "Zestaw pieluszek muślinowych",
    "Lampka nocna",
    "Książeczka kontrastowa",
    "Plecak do wózka",
  ].forEach((name, i) => {
    const id = "demo-" + i;
    db.prepare("INSERT INTO gifts VALUES(?,?,?,?,?,?,?,?)").run(
      id,
      "demo",
      name,
      "",
      "",
      [189, 249, 79, 129, 39, 219][i],
      [
        "Rozmiar 0–6 miesięcy, spokojne kolory",
        "Miękka przestrzeń do odkrywania świata",
        "Delikatne, w naturalnych kolorach",
        "Ciepłe światło do wieczornego karmienia",
        "Na pierwsze wspólne czytanie",
        "Na małe i duże wyprawy",
      ][i],
      i < 3 ? "Najbardziej potrzebne" : "Miło mieć",
    );
    if (i === 1 || i === 3)
      db.prepare("INSERT INTO reservations VALUES(?,?,?,?)").run(
        id,
        token(),
        "Gość",
        i === 1 ? "reserved" : "purchased",
      );
  });
}).immediate();

export function updateList(key: string, input: unknown) {
  const l = ownerList(key),
    v = listSchema.parse(input);
  db.prepare(
    "UPDATE lists SET title=?,occasion=?,date=?,message=? WHERE id=?",
  ).run(v.title, v.occasion, v.date, v.message, l.id);
}
export function deleteGift(key: string, id: string) {
  const l = ownerList(key);
  if (
    !db.prepare("DELETE FROM gifts WHERE id=? AND list_id=?").run(id, l.id)
      .changes
  )
    throw new AppError(404, "Nie znaleziono prezentu.");
}
export function updateReservation(key: string, status: unknown) {
  reservation(key);
  if (status !== "reserved" && status !== "purchased")
    throw new AppError(400, "Niepoprawny status.");
  db.prepare("UPDATE reservations SET status=? WHERE token=?").run(status, key);
}
export function cancelReservation(key: string) {
  reservation(key);
  db.prepare("DELETE FROM reservations WHERE token=?").run(key);
}
