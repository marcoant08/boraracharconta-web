'use client';

import { MouseEvent } from 'react';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { GitHubIcon } from '@/components/icons/GitHubIcon';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ssoButtonClassName =
  'flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';

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
