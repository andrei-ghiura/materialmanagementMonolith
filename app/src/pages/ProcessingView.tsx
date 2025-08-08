import { useState, useRef, useEffect, useCallback } from 'react';
import { Container, Form, Button, Modal, ListGroup, Alert, InputGroup } from 'react-bootstrap';
import { FaPlus, FaCheck, FaQrcode, FaSave } from 'react-icons/fa';
// ...existing code...
import { Html5Qrcode } from 'html5-qrcode';
import { Material } from '../types';
import { getAll, getById, processMaterials as processAPI } from '../api/materials';
import { MaterialMappings } from '../config/materialMappings';
import MaterialItem from '../components/MaterialItem';
import apiClient from '../api/apiClient';

// Processing type interface (matches backend)
interface ProcessingType {
    id: string;
    label: string;
    description: string;
    sourceTypes: string[];
    resultType: string;
    carryOverFields: Array<{
        sourceField: string;
        resultField: string;
        carryOverStrategy: string;
        isRequired: boolean;
        transform?: ((value: unknown, sourceMaterials: Material[]) => unknown);
    }>;
}

// Check if we're on web or native
const isWeb = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !(window as any).Capacitor?.isNativePlatform?.();
};

/*
API Endpoint design prompt:
Create a Node.js Express endpoint for processing materials. The endpoint should:
1. Accept an array of source material IDs and a configuration for the new material(s)
2. Retrieve all source materials from the database
3. Calculate aggregated properties (volume, dimensions, etc.) based on source materials
4. Create one or more new materials with the calculated properties
5. Update the status of source materials to indicate they've been processed
6. Return the newly created material(s)

The endpoint should handle validation, error cases, and maintain data integrity.
Include transaction support to ensure all operations succeed or fail together.
*/

