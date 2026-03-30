'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { billService } from '@/services/bill.service';
import { BillSummaryDto } from '@/types/bill.types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCode } from '@/utils/format';
import Link from 'next/link';
import { getAxiosErrorMessage } from '@/utils/api-error';
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [bills, setBills] = useState<BillSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      const userBills = await billService.getBills();
      setBills(userBills);
    } catch (error: unknown) {
      const message = getAxiosErrorMessage(error, 'Erro ao carregar contas.');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadBills();
  }, [isAuthenticated, router, loadBills]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">bora rachar conta</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Olá, {user?.name}</span>
            <Button variant="secondary" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <p className="text-xl text-gray-600">
            Crie uma conta e comece a dividir despesas com seus amigos
          </p>
        </div>

        <Card className="text-center mb-8">
          <p className="text-gray-600 mb-6">
            Escolha uma opção para começar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/bills/new">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Criar Nova Conta
              </Button>
            </Link>
            <Link href="/bills/code">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Ver por Código
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Minhas Contas</h3>
            <Button variant="secondary" size="sm" onClick={loadBills}>
              Atualizar
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando contas...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Você ainda não participa de nenhuma conta.</p>
              <p className="text-sm text-gray-400">
                Crie uma nova conta ou entre com um código para começar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bills.map((bill) => (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{bill.name}</h4>
                      <p className="text-sm text-gray-600">
                        Código: <span className="font-mono font-semibold">{formatCode(bill.code)}</span>
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h4 className="font-semibold text-gray-900 mb-2">Crie Contas</h4>
            <p className="text-gray-600 text-sm">
              Crie uma conta e compartilhe o código com seus amigos
            </p>
          </Card>
          <Card>
            <h4 className="font-semibold text-gray-900 mb-2">Adicione Itens</h4>
            <p className="text-gray-600 text-sm">
              Adicione itens e valores para dividir entre os participantes
            </p>
          </Card>
          <Card>
            <h4 className="font-semibold text-gray-900 mb-2">Veja Estatísticas</h4>
            <p className="text-gray-600 text-sm">
              Visualize quanto cada pessoa deve pagar automaticamente
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
