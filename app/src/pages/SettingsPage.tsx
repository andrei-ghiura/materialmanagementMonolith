
import React from 'react';
import { useUiState } from '../components/ui/UiStateContext';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';


const SettingsPage: React.FC = () => {

    const { theme, setTheme } = useUiState();

    return (
        <Container className="mt-4">

            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Preferințe</Card.Title>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span>Temă aplicație</span>
                                        <div>
                                            <Button
                                                className={`btn-emphasized me-2${theme === 'light' ? '' : ' btn-transparent'}`}
                                                size="sm"
                                                onClick={() => setTheme('light')}
                                            >
                                                Luminoasă
                                            </Button>
                                            <Button
                                                className={`btn-emphasized${theme === 'dark' ? '' : ' btn-transparent'}`}
                                                size="sm"
                                                onClick={() => setTheme('dark')}
                                            >
                                                Întunecată
                                            </Button>
                                        </div>
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
