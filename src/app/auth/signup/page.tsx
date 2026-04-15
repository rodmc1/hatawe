import Link from 'next/link';
import { signup } from './actions';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-bold">Sign up</h1>
        <div className="flex flex-col gap-1">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <button formAction={signup} className="rounded bg-primary px-4 py-2 text-white">
          Sign up
        </button>
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
