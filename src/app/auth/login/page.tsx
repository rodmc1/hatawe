import Link from 'next/link';
import { login } from './actions';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-bold">Log in</h1>
        <div className="flex flex-col gap-1">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="w-full rounded border px-3 py-2" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="w-full rounded border px-3 py-2" />
        </div>
        <button formAction={login} className="rounded bg-primary px-4 py-2 text-white">
          Log in
        </button>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
