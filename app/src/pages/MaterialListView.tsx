import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useUiState } from '../components/ui/UiStateContext';
import { useNavigate } from 'react-router-dom';
import labels from '../labels';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { deleteMaterial, getAll, getById } from '../api/materials';
import { Material } from '../types';
import { Html5Qrcode } from 'html5-qrcode';
import MaterialItem from '../components/MaterialItem';
import Container from 'react-bootstrap/Container';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';

const isWeb = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !(window as any).Capacitor?.isNativePlatform?.();
};

const MaterialListView: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showWebQrModal, setShowWebQrModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState<{ header: string, message: string } | null>(null);
  const webQrRef = useRef<HTMLDivElement>(null);
  const html5QrInstance = useRef<Html5Qrcode | null>(null);

  const scan = useCallback(async () => {
    if (isWeb()) {
      setShowWebQrModal(true);
      return;
    }
    const granted = await requestPermissions();
    if (!granted) {
      setAlertContent({ header: 'Permission denied', message: 'Please grant camera permission to use the barcode scanner.' });
      setShowAlert(true);
      return;
    }
    const { barcodes } = await BarcodeScanner.scan();
    if (barcodes && barcodes.length > 0) {
      let id: string | null = null;
      let rawValue = barcodes[0].rawValue;
      if (typeof rawValue === 'string') {
        rawValue = rawValue.trim();
        try {
          const data = JSON.parse(rawValue);
          if (data && data.id) {
            id = data.id;
          }
        } catch {
          if (rawValue) {
            id = rawValue;
          }
        }
      }
      if (id) {
        try {
          const material = await getById(id);
          if (material) {
            navigate(`/material/${material._id}`);
            return;
          }
        } catch {
          setAlertContent({ header: 'Material inexistent', message: `Materialul scanat (${id}) nu există în aplicație.` });
          setShowAlert(true);
          return;
        }
      }
    }
    setAlertContent({ header: 'QR invalid', message: 'Codul QR scanat nu contine date valide de material.' });
    setShowAlert(true);
  }, [navigate, setAlertContent, setShowAlert, setShowWebQrModal]);

  const requestPermissions = async (): Promise<boolean> => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  };


  const loadData = async () => {
    getAll().then((data) => setMaterials(data)).catch((error) => console.log(error));
  };

  useEffect(() => {
    loadData();
  }, []);

  const closeWebQrModal = async () => {
    setShowWebQrModal(false);
    if (html5QrInstance.current) {
      try {
        await html5QrInstance.current.stop();
      } catch (e) {
        console.error(e);
      }
      html5QrInstance.current = null;
    }
  };

  async function handleDeleteMaterial(id: string | undefined) {
    if (!id) return;
    try {
      await deleteMaterial(id);
      await loadData();
    } catch {
      setAlertContent({ header: 'Eroare', message: 'Nu s-a putut șterge materialul.' });
      setShowAlert(true);
    }
  }

  // Footer actions for MaterialListView
  const { setFooterActions } = useUiState();
  useEffect(() => {
    setFooterActions({
      actionsLeft: (
        <Button
          className="btn-success  me-2"
          onClick={() => navigate('/material/')}
          data-cy="add-material-btn"
          aria-label="Adaugă Material"
        >
          <span className="d-md-none">+</span>
          <span className="d-none d-md-inline">+ Adaugă</span>
        </Button>
      ),
      actionsRight: (
        <>
          <Button
            className="btn-emphasized me-2"
            style={{ fontWeight: 600, fontSize: '1.1rem', borderRadius: 12 }}
            onClick={scan}
            data-cy="scan-qr-btn"
          >
            <span className="d-md-none">📷</span> <span className="d-none d-md-inline">Scanează Material</span>
          </Button>
          <Button
            className="btn-default"
            style={{ fontWeight: 600, fontSize: '1.1rem', borderRadius: 12 }}
            onClick={() => navigate('/processing')}
          >
            <span className="d-md-none">⚙️</span> <span className="d-none d-md-inline">Prelucrare</span>
          </Button>
        </>
      )
    });
    return () => setFooterActions(null);
  }, [navigate, scan, setFooterActions]);


  return (
    <Container
      className="py-2 px-0 px-md-3"
      style={{ minHeight: '100vh', height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Main content: responsive flex for mobile/desktop */}
      <Row className="g-0 flex-column flex-md-row flex-grow-1" style={{ flex: 1, minHeight: 0 }}>
        <Col xs={12} md={8} className="mx-auto order-2 order-md-1 d-flex flex-column" style={{ height: '100%', minHeight: 0 }}>
          <Card className="shadow-sm border-0 mb-3 flex-grow-1 d-flex flex-column" style={{ minHeight: 300, height: '100%' }}>
            <Card.Body
              className="p-2 p-md-3 flex-grow-1 d-flex flex-column"
            >
              <ListGroup data-cy="material-list" variant="flush">
                {materials.length === 0 && (
                  <div className="text-center text-muted py-5">Niciun material găsit.</div>
                )}
                {materials.map((material) => (
                  <ListGroup.Item
                    key={material.id || material._id}
                    className="d-flex align-items-center px-2 px-md-3 py-2 border-0 border-bottom"
                    style={{ background: 'transparent', borderRadius: 12 }}
                  >
                    <div
                      style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}
                      onClick={() => navigate(`/material/${material.id || material._id}`)}
                      data-cy={`material-list-item-${material.id || material._id}`}
                    >
                      <MaterialItem material={material} />
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Web QR Modal */}
      <Modal show={showWebQrModal} onHide={closeWebQrModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scanare QR</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="web-qr-reader" ref={webQrRef} style={{ width: 300, height: 300, background: '#000', margin: '0 auto', borderRadius: 16 }}></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={closeWebQrModal}>Închide</Button>
        </Modal.Footer>
      </Modal>
      {/* Alert Modal */}
      <Modal show={showAlert} onHide={() => setShowAlert(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{alertContent?.header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{alertContent?.message}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowAlert(false)}>OK</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
export default MaterialListView;
