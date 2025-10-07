import { ChatPage } from './components';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <ChatPage />
      <Toaster 
        position="top-right" 
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            fontSize: '14px',
            fontWeight: '500'
          }
        }}
      />
    </>
  );
}

export default App;