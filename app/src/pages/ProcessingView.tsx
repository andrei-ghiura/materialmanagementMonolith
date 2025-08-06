import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonItemDivider, IonLabel, IonList, IonModal, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar, useIonAlert } from '@ionic/react';
import { add, checkmark, close, qrCode, save, trash } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Html5Qrcode } from 'html5-qrcode';
import { Material } from '../types';
import { getAll, getById } from '../../api/materials';
import { materialTypes, woodSpecies } from '../selectOptions';
import MaterialItem from '../components/MaterialItem';

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
    const [presentAlert] = useIonAlert();
    const router = useIonRouter();
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
        specie: ''
    });

    const qrRef = useRef<HTMLDivElement>(null);
    const html5QrInstance = useRef<Html5Qrcode | null>(null);

    // Load all materials when the page enters
    useIonViewWillEnter(() => {
        loadMaterials();
    });

    // Filter materials whenever the search term changes
    useEffect(() => {
        if (allMaterials.length > 0) {
            if (!materialSearchTerm.trim()) {
                setFilteredMaterials(allMaterials);
            } else {
                const lowercaseSearch = materialSearchTerm.toLowerCase();
                const filtered = allMaterials.filter(material =>
                    (material.humanId && material.humanId.toLowerCase().includes(lowercaseSearch)) ||
                    (material.id && material.id.toLowerCase().includes(lowercaseSearch)) ||
                    (materialTypes.find(t => t.id === material.type)?.label.toLowerCase().includes(lowercaseSearch)) ||
                    (woodSpecies.find(s => s.id === material.specie)?.label.toLowerCase().includes(lowercaseSearch))
                );
                setFilteredMaterials(filtered);
            }
        }
    }, [materialSearchTerm, allMaterials]);

    const loadMaterials = async () => {
        try {
            const materials = await getAll();
            setAllMaterials(materials);
            setFilteredMaterials(materials);
        } catch (error) {
            console.error('Failed to load materials:', error);
            presentAlert({
                header: 'Eroare',
                message: 'Nu s-au putut încărca materialele.',
                buttons: ['OK'],
            });
        }
    };

    const addMaterialById = async (id: string) => {
        // Clear the input field
        setMaterialInput('');
        console.log('Adding material with ID:', id);

        try {
            // First check if material is already selected
            if (selectedMaterials.some(m => m.id === id)) {
                console.log('Material already selected');
                presentAlert({
                    header: 'Material deja adăugat',
                    message: 'Acest material este deja în lista de procesare.',
                    buttons: ['OK'],
                });
                return;
            }

            // Try to find material in already loaded materials
            let material = allMaterials.find(m => m.id === id || m.humanId === id);
            console.log('Found in loaded materials:', material);

            // If not found, try to fetch from API
            if (!material) {
                console.log('Material not found in loaded materials, fetching from API');
                material = await getById(id);
                console.log('API response:', material);
            }

            if (material) {
                console.log('Adding material to selected materials:', material);
                setSelectedMaterials(prev => [...prev, material]);
            } else {
                presentAlert({
                    header: 'Material inexistent',
                    message: `Materialul cu ID-ul ${id} nu există.`,
                    buttons: ['OK'],
                });
            }
        } catch (error) {
            console.error('Error adding material:', error);
            presentAlert({
                header: 'Eroare',
                message: 'Nu s-a putut adăuga materialul.',
                buttons: ['OK'],
            });
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
        if (isWeb()) {
            setShowQrModal(true);
            return;
        }

        try {
            const { barcodes } = await BarcodeScanner.scan();
            if (barcodes && barcodes.length > 0) {
                let id: string | null = null;
                const rawValue = barcodes[0].rawValue;

                try {
                    // Try to parse as JSON
                    const data = JSON.parse(rawValue);
                    if (data && data.id) {
                        id = data.id;
                    } else if (data && data.humanId) {
                        id = data.humanId;
                    }
                } catch {
                    // Not JSON, treat as plain id string
                    id = rawValue;
                }

                if (id) {
                    await addMaterialById(id);
                }
            }
        } catch (error) {
            console.error('QR scan error:', error);
        }
    };

    const processMaterials = async () => {
        if (selectedMaterials.length === 0) {
            presentAlert({
                header: 'Niciun material selectat',
                message: 'Selectați cel puțin un material pentru procesare.',
                buttons: ['OK'],
            });
            return;
        }

        if (!outputConfig.type) {
            presentAlert({
                header: 'Configurare incompletă',
                message: 'Selectați tipul materialului rezultat.',
                buttons: ['OK'],
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Here we would call the API to process the materials
            // const result = await processMaterials(selectedMaterials.map(m => m.id), outputConfig);

            // For now we'll just show a success message
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            presentAlert({
                header: 'Succes',
                message: 'Materialele au fost procesate cu succes.',
                buttons: [
                    {
                        text: 'OK',
                        handler: () => {
                            // Clear selected materials and navigate back
                            setSelectedMaterials([]);
                            router.push('/', 'back', 'pop'); // Navigate to the main materials list
                        }
                    }
                ],
            });
        } catch (error) {
            console.error('Processing error:', error);
            presentAlert({
                header: 'Eroare de procesare',
                message: 'Nu s-au putut procesa materialele.',
                buttons: ['OK'],
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const closeQrModal = async () => {
        setShowQrModal(false);
        if (html5QrInstance.current) {
            try {
                await html5QrInstance.current.stop();
            } catch (e) {
                console.error(e);
            }
            html5QrInstance.current = null;
        }
    };

    // Calculate total volume of selected materials
    const totalVolume = selectedMaterials.reduce((sum, material) => {
        return sum + (material.volum_total ? parseFloat(material.volum_total) : 0);
    }, 0);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Procesare Materiale</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-padding">
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Procesare Materiale</IonTitle>
                    </IonToolbar>
                </IonHeader>

                {/* Material Input Section */}
                <IonItem lines="full">
                    <IonLabel position="stacked">Adaugă Material (ID sau Cod)</IonLabel>
                    <div className="flex w-full">
                        <IonInput
                            value={materialInput}
                            onIonChange={e => setMaterialInput(e.detail.value || '')}
                            onKeyPress={handleInputKeyPress}
                            placeholder="Introdu ID-ul materialului"
                            className="flex-1"
                        ></IonInput>
                        <IonButton onClick={() => setShowMaterialSelectionModal(true)}>
                            <IonIcon icon={add} />
                        </IonButton>
                        <IonButton onClick={handleQrScan}>
                            <IonIcon icon={qrCode} />
                        </IonButton>
                    </div>
                </IonItem>

                {/* Selected Materials Section */}
                <IonItemDivider>Materiale Selectate</IonItemDivider>

                {selectedMaterials.length === 0 ? (
                    <IonItem lines="none">
                        <IonLabel color="medium" className="ion-text-center">
                            Niciun material selectat
                        </IonLabel>
                    </IonItem>
                ) : (
                    <IonList>
                        {selectedMaterials.map((material, index) => (
                            <MaterialItem
                                key={index}
                                material={material}
                                detailButton={false}
                                showDeleteButton={true}
                                onDelete={() => removeMaterial(index)}
                            />
                        ))}

                        <IonItem>
                            <IonLabel>
                                <h2>Total Volum</h2>
                            </IonLabel>
                            <IonLabel slot="end" className="ion-text-right">
                                <h2>{totalVolume.toFixed(3)} m³</h2>
                            </IonLabel>
                        </IonItem>
                    </IonList>
                )}

                {/* Output Configuration */}
                <IonItemDivider className="mt-4">Configurare Rezultat</IonItemDivider>

                <IonItem>
                    <IonLabel position="stacked">Număr de materiale rezultate</IonLabel>
                    <IonInput
                        type="number"
                        min={1}
                        value={outputConfig.count}
                        onIonChange={e => setOutputConfig({
                            ...outputConfig,
                            count: parseInt(e.detail.value || '1', 10)
                        })}
                    ></IonInput>
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">Tip material</IonLabel>
                    <IonSelect
                        value={outputConfig.type}
                        placeholder="Selectează tipul"
                        onIonChange={e => setOutputConfig({
                            ...outputConfig,
                            type: e.detail.value
                        })}
                    >
                        {materialTypes.map(type => (
                            <IonSelectOption key={type.id} value={type.id}>{type.label}</IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">Specie lemn</IonLabel>
                    <IonSelect
                        value={outputConfig.specie}
                        placeholder="Selectează specia"
                        onIonChange={e => setOutputConfig({
                            ...outputConfig,
                            specie: e.detail.value
                        })}
                    >
                        {woodSpecies.map(specie => (
                            <IonSelectOption key={specie.id} value={specie.id}>{specie.label}</IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>

                {/* Process Button */}
                <div className="ion-padding">
                    <IonButton
                        expand="block"
                        onClick={processMaterials}
                        disabled={selectedMaterials.length === 0 || isProcessing}
                    >
                        <IonIcon icon={save} slot="start" />
                        {isProcessing ? 'Se procesează...' : 'Procesează Materialele'}
                    </IonButton>
                </div>
            </IonContent>

            {/* QR Scanner Modal */}
            <IonModal
                isOpen={showQrModal}
                onDidDismiss={closeQrModal}
                onWillPresent={() => {
                    setTimeout(() => {
                        if (qrRef.current && !html5QrInstance.current) {
                            html5QrInstance.current = new Html5Qrcode(qrRef.current.id);
                            html5QrInstance.current.start(
                                {
                                    facingMode: 'environment',
                                    aspectRatio: 1
                                },
                                {
                                    fps: 10,
                                    qrbox: 250,
                                    disableFlip: true,
                                    videoConstraints: {
                                        aspectRatio: 1,
                                        facingMode: 'environment'
                                    }
                                },
                                async (decodedText) => {
                                    await html5QrInstance.current?.stop();
                                    setShowQrModal(false);

                                    let id: string | null = null;
                                    try {
                                        const data = JSON.parse(decodedText.trim());
                                        if (data && data.humanId) {
                                            id = data.humanId;
                                        } else if (data && data.id) {
                                            id = data.id;
                                        }
                                    } catch {
                                        id = decodedText.trim();
                                    }

                                    if (id) {
                                        await addMaterialById(id);
                                    } else {
                                        presentAlert({
                                            header: 'QR invalid',
                                            message: 'Codul QR scanat nu conține date valide de material.',
                                            buttons: ['OK'],
                                        });
                                    }
                                },
                                (error) => {
                                    // Only log errors that aren't about not finding a QR code
                                    if (!error.includes("NotFoundException")) {
                                        console.error(error);
                                    }
                                }
                            );
                        }
                    }, 100);
                }}
                className="qr-scanner-modal">
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Scanare QR</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={closeQrModal}>
                                <IonIcon icon={close} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <div className="flex flex-col h-full items-center justify-center">
                        <div
                            id="web-qr-reader"
                            ref={qrRef}
                            className="w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden mx-auto"
                        ></div>
                    </div>
                </IonContent>
            </IonModal>

            {/* Material Selection Modal */}
            <IonModal isOpen={showMaterialSelectionModal} onDidDismiss={() => setShowMaterialSelectionModal(false)}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Selectează Material</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => setShowMaterialSelectionModal(false)}>
                                <IonIcon icon={close} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                    <IonToolbar>
                        <IonInput
                            placeholder="Caută material..."
                            value={materialSearchTerm}
                            onIonChange={e => setMaterialSearchTerm(e.detail.value || '')}
                            clearInput
                        ></IonInput>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonList>
                        {filteredMaterials.length === 0 ? (
                            <IonItem>
                                <IonLabel className="ion-text-center">
                                    Nu s-au găsit materiale
                                </IonLabel>
                            </IonItem>
                        ) : (
                            filteredMaterials.map((material) => (
                                <MaterialItem
                                    key={material._id}
                                    material={material}
                                    onItemClick={() => {
                                        console.log('Material clicked:', material);
                                        if (material._id) {
                                            console.log('Adding material with ID:', material._id);
                                            addMaterialById(material._id);
                                            setShowMaterialSelectionModal(false);
                                            setMaterialSearchTerm('');
                                        } else {
                                            console.error('Material ID is undefined');
                                        }
                                    }}
                                    disabled={selectedMaterials.some(m => m.id === material.id)}
                                    extraContent={
                                        selectedMaterials.some(m => m.id === material.id) && (
                                            <IonIcon icon={checkmark} slot="end" color="success" />
                                        )
                                    }
                                />
                            ))
                        )}
                    </IonList>
                </IonContent>
            </IonModal>
        </IonPage>
    );
};

export default ProcessingView;
