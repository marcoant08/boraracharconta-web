'use client';

import { MouseEvent } from 'react';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { GitHubIcon } from '@/components/icons/GitHubIcon';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ssoButtonClassName =
  'flex w-full items-center justify-center gap-2 rounded-xl border border-[#d7d0c4] bg-[#f7f8f7] px-4 py-3 text-base font-medium text-[#0c2919] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#297747] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7ede0]';

function ssoUrl(apiBaseUrl: string, provider: 'google' | 'github'): string {
  const url = new URL(`${apiBaseUrl}/auth/${provider}`);
  url.searchParams.set('returnTo', window.location.origin);
  return url.toString();
}

function startSso(apiBaseUrl: string, provider: 'google' | 'github') {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.location.assign(ssoUrl(apiBaseUrl, provider));
  };
}

export const LoginForm = () => {
  return (
    <div className="space-y-3">
      <a
        href={`${apiBaseUrl}/auth/google`}
        className={ssoButtonClassName}
        onClick={startSso(apiBaseUrl, 'google')}
      >
        <GoogleIcon size={18} />
        Entrar com Google
      </a>
      <a
        href={`${apiBaseUrl}/auth/github`}
        className={ssoButtonClassName}
        onClick={startSso(apiBaseUrl, 'github')}
      >
        <GitHubIcon size={18} />
        Entrar com GitHub
      </a>
    </div>
  );
};
