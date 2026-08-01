import { getTranslations } from 'next-intl/server';
import GrowSetupWizard from '@/components/grow/GrowSetupWizard';

export async function generateMetadata() {
  const t = await getTranslations('start');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function StartPage() {
  const t = await getTranslations('start');
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto flex max-w-md flex-col">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-4xl">🌱</span>
          <h1 className="mt-3 text-2xl font-bold text-foreground">
            {t('pageTitle')}
          </h1>
          <p className="mt-1.5 text-sm text-muted-fg">
            {t('pageDescription')}
          </p>
        </div>

        <GrowSetupWizard />
      </div>
    </main>
  );
}
