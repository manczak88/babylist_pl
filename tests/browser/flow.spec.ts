import { test, expect } from "@playwright/test";
test("pełny przepływ właściciela i gościa, konflikty i uprawnienia", async ({
  browser,
  page,
  request,
}) => {
  await page.goto("/nowa");
  await page.getByLabel("Tytuł listy").fill("Lista testowa");
  await page.getByRole("button", { name: "Stwórz listę" }).click();
  await expect(
    page.getByRole("heading", { name: "Lista testowa" }),
  ).toBeVisible();
  const owner = page.url().split("/").pop()!;
  await page
    .locator(".list-toolbar")
    .getByRole("button", { name: "Dodaj prezent" })
    .click();
  await page.getByLabel("Nazwa prezentu").fill("Kocyk");
  await page.getByRole("button", { name: "Zapisz prezent" }).click();
  await expect(
    page.getByRole("heading", { name: "Kocyk", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edytuj", exact: true }).click();
  await page.getByLabel("Nazwa prezentu").fill("Kocyk bawełniany");
  await page.getByRole("button", { name: "Zapisz prezent" }).click();
  await expect(
    page.getByRole("heading", { name: "Kocyk bawełniany" }),
  ).toBeVisible();
  const l = await (await request.get("/api/owner/" + owner)).json();
  const context = await browser.newContext();
  const guest = await context.newPage();
  await guest.goto("/lista/" + l.id);
  const secondContext = await browser.newContext();
  const secondGuest = await secondContext.newPage();
  await secondGuest.goto("/lista/" + l.id);
  await secondGuest.getByRole("button", { name: "Zarezerwuj prezent" }).click();
  await secondGuest.getByLabel("Twoje imię").fill("Jan");
  await guest.getByRole("button", { name: "Zarezerwuj prezent" }).click();
  await guest.getByLabel("Twoje imię").fill("Alicja");
  await guest.getByRole("button", { name: "Potwierdź rezerwację" }).click();
  await expect(guest.getByText("Prezent czeka na Ciebie!")).toBeVisible();
  const href = await guest
    .getByRole("link", { name: "Zarządzaj rezerwacją" })
    .getAttribute("href");
  await secondGuest
    .getByRole("button", { name: "Potwierdź rezerwację" })
    .click();
  await expect(
    secondGuest.getByRole("alert").filter({ hasText: "Ktoś już zarezerwował" }),
  ).toBeVisible();
  await expect(
    secondGuest.getByText("Ten prezent jest zarezerwowany"),
  ).toBeVisible();
  await secondContext.close();
  const conflict = await request.post("/api/reserve/" + l.gifts[0].id, {
    data: { name: "Jan" },
  });
  expect(conflict.status()).toBe(409);
  const denied = await request.post("/api/owner/" + l.id + "/gifts", {
    data: {},
  });
  expect(denied.status()).toBe(404);
  const pub = await (await request.get("/api/public/" + l.id)).json();
  expect(JSON.stringify(pub)).not.toContain("Alicja");
  expect(JSON.stringify(pub)).not.toContain(owner);
  await guest.goto(href!);
  await expect(guest.getByText("Alicja, dziękujemy!")).toBeVisible();
  await guest.getByRole("button", { name: "Oznacz jako kupiony" }).click();
  await expect(
    guest.getByRole("button", { name: "Cofnij oznaczenie zakupu" }),
  ).toBeVisible();
  await guest.getByRole("button", { name: "Cofnij oznaczenie zakupu" }).click();
  await expect(
    guest.getByRole("button", { name: "Oznacz jako kupiony" }),
  ).toBeVisible();
  await guest
    .getByRole("button", { name: "Anuluj rezerwację", exact: true })
    .click();
  await guest.getByRole("button", { name: "Tak, anuluj rezerwację" }).click();
  await expect(guest.getByText("Rezerwacja anulowana")).toBeVisible();
  const after = await (await request.get("/api/public/" + l.id)).json();
  expect(after.gifts[0].status).toBe("available");
  await context.close();
});
test("dwa jednoczesne żądania rezerwacji: jeden sukces", async ({
  request,
}) => {
  const l = await (
    await request.post("/api/lists", {
      data: { title: "Konflikt", occasion: "Narodziny", date: "", message: "" },
    })
  ).json();
  await request.post("/api/owner/" + l.owner + "/gifts", {
    data: {
      name: "Lampka",
      url: "",
      image: "",
      price: "",
      notes: "",
      priority: "Miło mieć",
    },
  });
  const pub = await (await request.get("/api/public/" + l.id)).json();
  const rs = await Promise.all([
    request.post("/api/reserve/" + pub.gifts[0].id, { data: { name: "Anna" } }),
    request.post("/api/reserve/" + pub.gifts[0].id, { data: { name: "Jan" } }),
  ]);
  expect(rs.map((r) => r.status()).sort()).toEqual([200, 409]);
  expect(
    (
      await request.patch("/api/owner/" + l.id, { data: { title: "Atak" } })
    ).status(),
  ).toBe(404);
  expect(
    (
      await request.patch("/api/reservation/" + l.id, {
        data: { status: "purchased" },
      })
    ).status(),
  ).toBe(404);
});
test("widok desktopowy i mobilny bez przewijania w poziomie", async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "Prezenty, których naprawdę potrzebujecie.",
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/landing-${width}.png`,
      fullPage: true,
    });
    await page.goto("/lista/demo");
    await expect(page.locator(".gift-card")).toHaveCount(6);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/demo-${width}.png`,
      fullPage: true,
    });
  }
});
