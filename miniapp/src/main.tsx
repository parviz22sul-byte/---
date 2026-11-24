import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { init, miniApp, themeParams, viewport, backButton } from '@telegram-apps/sdk-react';
import App from './app/App';
import './i18n';
import './index.css';

async function bootstrap() {
  try {
    init();
    miniApp.mount();
    themeParams.mount();
    await viewport.mount().catch(() => {});
    backButton.mount();
    miniApp.ready();
    viewport.expand();
  } catch (e) {
    console.warn('Telegram SDK init skipped (running outside Telegram):', e);
  }

  const qc = new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 15_000 } },
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}

bootstrap();
