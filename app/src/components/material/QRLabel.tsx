import React from 'react';
import { IonButton } from '@ionic/react';

interface QRLabelProps {
    labelImageUrl: string;
    onDownload: () => void;
    isNew: boolean;
}

const QRLabel: React.FC<QRLabelProps> = ({ labelImageUrl, onDownload, isNew }) => {
    if (isNew) return null;

    return (
        <div className="">
            <h3 className="text-lg font-semibold mb-2">Etichetă QR</h3>
            <div id="qrcode" className="mx-auto">
                {labelImageUrl && (
                    <img src={labelImageUrl} alt="Printable label" className="" />
                )}
            </div>
            <IonButton
                color="tertiary"
                onClick={onDownload}
                size="small"
                data-cy="download-qr-btn"
            >
                <span className="text-lg mr-1" role="img" aria-label="print">⎙</span>
                Descarcă Etichetă
            </IonButton>
        </div>
    );
};

export default QRLabel;
