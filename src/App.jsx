import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TemplateEditor from './pages/TemplateEditor';
import IdPrint from './pages/IdPrint';
import TemplateManagementPage from './pages/TemplateManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import ConfirmModal from './components/ConfirmModal';

const App = () => {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<Navigate to="/print" replace />} />
          <Route path="/templates" element={<TemplateManagementPage />} />
          <Route path="/template-editor/:name" element={<TemplateEditor />} />
          <Route path="/print" element={<IdPrint />} />
          <Route path="/users" element={<UserManagementPage />} />
        </Routes>
        
        {/* Global Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
              padding: '10px 14px',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
              fontSize: '13px',
              maxWidth: '300px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {/* Global Confirmation Modal */}
        <ConfirmModal />
      </div>
    </BrowserRouter>
  );
};

export default App;