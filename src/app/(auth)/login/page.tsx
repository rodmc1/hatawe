import { LoginForm } from '@/components/login-form';
import { AuthRightPanel } from '@/components/auth-right-panel';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center pt-0 md:-mt-[88px]">
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
            <LoginForm />
          </div>
        </div>
      </div>
      <AuthRightPanel />
    </div>
  );
}
