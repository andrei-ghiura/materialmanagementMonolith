import React from 'react';
import { IonFooter, IonToolbar, IonButtons, IonButton } from '@ionic/react';

interface PageFooterProps {
    leftButtons?: Array<{
        label: string;
        color?: string;
        icon?: string;
        onClick: () => void;
        dataCy?: string;
    }>;
    rightButtons?: Array<{
        label: string;
        color?: string;
        icon?: string;
        onClick: () => void;
        dataCy?: string;
    }>;
}

const PageFooter: React.FC<PageFooterProps> = ({ leftButtons = [], rightButtons = [] }) => {
    if (leftButtons.length === 0 && rightButtons.length === 0) {
        return null;
    }

    return (
        <IonFooter>
            <IonToolbar className="py-0 min-h-[auto]">
                <IonButtons slot="start">
                    {leftButtons.map((button, index) => (
                        <IonButton
                            key={index}
                            color={button.color}
                            onClick={button.onClick}
                            size="small"
                            data-cy={button.dataCy}
                        >
                            {button.icon && (
                                <span className="text-lg mr-1" role="img" aria-label={button.label}>
                                    {button.icon}
                                </span>
                            )}
                            {button.label}
                        </IonButton>
                    ))}
                </IonButtons>
                <IonButtons slot="end">
                    {rightButtons.map((button, index) => (
                        <IonButton
                            key={index}
                            color={button.color}
                            onClick={button.onClick}
                            size="small"
                            data-cy={button.dataCy}
                        >
                            {button.icon && (
                                <span className="text-lg mr-1" role="img" aria-label={button.label}>
                                    {button.icon}
                                </span>
                            )}
                            {button.label}
                        </IonButton>
                    ))}
                </IonButtons>
            </IonToolbar>
        </IonFooter>
    );
};

export default PageFooter;
