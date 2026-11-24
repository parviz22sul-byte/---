import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, KeyRound, ArrowUpRight, Wallet } from 'lucide-react';
import { apiGet } from '@/shared/api';

type HomeSummary = {
  user: { firstName: string; telegramId: number };
  balance: { units: number };
  usage: { tokensTotal: number };
  apiKey: { active: boolean };
  models: { count: number };
  recent: Array<{
    id: string;
    title: string;
    delta: number;
    createdAt: string;
  }>;
};

export default function HomePage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['home'],
    queryFn: () => apiGet<HomeSummary>('/miniapp/home'),
  });

  if (isLoading) return <HomeSkeleton />;

  if (isError || !data) {
    return (
      <div className="px-4 pt-6">
        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
          <p className="font-medium">{t('home.loadError')}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-3 px-4 pb-4"
    >
      <header className="mt-4">
        <p className="text-sm opacity-60">{t('home.greeting')}</p>
        <h1 className="text-2xl font-semibold">
          {t('home.hello', { name: data.user.firstName })}
        </h1>
      </header>

      {/* Баланс */}
      <section className="rounded-2xl p-5 text-white bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm opacity-80 flex items-center gap-1">
              <Wallet size={14} /> {t('home.balance')}
            </p>
            <p className="text-3xl font-bold mt-1">
              {data.balance.units.toLocaleString()} ₦
            </p>
            <p className="text-xs opacity-75 mt-1">
              {t('home.tokensUsed', { n: data.usage.tokensTotal.toLocaleString() })}
            </p>
          </div>
          <Link
            to="/topup"
            className="shrink-0 bg-white/15 hover:bg-white/25 active:bg-white/30 transition rounded-xl px-3 py-2 text-sm font-medium flex items-center gap-1"
          >
            {t('home.topUp')} <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* Быстрые карточки */}
      <section className="grid grid-cols-2 gap-3">
        <QuickCard
          to="/models"
          icon={<Cpu size={18} />}
          label={t('home.models')}
          value={String(data.models.count)}
        />
        <QuickCard
          to="/api"
          icon={<KeyRound size={18} />}
          label={t('home.apiKey')}
          value={data.apiKey.active ? t('home.active') : t('home.missing')}
          tone={data.apiKey.active ? 'ok' : 'warn'}
        />
      </section>

      {/* Последние операции */}
      <section className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{t('home.recent')}</h2>
          <Link to="/history" className="text-sm text-indigo-500">
            {t('common.all')}
          </Link>
        </div>

        {data.recent.length === 0 ? (
          <div className="p-4 rounded-xl bg-[var(--tg-theme-secondary-bg-color)] text-sm opacity-70 text-center">
            {t('home.noOperations')}
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.recent.map((op) => (
              <li
                key={op.id}
                className="flex justify-between items-center p-3 rounded-xl bg-[var(--tg-theme-secondary-bg-color)]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{op.title}</p>
                  <p className="text-xs opacity-60">
                    {new Date(op.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`font-medium tabular-nums ${
                    op.delta > 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {op.delta > 0 ? '+' : ''}
                  {op.delta.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  );
}

function QuickCard({
  to,
  icon,
  label,
  value,
  tone = 'default',
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'default' | 'ok' | 'warn';
}) {
  const toneClass =
    tone === 'ok'
      ? 'text-emerald-500'
      : tone === 'warn'
      ? 'text-amber-500'
      : 'text-[var(--tg-theme-text-color)]';

  return (
    <Link
      to={to}
      className="p-4 rounded-2xl bg-[var(--tg-theme-secondary-bg-color)] hover:opacity-90 active:scale-[0.99] transition flex flex-col gap-2"
    >
      <div className="flex items-center gap-2 text-sm opacity-70">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-xl font-semibold ${toneClass}`}>{value}</p>
    </Link>
  );
}

function HomeSkeleton() {
  return (
    <div className="px-4 pt-6 flex flex-col gap-3 animate-pulse">
      <div className="h-6 w-40 bg-black/10 dark:bg-white/10 rounded" />
      <div className="h-28 rounded-2xl bg-black/10 dark:bg-white/10" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-2xl bg-black/10 dark:bg-white/10" />
        <div className="h-20 rounded-2xl bg-black/10 dark:bg-white/10" />
      </div>
      <div className="h-6 w-32 bg-black/10 dark:bg-white/10 rounded mt-2" />
      <div className="h-14 rounded-xl bg-black/10 dark:bg-white/10" />
      <div className="h-14 rounded-xl bg-black/10 dark:bg-white/10" />
      <div className="h-14 rounded-xl bg-black/10 dark:bg-white/10" />
    </div>
  );
}
