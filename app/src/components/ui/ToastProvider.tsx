import React, { useState, ReactNode } from 'react';
import { ToastContext } from './ToastContext';
import { Toast, ToastContainer } from 'react-bootstrap';



export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState('danger');

    const showToast = (msg: string, v: string = 'danger') => {
        setMessage(msg);
        setVariant(v);
        setShow(true);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer position="top-end" className="p-3">
                <Toast bg={variant} onClose={() => setShow(false)} show={show} delay={4000} autohide>
                    <Toast.Body>{message}</Toast.Body>
                </Toast>
            </ToastContainer>
        </ToastContext.Provider>
    );
};

