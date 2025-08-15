import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiState } from '../components/ui/useUiState';
import { Container, Form, Button, Modal, ListGroup, InputGroup } from 'react-bootstrap';
import { FaPlus, FaCheck, FaQrcode, FaSave } from 'react-icons/fa';
// import { Html5Qrcode } from 'html5-qrcode';
import { useQrScannerModal } from '../hooks/useQrScannerModal';
import { Material } from '../types';
import { getAll, getById, processMaterials as processAPI } from '../api/materials';
import { MaterialMappings } from '../config/materialMappings';
import MaterialItem from '../components/MaterialItem';
import apiClient from '../api/apiClient';
import useI18n from '../hooks/useI18n';
import { useAlert } from '../hooks/useAlert';

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


const ProcessingView: React.FC = () => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { setFooterActions } = useUiState();
    const showAlert = useAlert();
    const [navigateHome, setNavigateHome] = useState(false);
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
    const [currentStep, setCurrentStep] = useState(0); // 0: type, 1: materials, 2: config
    const steps = [
        t('processing.stepType'),
        t('processing.stepMaterials'),
        t('processing.stepConfig')
    ];
    const availableWoodSpecies = selectedMaterials.reduce((species, material) => {
        if (material.specie && !species.includes(material.specie)) {
            species.push(material.specie);
        }
        return species;
    }, [] as string[]);
    const getProcessingType = useCallback((id: string): ProcessingType | undefined => {
        return allProcessingTypes.find(p => p.id === id);
    }, [allProcessingTypes]);

    const loadProcessingTypes = async () => {
        try {
            const response = await apiClient.get('/processing-types');
            setAllProcessingTypes(response.data);
        } catch {
            //ignore
        }
    };
    const { open: openQrScanner, QrScannerModal } = useQrScannerModal();

    const processMaterials = useCallback(async () => {
        if (selectedMaterials.length === 0) {
            showAlert({
                title: t('processing.noMaterialsSelectedHeader'),
                content: t('processing.noMaterialsSelectedMessage'),
                actions: [{ text: 'OK' }],
            });
            return;
        }
        if (!outputConfig.processingType) {
            showAlert({
                title: t('processing.incompleteConfigHeader'),
                content: t('processing.incompleteConfigTypeMessage'),
                actions: [{ text: 'OK' }],
            });
            return;
        }
        if (!outputConfig.type) {
            showAlert({
                title: t('processing.incompleteConfigHeader'),
                content: t('processing.incompleteConfigTypeResultMessage'),
                actions: [{ text: 'OK' }],
            });
            return;
        }
        if (!outputConfig.specie) {
            showAlert({
                title: t('processing.incompleteConfigHeader'),
                content: t('processing.incompleteConfigSpecieMessage'),
                actions: [{ text: 'OK' }],
            });
            return;
        }
        if (!availableWoodSpecies.includes(outputConfig.specie)) {
            showAlert({
                title: t('processing.invalidSpecieHeader'),
                content: t('processing.invalidSpecieMessage'),
                actions: [{ text: 'OK' }],
            });
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
            showAlert({
                title: t('processing.successHeader'),
                content: t('processing.successMessage', { message: result.message }),
                actions: [{ text: 'OK', onClick: () => { setSelectedMaterials([]); setNavigateHome(true); } }],
            });
        } catch {
            showAlert({
                title: t('processing.processErrorHeader'),
                content: t('processing.processErrorMessage'),
                actions: [{ text: 'OK' }],
            });
        }
    }, [selectedMaterials, outputConfig.processingType, outputConfig.type, outputConfig.specie, outputConfig.count, availableWoodSpecies, showAlert, t]);

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
                            if (currentStep === 0 && !outputConfig.processingType) {
                                showAlert({
                                    title: t('alerts.selectTypeHeader'),
                                    content: t('alerts.selectTypeMessage'),
                                    actions: [{ text: 'OK' }],
                                });
                                return;
                            }
                            if (currentStep === 1 && selectedMaterials.length === 0) {
                                showAlert({
                                    title: t('alerts.addMaterialsHeader'),
                                    content: t('alerts.addMaterialsMessage'),
                                    actions: [{ text: 'OK' }],
                                });
                                return;
                            }
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
                        {t('processing.processMaterials')}
                    </Button>)
            )
        });
        return () => setFooterActions(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, outputConfig]);



    useEffect(() => {
        if (
            availableWoodSpecies.length === 1 &&
            outputConfig.specie !== availableWoodSpecies[0]
        ) {
            setOutputConfig(prev => {
                if (prev.specie === availableWoodSpecies[0]) return prev;
                return { ...prev, specie: availableWoodSpecies[0] };
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableWoodSpecies]);

    useEffect(() => {
        if (selectedMaterials.length > 0 && selectedProcessingType) {
            const incompatibleMaterials = selectedMaterials.filter(material =>
                !selectedProcessingType.sourceTypes.includes(material.type)
            );

            if (incompatibleMaterials.length > 0) {
                const compatibleMaterials = selectedMaterials.filter(material =>
                    selectedProcessingType.sourceTypes.includes(material.type)
                );

                setSelectedMaterials(compatibleMaterials);

                showAlert({
                    title: t('processing.incompatibleMaterialsHeader'),
                    content: t('processing.incompatibleMaterialsMessage', { count: incompatibleMaterials.length }),
                    actions: [{ text: 'OK' }],
                });
            }

            if (selectedMaterials.length > 1) {
                const firstType = selectedMaterials[0].type;
                const allSameType = selectedMaterials.every(m => m.type === firstType);

                if (!allSameType) {
                    showAlert({
                        title: t('processing.incompatibleTypesHeader'),
                        content: t('processing.incompatibleTypesMessage'),
                        actions: [{ text: 'OK' }],
                    });
                }
            }
        }
    }, [selectedMaterials, selectedProcessingType, showAlert, t]);
    useEffect(() => {
        if (outputConfig.processingType) {
            const processingType = getProcessingType(outputConfig.processingType);
            setSelectedProcessingType(processingType || null);

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

    const loadMaterials = useCallback(async () => {
        try {
            const materials = await getAll();
            setAllMaterials(materials);
            setFilteredMaterials(materials);
        } catch {
            showAlert({
                title: t('processing.loadMaterialsHeader'),
                content: t('processing.loadMaterialsMessage'),
                actions: [{ text: 'OK' }],
            });
        }
    }, [showAlert, t]);
    useEffect(() => {
        loadMaterials();
        loadProcessingTypes();
    }, [loadMaterials]);

    useEffect(() => {
        if (allMaterials.length > 0) {
            let materialsToFilter = allMaterials;

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
    const addMaterialById = async (id: string) => {
        setMaterialInput('');
        try {
            if (!selectedProcessingType) {
                showAlert({
                    title: t('processing.selectTypeHeader'),
                    content: t('processing.selectTypeMessage'),
                    actions: [{ text: 'OK' }],
                });
                return;
            }
            if (selectedMaterials.some(m => m._id === id || m.humanId === id)) {
                showAlert({
                    title: t('processing.materialAlreadyAddedHeader'),
                    content: t('processing.materialAlreadyAddedMessage'),
                    actions: [{ text: 'OK' }],
                });
                return;
            }
            let material = allMaterials.find(m => m.id === id || m.humanId === id);
            if (!material) {
                material = await getById(id);
            }
            if (material) {
                if (!selectedProcessingType.sourceTypes.includes(material.type)) {
                    showAlert({
                        title: t('processing.materialIncompatibleHeader'),
                        content: t('processing.materialIncompatibleMessage', { type: material.type, processing: selectedProcessingType.label, accepted: selectedProcessingType.sourceTypes.join(', ') }),
                        actions: [{ text: 'OK' }],
                    });
                    return;
                }
                if (selectedMaterials.length > 0 && selectedMaterials[0].type !== material.type) {
                    showAlert({
                        title: t('processing.differentTypesHeader'),
                        content: t('processing.differentTypesMessage'),
                        actions: [{ text: 'OK' }],
                    });
                    return;
                }
                setSelectedMaterials(prev => [...prev, material]);
            } else {
                showAlert({
                    title: t('messages.materialNotFound'),
                    content: t('messages.materialNotFoundMessage'),
                    actions: [{ text: 'OK' }],
                });
            }
        } catch {
            showAlert({
                title: t('processing.addMaterialErrorHeader'),
                content: t('processing.addMaterialErrorMessage'),
                actions: [{ text: 'OK' }],
            });
        }
    };
    const removeMaterial = (index: number) => {
        setSelectedMaterials(prev => prev.filter((_, i) => i !== index));
    };
    useEffect(() => {
        if (navigateHome) {
            navigate('/');
        }
    }, [navigateHome, navigate]);
    return (
        <Container>
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
            {currentStep === 1 && selectedProcessingType && (
                <>
                    <Form.Group className="mb-2">
                        <InputGroup>
                            <Form.Control
                                value={materialInput}
                                onChange={e => setMaterialInput(e.target.value)}
                                placeholder={t('processing.addMaterialPlaceholder')}
                            />
                            <Button variant="primary" onClick={() => setShowMaterialSelectionModal(true)} data-cy="add-material-by-id-btn">
                                <FaPlus />
                            </Button>
                            <Button variant="outline-secondary" onClick={openQrScanner} data-cy="scan-qr-btn">
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

            <QrScannerModal onScan={async (value: string) => {
                if (value) {
                    await addMaterialById(value);
                }
            }} />

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
export default ProcessingView;
