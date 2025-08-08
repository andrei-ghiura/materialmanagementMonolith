import { Container, Navbar, Nav, Alert } from 'react-bootstrap';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    MarkerType,
    Node,
    useNodesState,
    useEdgesState,
    NodeMouseHandler,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';
// ...existing code...
import { getAll, getMaterialFlow } from '../api/materials';

import { Material } from '../types';
import { getProcessingHistory, Processing } from '../api/processings';
import { MaterialMappings } from '../config/materialMappings';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';


const MaterialFlowView: React.FC = () => {
    const [alert, setAlert] = useState<string | null>(null);
    const navigate = useNavigate();
    const { id: urlMaterialId } = useParams<{ id?: string }>();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [allMaterials, setAllMaterials] = useState<Material[]>([]);
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const webQrRef = useRef<HTMLDivElement>(null);
    const html5QrInstance = useRef<any>(null);

    // Define processing order based on material flow
    const PROCESSING_ORDER = [
        'BSTN',  // Buștean (raw material)
        'BSTF',  // Buștean Fasonat
        'CHN',   // Cherestea Netivită
        'CHS',   // Cherestea Semitivită
        'CHT',   // Cherestea Tivită
        'FRZ',   // Frize
        'FRZR',  // Frize Rindeluite
        'LEA',   // Leaturi
        'PAN'    // Panouri (final product)
    ];

    // Processing type labels mapping
    const PROCESSING_TYPE_LABELS = new Map<string, string>([
        ['fasonare', 'Fasonare'],
        ['gaterare', 'Gaterare'],
        ['multilama_semitivire', 'Multilama Semitivire'],
        ['multilama_tivire', 'Multilama Tivire'],
        ['multilama_rindeluit', 'Multilama Rindeluit'],
        ['mrp_rindeluire_frize', 'MRP Rindeluire Frize'],
        ['mrp_leaturi', 'MRP Leaturi'],
        ['presa', 'Presa']
    ]);

    // Get processing type label
    const getProcessingTypeLabel = (processingTypeId: string): string => {
        return PROCESSING_TYPE_LABELS.get(processingTypeId) || processingTypeId;
    };

    // Get processing step index for ordering
    const getProcessingStep = (materialType: string): number => {
        const index = PROCESSING_ORDER.indexOf(materialType);
        return index === -1 ? 999 : index; // Unknown types go to end
    };

    // Function to get material label
    const getMaterialLabel = (material: Material) => {
        const type = MaterialMappings.getMaterialTypeLabel(material.type);
        const species = MaterialMappings.getWoodSpeciesLabel(material.specie);
        return `${type} - ${species}`;
    };

    // Function to format processing date and time
    const formatProcessingDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString('ro-RO');
        const timeStr = date.toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return `${dateStr}\n${timeStr}`;
    };

    // Handle node click to navigate to MaterialView
    const onNodeClick: NodeMouseHandler = (event, node) => {
        // Only navigate for material nodes (not processing nodes)
        if (node.data && node.data._id && !node.data.isProcessing) {
            navigate(`/material/${node.data._id}`);
        }
    };

    // Layout calculation - group by type and order by processing steps
    const calculateNodePosition = (materialType: string, indexInType: number, totalInType: number) => {
        const step = getProcessingStep(materialType);
        const xPosition = step * 450; // Increased horizontal spacing for better spread

        // Vertical positioning within each type group - increased spacing
        const spacing = 200;
        const yOffset = (indexInType - (totalInType - 1) / 2) * spacing;

        return {
            x: xPosition,
            y: 500 + yOffset // Centered around y=500
        };
    };

    // Calculate position for processing nodes (between material types)
    const calculateProcessingNodePosition = (sourceType: string, targetType: string, index: number, total: number) => {
        const sourceStep = getProcessingStep(sourceType);
        const targetStep = getProcessingStep(targetType);
        const xPosition = (sourceStep + targetStep) * 450 / 2; // Position between source and target

        const spacing = 150;
        const yOffset = (index - (total - 1) / 2) * spacing;

        return {
            x: xPosition,
            y: 250 + yOffset // Position above material nodes with more space
        };
    };

    // Process data into nodes and edges - grouped by material type
    const processData = (materials: Material[], processings: Processing[]) => {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // Group materials by type
        const materialsByType = new Map<string, Material[]>();

        materials.forEach(material => {
            const type = material.type;
            if (!materialsByType.has(type)) {
                materialsByType.set(type, []);
            }
            materialsByType.get(type)!.push(material);
        });

        // Sort types by processing order and create material nodes
        const sortedTypes = Array.from(materialsByType.keys()).sort((a, b) =>
            getProcessingStep(a) - getProcessingStep(b)
        );

        sortedTypes.forEach(type => {
            const materialsOfType = materialsByType.get(type)!;

            materialsOfType.forEach((material, index) => {
                newNodes.push({
                    id: material._id,
                    type: 'default',
                    position: calculateNodePosition(type, index, materialsOfType.length),
                    data: {
                        label: getMaterialLabel(material),
                        ...material
                    },
                    style: {
                        background: getNodeColor(type),
                        padding: 15,
                        borderRadius: 12,
                        border: `3px solid ${getBorderColor(type)}`,
                        width: 220,
                        height: 100,
                        cursor: 'pointer',
                        fontSize: '12px',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left
                });
            });
        });

        // Create processing nodes and edges
        processings.forEach((proc, index) => {
            const processingNodeId = `process-${proc._id}`;

            // Determine source and target material types for positioning
            const sourceType = proc.sourceIds[0]?.type || 'BSTN';
            const targetType = proc.outputType;

            // Add processing node
            newNodes.push({
                id: processingNodeId,
                type: 'default',
                position: calculateProcessingNodePosition(sourceType, targetType, index, processings.length),
                data: {
                    label: `${getProcessingTypeLabel(proc.processingTypeId)}\n${formatProcessingDateTime(proc.processingDate)}`,
                    isProcessing: true
                },
                style: {
                    background: '#fff9e6',
                    padding: 8,
                    borderRadius: '50%',
                    border: '4px solid #ff9933',
                    width: 140,
                    height: 140,
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 12px rgba(255, 153, 51, 0.4)',
                    color: '#cc6600',
                    lineHeight: '1.2'
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left
            });

            // Add edges from source materials to processing node
            proc.sourceIds.forEach(source => {
                newEdges.push({
                    id: `${source._id}-${processingNodeId}`,
                    source: source._id,
                    target: processingNodeId,
                    type: 'bezier',
                    animated: true,
                    style: {
                        stroke: '#0066cc',
                        strokeWidth: 3
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                    }
                });
            });

            // Add edges from processing node to result materials
            proc.outputIds.forEach(result => {
                newEdges.push({
                    id: `${processingNodeId}-${result._id}`,
                    source: processingNodeId,
                    target: result._id,
                    type: 'bezier',
                    animated: true,
                    style: {
                        stroke: '#66cc00',
                        strokeWidth: 3
                    },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                    }
                });
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    };

    // Get node background color based on material type
    const getNodeColor = (materialType: string): string => {
        const step = getProcessingStep(materialType);
        const colors = [
            '#e6f3ff', // BSTN - light blue
            '#e6f7ff', // BSTF - lighter blue
            '#fff3e6', // CHN - light orange
            '#fff7e6', // CHS - lighter orange
            '#fffbe6', // CHT - very light orange
            '#f0ffe6', // FRZ - light green
            '#f5ffe6', // FRZR - lighter green
            '#e6ffe6', // LEA - very light green
            '#ffe6f7'  // PAN - light pink
        ];
        return colors[step] || '#f5f5f5';
    };

    // Get border color based on material type
    const getBorderColor = (materialType: string): string => {
        const step = getProcessingStep(materialType);
        const colors = [
            '#0066cc', // BSTN - blue
            '#0080ff', // BSTF - lighter blue
            '#ff9933', // CHN - orange
            '#ffaa44', // CHS - lighter orange
            '#ffbb55', // CHT - even lighter orange
            '#66cc00', // FRZ - green
            '#77dd11', // FRZR - lighter green
            '#88ee22', // LEA - even lighter green
            '#cc6699'  // PAN - pink
        ];
        return colors[step] || '#999999';
    };


    // QR code scan logic
    useEffect(() => {
        if (showQrModal && webQrRef.current) {
            if (!html5QrInstance.current) {
                html5QrInstance.current = new Html5Qrcode(webQrRef.current.id);
            }
            if (html5QrInstance.current) {
                html5QrInstance.current
                    .start(
                        { facingMode: 'environment' },
                        { fps: 10, qrbox: 250 },
                        (decodedText: string) => {
                            let scannedData: { id: string } = { id: '' };
                            try {
                                scannedData = JSON.parse(decodedText);
                            } catch {
                                scannedData = { id: decodedText.trim() };
                            }
                            if (scannedData.id) {
                                setSelectedMaterialId(scannedData.id);
                                setShowQrModal(false);
                                if (html5QrInstance.current) html5QrInstance.current.stop();
                            }
                        },
                        (errorMessage: string) => {
                            // ignore
                        }
                    )
                    .catch(() => { });
            }
        }
        return () => {
            if (html5QrInstance.current) {
                html5QrInstance.current.stop().catch(() => { });
            }
        };
    }, [showQrModal]);

    useEffect(() => {
        // Load all materials for selector
        getAll().then(setAllMaterials).catch(() => setAlert('Nu s-au putut încărca materialele.'));
    }, []);

    // If urlMaterialId is present, set it as selectedMaterialId on mount
    useEffect(() => {
        if (urlMaterialId) {
            setSelectedMaterialId(urlMaterialId);
        }
    }, [urlMaterialId]);

    useEffect(() => {
        if (selectedMaterialId) {
            setLoading(true);
            getMaterialFlow(selectedMaterialId)
                .then(flow => {
                    // Compose nodes/edges from flow (ancestors, descendants, processings)
                    // For now, just show the material and its direct ancestors/descendants
                    const nodes: Node[] = [];
                    const edges: Edge[] = [];
                    const { material, ancestors, descendants, processingsAsSource, processingsAsOutput } = flow;
                    // Main node
                    nodes.push({
                        id: material._id,
                        type: 'default',
                        position: { x: 0, y: 0 },
                        data: { label: getMaterialLabel(material), ...material },
                    });
                    // Ancestors
                    ancestors.forEach((a: Material, i: number) => {
                        nodes.push({
                            id: a._id,
                            type: 'default',
                            position: { x: -250, y: -100 + i * 120 },
                            data: { label: getMaterialLabel(a), ...a },
                        });
                        edges.push({
                            id: `${a._id}->${material._id}`,
                            source: a._id,
                            target: material._id,
                            type: 'bezier',
                        });
                    });
                    // Descendants
                    descendants.forEach((d: Material, i: number) => {
                        nodes.push({
                            id: d._id,
                            type: 'default',
                            position: { x: 250, y: -100 + i * 120 },
                            data: { label: getMaterialLabel(d), ...d },
                        });
                        edges.push({
                            id: `${material._id}->${d._id}`,
                            source: material._id,
                            target: d._id,
                            type: 'bezier',
                        });
                    });
                    setNodes(nodes);
                    setEdges(edges);
                })
                .catch(() => setAlert('Nu s-a putut încărca fluxul materialului.'))
                .finally(() => setLoading(false));
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [selectedMaterialId]);

    // ReactFlow configuration
    const flowStyle = useMemo(() => ({
        width: '100%',
        height: 'calc(100vh - 56px)',
        minWidth: '1800px' // Increased to accommodate wider spacing
    }), []);

    return (
        <Container fluid style={{ padding: 0 }}>
            {alert && (
                <Alert variant="danger" onClose={() => setAlert(null)} dismissible>
                    {alert}
                </Alert>
            )}
            <div className="d-flex align-items-center mb-3 px-3">
                <label className="me-2">Selectează materialul:</label>
                <select
                    className="form-select me-2"
                    style={{ width: 300 }}
                    value={selectedMaterialId}
                    onChange={e => setSelectedMaterialId(e.target.value)}
                >
                    <option value="">-- Selectează --</option>
                    {allMaterials.map(m => (
                        <option key={m._id} value={m._id}>{m.humanId} ({MaterialMappings.getMaterialTypeLabel(m.type)})</option>
                    ))}
                </select>
                <button className="btn btn-info me-2" onClick={() => setShowQrModal(true)} type="button">Scan QR</button>
            </div>
            {loading && <div className="text-center">Se încarcă fluxul...</div>}
            <div style={flowStyle}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
            {/* QR Modal */}
            {showQrModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Scanează QR Material</h5>
                                <button type="button" className="btn-close" onClick={() => setShowQrModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div id="web-qr-reader" ref={webQrRef} style={{ width: 300, height: 300, background: '#000', margin: '0 auto' }}></div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowQrModal(false)}>Închide</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    );

};

export default MaterialFlowView;
