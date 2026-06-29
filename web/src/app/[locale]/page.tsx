import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { EmergencyBanner } from '@/components/home/emergency-banner';
import { HeroSection } from '@/components/home/hero-section';
import { ModuleGrid } from '@/components/home/module-grid';
import { fetchActiveEmergencies } from '@/lib/api/emergencies';

export default async function HomePage() {
  let activeEmergency = null;

  try {
    const emergencies = await fetchActiveEmergencies();
    activeEmergency = emergencies[0] ?? null;
  } catch {
    activeEmergency = null;
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {activeEmergency && (
          <div className="mb-6">
            <EmergencyBanner emergency={activeEmergency} />
          </div>
        )}

        <HeroSection />
        <ModuleGrid />
      </main>

      <SiteFooter />
    </div>
  );
}
