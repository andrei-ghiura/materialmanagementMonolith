import { useState, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

import { Modal, Button } from 'react-bootstrap';

export function useQrScannerModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [scannedValue, setScannedValue] = useState<string | null>(null);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    const QrScannerModal = ({ onScan }: { onScan?: (value: string) => void }) => {
        const scannerId = 'qr-scanner-html5';
        // Only initialize scanner when modal is open
        if (isOpen) {
            setTimeout(() => {
                if (document.getElementById(scannerId) && !document.getElementById(scannerId)?.hasChildNodes()) {
                    const scanner = new Html5QrcodeScanner(scannerId, { fps: 10, qrbox: 250 }, false);
                    scanner.render(
                        (decodedText: string) => {
                            setScannedValue(decodedText);
                            close();
                            if (onScan) onScan(decodedText);
                            scanner.clear();
                        },
                        () => { }
                    );
                }
            }, 100);
        }
        return isOpen ? (
            <Modal show={isOpen} onHide={close} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Scan QR Code</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div id={scannerId} style={{ width: '100%', minHeight: 250 }} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close}>Close</Button>
                </Modal.Footer>
            </Modal>
        ) : null;
    };

    return { open, close, QrScannerModal, scannedValue };
}
