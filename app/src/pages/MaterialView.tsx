import { useEffect, useState, useRef, useCallback, useMemo } from "react";

import { useUiState } from '../components/ui/UiStateContext';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteMaterial, save, update } from "../api/materials";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Capacitor } from '@capacitor/core';
import labels from '../labels';
import { Material } from "../types";
import { makeLabelCanvas } from "../components/makeLabelCanvas";
import { MaterialMappings } from "../config/materialMappings";
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
                header: 'Succes',
                message: 'QR code saved successfully!',
                buttons: [{ text: 'OK' }]
            });
        }
    };

    const handleConfirm = useCallback(async () => {
        // Validate required fields
        if (!material.type) {
            setAlert({
                header: 'Câmp obligatoriu',
                message: 'Selectați tipul materialului.',
                buttons: [{ text: 'OK' }]
            });
            return;
        }
        if (!material.specie) {
            setAlert({
                header: 'Câmp obligatoriu',
                message: 'Selectați specia lemnului.',
                buttons: [{ text: 'OK' }]
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
                    header: 'Succes',
                    message: `Material ${isNew ? 'creat' : 'actualizat'} cu succes!`,
                    buttons: [{ text: 'OK' }],
                    onDidDismiss: () => {
                        navigate('/');
                    }
                });
            }
        } catch (error) {
            console.error('Failed to save material:', error);
            setAlert({
                header: 'Eroare',
                message: `Nu s-a putut ${isNew ? 'crea' : 'actualiza'} materialul.`,
                buttons: [{ text: 'OK' }]
            });
        }
    }, [material, isNew, componente, isMaterial, id, pendingNavigation, navigate]);

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
    const visibleFields = MaterialMappings.getFieldsForType(material.type);
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
            Anulează
        </Button>
    ), [handleNav, navigate]);

    const actionsRight = useMemo(() => (
        <>
            {!isNew && (
                <Button className="btn-negative me-2" onClick={handleDelete} size="sm" data-cy="delete-material-btn">
                    <span className="me-1" role="img" aria-label="delete">🗑️</span>
                    Șterge
                </Button>
            )}
            <Button className="btn-default me-2" onClick={() => handleNav(() => navigate(`/material/${material._id}/components`))} size="sm" data-cy="export-components-btn">
                Export
            </Button>
            {!isNew && (
                <Button className="btn-info me-2" onClick={() => handleNav(() => navigate(`/flow/${material._id}`))} size="sm" data-cy="show-flow-btn">
                    Flow
                </Button>
            )}
            <Button className="btn-success  me-2" onClick={handleConfirm} data-cy="save-material-btn">
                <b>{isNew ? labels.adauga : labels.salveaza}</b>
            </Button>
        </>
    ), [isNew, handleDelete, handleConfirm, handleNav, navigate, material._id]);

    useEffect(() => {
        setFooterActions({ actionsLeft, actionsRight });
        return () => setFooterActions(null);
    }, [actionsLeft, actionsRight, setFooterActions]);

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
                                                    <Form.Label>{labels.type} <span className="text-danger">*</span></Form.Label>
                                                    <Form.Select
                                                        required
                                                        value={material.type}
                                                        onChange={ev => changeMaterial('type', ev.target.value)}
                                                        data-cy="material-type-select"
                                                        className={!material.type ? 'is-invalid' : ''}
                                                        disabled={!isNew}
                                                    >
                                                        <option value="">Selectează tipul</option>
                                                        {MaterialMappings.getMaterialTypeOptions().map(type => (
                                                            <option key={type.id} value={type.id} data-cy={`material-type-option-${type.id}`}>{type.label}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            {/* Wood Species */}
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{labels.specie} <span className="text-danger">*</span></Form.Label>
                                                    <Form.Select
                                                        required
                                                        value={material.specie}
                                                        onChange={ev => changeMaterial('specie', ev.target.value)}
                                                        data-cy="material-specie-select"
                                                        className={!material.specie ? 'is-invalid' : ''}
                                                        disabled={!isNew}
                                                    >
                                                        <option value="">Selectează specia</option>
                                                        {MaterialMappings.getWoodSpeciesOptions().map(type => (
                                                            <option key={type.id} value={type.id} data-cy={`material-specie-option-${type.id}`}>{type.label}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            {/* cod_unic_aviz */}
                                            <Col md={12} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{labels.cod_unic_aviz}</Form.Label>
                                                    <Form.Control data-cy="input-cod_unic_aviz" type="text" value={material.cod_unic_aviz} onChange={ev => changeMaterial('cod_unic_aviz', ev.target.value)} disabled={!isNew} />
                                                </Form.Group>
                                            </Col>
                                            {/* data */}
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{labels.data}</Form.Label>
                                                    <Form.Control data-cy="input-data" type="date" value={material.data} onChange={ev => changeMaterial('data', ev.target.value)} />
                                                </Form.Group>
                                            </Col>
                                            {/* apv */}
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{labels.apv}</Form.Label>
                                                    <Form.Control data-cy="input-apv" type="text" value={material.apv} onChange={ev => changeMaterial('apv', ev.target.value)} disabled={!isNew} />
                                                </Form.Group>
                                            </Col>
                                            {/* nr_placuta_rosie */}
                                            {isFieldVisible('nr_placuta_rosie') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{labels.nr_placuta_rosie}</Form.Label>
                                                        <Form.Control data-cy="input-nr_placuta_rosie" type="number" value={material.nr_placuta_rosie} onChange={ev => changeMaterial('nr_placuta_rosie', ev.target.value)} />
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* lat */}
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{labels.lat}</Form.Label>
                                                    <InputGroup>
                                                        <Form.Control data-cy="input-lat" type="text" value={material.lat} onChange={ev => changeMaterial('lat', ev.target.value)} disabled={!isNew} />
                                                        <InputGroup.Text>°</InputGroup.Text>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                            {/* log */}
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{labels.log}</Form.Label>
                                                    <InputGroup>
                                                        <Form.Control data-cy="input-log" type="text" value={material.log} onChange={ev => changeMaterial('log', ev.target.value)} disabled={!isNew} />
                                                        <InputGroup.Text>°</InputGroup.Text>
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                            {/* lungime */}
                                            {isFieldVisible('lungime') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{labels.lungime}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control data-cy="input-lungime" type="number" value={material.lungime} onChange={ev => changeMaterial('lungime', ev.target.value)} />
                                                            <InputGroup.Text>cm</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* diametru */}
                                            {isFieldVisible('diametru') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{labels.diametru}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control data-cy="input-diametru" type="number" value={material.diametru} onChange={ev => changeMaterial('diametru', ev.target.value)} />
                                                            <InputGroup.Text>cm</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* volum_placuta_rosie */}
                                            {isFieldVisible('volum_placuta_rosie') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{labels.volum_placuta_rosie}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control data-cy="input-volum_placuta_rosie" type="number" value={material.volum_placuta_rosie} onChange={ev => changeMaterial('volum_placuta_rosie', ev.target.value)} />
                                                            <InputGroup.Text>m³</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* volum_total */}
                                            {isFieldVisible('volum_total') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{labels.volum_total}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control data-cy="input-volum_total" type="number" value={material.volum_total} onChange={ev => changeMaterial('volum_total', ev.target.value)} />
                                                            <InputGroup.Text>m³</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* nr_bucati */}
                                            {isFieldVisible('nr_bucati') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{labels.nr_bucati}</Form.Label>
                                                        <Form.Control data-cy="input-nr_bucati" type="number" value={material.nr_bucati} onChange={ev => changeMaterial('nr_bucati', ev.target.value)} />
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* volum_net_paletizat */}
                                            {isFieldVisible('volum_net_paletizat') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{labels.volum_net_paletizat}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control data-cy="input-volum_net_paletizat" type="number" value={material.volum_net_paletizat} onChange={ev => changeMaterial('volum_net_paletizat', ev.target.value)} />
                                                            <InputGroup.Text>m³</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* volum_brut_paletizat */}
                                            {isFieldVisible('volum_brut_paletizat') && (
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label>{labels.volum_brut_paletizat}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control data-cy="input-volum_brut_paletizat" type="number" value={material.volum_brut_paletizat} onChange={ev => changeMaterial('volum_brut_paletizat', ev.target.value)} />
                                                            <InputGroup.Text>m³</InputGroup.Text>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            )}
                                            {/* observatii */}
                                            <Col md={12} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label>{labels.observatii}</Form.Label>
                                                    <Form.Control as="textarea" data-cy="input-observatii" value={material.observatii} onChange={ev => changeMaterial('observatii', ev.target.value)} />
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
                        <Card className="mb-2 shadow-sm">
                            <Card.Body>
                                <Card.Title as="h3" className="mb-2">{labels.componente}</Card.Title>
                                {componente?.length === 0 ? (
                                    <div className="text-muted">Nicio componenta adaugata.</div>
                                ) : (
                                    <ListGroup variant="flush">
                                        {componente.filter(isMaterial).map((comp, index) => (
                                            <ListGroup.Item key={index} action onClick={() => navigate(`/material/${comp._id}`)} data-cy={`component-list-item-${comp._id}`}>
                                                <div className="fw-bold">{comp.humanId}</div>
                                                <div className="text-muted small">
                                                    {MaterialMappings.getMaterialTypeLabel(comp.type)} • {MaterialMappings.getWoodSpeciesLabel(comp.specie)}
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                                {/* QR code scanning for adding components is disabled */}
                            </Card.Body>
                        </Card>
                        {!isNew && (
                            <Card className="mb-2">
                                <Card.Body>
                                    <Card.Title as="h3" className="mb-2">Etichetă QR</Card.Title>
                                    <div id="qrcode" className="mx-auto text-center">
                                        {labelImageUrl && (
                                            <img src={labelImageUrl} alt="Printable label" style={{ maxWidth: '100%' }} />
                                        )}
                                    </div>
                                    <Button className="btn-default mt-2" onClick={handleDownload} size="sm" data-cy="download-qr-btn">
                                        <span className="me-1" role="img" aria-label="print">⎙</span>
                                        Descarcă Etichetă
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
