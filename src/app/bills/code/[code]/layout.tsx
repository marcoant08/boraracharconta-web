import type { Metadata } from 'next';

type BillCodeLayoutProps = {
  params: { code: string };
  children: React.ReactNode;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getBillName(code: string): Promise<string | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/bills/code/${encodeURIComponent(code)}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const bill = (await response.json()) as { name?: unknown };
    if (typeof bill.name !== 'string') return null;
    const name = bill.name.trim();
    return name || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: BillCodeLayoutProps): Promise<Metadata> {
  const name = await getBillName(params.code);
  const description = name
    ? `Veja as divisões de ${name}`
    : 'Aplicação para dividir contas entre amigos';

  return {
    openGraph: {
      title: 'racha conta',
      description,
    },
    twitter: {
      title: 'racha conta',
      description,
    },
  };
}

export default function BillCodeLayout({ children }: BillCodeLayoutProps) {
  return children;
}
