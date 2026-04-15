import Link from 'next/link';
import { signup } from './actions';
import { loginWithGoogle } from '@/app/(auth)/login/actions';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { AuthRightPanel } from '@/components/auth-right-panel';

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center pt-0 md:-mt-22">
          <div className="w-full max-w-xs">
            <Image
              src="/assets/hatawe_logo.png"
              alt="Hatawe Badminton Club"
              width={448}
              height={448}
              className="mx-auto w-64 md:w-64"
              priority
              quality={100}
            />
            <form className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-xl font-bold">Create an account</h1>
                <p className="text-sm text-balance text-muted-foreground">Enter your details to get started</p>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="m@example.com"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button formAction={signup} disabled>
                Sign up
              </Button>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
              <Button variant="outline" type="submit" formAction={loginWithGoogle} formNoValidate>
                <img src="/assets/google.svg" alt="Google" className="size-5" />
                Sign up with Google
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="underline underline-offset-4">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      <AuthRightPanel />
    </div>
  );
}
