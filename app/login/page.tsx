import { LoginForm } from "@/components/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialError = params.error ? decodeURIComponent(params.error) : "";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-line bg-ivory p-8 shadow-xl">
        <p className="text-xs tracking-[0.28em] text-gold-dark uppercase">Acceso privado</p>
        <h1 className="mt-2 font-display text-4xl">Inventario de joyas</h1>
        <p className="mt-2 mb-8 text-muted">
          Ingresa para administrar piezas, precios y fotografías.
        </p>
        <LoginForm initialError={initialError} />
      </section>
    </main>
  );
}
