import React, { useRef, useEffect } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/react';
import { close } from 'ionicons/icons';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (decodedText: string) => void;
    title?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({
    isOpen,
    onClose,
    onScanSuccess,
    title = 'Scanare QR'
}) => {
    const webQrRef = useRef<HTMLDivElement>(null);
    const html5QrInstance = useRef<Html5Qrcode | null>(null);

    const handleClose = async () => {
        if (html5QrInstance.current) {
            try {
                await html5QrInstance.current.stop();
            } catch (e) {
                console.error(e);
            }
            html5QrInstance.current = null;
        }
        onClose();
    };

    useEffect(() => {
        if (isOpen && webQrRef.current && !html5QrInstance.current) {
            setTimeout(() => {
                if (webQrRef.current) {
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
                            html5QrInstance.current = null;
                            onScanSuccess(decodedText);
                            onClose();
                        },
                        (error) => {
                            if (!error.includes("NotFoundException")) {
                                console.error(error);
                            }
                        }
                    ).catch(console.error);
                }
            }, 100);
        }

        return () => {
            if (html5QrInstance.current) {
                html5QrInstance.current.stop().catch(console.error);
                html5QrInstance.current = null;
            }
        };
    }, [isOpen, onScanSuccess, onClose]);

    return (
        <IonModal isOpen={isOpen} onDidDismiss={handleClose} className="qr-scanner-modal">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{title}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton className="btn-transparent" onClick={handleClose}>
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
    );
};

export default QRScanner;
