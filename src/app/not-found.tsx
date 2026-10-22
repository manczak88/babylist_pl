import Link from "next/link";
export default function NotFound() {
  return (
    <main className="narrow">
      <h1>Nie znaleziono strony</h1>
      <p>Sprawdź adres lub wróć na początek.</p>
      <Link className="btn" href="/">
        Strona główna
      </Link>
    </main>
  );
}
