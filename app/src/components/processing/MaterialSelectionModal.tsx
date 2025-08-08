import React from 'react';
import { Modal, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { Material } from '../../types';
import MaterialItem from '../MaterialItem';

interface MaterialSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    materials: Material[];
    onMaterialSelect: (material: Material) => void;
    title?: string;
}

const MaterialSelectionModal: React.FC<MaterialSelectionModalProps> = ({
    isOpen,
    onClose,
    materials,
    onMaterialSelect,
    title = 'Selectează Material'
}) => {
    const handleMaterialSelect = (material: Material) => {
        onMaterialSelect(material);
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ListGroup>
                    {materials.map((material) => (
                        <ListGroupItem
                            key={material._id || material.id}
                            action
                            onClick={() => handleMaterialSelect(material)}
                            className="d-flex flex-column"
                        >
                            <div className="w-100">
                                <MaterialItem
                                    material={material}
                                    detailButton={false}
                                    extraContent={
                                        <div className="d-flex justify-content-end">
                                            <Button size="sm" variant="primary">
                                                Adaugă
                                            </Button>
                                        </div>
                                    }
                                />
                            </div>
                        </ListGroupItem>
                    ))}
                    {materials.length === 0 && (
                        <ListGroupItem>
                            Nu există materiale disponibile
                        </ListGroupItem>
                    )}
                </ListGroup>
            </Modal.Body>
        </Modal>
    );
};

export default MaterialSelectionModal;
