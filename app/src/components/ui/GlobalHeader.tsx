
// ...removed duplicate React import...
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// If you have a ThemeContext, import it. Otherwise, use a prop or fallback to a default.
import { useUiState } from '../../components/ui/useUiState';
import useI18n from '../../hooks/useI18n';

import React, { useState } from 'react';
// ...existing code...

const GlobalHeader: React.FC = () => {
  // Use UiStateContext for theme, fallback to 'light' if not available
  const uiState = useUiState();
  const theme = uiState?.theme || 'light';
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const { t } = useI18n();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleBack = () => navigate(-1);

  // Don't show back button on home page
  const showBackButton = location.pathname !== '/';

  // Breadcrumbs logic
  const [materialName, setMaterialName] = React.useState<string | null>(null);

  React.useEffect(() => {
    // If on material detail page, fetch material
    const match = location.pathname.match(/^\/material\/(\w{24})(?:$|\/)/);
    if (match) {
      const id = match[1];
      import('../../api/materials').then(({ getById }) => {
        getById(id).then((mat) => {
          setMaterialName(mat.humanId || mat.nume || mat._id);
        }).catch(() => setMaterialName(null));
      });
    } else {
      setMaterialName(null);
    }
  }, [location.pathname]);

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const crumbs: { label: string; to?: string }[] = [];
    if (segments.length === 0) {
      crumbs.push({ label: t('navigation.materialList'), to: '/' });
    } else {
      let currentPath = '';
      segments.forEach((seg, idx) => {
        currentPath += '/' + seg;
        let label = '';
        switch (seg) {
          case 'material':
            label = t('navigation.materialList');
            break;
          case 'processing':
            label = t('navigation.processing');
            break;
          case 'flow':
            label = t('navigation.flow');
            break;
          case 'settings':
            label = t('navigation.settings');
            break;
          case 'ancestors':
            label = t('material.components');
            break;
          default:
            // If it's a material id, show humanId if available
            if (currentPath.match(/^\/material\/(\w{24})$/) && materialName) {
              label = materialName;
            } else if (seg.match(/^[0-9a-fA-F]{24}$/)) {
              label = t('common.details');
            } else {
              label = seg;
            }
        }
        crumbs.push({ label, to: idx < segments.length - 1 ? currentPath : undefined });
      });
    }
    return crumbs;
  };
  const breadcrumbs = getBreadcrumbs();

  return (
    <Navbar
      expand="md"
      sticky="top"
      bg={theme === 'dark' ? 'dark' : 'light'}
      variant={theme === 'dark' ? 'dark' : 'light'}
      className="w-100 m-0"
    >
      <div className="d-flex align-items-center">
        {showBackButton && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleBack}
            className="me-2"
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: theme === 'dark' ? '#fff' : '#000',
              fontSize: '18px'
            }}
            aria-label="Navigate back"
          >
            ←
          </Button>
        )}
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
            {breadcrumbs.map((crumb, idx) => (
              <li
                key={idx}
                className={`breadcrumb-item${idx === breadcrumbs.length - 1 ? ' active' : ''}`}
                aria-current={idx === breadcrumbs.length - 1 ? 'page' : undefined}
              >
                {crumb.to ? (
                  <Link to={crumb.to} style={{ textDecoration: 'none', color: theme === 'dark' ? '#fff' : '#007bff' }}>{crumb.label}</Link>
                ) : (
                  crumb.label
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="d-flex align-items-center">
        <Navbar.Toggle aria-controls="offcanvas-navbar" onClick={handleShow} />
      </div>
      <Navbar.Offcanvas
        show={show}
        onHide={handleClose}
        id="offcanvas-navbar"
        aria-labelledby="offcanvas-navbar-label"
        placement="start"
        className={theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="offcanvas-navbar-label">
            {t('common.appTitle')}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" onClick={handleClose}>{t('navigation.materialList')}</Nav.Link>
            <Nav.Link as={Link} to="/settings" onClick={handleClose}>{t('navigation.settings')}</Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Navbar.Offcanvas>
    </Navbar>
  );
};

export default GlobalHeader;
