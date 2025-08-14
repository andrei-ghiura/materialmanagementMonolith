import { Button, Row, Col, Card } from 'react-bootstrap';
import { Material } from '../types';
import useMaterialMappings from '../hooks/useMaterialMappings';
import { FaTrash } from 'react-icons/fa';
import useI18n from '../hooks/useI18n';

interface MaterialItemProps {
    material: Material;
    onItemClick?: () => void;
    onDelete?: () => void;
    showDeleteButton?: boolean;
    detailButton?: boolean;
    disabled?: boolean;
    extraContent?: React.ReactNode;
}

const MaterialItem: React.FC<MaterialItemProps> = ({
    material,
    onItemClick,
    onDelete,
    showDeleteButton = false,
    disabled = false,
    extraContent
}) => {
    const { t } = useI18n();
    const materialMappings = useMaterialMappings();

    return (
        <Card className="mb-2" onClick={disabled ? undefined : onItemClick} style={{ cursor: onItemClick && !disabled ? 'pointer' : 'default', opacity: disabled ? 0.6 : 1 }}>
            <Card.Body>
                <Row className="align-items-center">
                    <Col xs={12} sm={3} className="mb-2 mb-sm-0">
                        <h2 className="fw-semibold fs-5 mb-0">
                            {materialMappings.getMaterialTypeLabel(material.type)}
                        </h2>
                    </Col>
                    <Col xs={12} sm={3} className="mb-2 mb-sm-0">
                        <h2 className="fw-semibold fs-5 mb-0">
                            {materialMappings.getWoodSpeciesLabel(material.specie)}
                        </h2>
                    </Col>
                    <Col xs={6} sm={3} className="mb-2 mb-sm-0">
                        <h3 className="text-secondary mb-0">{material.humanId}</h3>
                    </Col>
                    <Col xs={6} sm={3} className="mb-2 mb-sm-0">
                        <h3 className="text-secondary mb-0">{material.data}</h3>
                    </Col>
                </Row>
                <Row className="mt-2">
                    {material.cod_unic_aviz && (
                        <Col xs={6} sm={3} className="mb-2">
                            <small className="text-secondary">{t('material.shortLabels.codAviz')}</small>
                            <p className="mb-0">{material.cod_unic_aviz}</p>
                        </Col>
                    )}
                    {material.apv && (
                        <Col xs={6} sm={3} className="mb-2">
                            <small className="text-secondary">{t('material.shortLabels.apvShort')}</small>
                            <p className="mb-0">{material.apv}</p>
                        </Col>
                    )}
                    {material.nr_placuta_rosie && (
                        <Col xs={6} sm={3} className="mb-2">
                            <small className="text-secondary">{t('material.shortLabels.redPlateShort')}</small>
                            <p className="mb-0">{material.nr_placuta_rosie}</p>
                        </Col>
                    )}
                    {material.lungime && (
                        <Col xs={6} sm={3} className="mb-2">
                            <small className="text-secondary">{t('material.shortLabels.lengthShort')}</small>
                            <p className="mb-0">{material.lungime}</p>
                        </Col>
                    )}
                    {material.diametru && (
                        <Col xs={6} sm={3} className="mb-2">
                            <small className="text-secondary">{t('material.shortLabels.diameterShort')}</small>
                            <p className="mb-0">{material.diametru}</p>
                        </Col>
                    )}
                    {material.volum_placuta_rosie && (
                        <Col xs={6} sm={3} className="mb-2">
                            <small className="text-secondary">{t('material.shortLabels.redPlateVolumeShort')}</small>
                            <p className="mb-0">{material.volum_placuta_rosie} m³</p>
                        </Col>
                    )}
                    {material.volum_total && (
                        <Col xs={6} sm={3} className="mb-2">
                            <small className="text-secondary">{t('material.shortLabels.totalVolumeShort')}</small>
                            <p className="mb-0">{material.volum_total} m³</p>
                        </Col>
                    )}
                    {material.volum_net_paletizat && (
                        <Col xs={6} sm={3} className="mb-2">
                            <small className="text-secondary">{t('material.shortLabels.netPalletizedVolumeShort')}</small>
                            <p className="mb-0">{material.volum_net_paletizat} m³</p>
                        </Col>
                    )}
                    {material.volum_brut_paletizat && (
                        <Col xs={6} sm={3} className="mb-2">
                            <small className="text-secondary">{t('material.shortLabels.grossPalletizedVolumeShort')}</small>
                            <p className="mb-0">{material.volum_brut_paletizat} m³</p>
                        </Col>
                    )}
                    {material.nr_bucati && (
                        <Col xs={6} sm={3} className="mb-2">
                            <small className="text-secondary">{t('material.shortLabels.piecesShort')}</small>
                            <p className="mb-0">{material.nr_bucati}</p>
                        </Col>
                    )}
                </Row>
                {showDeleteButton && onDelete && (
                    <Button
                        variant="outline-danger"
                        className="position-absolute end-0 top-0 m-2"
                        size="sm"
                        onClick={e => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        disabled={disabled}
                        style={{ zIndex: 2 }}
                    >
                        <FaTrash />
                    </Button>
                )}
                {extraContent}
            </Card.Body>
        </Card>
    );
};

export default MaterialItem;
