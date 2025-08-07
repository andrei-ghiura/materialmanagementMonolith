import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonItemDivider, IonLabel, IonList, IonModal, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar, useIonAlert } from '@ionic/react';
import { add, checkmark, close, qrCode, save } from 'ionicons/icons';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Html5Qrcode } from 'html5-qrcode';
import { Material } from '../types';
import { getAll, getById } from '../api/materials';
import { processMaterials as processAPI } from '../api/materials';
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

                presentAlert({
                    header: 'Materiale incompatibile',
                    message: `${incompatibleMaterials.length} materiale au fost eliminate deoarece nu sunt compatibile cu tipul de procesare selectat.`,
                    buttons: ['OK'],
                });
            }

            // Check if all remaining materials are the same type
            if (selectedMaterials.length > 1) {
                const firstType = selectedMaterials[0].type;
                const allSameType = selectedMaterials.every(m => m.type === firstType);

                if (!allSameType) {
                    presentAlert({
                        header: 'Materiale incompatibile',
                        message: 'Toate materialele selectate trebuie să fie de același tip.',
                        buttons: ['OK'],
                    });
                }
            }
        }
    }, [selectedMaterials, selectedProcessingType, presentAlert]);    // Update selected processing type when processingType changes
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

    // Load all materials when the page enters
    useIonViewWillEnter(() => {
        loadMaterials();
        loadProcessingTypes();
    });

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
            // Check if processing type is selected first
            if (!selectedProcessingType) {
                presentAlert({
                    header: 'Selectați tipul de procesare',
                    message: 'Vă rugăm să selectați mai întâi tipul de procesare înainte de a adăuga materiale.',
                    buttons: ['OK'],
                });
                return;
            }

            // First check if material is already selected
            if (selectedMaterials.some(m => m._id === id || m.humanId === id)) {
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
                // Check if material type is compatible with selected processing type
                if (!selectedProcessingType.sourceTypes.includes(material.type)) {
                    presentAlert({
                        header: 'Material incompatibil',
                        message: `Acest material de tip "${material.type}" nu poate fi procesat cu "${selectedProcessingType.label}". Tipurile acceptate sunt: ${selectedProcessingType.sourceTypes.join(', ')}.`,
                        buttons: ['OK'],
                    });
                    return;
                }

                // Check if mixing material types (all materials should be same type)
                if (selectedMaterials.length > 0 && selectedMaterials[0].type !== material.type) {
                    presentAlert({
                        header: 'Tipuri diferite de materiale',
                        message: 'Toate materialele selectate trebuie să fie de același tip.',
                        buttons: ['OK'],
                    });
                    return;
                }

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

        if (!outputConfig.processingType) {
            presentAlert({
                header: 'Configurare incompletă',
                message: 'Selectați tipul de procesare.',
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

        if (!outputConfig.specie) {
            presentAlert({
                header: 'Configurare incompletă',
                message: 'Selectați specia lemnului pentru materialul rezultat.',
                buttons: ['OK'],
            });
            return;
        }

        if (!availableWoodSpecies.includes(outputConfig.specie)) {
            presentAlert({
                header: 'Specie invalidă',
                message: 'Specia selectată nu este prezentă în materialele sursă.',
                buttons: ['OK'],
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Call the API to process the materials
            const sourceIds = selectedMaterials.map(m => m._id);

            // Transform outputConfig to match backend expectations
            const apiConfig = {
                type: outputConfig.type,
                specie: outputConfig.specie,
                count: outputConfig.count,
                processingTypeId: outputConfig.processingType
            };

            const result = await processAPI(sourceIds, apiConfig);

            presentAlert({
                header: 'Succes',
                message: `${result.message}`,
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
                message: `Nu s-au putut procesa materialele: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`,
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

                {/* Step 1: Processing Type Selection */}
                <IonItemDivider>Pasul 1: Selectează Tipul de Procesare</IonItemDivider>

                <IonItem>
                    <IonLabel position="floating">Tip procesare</IonLabel>
                    <IonSelect
                        value={outputConfig.processingType}
                        placeholder="Selectează tipul de procesare"
                        onIonChange={e => {
                            const processingTypeId = e.detail.value;
                            setOutputConfig({
                                ...outputConfig,
                                processingType: processingTypeId
                            });
                            // Clear selected materials when processing type changes
                            if (processingTypeId !== outputConfig.processingType) {
                                setSelectedMaterials([]);
                            }
                        }}
                    >
                        {allProcessingTypes.map(type => (
                            <IonSelectOption key={type.id} value={type.id}>{type.label}</IonSelectOption>
                        ))}
                    </IonSelect>
                    {allProcessingTypes.length === 0 && (
                        <IonLabel color="medium" className="ion-padding-top">
                            Se încarcă tipurile de procesare...
                        </IonLabel>
                    )}
                </IonItem>

                {/* Processing type description */}
                {selectedProcessingType && (
                    <IonItem lines="none">
                        <IonLabel color="medium" className="ion-text-wrap">
                            <strong>Descriere:</strong> {selectedProcessingType.description}
                            <br />
                            <strong>Tip rezultat:</strong> {selectedProcessingType.resultType === 'same' ? 'Același ca sursa' : selectedProcessingType.resultType}
                            <br />
                            <strong>Tipuri materiale acceptate:</strong> {selectedProcessingType.sourceTypes.join(', ')}
                        </IonLabel>
                    </IonItem>
                )}

                {/* Step 2: Material Selection - Only shown after processing type is selected */}
                {selectedProcessingType && (
                    <>
                        <IonItemDivider className="mt-4">Pasul 2: Adaugă Materiale</IonItemDivider>

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

                        <IonItem lines="none">
                            <IonLabel color="medium" className="ion-text-wrap">
                                <strong>Restricție:</strong> Doar materialele de tip {selectedProcessingType.sourceTypes.join(' sau ')} pot fi procesate cu această opțiune.
                            </IonLabel>
                        </IonItem>
                    </>
                )}

                {/* Selected Materials Section - Only shown after processing type is selected */}
                {selectedProcessingType && (
                    <>
                        <IonItemDivider className="mt-2">Materiale Selectate</IonItemDivider>

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
                            </IonList>
                        )}
                    </>
                )}

                {/* Step 3: Output Configuration - Only shown after materials are selected */}
                {selectedProcessingType && selectedMaterials.length > 0 && (
                    <>
                        <IonItemDivider className="mt-4">Pasul 3: Configurare Rezultat</IonItemDivider>

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
                                disabled={selectedProcessingType !== null}
                                onIonChange={e => setOutputConfig({
                                    ...outputConfig,
                                    type: e.detail.value
                                })}
                            >
                                {MaterialMappings.getMaterialTypeOptions().map(type => (
                                    <IonSelectOption key={type.id} value={type.id}>{type.label}</IonSelectOption>
                                ))}
                            </IonSelect>
                            {selectedProcessingType && (
                                <IonLabel color="medium" className="ion-padding-top">
                                    Tipul este determinat automat de procesarea selectată
                                </IonLabel>
                            )}
                        </IonItem>

                        <IonItem>
                            <IonLabel position="stacked">Specie lemn</IonLabel>
                            <IonSelect
                                value={outputConfig.specie}
                                placeholder="Selectează specia"
                                disabled={availableWoodSpecies.length <= 1}
                                onIonChange={e => setOutputConfig({
                                    ...outputConfig,
                                    specie: e.detail.value
                                })}
                            >
                                {MaterialMappings.getWoodSpeciesOptions()
                                    .filter(specie => availableWoodSpecies.includes(specie.id))
                                    .map(specie => (
                                        <IonSelectOption key={specie.id} value={specie.id}>{specie.label}</IonSelectOption>
                                    ))}
                            </IonSelect>
                            {availableWoodSpecies.length === 0 && (
                                <IonLabel color="medium" className="ion-padding-top">
                                    Adăugați materiale pentru a selecta specia
                                </IonLabel>
                            )}
                        </IonItem>

                        {/* Process Button */}
                        <div className="ion-padding">
                            <IonButton
                                expand="block"
                                onClick={processMaterials}
                                disabled={selectedMaterials.length === 0 || isProcessing || !outputConfig.processingType}
                            >
                                <IonIcon icon={save} slot="start" />
                                {isProcessing ? 'Se procesează...' : 'Procesează Materialele'}
                            </IonButton>
                        </div>
                    </>
                )}
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
                                    disabled={selectedMaterials.some(m => m._id === material._id)}
                                    extraContent={
                                        selectedMaterials.some(m => m._id === material._id) && (
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
