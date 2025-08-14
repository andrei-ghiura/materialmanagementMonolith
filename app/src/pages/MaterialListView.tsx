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
import { Camera, GearFill, Hammer, Plus, QrCodeScan } from 'react-bootstrap-icons';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import MaterialTable from '../components/MaterialTable';

// Simple hook to detect desktop vs mobile/tablet
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
}
const isWeb = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !(window as any).Capacitor?.isNativePlatform?.();
};

const MaterialListView: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filters, setFilters] = useState<{ key: keyof Material | '', value: string }[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ [key: string]: string[] }>({});
  const [showAddFilter, setShowAddFilter] = useState(false);
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
    getAll().then((data) => {
      setMaterials(data);
      // Build filter options for autocomplete
      const options: { [key: string]: Set<string> } = {};
      data.forEach((mat: Material) => {
        Object.keys(mat).forEach((key) => {
          if (!options[key]) options[key] = new Set();
          if (mat[key as keyof Material] != null) {
            options[key].add(String(mat[key as keyof Material]));
          }
        });
      });
      const opts: { [key: string]: string[] } = {};
      Object.keys(options).forEach((k) => opts[k] = Array.from(options[k]));
      setFilterOptions(opts);
    }).catch((error) => console.log(error));
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
          <span className=""><Plus /></span>
          <span className="d-none d-md-inline">Adaugă</span>
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
            <span className=""><QrCodeScan /></span> <span className="d-none d-md-inline">Scanează Material</span>
          </Button>
          <Button
            className="btn-default"
            style={{ fontWeight: 600, fontSize: '1.1rem', borderRadius: 12 }}
            onClick={() => navigate('/processing')}
          >
            <span className=""><Hammer /></span> <span className="d-none d-md-inline">Prelucrare</span>
          </Button>
        </>
      )
    });
    return () => setFooterActions(null);
  }, [navigate, scan, setFooterActions]);


  const isDesktop = useIsDesktop();

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    if (filters.length === 0) return materials;
    return materials.filter((mat) => {
      return filters.every((f) => {
        if (!f.key) return true;
        const val = mat[f.key];
        return val != null && String(val).toLowerCase().includes(f.value.toLowerCase());
      });
    });
  }, [materials, filters]);

  // Add filter field
  const handleAddFilter = () => {
    setFilters([...filters, { key: '', value: '' }]);
  };

  // Remove filter field
  const handleRemoveFilter = (idx: number) => {
    setFilters(filters.filter((_, i) => i !== idx));
  };

  // Update filter field
  const handleFilterChange = (idx: number, key: keyof Material | '', value: string) => {
    const newFilters = [...filters];
    newFilters[idx] = { key, value };
    setFilters(newFilters);
  };

  return (
    <div
      className="w-screen min-h-screen h-screen flex flex-col"
      style={{ margin: 0, padding: 0 }}
    >
      {/* Filter Toolbar */}
      <Card className="mb-2 shadow-sm border-0 w-full">
        <Card.Body className="py-2 px-2 d-flex flex-wrap align-items-center gap-2">
          {filters.map((filter, idx) => (
            <div key={idx} className="d-flex align-items-center gap-2" style={{ minWidth: 220 }}>
              <select
                className="form-select"
                style={{ minWidth: 100 }}
                value={filter.key}
                onChange={e => handleFilterChange(idx, e.target.value as keyof Material, filter.value)}
              >
                <option value="">Atribut</option>
                {Object.keys(filterOptions).map((attr) => (
                  <option key={attr} value={attr}>{labels[attr] || attr}</option>
                ))}
              </select>
              <input
                className="form-control"
                style={{ minWidth: 100 }}
                type="text"
                value={filter.value}
                onChange={e => handleFilterChange(idx, filter.key, e.target.value)}
                list={`filter-autocomplete-${idx}`}
                placeholder="Valoare..."
                disabled={!filter.key}
              />
              <datalist id={`filter-autocomplete-${idx}`}>
                {(filter.key && filterOptions[filter.key]) ? filterOptions[filter.key].map((opt) => (
                  <option key={opt} value={opt} />
                )) : null}
              </datalist>
              <Button variant="outline-danger" size="sm" onClick={() => handleRemoveFilter(idx)} aria-label="Remove filter">✕</Button>
            </div>
          ))}
          <Button variant="outline-primary" size="sm" onClick={handleAddFilter} aria-label="Add filter">+ Filtru</Button>
        </Card.Body>
      </Card>
      <div className="order-2 order-md-1 d-flex flex-col w-full" style={{ height: '100%', minHeight: 0, width: '100%' }}>
        <Card className="shadow-sm border-0 mb-3 flex-grow-1 d-flex flex-column w-full" style={{ minHeight: 300, height: '100%', width: '100%' }}>
          <Card.Body className="p-2 p-md-3 flex-grow-1 d-flex flex-column">
            {filteredMaterials.length === 0 ? (
              <div className="text-center text-muted py-5">Niciun material găsit.</div>
            ) : isDesktop ? (
              <MaterialTable
                materials={filteredMaterials}
                onRowClick={(id) => navigate(`/material/${id}`)}
              />
            ) : (
              <ListGroup data-cy="material-list" variant="flush" style={{ width: '100%' }}>
                {filteredMaterials.map((material) => (
                  <ListGroup.Item
                    key={material.id || material._id}
                    className="d-flex align-items-center px-2 px-md-3 py-2 border-0 border-bottom"
                    style={{ background: 'transparent', borderRadius: 12, width: '100%' }}
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
            )}
          </Card.Body>
        </Card>
      </div>

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
    </div>
  );
}
export default MaterialListView;
