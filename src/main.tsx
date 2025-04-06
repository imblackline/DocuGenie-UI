import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n/config';
import { CircularProgress, Box } from '@mui/material';
import i18n from 'i18next';


const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

const initApp = async () => {
  if (!i18n.isInitialized) {
    await i18n.init();
  }
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </React.StrictMode>
  );
};

initApp().catch(console.error);
