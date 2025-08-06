import { IonButton, IonCol, IonIcon, IonItem, IonRow, IonText } from '@ionic/react';
import { Material } from '../types';
import { materialTypes, woodSpecies } from '../selectOptions';
import { trash } from 'ionicons/icons';

interface MaterialItemProps {
    material: Material;
    onItemClick?: () => void;
    onDelete?: () => void;
    showDeleteButton?: boolean;
    detailButton?: boolean;
    disabled?: boolean;
    extraContent?: React.ReactNode;
}

const MaterialItem: React.FC<MaterialItemProps> = ({
    material,
    onItemClick,
    onDelete,
    showDeleteButton = false,
    detailButton = true,
    disabled = false,
    extraContent
}) => {
    return (
        <IonItem
            button={onItemClick !== undefined}
            detail={detailButton}
            onClick={onItemClick}
            disabled={disabled}
        >
            <div className="w-full">
                <IonRow>
                    <IonCol>
                        <IonText>
                            <h2 className="ion-text-wrap font-semibold text-lg">
                                {materialTypes.find(e => e.id === material.type)?.label} {woodSpecies.find(e => e.id === material.specie)?.label}
                            </h2>
                        </IonText>
                    </IonCol>
                    <IonCol>
                        <IonText color="medium">
                            <p className="ion-no-margin">{material.humanId}</p>
                            <p className="ion-no-margin">{material.data}</p>
                        </IonText>
                    </IonCol>
                </IonRow>

                <IonRow>
                    {material.cod_unic_aviz && (
                        <IonCol size="6" sizeSm="3">
                            <IonText color="medium"><small>Cod aviz</small></IonText>
                            <IonText><p className="ion-no-margin">{material.cod_unic_aviz}</p></IonText>
                        </IonCol>
                    )}
                    {material.apv && (
                        <IonCol size="6" sizeSm="3">
                            <IonText color="medium"><small>A.P.V.</small></IonText>
                            <IonText><p className="ion-no-margin">{material.apv}</p></IonText>
                        </IonCol>
                    )}
                    {material.nr_placuta_rosie && (
                        <IonCol size="6" sizeSm="3">
                            <IonText color="medium"><small>Nr. placuta roșie</small></IonText>
                            <IonText><p className="ion-no-margin">{material.nr_placuta_rosie}</p></IonText>
                        </IonCol>
                    )}
                    {material.lungime && (
                        <IonCol size="6" sizeSm="3">
                            <IonText color="medium"><small>Lungime</small></IonText>
                            <IonText><p className="ion-no-margin">{material.lungime}</p></IonText>
                        </IonCol>
                    )}
                    {material.diametru && (
                        <IonCol size="6" sizeSm="3">
                            <IonText color="medium"><small>Diametru</small></IonText>
                            <IonText><p className="ion-no-margin">{material.diametru}</p></IonText>
                        </IonCol>
                    )}
                    {material.volum_placuta_rosie && (
                        <IonCol size="6" sizeSm="3">
                            <IonText color="medium"><small>V. placuta roșie</small></IonText>
                            <IonText><p className="ion-no-margin">{material.volum_placuta_rosie} m³</p></IonText>
                        </IonCol>
                    )}
                    {material.volum_total && (
                        <IonCol size="6" sizeSm="3">
                            <IonText color="medium"><small>V. total</small></IonText>
                            <IonText><p className="ion-no-margin">{material.volum_total} m³</p></IonText>
                        </IonCol>
                    )}
                    {material.volum_net_paletizat && (
                        <IonCol size="6" sizeSm="3">
                            <IonText color="medium"><small>V. net paletizat</small></IonText>
                            <IonText><p className="ion-no-margin">{material.volum_net_paletizat} m³</p></IonText>
                        </IonCol>
                    )}
                    {material.volum_brut_paletizat && (
                        <IonCol size="6" sizeSm="3">
                            <IonText color="medium"><small>V. brut paletizat</small></IonText>
                            <IonText><p className="ion-no-margin">{material.volum_brut_paletizat} m³</p></IonText>
                        </IonCol>
                    )}
                    {material.nr_bucati && (
                        <IonCol size="6" sizeSm="3">
                            <IonText color="medium"><small>Bucăți</small></IonText>
                            <IonText><p className="ion-no-margin">{material.nr_bucati}</p></IonText>
                        </IonCol>
                    )}
                </IonRow>
            </div>

            {showDeleteButton && onDelete && (
                <IonButton slot="end" fill="clear" color="danger" onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering item click
                    onDelete();
                }}>
                    <IonIcon icon={trash} />
                </IonButton>
            )}

            {extraContent}
        </IonItem>
    );
};

export default MaterialItem;
