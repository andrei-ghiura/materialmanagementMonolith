import { IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent, IonItem, IonInput, IonSelect, IonFooter, useIonAlert, IonLabel, IonPage, IonGrid, IonRow, IonCol, IonSelectOption, IonTextarea } from "@ionic/react";
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { useEffect, useState, useRef } from "react";
import { Prompt } from 'react-router-dom';
import { deleteMaterial, getAll, save, update } from "../../api/materials";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Capacitor } from '@capacitor/core';
import { useHistory, useParams } from 'react-router-dom';
import labels from '../labels';
import { Material } from "../types";
import { makeLabelCanvas } from "../components/makeLabelCanvas";
import { Html5Qrcode } from 'html5-qrcode';
import { materialTypes, woodSpecies } from "../selectOptions";
const isWeb = () => {
    return !(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
};

const MaterialView = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const [presentAlert] = useIonAlert();
    const [componente, setComponente] = useState<string[]>([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
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
        async function fetchMaterial() {
            if (id) {
                try {
                    const { getById } = await import('../../api/materials');
                    const data = await getById(id);
                    setMaterial(data);
                    initialMaterialRef.current = data;
                } catch (error) {
                    presentAlert({
                        header: 'Eroare',
                        message: 'Nu s-a putut încărca materialul.' + error,
                        buttons: ['OK'],
                    });
                }
            }
        }
        fetchMaterial();
    }, [id, presentAlert]);
    const [labelImageUrl, setLabelImageUrl] = useState("");
    const labelCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [pendingNavigation, setPendingNavigation] = useState<null | (() => void)>(null);
    const [unsaved, setUnsaved] = useState(false);
    const initialMaterialRef = useRef<Material | null>(null);
    const [showWebQrModal, setShowWebQrModal] = useState(false);
    const webQrRef = useRef<HTMLDivElement>(null);
    const html5QrInstance = useRef<Html5Qrcode | null>(null);
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

    // Intercept in-app navigation
    const handleNav = (navFn: () => void) => {
        if (unsaved) {
            setPendingNavigation(navFn); // Store the actual function, not a wrapper
            handleLeaveConfirm();
        } else {
            navFn();
        }
    }

    useEffect(() => {
        setComponente(material.componente || []);
    }, [material]);

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

    const scan = async () => {
        if (isWeb()) {
            setShowWebQrModal(true);
            return;
        }
        try {
            const { barcodes } = await BarcodeScanner.scan();
            const rawData = barcodes[0]?.displayValue || '';
            const scannedData = JSON.parse(rawData);
            if (scannedData.id) {
                const updated = {
                    ...material,
                    componente: [...(componente || []), scannedData.id],
                };
                await save(updated);
                setMaterial(updated);
                alert('Componenta adaugata cu succes!');
            } else {
                alert('QR-ul nu contine un material valid.');
            }
        } catch {
            alert('Eroare la scanare.');
        }
    }

    // Web QR code scan handler
    useEffect(() => {
        if (showWebQrModal && webQrRef.current) {
            if (!html5QrInstance.current) {
                html5QrInstance.current = new Html5Qrcode(webQrRef.current.id);
            }
            html5QrInstance.current
                .start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: 250 },
                    async (decodedText: string) => {
                        if (html5QrInstance.current) html5QrInstance.current.stop();
                        setShowWebQrModal(false);
                        let scannedData: { id: string } = { id: '' };
                        try {
                            scannedData = JSON.parse(decodedText);
                        } catch {
                            scannedData = { id: decodedText.trim() };
                        }
                        if (scannedData.id) {
                            const updated = {
                                ...material,
                                componente: [...(componente || []), scannedData.id],
                            };
                            await save(updated);
                            setMaterial(updated);
                            alert('Componenta adaugata cu succes!');
                        } else {
                            alert('QR-ul nu contine un material valid.');
                        }
                    },
                    (errorMessage: string) => {
                        console.error(errorMessage);
                    }
                )
                .catch(() => { });
        }
        return () => {
            if (html5QrInstance.current) {
                html5QrInstance.current.stop().catch(() => { });
            }
        };
    }, [componente, material, showWebQrModal]);

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
            alert('QR code saved successfully!');
        }
    };

    const handleConfirm = async () => {
        try {
            if (isNew) {
                // For new materials, use save
                await save({ ...material, componente });
            } else {
                // For existing materials, use update
                await update(id!, { ...material, componente });
            }

            setUnsaved(false);

            if (pendingNavigation) {
                const nav = pendingNavigation;
                setPendingNavigation(null);
                nav();
            } else {
                presentAlert({
                    header: 'Succes',
                    message: `Material ${isNew ? 'creat' : 'actualizat'} cu succes!`,
                    buttons: ['OK'],
                    onDidDismiss: () => {
                        history.push('/');
                    }
                });
            }
        } catch (error) {
            presentAlert({
                header: 'Eroare',
                message: `Nu s-a putut ${isNew ? 'crea' : 'actualiza'} materialul.`,
                buttons: ['OK']
            });
        }
    };
    const handleDownload = () => {
        if (labelCanvasRef.current) {
            const fileName = `${material.id || 'material'}_${new Date().toISOString().split('.')[0].replace(/[:-]/g, '_')}.png`;
            downloadQRImage(labelCanvasRef.current, fileName);
        }
    };
    if (!material) return null;
    // Delete confirmation using presentAlert
    const handleDelete = () => {
        presentAlert({
            header: 'Confirmare ștergere',
            message: 'Sigur vrei să ștergi acest material?',
            buttons: [
                {
                    text: 'Anulează',
                    role: 'cancel',
                },
                {
                    text: 'Da, șterge materialul',
                    role: 'destructive',
                    handler: async () => {
                        if (id) {
                            await deleteMaterial(id);
                            history.goBack();
                        }
                    },
                },
            ],
        });
    };

    // Leave confirmation using presentAlert
    const handleLeaveConfirm = () => {
        presentAlert({
            header: 'Modificări nesalvate',
            message: 'Ai modificări nesalvate. Ce vrei să faci?',
            buttons: [
                {
                    text: 'Rămâi pe pagină',
                    role: 'cancel',
                    handler: () => {
                        setPendingNavigation(null); // Clear the pending navigation on cancel
                    }
                },
                {
                    text: 'Părăsește fără salvare',
                    role: 'destructive',
                    handler: () => {
                        setUnsaved(false);
                        if (pendingNavigation) {
                            pendingNavigation(); // Execute the navigation function directly
                            setPendingNavigation(null);
                        }
                    },
                },
                {
                    text: 'Salvează și pleacă',
                    handler: async () => {
                        await handleConfirm();
                    },
                },
            ],
        });
    };

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
    const isRaw = (material: Material) => (material.type == 'BSTN' || material.type == 'BSTF')
    console.log(material)
    return (
        <IonPage>
            {/* Prompt for browser navigation (react-router-dom v5) */}
            {unsaved && <Prompt when={unsaved} message={() => false} />}
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton fill="clear" onClick={() => handleNav(() => history.goBack())}>
                            <span style={{ fontSize: 20 }}>←</span>
                        </IonButton>
                    </IonButtons>
                    <IonTitle>{labels.detaliiMaterial}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton color="success" onClick={handleConfirm}>
                            <span style={{ fontWeight: 600 }}>{isNew ? labels.adauga : labels.salveaza}</span>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding-condensed bg-[#f6f8fa] min-h-screen">
                <IonGrid>
                    <IonRow className="ion-justify-content-center">
                        {/* Left Column: Material Details */}
                        <IonCol size="12" size-lg="6" className="flex flex-col px-2 py-1"> {/* MODIFIED: Removed IonCard, added padding to IonCol */}
                            <div className="bg-white rounded-lg shadow p-3 mb-2 flex-grow"> {/* MODIFIED: Added a div with styling to replace IonCard visual */}
                                <h3 className="text-xl font-bold mb-2">{labels.detaliiMaterial}</h3> {/* MODIFIED: Adjusted margin */}
                                <IonRow>
                                    <IonCol>

                                        <IonItem>  <IonSelect label={labels.type}
                                            value={material.type}
                                            onIonChange={(ev) => changeMaterial('type', ev.target.value)}>
                                            {materialTypes.map((type) => (
                                                <IonSelectOption key={type.id} value={type.id}>{type.label}</IonSelectOption>
                                            ))}
                                        </IonSelect></IonItem>
                                    </IonCol>
                                    <IonCol>

                                        <IonItem>  <IonSelect label={labels.specie}
                                            value={material.specie}
                                            onIonChange={(ev) => changeMaterial('specie', ev.target.value)}>
                                            {woodSpecies.map((type) => (
                                                <IonSelectOption key={type.id} value={type.id}>{type.label}</IonSelectOption>
                                            ))}
                                        </IonSelect></IonItem>
                                    </IonCol>
                                    <IonCol size="12" ><IonItem> <IonInput onIonInput={(ev) => changeMaterial('cod_unic_aviz', ev.target.value)} label={labels.cod_unic_aviz} value={material.cod_unic_aviz} type="text" labelPlacement="floating" /> </IonItem></IonCol>
                                    <IonCol size="6" sizeSm="4" sizeLg="3"><IonItem> <IonInput onIonInput={(ev) => changeMaterial('data', ev.target.value)} label={labels.data} value={material.data} type="date" labelPlacement="floating" /> </IonItem></IonCol>
                                    <IonCol size="6" sizeSm="4" sizeLg="3"><IonItem> <IonInput onIonInput={(ev) => changeMaterial('apv', ev.target.value)} label={labels.apv} value={material.apv} type="text" labelPlacement="floating" /> </IonItem></IonCol>
                                    <IonCol size="6" sizeSm="4" sizeLg="3"><IonItem> <IonInput onIonInput={(ev) => changeMaterial('lat', ev.target.value)} label={labels.lat} value={material.lat} type="text" labelPlacement="floating" /> °</IonItem></IonCol>
                                    <IonCol size="6" sizeSm="4" sizeLg="3"><IonItem> <IonInput onIonInput={(ev) => changeMaterial('log', ev.target.value)} label={labels.log} value={material.log} type="text" labelPlacement="floating" /> °</IonItem></IonCol>
                                    <IonCol size="6" sizeSm="4" sizeLg="3"><IonItem> <IonInput onIonInput={(ev) => changeMaterial('nr_placuta_rosie', ev.target.value)} label={labels.nr_placuta_rosie} value={material.nr_placuta_rosie} type="number" labelPlacement="floating" /> </IonItem></IonCol>
                                    {!isRaw(material) && <IonCol size="6" sizeSm="4" sizeLg="3"><IonItem> <IonInput onIonInput={(ev) => changeMaterial('lungime', ev.target.value)} label={labels.lungime} value={material.lungime} type="number" labelPlacement="floating" />cm </IonItem></IonCol>}
                                    {!isRaw(material) && <IonCol size="6" sizeSm="4" sizeLg="3"><IonItem> <IonInput onIonInput={(ev) => changeMaterial('diametru', ev.target.value)} label={labels.diametru} value={material.diametru} type="number" labelPlacement="floating" /> cm</IonItem></IonCol>}
                                    {!isRaw(material) && <IonCol size="6" sizeSm="4" sizeLg="3"><IonItem> <IonInput onIonInput={(ev) => changeMaterial('volum_placuta_rosie', ev.target.value)} label={labels.volum_placuta_rosie} value={material.volum_placuta_rosie} type="number" labelPlacement="floating" /> m³</IonItem></IonCol>}
                                    {!isRaw(material) && <IonCol size="6" sizeSm="4" sizeLg="3"><IonItem> <IonInput onIonInput={(ev) => changeMaterial('volum_total', ev.target.value)} label={labels.volum_total} value={material.volum_total} type="number" labelPlacement="floating" /> m³</IonItem></IonCol>}
                                    {isRaw(material) && <IonCol size="6" sizeSm="4" sizeLg="3"><IonItem> <IonInput onIonInput={(ev) => changeMaterial('volum_net_paletizat', ev.target.value)} label={labels.volum_net_paletizat} value={material.volum_net_paletizat} type="number" labelPlacement="floating" /> m³</IonItem></IonCol>}
                                    {isRaw(material) && <IonCol size="6" sizeSm="4" sizeLg="3"><IonItem> <IonInput onIonInput={(ev) => changeMaterial('volum_brut_paletizat', ev.target.value)} label={labels.volum_brut_paletizat} value={material.volum_brut_paletizat} type="number" labelPlacement="floating" />m³ </IonItem></IonCol>}
                                    {isRaw(material) && <IonCol size="6" sizeSm="4" sizeLg="3"><IonItem> <IonInput onIonInput={(ev) => changeMaterial('nr_bucati', ev.target.value)} label={labels.nr_bucati} value={material.nr_bucati} type="number" labelPlacement="floating" /> </IonItem></IonCol>}
                                    <IonCol size="12"><IonItem> <IonTextarea onIonInput={(ev) => changeMaterial('observatii', ev.target.value)} label={labels.observatii} value={material.observatii} labelPlacement="floating" /> </IonItem></IonCol>
                                </IonRow>

                            </div>
                        </IonCol>

                        {/* Right Column: Components and QR Code */}
                        <IonCol size="12" size-lg="6" className="flex flex-col px-2 py-1"> {/* MODIFIED: Removed IonCard, added padding to IonCol */}
                            <div className="bg-white rounded-lg shadow p-3 mb-2"> {/* MODIFIED: Added a div with styling to replace IonCard visual */}
                                <h3 className="text-lg font-semibold mb-2">{labels.componente}</h3> {/* MODIFIED: Adjusted margin */}
                                {componente?.length === 0 ? (
                                    <IonLabel color="medium">Nicio componenta adaugata.</IonLabel>
                                ) : (
                                    componente.map((compId: string, index: number) => {
                                        const comp = allMaterials.find((m) => m.id === compId);
                                        return (
                                            <IonItem button detail key={index} onClick={() => history.push(`/material/${compId}`)} lines="full" className="py-1 min-h-[auto]">
                                                <IonLabel>
                                                    <h3 className="m-0 text-sm">{compId}</h3>
                                                    <p className="m-0 text-xs">{comp?.type || ''}</p>
                                                </IonLabel>
                                            </IonItem>
                                        );
                                    })
                                )}
                                <div className="flex justify-center mt-2 mb-1">
                                    <IonButton color="primary" shape="round" onClick={scan} size="small">
                                        <span className="font-semibold">{labels.adaugaComponenta}</span>
                                    </IonButton>
                                </div>
                            </div>
                            {!isNew && (
                                <div className="">
                                    <h3 className="text-lg font-semibold mb-2">Etichetă QR</h3>
                                    <div id="qrcode" className="mx-auto">
                                        {labelImageUrl && (
                                            <img src={labelImageUrl} alt="Printable label" className="" />
                                        )}
                                    </div>
                                    <IonButton color="tertiary" onClick={handleDownload} size="small">
                                        <span className="text-lg mr-1" role="img" aria-label="print">⎙</span>
                                        Descarcă Etichetă
                                    </IonButton>
                                </div>)}
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
            <IonFooter>
                <IonToolbar className="py-0 min-h-[auto]">
                    <IonButtons slot="start">
                        {!isNew && <IonButton color="danger" onClick={handleDelete} size="small">
                            <span className="text-lg mr-1" role="img" aria-label="delete">🗑️</span>
                            Șterge
                        </IonButton>
                        }

                    </IonButtons>
                    <IonButtons slot="end">
                        <IonButton color="medium" onClick={() => handleNav(() => history.push(`/material/${material.id}/components`))} size="small">
                            Export
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonFooter>
            {/* Web QR Modal */}
            {showWebQrModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        id="web-qr-reader"
                        ref={webQrRef}
                        style={{ width: 300, height: 300, background: '#000' }}
                    ></div>
                    <IonButton color="danger" onClick={closeWebQrModal}>
                        Închide
                    </IonButton>
                </div>
            )}
        </IonPage>
    );
}
export default MaterialView;
