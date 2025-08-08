import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Material } from '../types';
import Table from 'react-bootstrap/Table';

interface MaterialTableProps {
    materials: Material[];
    onRowClick: (id: string) => void;
}

const columns = [
    { key: 'id', label: 'ID', get: (m: Material) => m.id || m._id || '-' },
    { key: 'humanId', label: 'Human ID', get: (m: Material) => m.humanId || '-' },
    { key: 'tip', label: 'Tip', get: (m: Material) => m.tip || m.type || '-' },
    { key: 'specie', label: 'Specie', get: (m: Material) => m.specie || '-' },
    { key: 'stare', label: 'Stare', get: (m: Material) => m.stare || '-' },
    { key: 'cod_unic_aviz', label: 'Cod Unic Aviz', get: (m: Material) => m.cod_unic_aviz || '-' },
    { key: 'data', label: 'Data', get: (m: Material) => m.data || '-' },
    { key: 'apv', label: 'APV', get: (m: Material) => m.apv || '-' },
    { key: 'lat', label: 'Lat', get: (m: Material) => m.lat || '-' },
    { key: 'log', label: 'Log', get: (m: Material) => m.log || '-' },
    { key: 'nr_placuta_rosie', label: 'Nr Placuta Rosie', get: (m: Material) => m.nr_placuta_rosie || '-' },
    { key: 'lungime', label: 'Lungime', get: (m: Material) => m.lungime || '-' },
    { key: 'diametru', label: 'Diametru', get: (m: Material) => m.diametru || '-' },
    { key: 'volum_placuta_rosie', label: 'Volum Placuta Rosie', get: (m: Material) => m.volum_placuta_rosie || '-' },
    { key: 'volum_total', label: 'Volum Total', get: (m: Material) => m.volum_total || '-' },
    { key: 'volum_net_paletizat', label: 'Volum Net Paletizat', get: (m: Material) => m.volum_net_paletizat || '-' },
    { key: 'volum_brut_paletizat', label: 'Volum Brut Paletizat', get: (m: Material) => m.volum_brut_paletizat || '-' },
    { key: 'nr_bucati', label: 'Nr Bucati', get: (m: Material) => m.nr_bucati || '-' },
    { key: 'observatii', label: 'Observatii', get: (m: Material) => m.observatii || '-' },
    { key: 'componente', label: 'Componente', get: (m: Material) => Array.isArray(m.componente) ? m.componente.length : '-' },
];

const MaterialTable: React.FC<MaterialTableProps> = ({ materials, onRowClick }) => {
    const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        columns.forEach(col => { initial[col.key] = true; });
        return initial;
    });

    const [showSettings, setShowSettings] = useState(false);

    const handleToggle = (key: string) => {
        setVisibleCols(cols => ({ ...cols, [key]: !cols[key] }));
    };

    return (
        <div>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outline-secondary" size="sm" onClick={() => setShowSettings(true)}>
                    ⚙️ Setări tabel
                </Button>
            </div>
            <Table responsive bordered hover className="material-table">
                <thead>
                    <tr>
                        {columns.filter(col => visibleCols[col.key]).map(col => (
                            <th key={col.key}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {materials.map((material) => (
                        <tr
                            key={material.id || material._id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => onRowClick(material.id || material._id)}
                            data-cy={`material-table-row-${material.id || material._id}`}
                        >
                            {columns.filter(col => visibleCols[col.key]).map(col => (
                                <td key={col.key}>{col.get(material)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal show={showSettings} onHide={() => setShowSettings(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Setări tabel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {columns.map(col => (
                            <label key={col.key} style={{ fontWeight: 400, minWidth: 120 }}>
                                <input
                                    type="checkbox"
                                    checked={visibleCols[col.key]}
                                    onChange={() => handleToggle(col.key)}
                                    style={{ marginRight: 4 }}
                                />
                                {col.label}
                            </label>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSettings(false)}>
                        Închide
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MaterialTable;
