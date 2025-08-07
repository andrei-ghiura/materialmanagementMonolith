import React from 'react';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonTitle } from '@ionic/react';

interface PageHeaderProps {
    title: string;
    onBack?: () => void;
    onSave?: () => void;
    saveLabel?: string;
    saveColor?: string;
    showSave?: boolean;
    backLabel?: string;
    saveDataCy?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    onBack,
    onSave,
    saveLabel = 'Salvează',
    saveColor = 'success',
    showSave = true,
    backLabel = '←',
    saveDataCy = 'save-btn'
}) => {
    return (
        <IonHeader>
            <IonToolbar>
                {onBack && (
                    <IonButtons slot="start">
                        <IonButton fill="clear" onClick={onBack}>
                            <span style={{ fontSize: 20 }}>{backLabel}</span>
                        </IonButton>
                    </IonButtons>
                )}
                <IonTitle>{title}</IonTitle>
                {onSave && showSave && (
                    <IonButtons slot="end">
                        <IonButton color={saveColor} onClick={onSave} data-cy={saveDataCy}>
                            <span style={{ fontWeight: 600 }}>{saveLabel}</span>
                        </IonButton>
                    </IonButtons>
                )}
            </IonToolbar>
        </IonHeader>
    );
};

export default PageHeader;
