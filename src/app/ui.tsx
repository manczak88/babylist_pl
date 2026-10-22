"use client";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import {
  Heart,
  ArrowUpRight,
  ArrowRight,
  Check,
  Plus,
  Copy,
  Gift,
  Leaf,
  Menu,
  X,
  ExternalLink,
  LockKeyhole,
  Users,
  PackageCheck,
  ChevronRight,
} from "lucide-react";
type GiftType = {
  id: string;
  name: string;
  url: string;
  image: string;
  price: number | null;
  notes: string;
  priority: string;
  status: string;
};
type List = {
  id: string;
  title: string;
  occasion: string;
  date: string;
  message: string;
  demo: number;
  gifts: GiftType[];
};
const occasions = [
  "Narodziny",
  "Baby shower",
  "Chrzciny",
  "Roczek",
  "Urodziny",
  "Inna okazja",
];
const statuses: Record<string, string> = {
  available: "Dostępny",
  reserved: "Zarezerwowany",
  purchased: "Kupiony",
};
const blankList = { title: "", occasion: "Narodziny", date: "", message: "" };
const blankGift = {
  name: "",
  url: "",
  image: "",
  price: "",
  notes: "",
  priority: "Najbardziej potrzebne",
};
const money = (n: number) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(n);
async function api(url: string, method = "GET", body?: unknown) {
  const r = await fetch("/api/" + url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error);
  return data;
}
function Art({ name, index = 0 }: { name: string; index?: number }) {
  const icons = ["☾", "✳", "≋", "☀", "▤", "♧"];
  return (
    <div
      className={"art art-" + (index % 6)}
      aria-label={"Ilustracja: " + name}
    >
      <span className="art-circle" />
      <span className="art-shape">{icons[index % 6]}</span>
      <span className="art-caption">małe rzeczy, wielka radość</span>
    </div>
  );
}
function Picture({ gift, index }: { gift: GiftType; index: number }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [gift.image]);
  return gift.image && !failed ? (
    <div className="photo">
      <img
        src={gift.image}
        alt={gift.name}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
      />
    </div>
  ) : (
    <Art name={gift.name} index={index} />
  );
}
function Button({
  children,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className={"btn " + (p.className || "")}>
      {children}
    </button>
  );
}
function CopyLink({
  url,
  label = "Kopiuj link",
}: {
  url: string;
  label?: string;
}) {
  const [ok, setOk] = useState(false),
    [manual, setManual] = useState(false);
  return (
    <div>
      <Button
        type="button"
        className="secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setOk(true);
          } catch {
            setManual(true);
          }
        }}
      >
        <Copy size={16} />
        {ok ? "Skopiowano" : label}
      </Button>
      {manual && (
        <label>
          Skopiuj ten adres ręcznie
          <input readOnly value={url} onFocus={(e) => e.target.select()} />
        </label>
      )}
    </div>
  );
}
function ListFields({
  value,
  set,
}: {
  value: typeof blankList;
  set: (v: typeof blankList) => void;
}) {
  return (
    <>
      <label>
        Tytuł listy
        <input
          required
          maxLength={200}
          placeholder="np. Czekamy na naszą córeczkę"
          value={value.title}
          onChange={(e) => set({ ...value, title: e.target.value })}
        />
      </label>
      <div className="form-row">
        <label>
          Okazja
          <select
            value={value.occasion}
            onChange={(e) => set({ ...value, occasion: e.target.value })}
          >
            {occasions.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Data wydarzenia <small>(opcjonalnie)</small>
          <input
            type="date"
            value={value.date}
            onChange={(e) => set({ ...value, date: e.target.value })}
          />
        </label>
      </div>
      <label>
        Kilka słów do bliskich <small>(opcjonalnie)</small>
        <textarea
          maxLength={2000}
          placeholder="Podzielcie się tym, co jest dla Was ważne…"
          value={value.message}
          onChange={(e) => set({ ...value, message: e.target.value })}
        />
      </label>
    </>
  );
}
function Landing() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span /> NA DOBRY POCZĄTEK. OD SERCA.
          </span>
          <h1>
            Prezenty, których
            <br /> naprawdę
            <br />
            <em>potrzebujecie.</em>
          </h1>
          <p>
            Stwórz listę, udostępnij ją bliskim i uniknij podwójnych prezentów.
          </p>
          <div className="hero-actions">
            <Link className="btn" href="/nowa">
              Stwórz listę <ArrowUpRight size={19} />
            </Link>
            <Link className="text-link" href="/lista/demo">
              Zobacz przykładową listę <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-note">
            <Heart size={15} /> Mniej zgadywania. Więcej radości.
          </div>
        </div>
        <div className="hero-visual">
          <span className="doodle d1">✳</span>
          <div className="preview">
            <div className="preview-top">
              <div className="mini-heart">
                <Heart size={23} />
              </div>
              <span>NASZ MAŁY WIELKI POCZĄTEK</span>
              <span className="dots">•••</span>
            </div>
            <h2>
              Witaj na świecie,
              <br /> Zosiu! <span className="peach-heart">♡</span>
            </h2>
            <p>Lista drobiazgów na nowy rozdział.</p>
            <div className="preview-grid">
              <div>
                <Art name="Śpiworek" index={0} />
                <strong>Śpiworek do spania</strong>
                <small>189 zł · cena przykładowa</small>
                <span className="mini-status">Dostępny</span>
              </div>
              <div>
                <Art name="Mata" index={1} />
                <strong>Mata edukacyjna</strong>
                <small>249 zł · cena przykładowa</small>
                <span className="mini-status muted">
                  <Check size={11} /> Zarezerwowany
                </span>
              </div>
            </div>
            <Link href="/lista/demo" className="preview-bottom">
              Zajrzyj do przykładowej listy <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="floating-note">
            <span>♡</span> Dobre prezenty
            <br />
            <b>zaczynają się od bliskości.</b>
          </div>
          <span className="doodle d2">✧</span>
        </div>
      </section>
      <section className="steps-section" id="jak-to-dziala">
        <div className="section-heading">
          <span className="eyebrow">PROSTO, TAK JAK LUBICIE</span>
          <h2>Jedna lista. Wiele małych radości.</h2>
          <p>Wy tworzycie listę. Bliscy wiedzą, co sprawi Wam radość.</p>
        </div>
        <div className="steps">
          {[
            [
              Gift,
              "Dodaj prezenty",
              "Zbierz w jednym miejscu rzeczy, które przydadzą się Waszej rodzinie.",
            ],
            [
              Users,
              "Udostępnij listę",
              "Wyślij jeden link rodzinie i przyjaciołom. Bez zakładania konta dla gości.",
            ],
            [
              PackageCheck,
              "Bliscy rezerwują i kupują",
              "Każdy wybiera swój prezent, a Wy unikacie podwójnych zakupów.",
            ],
          ].map(([Icon, title, desc], i) => {
            const I = Icon as typeof Gift;
            return (
              <article key={i}>
                <div className="step-top">
                  <span className="step-icon">
                    <I size={25} />
                  </span>
                  <span className="step-number">0{i + 1}</span>
                </div>
                <h3>{title as string}</h3>
                <p>{desc as string}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="bottom-banner">
        <Leaf size={38} />
        <div>
          <h2>Na nowe początki i kolejne urodziny.</h2>
          <p>Przemyślane prezenty na Wasze ważne chwile.</p>
        </div>
        <Link className="btn" href="/nowa">
          Stwórz swoją listę <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
export default function App({ path }: { path: string[] }) {
  const [mobile, setMobile] = useState(false);
  return (
    <>
      <header className="header">
        <Link className="brand" href="/">
          <span className="brand-icon">
            <Heart size={23} />
          </span>
          lista od serca<span className="brand-dot">.</span>
        </Link>
        <nav className={mobile ? "open" : ""}>
          <Link href="/#jak-to-dziala" onClick={() => setMobile(false)}>
            Jak to działa
          </Link>
          <Link href="/lista/demo">Przykładowa lista</Link>
          <Link className="btn small" href="/nowa">
            Stwórz listę <Plus size={16} />
          </Link>
        </nav>
        <button
          className="menu"
          onClick={() => setMobile(!mobile)}
          aria-label="Menu"
        >
          {mobile ? <X /> : <Menu />}
        </button>
      </header>
      <main>
        {path.length === 0 ? (
          <Landing />
        ) : path[0] === "nowa" ? (
          <Create />
        ) : ["lista", "zarzadzaj"].includes(path[0]) && path[1] ? (
          <ListPage owner={path[0] === "zarzadzaj"} token={path[1]} />
        ) : path[0] === "rezerwacja" && path[1] ? (
          <Reservation token={path[1]} />
        ) : (
          <div className="narrow">
            <h1>Nie znaleziono strony</h1>
            <Link href="/">Wróć na stronę główną</Link>
          </div>
        )}
      </main>
      <footer>
        <Link className="brand" href="/">
          <Heart size={18} /> lista od serca.
        </Link>
        <span>Z myślą o małych i wielkich chwilach.</span>
        <span>Prototyp · bez płatności i pośrednictwa w zakupach</span>
      </footer>
    </>
  );
}
function Create() {
  const [value, set] = useState(blankList),
    [busy, b] = useState(false),
    [error, err] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    b(true);
    err("");
    try {
      const r = await api("lists", "POST", value);
      window.location.assign("/zarzadzaj/" + r.owner);
    } catch (e) {
      err((e as Error).message);
      b(false);
    }
  }
  return (
    <div className="narrow">
      <span className="eyebrow">WASZA HISTORIA ZACZYNA SIĘ TUTAJ</span>
      <h1>Lista pełna dobrych myśli.</h1>
      <p>Dodaj kilka szczegółów. Prezenty wybierzesz w kolejnym kroku.</p>
      <form className="panel" onSubmit={submit}>
        <ListFields value={value} set={set} />
        <div className="notice">
          <LockKeyhole size={20} />
          <p>
            Bez konta i bez e-maila. Otrzymasz prywatny link do zarządzania —
            zapisz go i nigdy nie wysyłaj go gościom. Każdy z linkiem gościa
            może zobaczyć listę. Nie podawaj adresów ani pełnych danych dziecka.
          </p>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <Button disabled={busy}>
          {busy ? "Tworzenie…" : "Stwórz listę"} <ArrowRight size={17} />
        </Button>
      </form>
    </div>
  );
}
function ListPage({ owner, token }: { owner: boolean; token: string }) {
  const [list, setList] = useState<List | null>(null),
    [error, err] = useState(""),
    [filter, F] = useState("all"),
    [edit, E] = useState(false),
    [gift, G] = useState<GiftType | null | undefined>(undefined),
    [res, R] = useState<GiftType | null>(null),
    [deleting, D] = useState<GiftType | null>(null),
    [message, M] = useState(""),
    [conflictError, setConflictError] = useState("");
  const url = (owner ? "owner/" : "public/") + token;
  async function load() {
    try {
      setList(await api(url));
      err("");
    } catch (e) {
      err((e as Error).message);
    }
  }
  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    window.addEventListener("focus", load);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", load);
    };
  }, [url]);
  if (!list)
    return (
      <div className="narrow" role="status">
        {error || "Wczytywanie listy…"}
        {error && <Button onClick={load}>Spróbuj ponownie</Button>}
      </div>
    );
  const guest =
    typeof window !== "undefined"
      ? window.location.origin + "/lista/" + list.id
      : "";
  return (
    <div className="list-page">
      {owner && (
        <div className="owner-banner">
          <LockKeyhole size={22} />
          <div>
            <strong>To Twój prywatny panel. Zapisz ten link.</strong>
            <p>Ten adres pozwala edytować listę. Nie udostępniaj go gościom.</p>
          </div>
          <CopyLink url={window.location.href} label="Zapisz link do panelu" />
        </div>
      )}
      {list.demo === 1 && (
        <div className="demo-banner">
          Oglądasz listę pokazową. Ceny i ilustracje są przykładowe.{" "}
          <Link href="/nowa">
            Stwórz własną listę <ArrowRight size={14} />
          </Link>
        </div>
      )}
      <section className="list-heading">
        <div className="list-symbol">
          <Heart size={34} />
        </div>
        <span className="eyebrow">
          {list.occasion}
          {list.date
            ? " · " +
              new Date(list.date + "T12:00:00").toLocaleDateString("pl-PL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : ""}
        </span>
        <h1>{list.title}</h1>
        <p>
          {list.message ||
            "Dziękujemy, że dzielicie z nami tę wyjątkową chwilę."}
        </p>
        {owner && (
          <div className="center-actions">
            <Button className="secondary" onClick={() => E(true)}>
              Edytuj szczegóły
            </Button>
            <CopyLink url={guest} label="Kopiuj link dla gości" />
            <Link className="text-link" href={"/lista/" + list.id}>
              Podgląd gościa <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </section>
      {owner && (
        <div className="stats">
          {["available", "reserved", "purchased"].map((s) => (
            <div key={s}>
              <strong>{list.gifts.filter((g) => g.status === s).length}</strong>
              <span>
                {s === "available"
                  ? "Dostępne"
                  : s === "reserved"
                    ? "Zarezerwowane"
                    : "Kupione"}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="list-toolbar">
        <div className="filters">
          {[
            ["all", "Wszystkie"],
            ["available", "Dostępne"],
            ["reserved", "Zarezerwowane"],
            ["purchased", "Kupione"],
          ].map(([s, label]) => (
            <button
              key={s}
              className={filter === s ? "active" : ""}
              onClick={() => F(s)}
            >
              {label}{" "}
              <span>
                {s === "all"
                  ? list.gifts.length
                  : list.gifts.filter((g) => g.status === s).length}
              </span>
            </button>
          ))}
        </div>
        {owner && (
          <Button onClick={() => G(null)}>
            <Plus size={17} /> Dodaj prezent
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {conflictError && (
        <p role="alert" className="error">
          {conflictError}
        </p>
      )}
      {message && (
        <p role="status" className="success">
          {message}
        </p>
      )}
      <div className="gift-grid">
        {list.gifts
          .filter((g) => filter === "all" || filter === g.status)
          .map((g, i) => (
            <article className="gift-card" key={g.id}>
              <div className="gift-picture">
                <Picture gift={g} index={i} />
                <span className={"badge " + g.status}>
                  {statuses[g.status]}
                </span>
              </div>
              <div className="gift-body">
                <span
                  className={
                    "priority " +
                    (g.priority === "Najbardziej potrzebne" ? "important" : "")
                  }
                >
                  <Heart size={12} /> {g.priority}
                </span>
                <div className="gift-title">
                  <h2>{g.name}</h2>
                  {g.price !== null && <strong>{money(g.price)}</strong>}
                </div>
                <p>{g.notes || "Wybrany z myślą o naszej rodzinie."}</p>
                {g.url && (
                  <a
                    className="store-link"
                    href={g.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Zobacz w sklepie <ExternalLink size={14} />
                  </a>
                )}
                {owner ? (
                  <div className="card-actions">
                    <Button className="secondary" onClick={() => G(g)}>
                      Edytuj
                    </Button>
                    <button className="delete" onClick={() => D(g)}>
                      Usuń
                    </button>
                  </div>
                ) : g.status === "available" ? (
                  <Button
                    className="full"
                    disabled={!!list.demo}
                    onClick={() => R(g)}
                  >
                    Zarezerwuj prezent <Plus size={16} />
                  </Button>
                ) : (
                  <div className="reserved-label">
                    <Check size={17} />{" "}
                    {g.status === "purchased"
                      ? "Ten prezent jest już kupiony"
                      : "Ten prezent jest zarezerwowany"}
                  </div>
                )}
              </div>
            </article>
          ))}
      </div>
      {list.gifts.filter((g) => filter === "all" || filter === g.status)
        .length === 0 && (
        <div className="empty">
          <Gift size={40} />
          <h2>
            {list.gifts.length
              ? "Nie ma tu jeszcze prezentów."
              : "Miejsce na pierwsze marzenia."}
          </h2>
          <p>
            {owner
              ? "Dodaj prezent lub wybierz inny filtr."
              : "Zajrzyj ponownie później lub wybierz inny filtr."}
          </p>
          {owner && <Button onClick={() => G(null)}>Dodaj prezent</Button>}
        </div>
      )}
      <div className="guest-note">
        <Heart size={20} />
        <p>
          Rezerwacja pomaga uniknąć podwójnych prezentów. Zakupu dokonujesz
          samodzielnie w wybranym sklepie.
          <br />
          <small>
            Lista jest dostępna dla każdego, kto ma jej link. Dostępność
            odświeża się co 10 sekund.
          </small>
        </p>
      </div>
      {edit && (
        <Modal title="Szczegóły listy" close={() => E(false)}>
          <Details
            list={list}
            token={token}
            done={() => {
              E(false);
              load();
              M("Zapisano szczegóły listy.");
            }}
          />
        </Modal>
      )}
      {gift !== undefined && (
        <Modal
          title={gift ? "Edytuj prezent" : "Nowy prezent"}
          close={() => G(undefined)}
        >
          <GiftForm
            gift={gift}
            token={token}
            done={() => {
              G(undefined);
              load();
              M("Prezent został zapisany.");
            }}
          />
        </Modal>
      )}
      {res && (
        <Modal title="Mały gest, wielka radość." close={() => R(null)}>
          <ReserveForm
            gift={res}
            done={() => {
              load();
            }}
            conflict={() => {
              R(null);
              load();
              setConflictError(
                "Ktoś już zarezerwował ten prezent. Wybierz inny — lista została odświeżona.",
              );
            }}
          />
        </Modal>
      )}
      {deleting && (
        <Modal title="Usunąć prezent?" close={() => D(null)}>
          <p>
            Prezent „{deleting.name}” zostanie usunięty.
            {deleting.status !== "available"
              ? " Ma już rezerwację. Jej prywatny link również przestanie działać."
              : ""}{" "}
            Tej operacji nie można cofnąć.
          </p>
          <AsyncForm
            submit={async () => {
              await api(url + "/gifts/" + deleting.id, "DELETE");
              D(null);
              load();
              M("Usunięto prezent.");
            }}
            label="Tak, usuń prezent"
          />
        </Modal>
      )}
    </div>
  );
}
function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
}) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const nodes = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".modal button:not(:disabled),.modal a[href],.modal input,.modal select,.modal textarea",
          ),
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", listener);
    };
  }, [close]);
  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className="close"
          aria-label="Zamknij"
          onClick={close}
          autoFocus
        >
          <X />
        </button>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}
function AsyncForm({
  children,
  submit,
  label,
}: {
  children?: React.ReactNode;
  submit: () => Promise<void>;
  label: string;
}) {
  const [busy, B] = useState(false),
    [error, E] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        B(true);
        E("");
        try {
          await submit();
        } catch (e) {
          E((e as Error).message);
        } finally {
          B(false);
        }
      }}
    >
      {children}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <Button disabled={busy}>{busy ? "Zapisywanie…" : label}</Button>
    </form>
  );
}
function Details({
  list,
  token,
  done,
}: {
  list: List;
  token: string;
  done: () => void;
}) {
  const [value, set] = useState({
    title: list.title,
    occasion: list.occasion,
    date: list.date,
    message: list.message,
  });
  return (
    <AsyncForm
      label="Zapisz szczegóły"
      submit={async () => {
        await api("owner/" + token, "PATCH", value);
        done();
      }}
    >
      <ListFields value={value} set={set} />
    </AsyncForm>
  );
}
function GiftForm({
  gift,
  token,
  done,
}: {
  gift: GiftType | null;
  token: string;
  done: () => void;
}) {
  const [v, V] = useState(
    gift
      ? { ...gift, price: gift.price === null ? "" : String(gift.price) }
      : blankGift,
  );
  return (
    <AsyncForm
      label="Zapisz prezent"
      submit={async () => {
        await api(
          "owner/" + token + "/gifts" + (gift ? "/" + gift.id : ""),
          gift ? "PATCH" : "POST",
          v,
        );
        done();
      }}
    >
      <label>
        Nazwa prezentu
        <input
          required
          maxLength={200}
          value={v.name}
          onChange={(e) => V({ ...v, name: e.target.value })}
        />
      </label>
      <label>
        Link do produktu <small>(opcjonalnie)</small>
        <input
          type="url"
          placeholder="https://"
          value={v.url}
          onChange={(e) => V({ ...v, url: e.target.value })}
        />
      </label>
      <label>
        Adres zdjęcia <small>(opcjonalnie)</small>
        <input
          type="url"
          placeholder="https://"
          value={v.image}
          onChange={(e) => V({ ...v, image: e.target.value })}
        />
      </label>
      <p className="field-note">
        Dodaj szczegóły ręcznie. Nie importujemy danych ze sklepów. Zewnętrzne
        zdjęcie będzie pobierane z podanego serwisu.
      </p>
      <div className="form-row">
        <label>
          Szacowana cena (zł)
          <input
            type="number"
            step="0.01"
            min="0"
            max="1000000"
            value={v.price}
            onChange={(e) => V({ ...v, price: e.target.value })}
          />
        </label>
        <label>
          Priorytet
          <select
            value={v.priority}
            onChange={(e) => V({ ...v, priority: e.target.value })}
          >
            <option>Najbardziej potrzebne</option>
            <option>Miło mieć</option>
          </select>
        </label>
      </div>
      <label>
        Wskazówki <small>(opcjonalnie)</small>
        <textarea
          maxLength={1000}
          placeholder="Rozmiar, kolor, ważne szczegóły…"
          value={v.notes}
          onChange={(e) => V({ ...v, notes: e.target.value })}
        />
      </label>
    </AsyncForm>
  );
}
function ReserveForm({
  gift,
  done,
  conflict,
}: {
  gift: GiftType;
  done: () => void;
  conflict: () => void;
}) {
  const [name, N] = useState(""),
    [key, K] = useState("");
  if (key)
    return (
      <div>
        <div className="success">
          <Check /> Prezent czeka na Ciebie!
        </div>
        <p>
          Zapisz prywatny link. Pozwoli Ci oznaczyć prezent jako kupiony lub
          anulować rezerwację. Nie udostępniaj go innym.
        </p>
        <div className="link-box">
          {window.location.origin + "/rezerwacja/" + key}
        </div>
        <CopyLink
          url={window.location.origin + "/rezerwacja/" + key}
          label="Kopiuj link rezerwacji"
        />
        <Link className="btn full mt" href={"/rezerwacja/" + key}>
          Zarządzaj rezerwacją <ArrowRight size={16} />
        </Link>
      </div>
    );
  return (
    <AsyncForm
      label="Potwierdź rezerwację"
      submit={async () => {
        try {
          const r = await api("reserve/" + gift.id, "POST", { name });
          K(r.token);
          done();
        } catch (e) {
          if ((e as Error).message.includes("Ktoś już")) conflict();
          else throw e;
        }
      }}
    >
      <p>
        Rezerwujesz: <strong>{gift.name}</strong>. Twoje imię nie będzie
        widoczne dla innych gości.
      </p>
      <label>
        Twoje imię
        <input
          required
          maxLength={60}
          autoComplete="given-name"
          value={name}
          onChange={(e) => N(e.target.value)}
        />
      </label>
      <p className="field-note">
        Rezerwacja nie oznacza zakupu. Prezent kupujesz samodzielnie w sklepie.
      </p>
    </AsyncForm>
  );
}
function Reservation({ token }: { token: string }) {
  const [r, R] = useState<any>(null),
    [error, E] = useState(""),
    [cancel, C] = useState(false),
    [gone, G] = useState(false);
  async function load() {
    try {
      R(await api("reservation/" + token));
    } catch (e) {
      E((e as Error).message);
    }
  }
  useEffect(() => {
    load();
  }, [token]);
  return (
    <div className="narrow">
      <span className="eyebrow">TWÓJ PRYWATNY LINK</span>
      <h1>Prezent od serca.</h1>
      {gone ? (
        <div className="panel">
          <h2>Rezerwacja anulowana</h2>
          <p>Prezent jest ponownie dostępny dla bliskich.</p>
          <Link className="btn" href={"/lista/" + r.list_id}>
            Wróć do listy
          </Link>
        </div>
      ) : error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : !r ? (
        <p>Wczytywanie rezerwacji…</p>
      ) : (
        <div className="panel">
          <span className={"badge inline " + r.status}>
            {statuses[r.status]}
          </span>
          <h2>{r.guest_name}, dziękujemy!</h2>
          <p>
            Twój prezent: <strong>{r.name}</strong>
          </p>
          <h3>{r.list_title}</h3>
          <p>{r.notes}</p>
          {r.url && (
            <a
              className="btn secondary"
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Przejdź do sklepu <ExternalLink size={16} />
            </a>
          )}
          <p>
            Oznacz prezent jako kupiony dopiero po zakupie. Samo otwarcie sklepu
            nie zmienia statusu.
          </p>
          <AsyncForm
            label={
              r.status === "purchased"
                ? "Cofnij oznaczenie zakupu"
                : "Oznacz jako kupiony"
            }
            submit={async () => {
              await api("reservation/" + token, "PATCH", {
                status: r.status === "purchased" ? "reserved" : "purchased",
              });
              await load();
            }}
          />
          <div className="mt">
            <CopyLink url={window.location.href} label="Kopiuj prywatny link" />
          </div>
          <button className="delete mt" onClick={() => C(true)}>
            Anuluj rezerwację
          </button>
          <p>
            <Link className="text-link" href={"/lista/" + r.list_id}>
              Wróć do listy <ArrowRight size={15} />
            </Link>
          </p>
          <small>
            Nie udostępniaj tego adresu. Każda osoba z tym linkiem może
            zarządzać rezerwacją.
          </small>
          {cancel && (
            <Modal title="Anulować rezerwację?" close={() => C(false)}>
              <p>
                Prezent ponownie będzie dostępny. Ten prywatny link przestanie
                działać.
              </p>
              <AsyncForm
                label="Tak, anuluj rezerwację"
                submit={async () => {
                  await api("reservation/" + token, "DELETE");
                  G(true);
                  C(false);
                }}
              />
            </Modal>
          )}
        </div>
      )}
    </div>
  );
}
