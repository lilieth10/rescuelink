import Link from 'next/link';
import { StatusBar } from '@/components/status-bar';

const modules = [
  {
    title: 'Personas Desaparecidas',
    description: 'Registra y busca personas desaparecidas durante una emergencia.',
    href: '/missing-persons',
    status: 'Próximamente',
  },
  {
    title: 'Personas Encontradas',
    description: 'Registro autorizado de hallazgos con código único.',
    href: '/found-persons',
    status: 'Próximamente',
  },
  {
    title: 'Niño Seguro',
    description: 'Protección de menores — acceso restringido.',
    href: '/protected-children',
    status: 'Próximamente',
  },
  {
    title: 'Refugios',
    description: 'Capacidad, recursos y necesidades urgentes.',
    href: '/shelters',
    status: 'Próximamente',
  },
  {
    title: 'Centro Humanitario',
    description: 'Logística y coordinación de recursos para ONG.',
    href: '/humanitarian',
    status: 'Próximamente',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-red-600">Emergency Coordination</p>
            <h1 className="text-2xl font-bold tracking-tight">RescueLink</h1>
          </div>
          <StatusBar />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <section className="mb-12 max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Coordinación humanitaria offline-first
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Plataforma multi-país y multi-emergencia para localizar personas,
            coordinar refugios y centralizar recursos — incluso cuando Internet
            falla.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <article
              key={module.href}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{module.title}</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                  {module.status}
                </span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-slate-600">
                {module.description}
              </p>
              <Link
                href={module.href}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Ver módulo →
              </Link>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        RescueLink MVP — Open Source humanitarian platform
      </footer>
    </div>
  );
}
