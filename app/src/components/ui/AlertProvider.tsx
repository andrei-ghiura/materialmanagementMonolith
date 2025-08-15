import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertContext, AlertOptions } from './AlertContext';


export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alert, setAlert] = useState<AlertOptions | null>(null);

    const showAlert = (options: AlertOptions) => setAlert(options);
    const handleClose = () => {
        setAlert(null);
        alert?.onClose?.();
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <Modal show={!!alert} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{alert?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{alert?.content}</Modal.Body>
                <Modal.Footer>
                    {alert?.actions?.map((action, idx) => (
                        <Button
                            key={idx}
                            variant={action.variant || 'primary'}
                            onClick={() => {
                                setAlert(null);
                                action.onClick?.();
                                alert?.onClose?.();
                            }}
                        >
                            {action.text}
                        </Button>
                    )) || (
                            <Button variant="primary" onClick={handleClose}>OK</Button>
                        )}
                </Modal.Footer>
            </Modal>
        </AlertContext.Provider>
    );
};
