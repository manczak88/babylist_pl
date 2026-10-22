import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
const directory = mkdtempSync(tmpdir() + "/lista-test-");
process.env.DATABASE_PATH = directory + "/test.sqlite";
const {
  db,
  createList,
  addGift,
  publicList,
  ownerList,
  reserve,
  reservation,
  giftSchema,
} = await import("../src/lib/db");
const input = {
  title: "Nasza lista",
  occasion: "Narodziny",
  date: "",
  message: "",
};
test("rezerwacja jest unikalna, prywatne dane nie trafiają do widoku publicznego", () => {
  const l = createList(input);
  addGift(l.owner, {
    name: "Śpiworek",
    url: "",
    image: "",
    price: 99,
    notes: "",
    priority: "Miło mieć",
  });
  const g = publicList(l.id).gifts[0] as any;
  const r = reserve(g.id, "Anna");
  assert.throws(() => reserve(g.id, "Jan"), /Ktoś już/);
  assert.equal((reservation(r.token) as any).guest_name, "Anna");
  const view = JSON.stringify(publicList(l.id));
  assert.ok(!view.includes(l.owner));
  assert.ok(!view.includes(r.token));
  assert.ok(!view.includes("Anna"));
  assert.equal(publicList(l.id).gifts[0].status, "reserved");
});
test("publiczny identyfikator nie uprawnia do zarządzania", () => {
  const l = createList(input);
  assert.throws(() => ownerList(l.id));
  assert.throws(() => addGift(l.id, {}));
  assert.throws(() => reservation(l.id));
});
test("niebezpieczne linki są odrzucane", () => {
  assert.throws(() =>
    giftSchema.parse({
      name: "Test",
      url: "javascript:alert(1)",
      image: "",
      price: "",
      notes: "",
      priority: "Miło mieć",
    }),
  );
});
test("plik bazy zachowuje dane po zamknięciu i otwarciu w nowym procesie", () => {
  const l = createList(input);
  db.close();
  const out = execFileSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      `import { publicList } from './src/lib/db.ts'; process.stdout.write(publicList('${l.id}').title)`,
    ],
    { env: { ...process.env }, encoding: "utf8" },
  );
  assert.equal(out, "Nasza lista");
  rmSync(directory, { recursive: true, force: true });
});
