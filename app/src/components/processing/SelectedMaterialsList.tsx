import React from 'react';
import { IonItem, IonLabel, IonButton, IonIcon, IonList } from '@ionic/react';
import { trash } from 'ionicons/icons';
import { Material } from '../../types';
import MaterialItem from '../MaterialItem';

interface SelectedMaterialsListProps {
    materials: Material[];
    onMaterialClick: (materialId: string) => void;
    onRemoveMaterial: (materialId: string) => void;
    title?: string;
}

const SelectedMaterialsList: React.FC<SelectedMaterialsListProps> = ({
    materials,
    onMaterialClick,
    onRemoveMaterial,
    title = 'Materiale Selectate'
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">{title}</h3>
            {materials.length === 0 ? (
                <IonLabel color="medium" className="text-center block py-4">
                    Niciun material selectat
                </IonLabel>
            ) : (
                <IonList>
                    {materials.map((material) => (
                        <IonItem
                            key={material._id || material.id}
                            className="mb-2 rounded border"
                        >
                            <div className="w-full">
                                <MaterialItem
                                    material={material}
                                    onItemClick={() => onMaterialClick(material._id || material.id || '')}
                                    detailButton={false}
                                    extraContent={
                                        <div className="flex justify-end mt-2">
                                            <IonButton
                                                size="small"
                                                color="danger"
                                                fill="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemoveMaterial(material._id || material.id || '');
                                                }}
                                            >
                                                <IonIcon icon={trash} />
                                                Elimină
                                            </IonButton>
                                        </div>
                                    }
                                />
                            </div>
                        </IonItem>
                    ))}
                </IonList>
            )}
        </div>
    );
};

export default SelectedMaterialsList;
