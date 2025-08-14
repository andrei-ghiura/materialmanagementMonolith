import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import useI18n from '../hooks/useI18n';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const I18nTestPage: React.FC = () => {
    const { t } = useI18n();

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h2>Internationalization Test</h2>
                            <LanguageSwitcher />
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <h4>Common Terms</h4>
                                    <ul>
                                        <li><strong>{t('common.add')}:</strong> {t('common.add')}</li>
                                        <li><strong>{t('common.save')}:</strong> {t('common.save')}</li>
                                        <li><strong>{t('common.delete')}:</strong> {t('common.delete')}</li>
                                        <li><strong>{t('common.confirm')}:</strong> {t('common.confirm')}</li>
                                        <li><strong>{t('common.cancel')}:</strong> {t('common.cancel')}</li>
                                    </ul>
                                </Col>
                                <Col md={6}>
                                    <h4>Navigation</h4>
                                    <ul>
                                        <li><strong>{t('navigation.materials')}:</strong> {t('navigation.materials')}</li>
                                        <li><strong>{t('navigation.processings')}:</strong> {t('navigation.processings')}</li>
                                        <li><strong>{t('navigation.settings')}:</strong> {t('navigation.settings')}</li>
                                    </ul>
                                </Col>
                            </Row>

                            <Row className="mt-4">
                                <Col>
                                    <h4>Material Fields</h4>
                                    <Row>
                                        <Col md={6}>
                                            <ul>
                                                <li><strong>{t('material.materialType')}:</strong> {t('material.materialType')}</li>
                                                <li><strong>{t('material.species')}:</strong> {t('material.species')}</li>
                                                <li><strong>{t('material.uniqueCode')}:</strong> {t('material.uniqueCode')}</li>
                                                <li><strong>{t('material.date')}:</strong> {t('material.date')}</li>
                                                <li><strong>{t('material.length')}:</strong> {t('material.length')}</li>
                                            </ul>
                                        </Col>
                                        <Col md={6}>
                                            <ul>
                                                <li><strong>{t('material.diameter')}:</strong> {t('material.diameter')}</li>
                                                <li><strong>{t('material.totalVolume')}:</strong> {t('material.totalVolume')}</li>
                                                <li><strong>{t('material.pieces')}:</strong> {t('material.pieces')}</li>
                                                <li><strong>{t('material.observations')}:</strong> {t('material.observations')}</li>
                                            </ul>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <Row className="mt-4">
                                <Col>
                                    <h4>Validation Messages</h4>
                                    <ul>
                                        <li><strong>Required:</strong> {t('validation.required')}</li>
                                        <li><strong>Invalid Email:</strong> {t('validation.invalidEmail')}</li>
                                        <li><strong>Min Length:</strong> {t('validation.minLength', { min: 5 })}</li>
                                        <li><strong>Max Length:</strong> {t('validation.maxLength', { max: 50 })}</li>
                                    </ul>
                                </Col>
                            </Row>

                            <Row className="mt-4">
                                <Col>
                                    <h4>Sample Actions</h4>
                                    <Button variant="primary" className="me-2">
                                        {t('material.addMaterial')}
                                    </Button>
                                    <Button variant="success" className="me-2">
                                        {t('common.save')}
                                    </Button>
                                    <Button variant="danger" className="me-2">
                                        {t('common.delete')}
                                    </Button>
                                    <Button variant="secondary">
                                        {t('common.cancel')}
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default I18nTestPage;
