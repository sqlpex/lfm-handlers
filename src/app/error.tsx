"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-white">Something went wrong</h1>
      <p className="mt-2 text-sm text-[#b5bac1]">{error.message}</p>
      <button onClick={reset} className="mt-6 rounded bg-[#4e5058] px-4 py-2 text-sm text-white hover:bg-[#6d6f78]">
        Try again
      </button>
    </main>
  );
}
