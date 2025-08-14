import React, { useState, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Material } from '../types';
import Table from 'react-bootstrap/Table';
import { MaterialMappings } from '../config/materialMappings';

interface MaterialTableProps {
    materials: Material[];
    onRowClick: (id: string) => void;
}

const columns = [
    { key: 'tip', label: 'Tip', get: (m: Material) => MaterialMappings.getMaterialTypeLabel(m.tip || m.type || '-') },
    { key: 'id', label: 'ID', get: (m: Material) => m.id || m._id || '-' },
    { key: 'humanId', label: 'ID', get: (m: Material) => m.humanId || '-' },
    { key: 'specie', label: 'Specie', get: (m: Material) => MaterialMappings.getWoodSpeciesLabel(m.specie || '-') },
    { key: 'stare', label: 'Stare', get: (m: Material) => m.state || '-' },
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
        columns.forEach(col => {
            initial[col.key] = ['humanId', 'tip', 'specie', 'cod_unic_aviz', 'data', 'apv'].includes(col.key);
        });
        return initial;
    });

    const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        columns.forEach(col => {
            initial[col.key] = 140;
        });
        return initial;
    });
    const resizingCol = useRef<string | null>(null);
    const startX = useRef<number>(0);
    const startWidth = useRef<number>(0);

    const [showSettings, setShowSettings] = useState(false);

    const handleToggle = (key: string) => {
        setVisibleCols(cols => ({ ...cols, [key]: !cols[key] }));
    };

    const handleSelectAll = () => {
        const allSelected: Record<string, boolean> = {};
        columns.forEach(col => {
            allSelected[col.key] = true;
        });
        setVisibleCols(allSelected);
    };

    const handleClearAll = () => {
        const allDeselected: Record<string, boolean> = {};
        columns.forEach(col => {
            allDeselected[col.key] = false;
        });
        setVisibleCols(allDeselected);
    };

    const handleMouseDown = (key: string, e: React.MouseEvent) => {
        resizingCol.current = key;
        startX.current = e.clientX;
        startWidth.current = colWidths[key];
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!resizingCol.current) return;
        const delta = e.clientX - startX.current;
        setColWidths(widths => ({
            ...widths,
            [resizingCol.current!]: Math.max(60, startWidth.current + delta)
        }));
    };

    const handleMouseUp = () => {
        resizingCol.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
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
                            <th
                                key={col.key}
                                style={{ position: 'relative', width: colWidths[col.key], minWidth: 60 }}
                            >
                                <span>{col.label}</span>
                                <span
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: 8,
                                        cursor: 'col-resize',
                                        zIndex: 2,
                                        userSelect: 'none',
                                        background: 'rgba(0,0,0,0.03)'
                                    }}
                                    onMouseDown={e => handleMouseDown(col.key, e)}
                                />
                            </th>
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
                                <td key={col.key} style={{ width: colWidths[col.key], minWidth: 60 }}>{col.get(material)}</td>
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
                    <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                        <Button variant="outline-primary" size="sm" onClick={handleSelectAll}>
                            Selectează toate
                        </Button>
                        <Button variant="outline-secondary" size="sm" onClick={handleClearAll}>
                            Deselectează toate
                        </Button>
                    </div>
                    <div className="multiselect-container">
                        {columns.map(col => (
                            <div
                                key={col.key}
                                className={`multiselect-item ${visibleCols[col.key] ? 'multiselect-item-selected' : ''}`}
                                onClick={() => handleToggle(col.key)}
                            >
                                <input
                                    type="checkbox"
                                    checked={visibleCols[col.key]}
                                    onChange={() => { }} // Controlled by parent div click
                                    style={{ marginRight: 8, pointerEvents: 'none' }}
                                />
                                <span className="multiselect-item-text">
                                    {col.label}
                                </span>
                                {visibleCols[col.key] && (
                                    <span className="multiselect-item-check">
                                        ✓
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="multiselect-counter">
                        {Object.values(visibleCols).filter(Boolean).length} din {columns.length} coloane selectate
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