const ProcessingView: React.FC = () => {
    const [alert, setAlert] = useState<{ header: string; message: string; variant?: string; onClose?: () => void } | null>(null);
    const [navigateHome, setNavigateHome] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [showMaterialSelectionModal, setShowMaterialSelectionModal] = useState(false);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
    const [materialInput, setMaterialInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [outputConfig, setOutputConfig] = useState({
        count: 1,
        type: '',
        specie: '',
        processingType: '' // Added processing type
    });
    const [selectedProcessingType, setSelectedProcessingType] = useState<ProcessingType | null>(null);
    const [allProcessingTypes, setAllProcessingTypes] = useState<ProcessingType[]>([]);

    // Helper functions to work with processing types
    const getProcessingType = useCallback((id: string): ProcessingType | undefined => {
        return allProcessingTypes.find(p => p.id === id);
    }, [allProcessingTypes]);

    // Load all processing types from backend
    const loadProcessingTypes = async () => {
        try {
            const response = await apiClient.get('/processing-types');
            setAllProcessingTypes(response.data);
        } catch (error) {
            console.error('Failed to load processing types:', error);
        }
    };

    // Track available wood species from selected materials
    const availableWoodSpecies = selectedMaterials.reduce((species, material) => {
        if (material.specie && !species.includes(material.specie)) {
            species.push(material.specie);
        }
        return species;
    }, [] as string[]);

    // Auto-select wood species if there's only one
    useEffect(() => {
        if (availableWoodSpecies.length === 1 && outputConfig.specie !== availableWoodSpecies[0]) {
            setOutputConfig(prev => ({
                ...prev,
                specie: availableWoodSpecies[0]
            }));
        }
    }, [availableWoodSpecies, outputConfig.specie]);

    // Validate selected materials against processing type when materials change
    useEffect(() => {
        if (selectedMaterials.length > 0 && selectedProcessingType) {
            // Check if all materials are compatible with the selected processing type
            const incompatibleMaterials = selectedMaterials.filter(material =>
                !selectedProcessingType.sourceTypes.includes(material.type)
            );

            if (incompatibleMaterials.length > 0) {
                // Remove incompatible materials and show alert
                const compatibleMaterials = selectedMaterials.filter(material =>
                    selectedProcessingType.sourceTypes.includes(material.type)
                );

                setSelectedMaterials(compatibleMaterials);

                setAlert({
                    header: 'Materiale incompatibile',
                    message: `${incompatibleMaterials.length} materiale au fost eliminate deoarece nu sunt compatibile cu tipul de procesare selectat.`,
                    variant: 'warning',
                });
            }

            // Check if all remaining materials are the same type
            if (selectedMaterials.length > 1) {
                const firstType = selectedMaterials[0].type;
                const allSameType = selectedMaterials.every(m => m.type === firstType);

                if (!allSameType) {
                    setAlert({
                        header: 'Materiale incompatibile',
                        message: 'Toate materialele selectate trebuie să fie de același tip.',
                        variant: 'warning',
                    });
                }
            }
        }
    }, [selectedMaterials, selectedProcessingType]);
    useEffect(() => {
        if (outputConfig.processingType) {
            const processingType = getProcessingType(outputConfig.processingType);
            setSelectedProcessingType(processingType || null);

            // Auto-set output material type based on processing type
            if (processingType) {
                setOutputConfig(prev => ({
                    ...prev,
                    type: processingType.resultType === 'same'
                        ? (selectedMaterials[0]?.type || '')
                        : processingType.resultType
                }));
            }
        } else {
            setSelectedProcessingType(null);
        }
    }, [outputConfig.processingType, selectedMaterials, getProcessingType]);

    const qrRef = useRef<HTMLDivElement>(null);
    const html5QrInstance = useRef<Html5Qrcode | null>(null);

    // Load all materials and processing types on mount
    useEffect(() => {
        loadMaterials();
        loadProcessingTypes();
    }, []);

    // Filter materials whenever the search term changes or processing type changes
    useEffect(() => {
        if (allMaterials.length > 0) {
            let materialsToFilter = allMaterials;

            // If a processing type is selected, filter by valid source types
            if (selectedProcessingType) {
                materialsToFilter = allMaterials.filter(material =>
                    selectedProcessingType.sourceTypes.includes(material.type)
                );
            }

            if (!materialSearchTerm.trim()) {
                setFilteredMaterials(materialsToFilter);
            } else {
                const lowercaseSearch = materialSearchTerm.toLowerCase();
                const filtered = materialsToFilter.filter(material =>
                    (material.humanId && material.humanId.toLowerCase().includes(lowercaseSearch)) ||
                    (material.id && material.id.toLowerCase().includes(lowercaseSearch)) ||
                    (MaterialMappings.getMaterialTypeLabel(material.type).toLowerCase().includes(lowercaseSearch)) ||
                    (MaterialMappings.getWoodSpeciesLabel(material.specie).toLowerCase().includes(lowercaseSearch))
                );
                setFilteredMaterials(filtered);
            }
        }
    }, [materialSearchTerm, allMaterials, selectedProcessingType]);

    const loadMaterials = async () => {
        try {
            const materials = await getAll();
            setAllMaterials(materials);
            setFilteredMaterials(materials);
        } catch (error) {
            console.error('Failed to load materials:', error);
            setAlert({
                header: 'Eroare',
                message: 'Nu s-au putut încărca materialele.',
                variant: 'danger',
            });
        }
    };

    const addMaterialById = async (id: string) => {
        setMaterialInput('');
        try {
            if (!selectedProcessingType) {
                setAlert({ header: 'Selectați tipul de procesare', message: 'Vă rugăm să selectați mai întâi tipul de procesare înainte de a adăuga materiale.', variant: 'warning' });
                return;
            }
            if (selectedMaterials.some(m => m._id === id || m.humanId === id)) {
                setAlert({ header: 'Material deja adăugat', message: 'Acest material este deja în lista de procesare.', variant: 'info' });
                return;
            }
            let material = allMaterials.find(m => m.id === id || m.humanId === id);
            if (!material) {
                material = await getById(id);
            }
            if (material) {
                if (!selectedProcessingType.sourceTypes.includes(material.type)) {
                    setAlert({ header: 'Material incompatibil', message: `Acest material de tip "${material.type}" nu poate fi procesat cu "${selectedProcessingType.label}". Tipurile acceptate sunt: ${selectedProcessingType.sourceTypes.join(', ')}.`, variant: 'danger' });
                    return;
                }
                if (selectedMaterials.length > 0 && selectedMaterials[0].type !== material.type) {
                    setAlert({ header: 'Tipuri diferite de materiale', message: 'Toate materialele selectate trebuie să fie de același tip.', variant: 'danger' });
                    return;
                }
                setSelectedMaterials(prev => [...prev, material]);
            } else {
                setAlert({ header: 'Material inexistent', message: `Materialul cu ID-ul ${id} nu există.`, variant: 'danger' });
            }
        } catch (error) {
            setAlert({ header: 'Eroare', message: 'Nu s-a putut adăuga materialul.', variant: 'danger' });
        }
    };

    const handleInputKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && materialInput) {
            addMaterialById(materialInput);
        }
    };

    const removeMaterial = (index: number) => {
        setSelectedMaterials(prev => prev.filter((_, i) => i !== index));
    };

    const handleQrScan = async () => {
        setShowQrModal(true);
    };

    const processMaterials = async () => {
        if (selectedMaterials.length === 0) {
            setAlert({ header: 'Niciun material selectat', message: 'Selectați cel puțin un material pentru procesare.', variant: 'warning' });
            return;
        }
        if (!outputConfig.processingType) {
            setAlert({ header: 'Configurare incompletă', message: 'Selectați tipul de procesare.', variant: 'warning' });
            return;
        }
        if (!outputConfig.type) {
            setAlert({ header: 'Configurare incompletă', message: 'Selectați tipul materialului rezultat.', variant: 'warning' });
            return;
        }
        if (!outputConfig.specie) {
            setAlert({ header: 'Configurare incompletă', message: 'Selectați specia lemnului pentru materialul rezultat.', variant: 'warning' });
            return;
        }
        if (!availableWoodSpecies.includes(outputConfig.specie)) {
            setAlert({ header: 'Specie invalidă', message: 'Specia selectată nu este prezentă în materialele sursă.', variant: 'danger' });
            return;
        }
        setIsProcessing(true);
        try {
            const sourceIds = selectedMaterials.map(m => m._id);
            const apiConfig = {
                type: outputConfig.type,
                specie: outputConfig.specie,
                count: outputConfig.count,
                processingTypeId: outputConfig.processingType
            };
            const result = await processAPI(sourceIds, apiConfig);
            setAlert({
                header: 'Succes',
                message: `${result.message}`,
                variant: 'success',
                onClose: () => {
                    setSelectedMaterials([]);
                    setNavigateHome(true);
                }
            });
        } catch {
            setAlert({ header: 'Eroare de procesare', message: 'Nu s-au putut procesa materialele.', variant: 'danger' });
        } finally {
            setIsProcessing(false);
        }
    };

    const closeQrModal = async () => {
        setShowQrModal(false);
        if (html5QrInstance.current) {
            try {
                await html5QrInstance.current.stop();
            } catch {
                // ignore
            }
            html5QrInstance.current = null;
        }
    };


    // Navigation after success
    useEffect(() => {
        if (navigateHome) {
            window.location.href = '/';
        }
    }, [navigateHome]);

    return (
        <Container className="py-4">
            <h2 className="mb-3">Procesare Materiale</h2>

            {alert && (
                <Alert variant={alert.variant || 'info'} dismissible onClose={() => { if (alert.onClose) alert.onClose(); setAlert(null); }}>
                    <strong>{alert.header}</strong>
                    <div>{alert.message}</div>
                </Alert>
            )}

            {/* Step 1: Processing Type Selection */}
            <h5 className="mt-3">Pasul 1: Selectează Tipul de Procesare</h5>
            <Form.Group className="mb-3">
                <Form.Label>Tip procesare</Form.Label>
                <Form.Select
                    value={outputConfig.processingType}
                    onChange={e => {
                        const processingTypeId = e.target.value;
                        setOutputConfig({ ...outputConfig, processingType: processingTypeId });
                        if (processingTypeId !== outputConfig.processingType) {
                            setSelectedMaterials([]);
                        }
                    }}
                >
                    <option value="">Selectează tipul de procesare</option>
                    {allProcessingTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                </Form.Select>
                {allProcessingTypes.length === 0 && (
                    <div className="text-muted mt-2">Se încarcă tipurile de procesare...</div>
                )}
            </Form.Group>

            {selectedProcessingType && (
                <Alert variant="secondary">
                    <div><strong>Descriere:</strong> {selectedProcessingType.description}</div>
                    <div><strong>Tip rezultat:</strong> {selectedProcessingType.resultType === 'same' ? 'Același ca sursa' : selectedProcessingType.resultType}</div>
                    <div><strong>Tipuri materiale acceptate:</strong> {selectedProcessingType.sourceTypes.join(', ')}</div>
                </Alert>
            )}

            {/* Step 2: Material Selection */}
            {selectedProcessingType && (
                <>
                    <h5 className="mt-4">Pasul 2: Adaugă Materiale</h5>
                    <Form.Group className="mb-2">
                        <Form.Label>Adaugă Material (ID sau Cod)</Form.Label>
                        <InputGroup>
                            <Form.Control
                                value={materialInput}
                                onChange={e => setMaterialInput(e.target.value)}
                                onKeyPress={handleInputKeyPress}
                                placeholder="Introdu ID-ul materialului"
                            />
                            <Button variant="primary" onClick={() => setShowMaterialSelectionModal(true)} data-cy="add-material-by-id-btn">
                                <FaPlus />
                            </Button>
                            <Button variant="outline-secondary" onClick={handleQrScan} data-cy="scan-qr-btn">
                                <FaQrcode />
                            </Button>
                        </InputGroup>
                    </Form.Group>
                    <div className="text-muted mb-2">
                        <strong>Restricție:</strong> Doar materialele de tip {selectedProcessingType.sourceTypes.join(' sau ')} pot fi procesate cu această opțiune.
                    </div>
                </>
            )}

            {/* Selected Materials Section */}
            {selectedProcessingType && (
                <>
                    <h5 className="mt-3">Materiale Selectate</h5>
                    {selectedMaterials.length === 0 ? (
                        <div className="text-center text-muted">Niciun material selectat</div>
                    ) : (
                        <ListGroup className="mb-3">
                            {selectedMaterials.map((material, index) => (
                                <ListGroup.Item key={material._id} data-cy={`selected-material-item-${material._id}`}>
                                    <MaterialItem
                                        material={material}
                                        detailButton={false}
                                        showDeleteButton={true}
                                        onDelete={() => removeMaterial(index)}
                                    />
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </>
            )}

            {/* Step 3: Output Configuration */}
            {selectedProcessingType && selectedMaterials.length > 0 && (
                <>
                    <h5 className="mt-4">Pasul 3: Configurare Rezultat</h5>
                    <Form.Group className="mb-3">
                        <Form.Label>Număr de materiale rezultate</Form.Label>
                        <Form.Control
                            type="number"
                            min={1}
                            value={outputConfig.count}
                            onChange={e => setOutputConfig({ ...outputConfig, count: parseInt(e.target.value || '1', 10) })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Tip material</Form.Label>
                        <Form.Select
                            value={outputConfig.type}
                            disabled={selectedProcessingType !== null}
                            onChange={e => setOutputConfig({ ...outputConfig, type: e.target.value })}
                        >
                            <option value="">Selectează tipul</option>
                            {MaterialMappings.getMaterialTypeOptions().map(type => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </Form.Select>
                        {selectedProcessingType && (
                            <div className="text-muted mt-1">Tipul este determinat automat de procesarea selectată</div>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Specie lemn</Form.Label>
                        <Form.Select
                            value={outputConfig.specie}
                            disabled={availableWoodSpecies.length <= 1}
                            onChange={e => setOutputConfig({ ...outputConfig, specie: e.target.value })}
                        >
                            <option value="">Selectează specia</option>
                            {MaterialMappings.getWoodSpeciesOptions()
                                .filter(specie => availableWoodSpecies.includes(specie.id))
                                .map(specie => (
                                    <option key={specie.id} value={specie.id}>{specie.label}</option>
                                ))}
                        </Form.Select>
                        {availableWoodSpecies.length === 0 && (
                            <div className="text-muted mt-1">Adăugați materiale pentru a selecta specia</div>
                        )}
                    </Form.Group>
                    <div className="d-grid gap-2">
                        <Button
                            variant="success"
                            onClick={processMaterials}
                            disabled={selectedMaterials.length === 0 || isProcessing || !outputConfig.processingType}
                            data-cy="process-btn"
                        >
                            <FaSave className="me-2" />
                            {isProcessing ? 'Se procesează...' : 'Procesează Materialele'}
                        </Button>
                    </div>
                </>
            )}

            {/* QR Scanner Modal */}
            <Modal show={showQrModal} onHide={closeQrModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Scanare QR</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 350 }}>
                        <div
                            id="web-qr-reader"
                            ref={qrRef}
                            style={{ width: 350, height: 350, background: 'black', borderRadius: 12, overflow: 'hidden' }}
                        ></div>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Material Selection Modal */}
            <Modal show={showMaterialSelectionModal} onHide={() => setShowMaterialSelectionModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Selectează Material</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Control
                            placeholder="Caută material..."
                            value={materialSearchTerm}
                            onChange={e => setMaterialSearchTerm(e.target.value)}
                        />
                    </Form.Group>
                    {filteredMaterials.length === 0 ? (
                        <div className="text-center text-muted">Nu s-au găsit materiale</div>
                    ) : (
                        <ListGroup>
                            {filteredMaterials.map((material) => (
                                <ListGroup.Item
                                    key={material._id}
                                    action
                                    onClick={() => {
                                        if (material._id) {
                                            addMaterialById(material._id);
                                            setShowMaterialSelectionModal(false);
                                            setMaterialSearchTerm('');
                                        }
                                    }}
                                    disabled={selectedMaterials.some(m => m._id === material._id)}
                                >
                                    <MaterialItem
                                        material={material}
                                        extraContent={selectedMaterials.some(m => m._id === material._id) && <FaCheck color="green" className="ms-2" />}
                                    />
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ProcessingView;
