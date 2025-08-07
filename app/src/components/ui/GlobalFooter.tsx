import React, { useState } from 'react';

interface GlobalFooterProps {
  actionsLeft?: React.ReactNode;
  actionsRight?: React.ReactNode;
}

const GlobalFooter: React.FC<GlobalFooterProps> = ({ actionsLeft, actionsRight }) => {
  const [showMenu, setShowMenu] = useState(false);

  // Render actions as array for menu
  const actionsLeftArray = Array.isArray(actionsLeft) ? actionsLeft : actionsLeft ? [actionsLeft] : [];
  const actionsRightArray = Array.isArray(actionsRight) ? actionsRight : actionsRight ? [actionsRight] : [];

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
      <div className="d-none d-md-flex align-items-center" style={{ gap: 12 }}>
        {actionsLeft}
      </div>
      <div className="d-none d-md-flex align-items-center" style={{ gap: 12, marginLeft: 'auto' }}>
        {actionsRight}
      </div>

      {/* Mobile: show menu button */}
      <div className="d-flex d-md-none align-items-center w-100 justify-content-between">
        <button
          aria-label="Deschide acțiuni"
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: 28,
            padding: 4,
            marginRight: 0,
            cursor: 'pointer',
          }}
          onClick={() => setShowMenu((v) => !v)}
        >
          ⋮
        </button>
        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.32)',
                zIndex: 998,
              }}
              onClick={() => setShowMenu(false)}
            />
            {/* Action sheet */}
            <div
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                background: '#23223b',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                boxShadow: '0 -2px 16px rgba(0,0,0,0.18)',
                padding: '20px 0 32px 0',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                alignItems: 'center',
                minHeight: 120,
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Left actions first, then right actions in the menu */}
              {[...actionsLeftArray.map((action, i) => {
                const isButton = action && action.type === 'button';
                // Try to extract the label from children
                let label = '';
                if (action && action.props && action.props.children) {
                  if (typeof action.props.children === 'string') {
                    label = action.props.children;
                  } else if (Array.isArray(action.props.children)) {
                    label = action.props.children.map(child => typeof child === 'string' ? child : '').join(' ');
                  }
                } else if (typeof action === 'string') {
                  label = action;
                }
                return (
                  <div
                    key={`left-${i}`}
                    style={{
                      width: '96%',
                      margin: '0 auto',
                      padding: '0',
                    }}
                  >
                    {isButton ? (
                      <button
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          fontSize: 18,
                          padding: '16px 0',
                          textAlign: 'center',
                          borderBottom: '1px solid #35354a',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          cursor: 'pointer',
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          if (action.props && typeof action.props.onClick === 'function') action.props.onClick(e);
                          setShowMenu(false);
                        }}
                      >
                        {label || 'Action'}
                      </button>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          fontSize: 18,
                          padding: '16px 0',
                          textAlign: 'center',
                          borderBottom: '1px solid #35354a',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          setShowMenu(false);
                        }}
                        onKeyPress={e => {
                          if (e.key === 'Enter' || e.key === ' ') setShowMenu(false);
                        }}
                      >
                        {label || 'Action'}
                      </div>
                    )}
                  </div>
                );
              }),
              ...actionsRightArray.map((action, i) => {
                const isButton = action && action.type === 'button';
                let label = '';
                if (action && action.props && action.props.children) {
                  if (typeof action.props.children === 'string') {
                    label = action.props.children;
                  } else if (Array.isArray(action.props.children)) {
                    label = action.props.children.map(child => typeof child === 'string' ? child : '').join(' ');
                  }
                } else if (typeof action === 'string') {
                  label = action;
                }
                return (
                  <div
                    key={`right-${i}`}
                    style={{
                      width: '96%',
                      margin: '0 auto',
                      padding: '0',
                    }}
                  >
                    {isButton ? (
                      <button
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          fontSize: 18,
                          padding: '16px 0',
                          textAlign: 'center',
                          borderBottom: i === actionsRightArray.length - 1 ? 'none' : '1px solid #35354a',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          cursor: 'pointer',
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          if (action.props && typeof action.props.onClick === 'function') action.props.onClick(e);
                          setShowMenu(false);
                        }}
                      >
                        {label || 'Action'}
                      </button>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          fontSize: 18,
                          padding: '16px 0',
                          textAlign: 'center',
                          borderBottom: i === actionsRightArray.length - 1 ? 'none' : '1px solid #35354a',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          setShowMenu(false);
                        }}
                        onKeyPress={e => {
                          if (e.key === 'Enter' || e.key === ' ') setShowMenu(false);
                        }}
                      >
                        {label || 'Action'}
                      </div>
                    )}
                  </div>
                );
              })]}
              {/* Cancel button */}
              <button
                style={{
                  marginTop: 16,
                  width: '90%',
                  padding: '12px 0',
                  background: '#35354a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 18,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onClick={() => setShowMenu(false)}
              >
                Anulează
              </button>
            </div>
          </>
        )}
      </div>
    </footer>
  );
};

export default GlobalFooter;
