'use client';

import { MainLayout } from '@/components/layout';

export default function ClienteTicketsPage() {
  return (
    <MainLayout requiredRoles={['Cliente']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mis Tickets
          </h1>
          <a
            href="/cliente/tickets/nuevo"
            className="btn-primary"
          >
            Nuevo Ticket
          </a>
        </div>

        <div className="card p-6">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No tienes tickets aun
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Crea tu primer ticket para reportar un problema o solicitar ayuda.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
