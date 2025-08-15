import { Hammer, Plus, QrCode } from 'react-bootstrap-icons';
import { useQrScannerModal } from '../hooks/useQrScannerModal';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useUiState } from '../components/ui/useUiState';
import { useNavigate } from 'react-router-dom';
import useI18n from '../hooks/useI18n';
import { getAll } from '../api/materials';
import { Material } from '../types';
import MaterialItem from '../components/MaterialItem';

import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import MaterialTable from '../components/MaterialTable';
import { Modal } from 'react-bootstrap';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
}

const MaterialListView: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const materialTypes = useMemo(() => Array.from(new Set(materials.map(m => m.type).filter(Boolean))), [materials]);
  const woodSpecies = useMemo(() => Array.from(new Set(materials.map(m => m.specie).filter(Boolean))), [materials]);
  const navigate = useNavigate();
  const { t } = useI18n();

  const [showAlert, setShowAlert] = useState(false);
  const [alertContent] = useState<{ header: string, message: string } | null>(null);

  const [showDeleted, setShowDeleted] = useState(false);



  const loadData = useCallback(async () => {
    getAll({ showDeleted: showDeleted ? 'true' : undefined }).then((data) => {
      setMaterials(data);
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
    }).catch(() => {
    });
  }, [showDeleted]);

  useEffect(() => {
    loadData();
  }, [showDeleted, loadData]);

  const { setFooterActions } = useUiState();
  const { open: openQrScanner, QrScannerModal } = useQrScannerModal();
  useEffect(() => {
    setFooterActions({
      actionsLeft: (
        <>
          <Button
            className="btn-success me-2"
            onClick={() => navigate('/material/')}
            data-cy="add-material-btn"
            aria-label={t('material.addMaterial')}
          >
            <span className=""><Plus /></span>
            <span className="d-none d-md-inline">{t('common.add')}</span>
          </Button>
          <Button
            className="btn-info me-2"
            onClick={openQrScanner}
            aria-label="Scan QR"
          >
            <span className=""><QrCode /></span>
            <span className="d-none d-md-inline ms-1">Scan QR</span>
          </Button>
        </>
      ),
      actionsRight: (
        <Button
          className="btn-default"
          style={{ fontWeight: 600, fontSize: '1.1rem', borderRadius: 12 }}
          onClick={() => navigate('/processing')}
        >
          <span className=""><Hammer /></span> <span className="d-none d-md-inline">{t('processing.title')}</span>
        </Button>
      )
    });
    return () => setFooterActions(null);
  }, [navigate, setFooterActions, t, openQrScanner]);

  const isDesktop = useIsDesktop();

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
      <Modal show={showAlert} onHide={() => setShowAlert(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{alertContent?.header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{alertContent?.message}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowAlert(false)}>OK</Button>
        </Modal.Footer>
      </Modal>
      <QrScannerModal onScan={(scannedId) => {
        if (scannedId) {
          navigate(`/material/${scannedId}`);
        }
      }} />
    </div>
  );
}
export default MaterialListView;
