// ...removed duplicate showDeleted declaration...
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useUiState } from '../components/ui/useUiState';
import { useNavigate } from 'react-router-dom';
import useI18n from '../hooks/useI18n';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { getAll, getById } from '../api/materials';
import { Material } from '../types';
import { Html5Qrcode } from 'html5-qrcode';
import MaterialItem from '../components/MaterialItem';
import { Hammer, Plus, QrCodeScan } from 'react-bootstrap-icons';

import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
// import Modal from 'react-bootstrap/Modal';
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
  const [materials, setMaterials] = useState<Material[]>([]);
  // Multiselect filter state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  // Extract unique material types and species from materials
  const materialTypes = useMemo(() => Array.from(new Set(materials.map(m => m.type).filter(Boolean))), [materials]);
  const woodSpecies = useMemo(() => Array.from(new Set(materials.map(m => m.specie).filter(Boolean))), [materials]);
  // ...existing code...
  const navigate = useNavigate();
  const { t } = useI18n();

  // ...existing code...
  // ...existing code...
  // Removed filters state
  // ...existing code...
  const [showWebQrModal, setShowWebQrModal] = useState(false);
  // ...existing code...
  const [showDeleted, setShowDeleted] = useState(false);
  const webQrRef = useRef<HTMLDivElement>(null);
  const html5QrInstance = useRef<Html5Qrcode | null>(null);

  const scan = useCallback(async () => {
    if (isWeb()) {
      setShowWebQrModal(true);
      return;
    }
    const granted = await requestPermissions();
    if (!granted) {
      // Alert functionality removed
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
          // Alert functionality removed
          return;
        }
      }
    }
    // Alert functionality removed
  }, [navigate, setShowWebQrModal]);

  const requestPermissions = async (): Promise<boolean> => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  };


  const loadData = useCallback(async () => {
    getAll({ showDeleted: showDeleted ? 'true' : undefined }).then((data) => {
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
      // Filter options functionality removed
    }).catch(() => {
      // Handle load error silently
    });
  }, [showDeleted]);

  useEffect(() => {
    loadData();
  }, [showDeleted, loadData]);

  // Initialize QR scanner when modal opens
  useEffect(() => {
    if (showWebQrModal && webQrRef.current) {
      const startScanner = async () => {
        try {
          if (!html5QrInstance.current) {
            html5QrInstance.current = new Html5Qrcode("web-qr-reader");
          }

          await html5QrInstance.current.start(
            { facingMode: "environment" }, // Use back camera
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            async (decodedText: string) => {
              // Handle successful scan
              let id: string | null = null;
              const rawValue = decodedText.trim();

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

              if (id) {
                try {
                  const material = await getById(id);
                  if (material) {
                    await closeWebQrModal();
                    navigate(`/material/${material._id}`);
                    return;
                  }
                } catch {
                  // Alert functionality removed
                  await closeWebQrModal();
                  return;
                }
              }

              // Alert functionality removed
              await closeWebQrModal();
            },
            () => {
              // Handle scan errors (can be ignored for continuous scanning)
            }
          );
        } catch {
          // Alert functionality removed
          setShowWebQrModal(false);
        }
      };

      startScanner();
    }

    // Cleanup function
    return () => {
      if (html5QrInstance.current && showWebQrModal) {
        html5QrInstance.current.stop().catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, [showWebQrModal, navigate, t]);

  const closeWebQrModal = async () => {
    setShowWebQrModal(false);
    if (html5QrInstance.current) {
      try {
        await html5QrInstance.current.stop();
        await html5QrInstance.current.clear();
      } catch {
        // Ignore cleanup errors
      }
      html5QrInstance.current = null;
    }
  };

  // Footer actions for MaterialListView
  const { setFooterActions } = useUiState();
  useEffect(() => {
    setFooterActions({
      actionsLeft: (
        <Button
          className="btn-success  me-2"
          onClick={() => navigate('/material/')}
          data-cy="add-material-btn"
          aria-label={t('material.addMaterial')}
        >
          <span className=""><Plus /></span>
          <span className="d-none d-md-inline">{t('common.add')}</span>
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
            <span className=""><QrCodeScan /></span> <span className="d-none d-md-inline">{t('material.scanQr')} Material</span>
          </Button>
          <Button
            className="btn-default"
            style={{ fontWeight: 600, fontSize: '1.1rem', borderRadius: 12 }}
            onClick={() => navigate('/processing')}
          >
            <span className=""><Hammer /></span> <span className="d-none d-md-inline">{t('processing.title')}</span>
          </Button>
        </>
      )
    });
    return () => setFooterActions(null);
  }, [navigate, scan, setFooterActions, t]);


  const isDesktop = useIsDesktop();

  // Filtered materials
  // Filter materials based on selected types and species
  const filteredMaterials = useMemo(() => {
    let result = materials;
    if (selectedTypes.length > 0) {
      result = result.filter(m => selectedTypes.includes(m.type));
    }
    if (selectedSpecies.length > 0) {
      result = result.filter(m => selectedSpecies.includes(m.specie));
    }
    return result;
  }, [materials, selectedTypes, selectedSpecies]);

  // ...existing code...

  return (
    <div
      className="w-screen min-h-screen h-screen flex flex-col"
      style={{ margin: 0, padding: 0 }}
    >
      <div className="toolbar d-flex flex-wrap align-items-center gap-3 mb-3 p-2" style={{ background: '#23272f', borderRadius: 8, border: '1px solid #343a40', color: '#f8f9fa' }}>
        <div className="form-check form-switch d-flex align-items-center ">
          <input
            className="form-check-input"
            type="checkbox"
            id="showDeletedSwitch"
            checked={showDeleted}
            onChange={e => setShowDeleted(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          <label className="form-check-label" htmlFor="showDeletedSwitch">{t('filters.showDeleted') || 'Afișează materiale șterse'}</label>
        </div>
        <div className="d-flex flex-column">
          <label htmlFor="typeFilter" className="form-label mb-1">{t('material.materialType') || 'Tip material'}</label>
          <select
            id="typeFilter"
            className="form-select"
            value={selectedTypes[0] || ''}
            onChange={e => setSelectedTypes(e.target.value ? [e.target.value] : [])}
            style={{ minWidth: 180, maxWidth: 300 }}
          >
            <option value="">{t('filters.all') || 'Toate'}</option>
            {materialTypes.map(type => (
              <option key={type} value={type}>{t(`material.materialTypes.${type}`) || type}</option>
            ))}
          </select>
        </div>
        <div className="d-flex flex-column">
          <label htmlFor="speciesFilter" className="form-label mb-1">{t('material.species') || 'Specie lemn'}</label>
          <select
            id="speciesFilter"
            className="form-select"
            value={selectedSpecies[0] || ''}
            onChange={e => setSelectedSpecies(e.target.value ? [e.target.value] : [])}
            style={{ minWidth: 180, maxWidth: 300 }}
          >
            <option value="">{t('filters.all') || 'Toate'}</option>
            {woodSpecies.map(specie => (
              <option key={specie} value={specie}>{t(`material.woodSpecies.${specie}`) || specie}</option>
            ))}
          </select>
        </div>
      </div>
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
                    className="d-flex align-items-center px-2 px-md-3 py-2 border-0 "
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

      {/* Web QR Modal and Alert Modal removed for clarity. Restore actual modal code if needed. */}
    </div>
  );
}
export default MaterialListView;
