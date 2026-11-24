import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  useSignal,
  themeParams,
  miniApp,
  backButton,
} from '@telegram-apps/sdk-react';
import { Home, Cpu, KeyRound, Wallet, Clock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import HomePage from '@/features/home/HomePage';
import ModelsPage from '@/features/models/ModelsPage';
import ApiPage from '@/features/api-key/ApiPage';
import TopUpPage from '@/features/topup/TopUpPage';
import HistoryPage from '@/features/history/HistoryPage';
import ProfilePage from '@/features/profile/ProfilePage';

export default function App() {
  const theme = useSignal(themeParams.state);
  const loc = useLocation();
  const navigate = useNavigate();

  // Синхронизация темы с Telegram (тёмная/светлая)
  useEffect(() => {
    const bg = theme?.bgColor ?? '#ffffff';
    const dark = isDark(bg);
    document.documentElement.classList.toggle('dark', dark);

    try {
      miniApp.setHeaderColor(dark ? '#0f172a' : '#ffffff');
      miniApp.setBackgroundColor(dark ? '#0f172a' : '#ffffff');
    } catch {
      /* не поддерживается в старых версиях Telegram — игнорируем */
    }
  }, [theme]);

  // Кнопка "назад" Telegram: скрываем на главной, показываем на вложенных
  useEffect(() => {
    if (loc.pathname === '/') {
      backButton.hide();
      return;
    }
    backButton.show();
    const off = backButton.onClick(() => navigate(-1));
    return () => {
      off?.();
    };
  }, [loc.pathname, navigate]);

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)]">
      <main className="pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/api" element={<ApiPage />} />
          <Route path="/topup" element={<TopUpPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const { t } = useTranslation();
  const items = [
    { to: '/',        icon: Home,     label: t('nav.home') },
    { to: '/models',  icon: Cpu,      label: t('nav.models') },
    { to: '/api',     icon: KeyRound, label: t('nav.api') },
    { to: '/topup',   icon: Wallet,   label: t('nav.topup') },
    { to: '/history', icon: Clock,    label: t('nav.history') },
    { to: '/profile', icon: User,     label: t('nav.profile') },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-black/5 dark:border-white/10 bg-[var(--tg-theme-bg-color)]/90 backdrop-blur">
      <ul className="grid grid-cols-6">
        {items.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 text-[11px] transition-colors ${
                  isActive ? 'text-indigo-500' : 'opacity-70 hover:opacity-100'
                }`
              }
            >
              <Icon size={20} />
              <span className="mt-0.5">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function isDark(hex: string): boolean {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}
