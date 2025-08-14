import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { BoxSeam, Gear, List as ListIcon, X } from 'react-bootstrap-icons';
import useI18n from '../../hooks/useI18n';


interface SidebarProps {
  width?: number;
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ width = 220, collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [showMobile, setShowMobile] = useState(false);
  const [forceCollapse, setForceCollapse] = useState(false);

  // Dynamic navigation items with translations
  const navItems = [
    { labelKey: 'navigation.addMaterial', path: '/material', icon: <BoxSeam /> },
    { labelKey: 'navigation.materials', path: '/', icon: <BoxSeam /> },
    { labelKey: 'navigation.processing', path: '/processing', icon: <Gear /> },
    { labelKey: 'navigation.settings', path: '/settings', icon: <Gear /> },
  ];

  // Collapse sidebar if window is below 1200px (or any custom width)
  useEffect(() => {
    const handleResize = () => {
      setForceCollapse(window.innerWidth < 1200);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sidebar content as a function for reuse
  const sidebarContent = (
    <div style={{ padding: '1.5rem 1rem', minWidth: collapsed ? 44 : width, width: collapsed ? 44 : width, transition: 'width 0.2s' }}>

      <ListGroup variant="flush">
        {navItems.map((item) => {
          // For dynamic routes, match by pattern
          const isActive = item.path.includes(':')
            ? location.pathname.startsWith(item.path.split('/:')[0])
            : location.pathname === item.path;
          return (
            <ListGroup.Item
              key={item.path}
              action
              active={isActive}
              onClick={() => { setShowMobile(false); navigate(item.path.replace(':id', '')); }}
              style={{ cursor: 'pointer', borderRadius: 8, marginBottom: 6, fontWeight: 500, fontSize: 16, background: isActive ? '#e9f5ff' : undefined, border: isActive ? '1px solid #339af0' : undefined }}
              className="d-flex align-items-center"
            >
              <span className="me-2">{item.icon}</span> {t(item.labelKey)}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );

  return (
    <>
      {/* Hamburger for mobile */}
      {(forceCollapse || window.innerWidth < 768) && (
        <Button
          className="btn-transparent position-fixed top-0 start-0 m-2 d-flex align-items-center justify-content-center"
          style={{ zIndex: 200, borderRadius: '50%', width: 44, height: 44, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 0 }}
          aria-label="Deschide meniul"
          onClick={() => setShowMobile(true)}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <ListIcon size={28} />
          </span>
        </Button>
      )}

      {/* Sidebar for desktop */}
      {!(forceCollapse || window.innerWidth < 768) && (
        <aside
          style={{
            minWidth: collapsed ? 44 : width,
            width: collapsed ? 44 : width,
            background: '#fff',
            borderRight: '1px solid #e5e5e5',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 100,
            paddingTop: 56,
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.2s',
            overflow: 'hidden',
          }}
        >
          {sidebarContent}
        </aside>
      )}

      {/* Sidebar as modal/drawer for mobile with dimmed overlay */}
      {showMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 299,
        }}
          onClick={() => setShowMobile(false)}
        />
      )}
      <Modal
        show={showMobile}
        onHide={() => setShowMobile(false)}
        centered
        dialogClassName="m-0"
        contentClassName="border-0"
        style={{ zIndex: 300 }}
        className="d-md-none"
        backdrop={false}
        animation={true}
      >
        <Modal.Body style={{ padding: 0, background: '#fff', minHeight: '100vh', minWidth: 220, maxWidth: 320, position: 'relative', boxShadow: '2px 0 16px rgba(0,0,0,0.12)' }}>
          <Button
            className="btn-transparent position-absolute top-0 end-0 m-2"
            style={{ borderRadius: '50%', width: 36, height: 36, zIndex: 400 }}
            aria-label={t('navigation.closeMenu')}
            onClick={() => setShowMobile(false)}
          >
            <X size={22} />
          </Button>
          {sidebarContent}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Sidebar;
