import React from 'react';
import AppRoutes from './routes';
import { Toaster } from 'sonner';
// import './App.css';

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
