
// ...removed duplicate React import...
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Link } from 'react-router-dom';
// If you have a ThemeContext, import it. Otherwise, use a prop or fallback to a default.
import { useUiState } from '../../components/ui/UiStateContext';


import React, { useState } from 'react';
// ...existing code...

const GlobalHeader: React.FC = () => {
  // Use UiStateContext for theme, fallback to 'light' if not available
  const uiState = useUiState();
  const theme = uiState?.theme || 'light';
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <Navbar
      expand="md"
      sticky="top"
      bg={theme === 'dark' ? 'dark' : 'light'}
      variant={theme === 'dark' ? 'dark' : 'light'}
      className="w-100 m-0"
    >
      <Navbar.Brand href="#home">Material Manager</Navbar.Brand>
      <Navbar.Toggle aria-controls="offcanvas-navbar" onClick={handleShow} />
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
            Material Manager
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={handleClose}>Material List</Nav.Link>
            <Nav.Link as={Link} to="/settings" onClick={handleClose}>Settings</Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Navbar.Offcanvas>
    </Navbar>
  );
};

export default GlobalHeader;
