import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

test(
  "lista, prezent i rezerwacja przetrwają restart serwera",
  { timeout: 30000 },
  async () => {
    const dir = mkdtempSync(tmpdir() + "/lista-restart-");
    let child: ChildProcess | undefined;
    const base = "http://127.0.0.1:3109";
    const call = async (path: string, method = "GET", body?: unknown) => {
      const r = await fetch(base + "/api/" + path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      assert.equal(r.status, 200);
      return r.json();
    };
    async function start() {
      child = spawn(
        process.execPath,
        [
          "node_modules/next/dist/bin/next",
          "start",
          "-p",
          "3109",
          "-H",
          "127.0.0.1",
        ],
        {
          env: { ...process.env, DATABASE_PATH: dir + "/test.sqlite" },
          stdio: "ignore",
        },
      );
      for (let i = 0; i < 80; i++) {
        try {
          if ((await fetch(base)).ok) return;
        } catch {}
        await new Promise((r) => setTimeout(r, 100));
      }
      throw new Error("Serwer nie uruchomił się.");
    }
    async function stop() {
      if (child && child.exitCode === null) {
        const exited = once(child, "exit");
        child.kill("SIGTERM");
        await exited;
      }
    }
    try {
      await start();
      const l = await call("lists", "POST", {
        title: "Po restarcie",
        occasion: "Narodziny",
        date: "",
        message: "",
      });
      await call("owner/" + l.owner + "/gifts", "POST", {
        name: "Kocyk",
        url: "",
        image: "",
        price: 99,
        notes: "",
        priority: "Miło mieć",
      });
      const list = await call("public/" + l.id);
      const r = await call("reserve/" + list.gifts[0].id, "POST", {
        name: "Anna",
      });
      await call("reservation/" + r.token, "PATCH", { status: "purchased" });
      await stop();
      await start();
      const restored = await call("public/" + l.id);
      assert.equal(restored.title, "Po restarcie");
      assert.equal(restored.gifts[0].name, "Kocyk");
      assert.equal(restored.gifts[0].status, "purchased");
      assert.equal((await call("reservation/" + r.token)).guest_name, "Anna");
      assert.equal((await call("owner/" + l.owner)).id, l.id);
    } finally {
      await stop();
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
