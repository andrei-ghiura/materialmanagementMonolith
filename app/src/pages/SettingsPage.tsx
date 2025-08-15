
import React from 'react';
import { useUiState } from '../components/ui/useUiState';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import useI18n from '../hooks/useI18n';


const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useUiState();
    const { t } = useI18n();

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>{t('settings.preferences')}</Card.Title>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span>{t('settings.appTheme')}</span>
                                        <div>
                                            <Button
                                                className={`btn-emphasized me-2${theme === 'light' ? '' : ' btn-transparent'}`}
                                                size="sm"
                                                onClick={() => setTheme('light')}
                                            >
                                                {t('settings.lightTheme')}
                                            </Button>
                                            <Button
                                                className={`btn-emphasized${theme === 'dark' ? '' : ' btn-transparent'}`}
                                                size="sm"
                                                onClick={() => setTheme('dark')}
                                            >
                                                {t('settings.darkTheme')}
                                            </Button>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <div>{t('settings.language')}</div>
                                            <small className="text-muted">{t('settings.languageDescription')}</small>
                                        </div>
                                        <LanguageSwitcher />
                                    </div>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SettingsPage;
