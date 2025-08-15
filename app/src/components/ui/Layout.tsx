import React from 'react';

// import Sidebar from './Sidebar';
import GlobalHeader from './GlobalHeader';
import GlobalFooter from './GlobalFooter';
import { useUiState } from './useUiState';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { footerActions } = useUiState();
  // Sidebar removed, no collapse state needed

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f8f9fa',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Header Navbar */}
      <nav
        style={{
          width: '100%',
          height: 56,
          background: '#fff',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          boxSizing: 'border-box',
          zIndex: 10,
        }}
      >
        <GlobalHeader />
      </nav>
      {/* Main Content */}
      <main
        style={{
          flex: 1,
          paddingBottom: 64,
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {children}
      </main>
      {/* Footer */}
      <GlobalFooter actionsLeft={footerActions?.actionsLeft} actionsRight={footerActions?.actionsRight} />
    </div>
  );
};

export default Layout;
