import { useState, useRef, useEffect, useCallback } from 'react';
import { useUiState } from '../components/ui/useUiState';
import { Container, Form, Button, Modal, ListGroup, Alert, InputGroup } from 'react-bootstrap';
import { FaPlus, FaCheck, FaQrcode, FaSave } from 'react-icons/fa';
import { Html5Qrcode } from 'html5-qrcode';
import { Material } from '../types';
import { getAll, getById, processMaterials as processAPI } from '../api/materials';
import { MaterialMappings } from '../config/materialMappings';
import MaterialItem from '../components/MaterialItem';
import apiClient from '../api/apiClient';
import useI18n from '../hooks/useI18n';

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
    const { t } = useI18n();
    const { setFooterActions } = useUiState();
    const [alert, setAlert] = useState<{ header: string; message: string; params?: Record<string, unknown>; variant?: string; onClose?: () => void } | null>(null);
    const [navigateHome, setNavigateHome] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [showMaterialSelectionModal, setShowMaterialSelectionModal] = useState(false);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
    const [materialInput, setMaterialInput] = useState('');
    const [outputConfig, setOutputConfig] = useState({
        count: 1,
        type: '',
        specie: '',
        processingType: ''
    });
    const [selectedProcessingType, setSelectedProcessingType] = useState<ProcessingType | null>(null);
    const [allProcessingTypes, setAllProcessingTypes] = useState<ProcessingType[]>([]);
    // Wizard step state
    const [currentStep, setCurrentStep] = useState(0); // 0: type, 1: materials, 2: config
    const steps = [
        t('processing.stepType'),
        t('processing.stepMaterials'),
        t('processing.stepConfig')
    ];

    // Helper functions to work with processing types
    const getProcessingType = useCallback((id: string): ProcessingType | undefined => {
        return allProcessingTypes.find(p => p.id === id);
    }, [allProcessingTypes]);

    // Load all processing types from backend
    const loadProcessingTypes = async () => {
        try {
            const response = await apiClient.get('/processing-types');
            setAllProcessingTypes(response.data);
        } catch {
            // Swallow error silently
        }
    };
    useEffect(() => {
        setFooterActions({
            actionsLeft: (
                <Button
                    variant="secondary"
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                >{t('processing.back')}</Button>
            ),
            actionsRight: (
                currentStep < steps.length - 1 ? (
                    <Button
                        variant="primary"
                        onClick={() => {
                            // Step validation
                            if (currentStep === 0 && !outputConfig.processingType) {
                                setAlert({ header: 'alerts.selectTypeHeader', message: 'alerts.selectTypeMessage', variant: 'warning' });
                                return;
                            }
                            if (currentStep === 1 && selectedMaterials.length === 0) {
                                setAlert({ header: 'alerts.addMaterialsHeader', message: 'alerts.addMaterialsMessage', variant: 'warning' });
                                return;
                            }
                            setAlert(null);
                            setCurrentStep(s => Math.min(steps.length - 1, s + 1));
                        }}
                    >{t('processing.next')}</Button>
                ) :
                    (<Button
                        variant="success"
                        onClick={processMaterials}
                        disabled={selectedMaterials.length === 0 || !outputConfig.processingType}
                        data-cy="process-btn"
                    >
                        <FaSave className="me-2" />
                        {t('processing.processing')}
                    </Button>)
            )
        });
        return () => setFooterActions(null);
    }, [currentStep, outputConfig.processingType, selectedMaterials, steps.length, t, setFooterActions]);

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
                    header: 'processing.incompatibleMaterialsHeader',
                    message: 'processing.incompatibleMaterialsMessage',
                    params: { count: incompatibleMaterials.length },
                    variant: 'warning',
                });
            }

            // Check if all remaining materials are the same type
            if (selectedMaterials.length > 1) {
                const firstType = selectedMaterials[0].type;
                const allSameType = selectedMaterials.every(m => m.type === firstType);

                if (!allSameType) {
                    setAlert({
                        header: 'processing.incompatibleTypesHeader',
                        message: 'processing.incompatibleTypesMessage',
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
        } catch {
            setAlert({ header: 'processing.loadMaterialsHeader', message: 'processing.loadMaterialsMessage', variant: 'danger' });
        }
    };

    const addMaterialById = async (id: string) => {
        setMaterialInput('');
        try {
            if (!selectedProcessingType) {
                setAlert({ header: 'processing.selectTypeHeader', message: 'processing.selectTypeMessage', variant: 'warning' });
                return;
            }
            if (selectedMaterials.some(m => m._id === id || m.humanId === id)) {
                setAlert({ header: 'processing.materialAlreadyAddedHeader', message: 'processing.materialAlreadyAddedMessage', variant: 'info' });
                return;
            }
            let material = allMaterials.find(m => m.id === id || m.humanId === id);
            if (!material) {
                material = await getById(id);
            }
            if (material) {
                if (!selectedProcessingType.sourceTypes.includes(material.type)) {
                    setAlert({ header: 'processing.materialIncompatibleHeader', message: 'processing.materialIncompatibleMessage', params: { type: material.type, processing: selectedProcessingType.label, accepted: selectedProcessingType.sourceTypes.join(', ') }, variant: 'danger' });
                    return;
                }
                if (selectedMaterials.length > 0 && selectedMaterials[0].type !== material.type) {
                    setAlert({ header: 'processing.differentTypesHeader', message: 'processing.differentTypesMessage', variant: 'danger' });
                    return;
                }
                setSelectedMaterials(prev => [...prev, material]);
            } else {
                setAlert({ header: t('messages.materialNotFound'), message: t('messages.materialNotFoundMessage'), variant: 'danger' });
            }
        } catch {
            setAlert({ header: 'processing.addMaterialErrorHeader', message: 'processing.addMaterialErrorMessage', variant: 'danger' });
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
            setAlert({ header: 'processing.noMaterialsSelectedHeader', message: 'processing.noMaterialsSelectedMessage', variant: 'warning' });
            return;
        }
        if (!outputConfig.processingType) {
            setAlert({ header: 'processing.incompleteConfigHeader', message: 'processing.incompleteConfigTypeMessage', variant: 'warning' });
            return;
        }
        if (!outputConfig.type) {
            setAlert({ header: 'processing.incompleteConfigHeader', message: 'processing.incompleteConfigTypeResultMessage', variant: 'warning' });
            return;
        }
        if (!outputConfig.specie) {
            setAlert({ header: 'processing.incompleteConfigHeader', message: 'processing.incompleteConfigSpecieMessage', variant: 'warning' });
            return;
        }
        if (!availableWoodSpecies.includes(outputConfig.specie)) {
            setAlert({ header: 'processing.invalidSpecieHeader', message: 'processing.invalidSpecieMessage', variant: 'danger' });
            return;
        }
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
                header: 'processing.successHeader',
                message: 'processing.successMessage',
                params: { message: result.message },
                variant: 'success',
                onClose: () => {
                    setSelectedMaterials([]);
                    setNavigateHome(true);
                }
            });
        } catch {
            setAlert({ header: 'processing.processErrorHeader', message: 'processing.processErrorMessage', variant: 'danger' });
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
        <Container>
            {/* Wizard Progress Bar */}
            <div className="mb-4">
                <div className="d-flex align-items-center">
                    {steps.map((step, idx) => (
                        <div key={step} className={`flex-grow-1 text-center ${idx === currentStep ? 'fw-bold text-primary' : 'text-muted'}`}
                            style={{ borderBottom: idx === currentStep ? '2px solid #0d6efd' : '1px solid #ccc', paddingBottom: 4 }}>
                            {t('processing.step', { number: idx + 1, name: step })}
                        </div>
                    ))}
                </div>
            </div>

            {alert && (
                <Alert variant={alert.variant || 'info'} dismissible onClose={() => { if (alert.onClose) alert.onClose(); setAlert(null); }}>
                    <strong>{t(alert.header)}</strong>
                    <div>{t(alert.message, alert.params)}</div>
                </Alert>
            )}

            {/* Step 1: Processing Type Selection */}
            {currentStep === 0 && (
                <>
                    {allProcessingTypes.length === 0 ? (
                        <div className="text-muted mt-2">{t('processing.loadingTypes')}</div>
                    ) : (
                        <ListGroup>
                            {allProcessingTypes.map(type => (
                                <ListGroup.Item
                                    key={type.id}
                                    action
                                    active={outputConfig.processingType === type.id}
                                    onClick={() => {
                                        setOutputConfig({ ...outputConfig, processingType: type.id });
                                        if (type.id !== outputConfig.processingType) {
                                            setSelectedMaterials([]);
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex flex-column">
                                        <h2 className="fw-bold">{type.label}</h2>
                                        <div>
                                            {type.sourceTypes.map(tid => MaterialMappings.getMaterialTypeLabel(tid)).join(', ')}
                                            {' '}→{' '}
                                            {type.resultType === 'same' ? t('processing.sameAsSource') : MaterialMappings.getMaterialTypeLabel(type.resultType)}
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </>
            )}

            {/* Step 2: Material Selection */}
            {currentStep === 1 && selectedProcessingType && (
                <>
                    <Form.Group className="mb-2">
                        <InputGroup>
                            <Form.Control
                                value={materialInput}
                                onChange={e => setMaterialInput(e.target.value)}
                                onKeyPress={handleInputKeyPress}
                                placeholder={t('processing.addMaterialPlaceholder')}
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
                        {selectedProcessingType.sourceTypes.map(tid => MaterialMappings.getMaterialTypeLabel(tid)).join(', ')}
                    </div>
                    <h5 className="mt-3">{t('processing.selectedMaterialsTitle')}</h5>
                    {selectedMaterials.length === 0 ? (
                        <div className="text-center text-muted">{t('processing.noMaterialsSelected')}</div>
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
            {currentStep === 2 && selectedProcessingType && selectedMaterials.length > 0 && (
                <>
                    <h5 className="mt-4">{t('processing.stepConfigTitle')}</h5>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('processing.resultCountLabel')}</Form.Label>
                        <Form.Control
                            type="number"
                            min={1}
                            value={outputConfig.count}
                            onChange={e => setOutputConfig({ ...outputConfig, count: parseInt(e.target.value || '1', 10) })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('processing.resultTypeLabel')}</Form.Label>
                        <Form.Select
                            value={outputConfig.type}
                            disabled={selectedProcessingType !== null}
                            onChange={e => setOutputConfig({ ...outputConfig, type: e.target.value })}
                        >
                            <option value="">{t('processing.resultTypeSelect')}</option>
                            {MaterialMappings.getMaterialTypeOptions().map(type => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </Form.Select>
                        {selectedProcessingType && (
                            <div className="text-muted mt-1">{t('processing.resultTypeAuto')}</div>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('processing.resultSpecieLabel')}</Form.Label>
                        <Form.Select
                            value={outputConfig.specie}
                            disabled={availableWoodSpecies.length <= 1}
                            onChange={e => setOutputConfig({ ...outputConfig, specie: e.target.value })}
                        >
                            <option value="">{t('processing.resultSpecieSelect')}</option>
                            {MaterialMappings.getWoodSpeciesOptions()
                                .filter(specie => availableWoodSpecies.includes(specie.id))
                                .map(specie => (
                                    <option key={specie.id} value={specie.id}>{specie.label}</option>
                                ))}
                        </Form.Select>
                        {availableWoodSpecies.length === 0 && (
                            <div className="text-muted mt-1">{t('processing.addMaterialsForSpecie')}</div>
                        )}
                    </Form.Group>

                </>
            )}

            {/* ...existing code... */}

            {/* QR Scanner Modal */}
            <Modal show={showQrModal} onHide={closeQrModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('processing.qrModalTitle')}</Modal.Title>
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
                    <Modal.Title>{t('processing.selectMaterial')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Control
                            placeholder={t('processing.searchMaterial')}
                            value={materialSearchTerm}
                            onChange={e => setMaterialSearchTerm(e.target.value)}
                        />
                    </Form.Group>
                    {filteredMaterials.length === 0 ? (
                        <div className="text-center text-muted">{t('processing.noMaterialsFound')}</div>
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
}

// Set footer actions for navigation
// (must be inside the component, but before return)
// Move this above the return statement

export default ProcessingView;
