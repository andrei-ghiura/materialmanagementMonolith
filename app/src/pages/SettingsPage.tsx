import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle, IonButtons, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const SettingsPage: React.FC = () => {
    const { paletteToggle, toggleDarkPalette } = useDarkMode();
    const history = useHistory();

    const handleToggle = (checked: boolean) => {
        toggleDarkPalette(checked);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton fill="clear" onClick={() => history.goBack()}>
                            <span style={{ fontSize: 20 }}>←</span>
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Setări</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    <IonItem>
                        <IonLabel>Mod Întunecat</IonLabel>
                        <IonToggle
                            checked={paletteToggle}
                            onIonChange={e => handleToggle(e.detail.checked)}
                            data-cy="dark-mode-toggle"
                        />
                    </IonItem>
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default SettingsPage;
