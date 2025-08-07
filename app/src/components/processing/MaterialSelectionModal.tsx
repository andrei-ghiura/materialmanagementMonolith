import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { close, add } from 'ionicons/icons';
import { Material } from '../../types';
import MaterialItem from '../MaterialItem';

interface MaterialSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    materials: Material[];
    onMaterialSelect: (material: Material) => void;
    title?: string;
}

const MaterialSelectionModal: React.FC<MaterialSelectionModalProps> = ({
    isOpen,
    onClose,
    materials,
    onMaterialSelect,
    title = 'Selectează Material'
}) => {
    const handleMaterialSelect = (material: Material) => {
        onMaterialSelect(material);
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{title}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>
                            <IonIcon icon={close}></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    {materials.map((material) => (
                        <IonItem
                            key={material._id || material.id}
                            button
                            onClick={() => handleMaterialSelect(material)}
                        >
                            <div className="w-full">
                                <MaterialItem
                                    material={material}
                                    detailButton={false}
                                    extraContent={
                                        <div className="flex justify-end">
                                            <IonButton size="small" color="primary">
                                                <IonIcon icon={add} />
                                                Adaugă
                                            </IonButton>
                                        </div>
                                    }
                                />
                            </div>
                        </IonItem>
                    ))}
                    {materials.length === 0 && (
                        <IonItem>
                            <IonLabel>Nu există materiale disponibile</IonLabel>
                        </IonItem>
                    )}
                </IonList>
            </IonContent>
        </IonModal>
    );
};

export default MaterialSelectionModal;
