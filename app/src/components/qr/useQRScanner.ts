import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { useIonAlert } from '@ionic/react';

// Check if we're on web or native
export const isWeb = () => {
    return !(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
};

interface QRScanHookProps {
    onScanSuccess: (data: string) => void;
    onScanError?: (error: string) => void;
}

export const useQRScanner = ({ onScanSuccess, onScanError }: QRScanHookProps) => {
    const [presentAlert] = useIonAlert();

    const requestPermissions = async (): Promise<boolean> => {
        try {
            const { camera } = await BarcodeScanner.requestPermissions();
            return camera === 'granted' || camera === 'limited';
        } catch {
            return false;
        }
    };

    const presentDenyAlert = async (): Promise<void> => {
        await presentAlert({
            header: 'Permission denied',
            message: 'Please grant camera permission to use the barcode scanner.',
            buttons: ['OK'],
        });
    };

    const scanNative = async () => {
        const granted = await requestPermissions();
        if (!granted) {
            await presentDenyAlert();
            return;
        }

        try {
            const { barcodes } = await BarcodeScanner.scan();
            if (barcodes && barcodes.length > 0) {
                const rawData = barcodes[0]?.displayValue || barcodes[0]?.rawValue || '';
                onScanSuccess(rawData);
            } else {
                onScanError?.('No QR code found');
            }
        } catch (error) {
            onScanError?.(`Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return {
        scanNative,
        isWeb,
        presentAlert
    };
};

export default useQRScanner;
