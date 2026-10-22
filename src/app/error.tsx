"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="narrow">
      <h1>Coś poszło nie tak.</h1>
      <p>Nie udało się wczytać strony. Spróbuj ponownie za chwilę.</p>
      <button className="btn" onClick={reset}>
        Spróbuj ponownie
      </button>
    </div>
  );
}
