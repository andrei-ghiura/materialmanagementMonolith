import React, { useState } from 'react';

interface GlobalFooterProps {
  actionsLeft?: React.ReactNode;
  actionsRight?: React.ReactNode;
}

const GlobalFooter: React.FC<GlobalFooterProps> = ({ actionsLeft, actionsRight }) => {

  return (
    <footer
      style={{
        width: '100%',
        background: '#22223b',
        color: '#fff',
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        letterSpacing: '0.02em',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '56px',
        position: 'fixed',
        left: 0,
        bottom: 0,
        zIndex: 500,
      }}
    >
      {/* Desktop: show left and right actions */}
      <div className="d-md-flex align-items-center" style={{ gap: 12 }}>
        {actionsLeft}
      </div>
      <div className="d-md-flex align-items-center" style={{ gap: 12, marginLeft: 'auto' }}>
        {actionsRight}
      </div>


    </footer>
  );
};

export default GlobalFooter;
