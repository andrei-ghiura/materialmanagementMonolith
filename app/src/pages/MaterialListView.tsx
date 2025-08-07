import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonList, IonPage, IonTitle, IonToolbar, useIonAlert, IonItemOption, IonItemOptions, IonItemSliding, IonModal, IonMenuButton, IonItem } from '@ionic/react';
import labels from '../labels';
import { add, qrCode, cogOutline, close } from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { useRef, useState } from 'react';
import { deleteMaterial, getAll, getById } from '../api/materials';
import { useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { Material } from '../types';
import { Html5Qrcode } from 'html5-qrcode';
import MaterialItem from '../components/MaterialItem';

const isWeb = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !(window as any).Capacitor?.isNativePlatform?.();
};

const MaterialListView: React.FC = () => {
  const [presentAlert] = useIonAlert();
  const router = useIonRouter();

  const [materials, setMaterials] = useState<Material[]>([])
  const today = new Date();
  const lastWeeks = new Date();
  lastWeeks.setDate(today.getDate() - 14);
  const [showWebQrModal, setShowWebQrModal] = useState(false);
  const webQrRef = useRef<HTMLDivElement>(null);
  const html5QrInstance = useRef<Html5Qrcode | null>(null);

  const scan = async () => {
    if (isWeb()) {
      setShowWebQrModal(true);
      return;
    }
    const granted = await requestPermissions();
    if (!granted) {
      presentDenyAlert();
      return;
    }
    const { barcodes } = await BarcodeScanner.scan();

    // Try to extract material id from QR code data and validate existence
    if (barcodes && barcodes.length > 0) {
      let id: string | null = null;
      let rawValue = barcodes[0].rawValue;
      if (typeof rawValue === 'string') {
        rawValue = rawValue.trim();
        try {
          // Try to parse as JSON
          const data = JSON.parse(rawValue);
          if (data && data.id) {
            id = data.id;
          }
        } catch {

          // Not JSON, treat as plain id string
          if (rawValue) {
            id = rawValue;
          }
        }
      }
      if (id) {
        try {
          // Try to fetch the material directly from the database
          const material = await getById(id);
          if (material) {
            router.push(`/material/${material._id}`, 'forward', 'push');
            return;
          }
        } catch (error) {
          console.error('Error fetching material:', error);
          await presentAlert({
            header: 'Material inexistent',
            message: `Materialul scanat (${id}) nu există în aplicație.`,
            buttons: ['OK'],
          });
          return;
        }
      }
    }
    // Optionally show an alert if no valid material id found
    await presentAlert({
      header: 'QR invalid',
      message: 'Codul QR scanat nu contine date valide de material.',
      buttons: ['OK'],
    });
  }

  const requestPermissions = async (): Promise<boolean> => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  const presentDenyAlert = async (): Promise<void> => {
    await presentAlert({
      header: 'Permission denied',
      message: 'Please grant camera permission to use the barcode scanner.',
      buttons: ['OK'],
    });
  }


  const loadData = async () => {
    getAll().then((res) => {
      return res
    }).then((data) => setMaterials(data)).catch((error) => console.log(error));
  }

  useIonViewWillEnter(() => {
    loadData();
  });
  console.log(materials)

  const closeWebQrModal = async () => {
    setShowWebQrModal(false);
    if (html5QrInstance.current) {
      try {
        await html5QrInstance.current.stop();
      } catch (e) {
        console.error(e)
      }
      html5QrInstance.current = null;
    }
  };

  async function handleDeleteMaterial(id: string | undefined) {
    if (!id) return;
    try {
      await deleteMaterial(id);
      await loadData();
    } catch {
      await presentAlert({
        header: 'Eroare',
        message: 'Nu s-a putut șterge materialul.',
        buttons: ['OK'],
      });
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton data-cy="menu-btn" />
          </IonButtons>
          <IonTitle>{labels.MaterialListView}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList data-cy="material-list">
          {materials.map((material) => (
            <IonItemSliding key={material.id || material._id}>
              <IonItem button className='ion-no-padding' data-cy={`material-list-item-${material.id || material._id}`} onClick={() => router.push(`/material/${material.id || material._id}`)}>
                <MaterialItem material={material} />
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption color="danger" onClick={() => handleDeleteMaterial(material.id)}>
                  Delete
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>
        <IonFab slot="fixed" vertical="bottom" horizontal="start">
          <IonFabButton>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
          <IonFabList side="top">
            <IonButton onClick={() => router.push('/processing', 'forward', 'push')}>
              Prelucrare
              <IonIcon icon={cogOutline}></IonIcon>
            </IonButton>
            <IonButton onClick={() => router.push('/material/', 'forward', 'push')} data-cy="add-material-btn">
              Recepție
              <IonIcon icon={add}></IonIcon>
            </IonButton>
            <IonButton onClick={scan} data-cy="scan-qr-btn">
              Scanează Material
              <IonIcon icon={qrCode}></IonIcon>
            </IonButton>
          </IonFabList>
        </IonFab>
        {/* Web QR Modal */}
        <IonModal
          isOpen={showWebQrModal}
          onDidDismiss={closeWebQrModal}
          onWillPresent={() => {
            setTimeout(() => {
              if (webQrRef.current && !html5QrInstance.current) {
                html5QrInstance.current = new Html5Qrcode(webQrRef.current.id);
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
                    setShowWebQrModal(false);
                    let id: string | null = null;
                    try {
                      const data = JSON.parse(decodedText.trim());
                      if (data && data.humanId) {
                        id = data.humanId;
                      }
                    } catch {
                      id = decodedText.trim();
                    }
                    if (id) {
                      const materials = await getAll();
                      const found = materials && materials.find((m: Material) => m.id === id);
                      if (found) {
                        router.push(`/material/${id}`, 'forward', 'push');
                      } else {
                        await presentAlert({
                          header: 'Material inexistent',
                          message: `Materialul scanat nu există în aplicație: ${id}`,
                          buttons: ['OK'],
                        });
                      }
                    } else {
                      await presentAlert({
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
                <IonButton onClick={closeWebQrModal}>
                  <IonIcon icon={close}></IonIcon>
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div className="flex flex-col h-full items-center justify-center">
              <div
                id="web-qr-reader"
                ref={webQrRef}
                className="w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden mx-auto"
              ></div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default MaterialListView;
