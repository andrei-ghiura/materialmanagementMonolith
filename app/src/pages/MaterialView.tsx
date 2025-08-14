import { useEffect, useState, useRef, useCallback, useMemo } from "react";

import { useUiState } from '../components/ui/UiStateContext';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteMaterial, save, update } from "../api/materials";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Capacitor } from '@capacitor/core';
import useI18n from '../hooks/useI18n';
import useMaterialMappings from '../hooks/useMaterialMappings';
import { Material } from "../types";
import { makeLabelCanvas } from "../components/makeLabelCanvas";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import InputGroup from 'react-bootstrap/InputGroup';

const MaterialView = () => {
    // Dark mode logic: listen for changes and apply/remove dark class

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { t } = useI18n();
    const materialMappings = useMaterialMappings();
    // Alert state for react-bootstrap Modal
    const [alert, setAlert] = useState<{ header: string, message: string, buttons: { text: string }[], onDidDismiss?: () => void } | null>(null);

    const isMaterial = useCallback((component: string | Material): component is Material => {
        return typeof component === 'object' && component !== null && '_id' in component;
    }, []);

    const ensureMaterialArray = useCallback(async (components: (string | Material)[] = []): Promise<Material[]> => {
        const result: Material[] = [];
        const { getById } = await import('../api/materials');

        for (const comp of components) {
            if (isMaterial(comp)) {
                result.push(comp);
            } else {
                try {
                    const material = await getById(comp);
                    if (material) {
                        result.push(material);
                    }
                } catch (error) {
                    console.error(`Failed to fetch material with id ${comp}:`, error);
                }
            }
        }
        return result;
    }, [isMaterial]);

    // Removed unused saveToApi
    const [componente, setComponente] = useState<(string | Material)[]>([]);
    const [material, setMaterial] = useState<Material>({
        _id: '',
        type: '',
        cod_unic_aviz: '',
        specie: '',
        data: new Date().toISOString().split('T')[0], // today Data in YYYY-MM-DD
        apv: '',
        lat: '',
        log: '',
        nr_placuta_rosie: '',
        lungime: '',
        diametru: '',
        volum_placuta_rosie: '',
        volum_total: '',
        volum_net_paletizat: '',
        volum_brut_paletizat: '',
        nr_bucati: '',
        observatii: '',
        componente: [],
        deleted: false, // <-- add deleted flag
    });
    const isNew = !id;
    // Fetch material from backend if id is present
    useEffect(() => {
        async function fetchData() {
            if (id) {
                try {
                    const { getById } = await import('../api/materials');
                    const data = await getById(id);
                    setMaterial(data);
                    setComponente(data.componente || []);
                    initialMaterialRef.current = data;
                } catch (error: unknown) {
                    console.error('Failed to fetch material:', error);

                }
            }
        }
        fetchData();
    }, [id]);
    const [labelImageUrl, setLabelImageUrl] = useState("");
    const labelCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [pendingNavigation, setPendingNavigation] = useState<null | (() => void)>(null);
    const [unsaved, setUnsaved] = useState(false);
    const initialMaterialRef = useRef<Material | null>(null);
    // QR code scanning for adding components is disabled
    const changeMaterial = (key: string, value: string | number | null | undefined) => setMaterial({ ...material, [key]: value as string || '' });


    // Track unsaved changes
    useEffect(() => {
        if (!initialMaterialRef.current) return;
        const isChanged = JSON.stringify({ ...material, componente }) !== JSON.stringify({ ...initialMaterialRef.current, componente: initialMaterialRef.current.componente });
        setUnsaved(isChanged);
    }, [material, componente]);

    // Intercept browser back/refresh
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (unsaved) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [unsaved]);

    // Leave confirmation using Modal
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const handleLeaveConfirm = useCallback(() => setShowLeaveModal(true), []);

    // Intercept in-app navigation
    const handleNav = useCallback((navFn: () => void) => {
        if (unsaved) {
            setPendingNavigation(navFn); // Store the actual function, not a wrapper
            handleLeaveConfirm();
        } else {
            navFn();
        }
    }, [unsaved, handleLeaveConfirm]);

    useEffect(() => {
        async function updateComponente() {
            if (material.componente) {
                const materials = await ensureMaterialArray(material.componente);
                setComponente(materials);
            } else {
                setComponente([]);
            }
        }
        updateComponente();
    }, [material, ensureMaterialArray]);

    // Generate label image when material or material.id changes
    useEffect(() => {
        (async () => {
            if (!material || !material._id) return;
            const canvas = await makeLabelCanvas(material);
            if (canvas) {
                labelCanvasRef.current = canvas;
                setLabelImageUrl(canvas.toDataURL("image/png"));
            }
        })();
    }, [material]);





    const downloadQRImage = async (canvas: HTMLCanvasElement, fileName: string) => {
        const dataUrl = canvas.toDataURL('image/png');

        if (Capacitor.getPlatform() === 'web') {
            // For web platform, create a download link
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // For native platforms (Android), use Filesystem API
            const base64Data = dataUrl.split(',')[1];
            await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Documents,
                recursive: true,
            });
            setAlert({
                header: t('common.success'),
                message: t('material.actions.saveSuccess'),
                buttons: [{ text: t('common.close') }]
            });
        }
    };

    const handleConfirm = useCallback(async () => {
        // Validate required fields
        if (!material.type) {
            setAlert({
                header: t('material.actions.requiredField'),
                message: t('material.actions.typeRequired'),
                buttons: [{ text: t('common.close') }]
            });
            return;
        }
        if (!material.specie) {
            setAlert({
                header: t('material.actions.requiredField'),
                message: t('material.actions.speciesRequired'),
                buttons: [{ text: t('common.close') }]
            });
            return;
        }
        try {
            if (isNew) {
                const componentsToSave = componente.map(comp => isMaterial(comp) ? comp._id : comp);
                await save({ ...material, componente: componentsToSave });
            } else {
                const componentsToSave = componente.map(comp => isMaterial(comp) ? comp._id : comp);
                await update(id!, { ...material, componente: componentsToSave });
            }
            setUnsaved(false);
            if (pendingNavigation) {
                const nav = pendingNavigation;
                setPendingNavigation(null);
                nav();
            } else {
                setAlert({
                    header: t('common.success'),
                    message: isNew ? t('material.actions.createSuccess') : t('material.actions.updateSuccess'),
                    buttons: [{ text: t('common.close') }],
                    onDidDismiss: () => {
                        navigate('/');
                    }
                });
            }
        } catch (error) {
            console.error('Failed to save material:', error);
            setAlert({
                header: t('common.error'),
                message: isNew ? t('material.actions.createError') : t('material.actions.updateError'),
                buttons: [{ text: t('common.close') }]
            });
        }
    }, [material, isNew, componente, isMaterial, id, pendingNavigation, navigate, t]);

    const handleDownload = () => {
        if (labelCanvasRef.current) {
            const fileName = `${material.id || 'material'}_${new Date().toISOString().split('.')[0].replace(/[:-]/g, '_')}.png`;
            downloadQRImage(labelCanvasRef.current, fileName);
        }
    };

    // Delete confirmation using Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleDelete = useCallback(() => setShowDeleteModal(true), []);
    const confirmDelete = async () => {
        if (id) {
            await deleteMaterial(id);
            setShowDeleteModal(false); // Close modal first to avoid state update after unmount
            navigate(-1);
        }
    };

    // Leave modal handlers
    const stayOnPage = () => {
        setPendingNavigation(null);
        setShowLeaveModal(false);
    };
    const leaveWithoutSave = () => {
        setUnsaved(false);
        if (pendingNavigation) {
            pendingNavigation();
            setPendingNavigation(null);
        }
        setShowLeaveModal(false);
    };
    const saveAndLeave = async () => {
        await handleConfirm();
        setShowLeaveModal(false);
    };

    // QR code scanning for adding components is disabled
    // Field visibility logic based on material type
    const visibleFields = materialMappings.getFieldsForType(material.type);
    const isFieldVisible = (field: string) => visibleFields.includes(field);

    const { setFooterActions } = useUiState();

    // Memoize footer actions to avoid unnecessary re-renders and stale closures
    const actionsLeft = useMemo(() => (
        <Button
            className="me-2"
            onClick={() => handleNav(() => navigate(-1))}
            size="sm"
            style={{ fontSize: 20, textDecoration: 'none' }}
            data-cy="footer-back-btn"
        >
            {t('common.cancel')}
        </Button>
    ), [handleNav, navigate, t]);

    const actionsRight = useMemo(() => (
        <>
            {!isNew && (
                <Button className="btn-negative me-2" onClick={handleDelete} size="sm" data-cy="delete-material-btn">
                    <span className="me-1" role="img" aria-label="delete">🗑️</span>
                    {t('common.delete')}
                </Button>
            )}
            <Button className="btn-default me-2" onClick={() => handleNav(() => navigate(`/material/${material._id}/ancestors`))} size="sm" data-cy="export-components-btn">
                {t('material.actions.exportLabel')}
            </Button>
            {!isNew && (
                <Button className="btn-info me-2" onClick={() => handleNav(() => navigate(`/flow/${material._id}`))} size="sm" data-cy="show-flow-btn">
                    {t('navigation.flow')}
                </Button>
            )}
            <Button className="btn-success  me-2" onClick={handleConfirm} data-cy="save-material-btn" disabled={material.deleted}>
                <b>{isNew ? t('common.add') : t('common.save')}</b>
            </Button>
        </>
    ), [isNew, handleDelete, handleConfirm, handleNav, navigate, material._id, t]);

    useEffect(() => {
        setFooterActions({ actionsLeft, actionsRight });
        return () => setFooterActions(null);
    }, [actionsLeft, actionsRight, setFooterActions]);

    const isReadonly = Boolean(material.deleted);

    if (!material) return null;

    return (
        <>
            {/* Prompt removed: handled by custom leave modal */}
            <Container fluid className="bg-[#f6f8fa] min-vh-100">
                <Row className="justify-content-center">
                    {/* Left Column: Material Details */}
                    <Col xs={12} lg={6} className="px-2 py-1">
                        <div className="w-100 mx-auto" style={{ maxWidth: 800 }}>
                            <Card className="mb-4 border border-gray-200 shadow-sm">
                                <Card.Body>
                                    <Form>
                                        <Row>
                                            {/* Material Type */}
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{t('material.materialType')} <span className="text-danger">*</span></Form.Label>
                                                    <Form.Select
                                                        required
                                                        value={material.type}
                                                        onChange={ev => changeMaterial('type', ev.target.value)}
                                                        data-cy="material-type-select"
                                                        className={!material.type ? 'is-invalid' : ''}
                                                        disabled={!isNew || isReadonly}
                                                    >
                                                        <option value="">{t('material.selectType')}</option>
                                                        {materialMappings.getMaterialTypeOptions().map(type => (
                                                            <option key={type.id} value={type.id} data-cy={`material-type-option-${type.id}`}>{type.label}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            {/* Wood Species */}
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{t('material.species')} <span className="text-danger">*</span></Form.Label>
                                                    <Form.Select
                                                        required
                                                        value={material.specie}
                                                        onChange={ev => changeMaterial('specie', ev.target.value)}
                                                        data-cy="material-specie-select"
                                                        className={!material.specie ? 'is-invalid' : ''}
                                                        disabled={!isNew || isReadonly}
                                                    >
                                                        <option value="">{t('material.selectSpecies')}</option>
                                                        {materialMappings.getWoodSpeciesOptions().map(type => (
                                                            <option key={type.id} value={type.id} data-cy={`material-specie-option-${type.id}`}>{type.label}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            {/* cod_unic_aviz */}
                                            <Col md={12} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{t('material.uniqueCode')}</Form.Label>
                                                    <Form.Control data-cy="input-cod_unic_aviz" type="text" value={material.cod_unic_aviz} onChange={ev => changeMaterial('cod_unic_aviz', ev.target.value)} disabled={!isNew || isReadonly} />
                                                </Form.Group>
                                            </Col>
                                            {/* data */}
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{t('material.date')}</Form.Label>
                                                    <Form.Control data-cy="input-data" type="date" value={material.data} onChange={ev => changeMaterial('data', ev.target.value)} disabled={isReadonly} />
                                                </Form.Group>
                                            </Col>
                                            {/* apv */}
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{t('material.apv')}</Form.Label>
                                                    <Form.Control data-cy="input-apv" type="text" value={material.apv} onChange={ev => changeMaterial('apv', ev.target.value)} disabled={!isNew || isReadonly} />
                                                </Form.Group>
                                            </Col>
                                            {/* nr_placuta_rosie */}
                                            {isFieldVisible('nr_placuta_rosie') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{t('material.redPlateNumber')}</Form.Label>
                                                        <Form.Control data-cy="input-nr_placuta_rosie" type="number" value={material.nr_placuta_rosie} onChange={ev => changeMaterial('nr_placuta_rosie', ev.target.value)} disabled={isReadonly} />
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* lat */}
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{t('material.latitude')}</Form.Label>
                                                    <InputGroup>
                                                        <Form.Control data-cy="input-lat" type="text" value={material.lat} onChange={ev => changeMaterial('lat', ev.target.value)} disabled={!isNew || isReadonly} />
                                                        <InputGroup.Text>°</InputGroup.Text>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                            {/* log */}
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{t('material.longitude')}</Form.Label>
                                                    <InputGroup>
                                                        <Form.Control data-cy="input-log" type="text" value={material.log} onChange={ev => changeMaterial('log', ev.target.value)} disabled={!isNew || isReadonly} />
                                                        <InputGroup.Text>°</InputGroup.Text>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                            {/* lungime */}
                                            {isFieldVisible('lungime') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{t('material.length')}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control data-cy="input-lungime" type="number" value={material.lungime} onChange={ev => changeMaterial('lungime', ev.target.value)} disabled={isReadonly} />
                                                            <InputGroup.Text>cm</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* diametru */}
                                            {isFieldVisible('diametru') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{t('material.diameter')}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control data-cy="input-diametru" type="number" value={material.diametru} onChange={ev => changeMaterial('diametru', ev.target.value)} disabled={isReadonly} />
                                                            <InputGroup.Text>cm</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* volum_placuta_rosie */}
                                            {isFieldVisible('volum_placuta_rosie') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{t('material.redPlateVolume')}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control data-cy="input-volum_placuta_rosie" type="number" value={material.volum_placuta_rosie} onChange={ev => changeMaterial('volum_placuta_rosie', ev.target.value)} disabled={isReadonly} />
                                                            <InputGroup.Text>m³</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* volum_total */}
                                            {isFieldVisible('volum_total') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{t('material.totalVolume')}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control data-cy="input-volum_total" type="number" value={material.volum_total} onChange={ev => changeMaterial('volum_total', ev.target.value)} disabled={isReadonly} />
                                                            <InputGroup.Text>m³</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* nr_bucati */}
                                            {isFieldVisible('nr_bucati') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{t('material.pieces')}</Form.Label>
                                                        <Form.Control data-cy="input-nr_bucati" type="number" value={material.nr_bucati} onChange={ev => changeMaterial('nr_bucati', ev.target.value)} disabled={isReadonly} />
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* volum_net_paletizat */}
                                            {isFieldVisible('volum_net_paletizat') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{t('material.netPalletizedVolume')}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control data-cy="input-volum_net_paletizat" type="number" value={material.volum_net_paletizat} onChange={ev => changeMaterial('volum_net_paletizat', ev.target.value)} disabled={isReadonly} />
                                                            <InputGroup.Text>m³</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* volum_brut_paletizat */}
                                            {isFieldVisible('volum_brut_paletizat') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{t('material.grossPalletizedVolume')}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control data-cy="input-volum_brut_paletizat" type="number" value={material.volum_brut_paletizat} onChange={ev => changeMaterial('volum_brut_paletizat', ev.target.value)} disabled={isReadonly} />
                                                            <InputGroup.Text>m³</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* observatii */}
                                            <Col md={12} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{t('material.observations')}</Form.Label>
                                                    <Form.Control as="textarea" data-cy="input-observatii" value={material.observatii} onChange={ev => changeMaterial('observatii', ev.target.value)} disabled={isReadonly} />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                    {/* Right Column: Components and QR Code */}
                    <Col xs={12} lg={6} className="px-2 py-1">
                        {!isNew && componente?.length > 0 && (<Card className="mb-2 shadow-sm">
                            <Card.Body>
                                <Card.Title as="h3" className="mb-2">{t('material.components')}</Card.Title>
                                {componente?.length === 0 ? (
                                    <div className="text-muted">{t('material.noComponentsAdded')}</div>
                                ) : (
                                    <ListGroup variant="flush">
                                        {componente.filter(isMaterial).map((comp, index) => (
                                            <ListGroup.Item key={index} action onClick={() => navigate(`/material/${comp._id}`)} data-cy={`component-list-item-${comp._id}`}>
                                                <div className="fw-bold">{comp.humanId}</div>
                                                <div className="text-muted small">
                                                    {materialMappings.getMaterialTypeLabel(comp.type)} • {materialMappings.getWoodSpeciesLabel(comp.specie)}
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                                {/* QR code scanning for adding components is disabled */}
                            </Card.Body>
                        </Card>)}
                        {!isNew && (
                            <Card className="mb-2">
                                <Card.Body>
                                    <Card.Title as="h3" className="mb-2">{t('material.qrLabel')}</Card.Title>
                                    <div id="qrcode" className="mx-auto text-center">
                                        {labelImageUrl && (
                                            <img src={labelImageUrl} alt="Printable label" style={{ maxWidth: '100%' }} />
                                        )}
                                    </div>
                                    <Button className="btn-default mt-2" onClick={handleDownload} size="sm" data-cy="download-qr-btn">
                                        <span className="me-1" role="img" aria-label="print">⎙</span>
                                        {t('material.downloadLabel')}
                                    </Button>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </Container>
            {/* Footer */}
            {/* Alert Modal */}
            <Modal show={!!alert} onHide={() => { setAlert(null); if (alert?.onDidDismiss) alert.onDidDismiss(); }}>
                <Modal.Header closeButton>
                    <Modal.Title>{alert?.header}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{alert?.message}</Modal.Body>
                <Modal.Footer>
                    {alert?.buttons?.map((btn, idx) => (
                        <Button key={idx} variant="primary" onClick={() => { setAlert(null); if (alert?.onDidDismiss) alert.onDidDismiss(); }}>{btn.text}</Button>
                    ))}
                </Modal.Footer>
            </Modal>
            {/* Delete Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmare ștergere</Modal.Title>
                </Modal.Header>
                <Modal.Body>Sigur vrei să ștergi acest material?</Modal.Body>
                <Modal.Footer>
                    <Button className="btn-default" onClick={() => setShowDeleteModal(false)}>Anulează</Button>
                    <Button className="btn-negative" onClick={confirmDelete}>Da, șterge materialul</Button>
                </Modal.Footer>
            </Modal>
            {/* Leave Modal */}
            <Modal show={showLeaveModal} onHide={stayOnPage}>
                <Modal.Header closeButton>
                    <Modal.Title>Modificări nesalvate</Modal.Title>
                </Modal.Header>
                <Modal.Body>Ai modificări nesalvate. Ce vrei să faci?</Modal.Body>
                <Modal.Footer>
                    <Button className="btn-default" onClick={stayOnPage}>Rămâi pe pagină</Button>
                    <Button className="btn-negative" onClick={leaveWithoutSave}>Părăsește fără salvare</Button>
                    <Button className="btn-success" onClick={saveAndLeave}>Salvează și pleacă</Button>
                </Modal.Footer>
            </Modal>
            {/* QR code scanning for adding components is disabled */}
        </>
    );
}
export default MaterialView;
