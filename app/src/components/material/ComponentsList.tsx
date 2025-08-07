import React from 'react';
import { IonItem, IonLabel, IonButton } from '@ionic/react';
import { Material } from '../../types';
import { MaterialMappings } from '../../config/materialMappings';
import labels from '../../labels';

interface ComponentsListProps {
    componente: (string | Material)[];
    onComponentClick: (componentId: string) => void;
    onAddComponent: () => void;
    isMaterial: (component: string | Material) => component is Material;
}

const ComponentsList: React.FC<ComponentsListProps> = ({
    componente,
    onComponentClick,
    onAddComponent,
    isMaterial
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-3 mb-2">
            <h3 className="text-lg font-semibold mb-2">{labels.componente}</h3>
            {componente?.length === 0 ? (
                <IonLabel color="medium">Nicio componenta adaugata.</IonLabel>
            ) : (
                componente.filter(isMaterial).map((comp, index) => (
                    <IonItem
                        button
                        detail
                        key={index}
                        onClick={() => onComponentClick(comp._id || '')}
                        lines="full"
                        className="py-2 min-h-[auto]"
                        data-cy={`component-list-item-${comp._id}`}
                    >
                        <IonLabel>
                            <h3 className="m-0 text-sm font-medium">{comp.humanId}</h3>
                            <p className="m-0 text-xs text-gray-600">
                                {MaterialMappings.getMaterialTypeLabel(comp.type)} • {' '}
                                {MaterialMappings.getWoodSpeciesLabel(comp.specie)}
                            </p>
                        </IonLabel>
                    </IonItem>
                ))
            )}
            <div className="flex justify-center mt-2 mb-1">
                <IonButton
                    color="primary"
                    shape="round"
                    onClick={onAddComponent}
                    size="small"
                    data-cy="add-component-btn"
                >
                    <span className="font-semibold">{labels.adaugaComponenta}</span>
                </IonButton>
            </div>
        </div>
    );
};

export default ComponentsList;
