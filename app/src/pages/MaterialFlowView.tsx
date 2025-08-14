interface MaterialWithAncestors extends Material {
    ancestors?: Array<{ processing: Processing; material: MaterialWithAncestors }>;
}

interface Layer {
    type: 'material' | 'processing';
    nodes: (Material | Processing)[];
}
import { Container, Alert } from 'react-bootstrap';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Node,
    useNodesState,
    useEdgesState,
    MarkerType,
    BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getAll, getMaterialFlow } from '../api/materials';

import { Material } from '../types';
import { MaterialMappings } from '../config/materialMappings';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import MaterialNode from '../components/flow/MaterialNode';
import ProcessingNode from '../components/flow/ProcessingNode';
import CustomEdge from '../components/flow/CustomEdge';

interface Processing {
    _id: string;
    type: string;
    description?: string;
    date?: string;
    [key: string]: unknown;
}

const MATERIAL_FLOW_ORDER = [
    "BSTN",                 // Bustean
    "fasonare",             // Processing: Fasonare
    "BSTF",                 // Bustean fasonat
    "gaterare",             // Processing: Gaterare
    "CHN",                  // Cherestea netivită
    "multilama_semitivire", // Processing: Multilama Semitivire
    "CHS",                  // Cherestea semitivită
    "multilama_tivire",     // Processing: Multilama Tivire
    "CHT",                  // Cherestea tivită
    "multilama_rindeluit",  // Processing: Multilama Rindeluit
    "FRZ",                  // Frize
    "mrp_rindeluire_frize", // Processing: MRP Rindeluire Frize
    "FRZR",                 // Frize rindeluite
    "mrp_leaturi",          // Processing: MRP Leaturi
    "LEA",                  // Leaturi
    "presa",                // Processing: Presa
    "PAN"                   // Panouri
];

const MaterialFlowView: React.FC = () => {
    const [alert, setAlert] = useState<string | null>(null);
    const { id: urlMaterialId } = useParams<{ id?: string }>();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    // Removed unused allMaterials state
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
    // Removed unused loading state
    const [showQrModal, setShowQrModal] = useState(false);
    const webQrRef = useRef<HTMLDivElement>(null);
    const html5QrInstance = useRef<Html5Qrcode | null>(null);

    // Define custom node types
    const nodeTypes = useMemo(() => ({
        materialNode: MaterialNode,
        processingNode: ProcessingNode,
    }), []);

    // Define custom edge types
    const edgeTypes = useMemo(() => ({
        customEdge: CustomEdge,
    }), []);

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
                        () => {
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
        getAll().catch(() => setAlert('Nu s-au putut încărca materialele.'));
    }, []);

    // If urlMaterialId is present, set it as selectedMaterialId on mount
    useEffect(() => {
        if (urlMaterialId) {
            setSelectedMaterialId(urlMaterialId);
        }
    }, [urlMaterialId]);

    useEffect(() => {
        if (selectedMaterialId) {
            getMaterialFlow(selectedMaterialId)
                .then(flow => {
                    const allNodes: Node[] = [];
                    const allEdges: Edge[] = [];
                    const nodeMap: { [id: string]: Node } = {};
                    const edgeList: Edge[] = [];
                    // Helper to add a node
                    function addNode(id: string, type: string, data: any) {
                        if (!nodeMap[id]) {
                            nodeMap[id] = {
                                id,
                                type: type === 'material' ? 'materialNode' : 'processingNode',
                                position: { x: 0, y: 0 },
                                data: { ...data, nodeType: data.type },
                            };
                        }
                    }
                    // Helper to add an edge
                    function addEdge(source: string, target: string) {
                        edgeList.push({
                            id: `${source}->${target}`,
                            source,
                            target,
                            type: 'customEdge',
                            sourceHandle: 'bottom',
                            targetHandle: 'top',
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: '#4facfe',
                            },
                            data: {}
                        });
                    }
                    // Recursive traversal for ancestors
                    function traverseAncestors(node: any) {
                        if (!node) return;
                        addNode(node._id, 'material', {
                            label: MaterialMappings.getMaterialTypeLabel(node.type),
                            ...node
                        });
                        if (node.ancestors && Array.isArray(node.ancestors)) {
                            node.ancestors.forEach((ancestor) => {
                                const proc = ancestor.processing;
                                const mat = ancestor.material;
                                addNode(proc._id, 'processing', {
                                    label: `Processing: ${proc.processingTypeId}`,
                                    type: proc.processingTypeId,
                                    description: proc.description,
                                    date: proc.date
                                });
                                addEdge(proc._id, node._id);
                                addNode(mat._id, 'material', {
                                    label: MaterialMappings.getMaterialTypeLabel(mat.type),
                                    ...mat
                                });
                                addEdge(mat._id, proc._id);
                                traverseAncestors(mat);
                            });
                        }
                    }
                    // Recursive traversal for descendants
                    function traverseDescendants(node: any) {
                        if (!node) return;
                        addNode(node._id, 'material', {
                            label: MaterialMappings.getMaterialTypeLabel(node.type),
                            ...node
                        });
                        if (node.descendants && Array.isArray(node.descendants)) {
                            node.descendants.forEach(({ processing, material }) => {
                                addNode(processing._id, 'processing', {
                                    label: `Processing: ${processing.processingTypeId}`,
                                    type: processing.processingTypeId,
                                    description: processing.description,
                                    date: processing.date
                                });
                                addEdge(node._id, processing._id);
                                addEdge(processing._id, material._id);
                                traverseDescendants(material);
                            });
                        }
                    }
                    // Traverse ancestors and descendants from correct roots
                    if (flow.ancestors) {
                        traverseAncestors(flow.ancestors);
                    } else if (flow.material) {
                        traverseAncestors(flow.material);
                    }
                    if (flow.material) {
                        traverseDescendants(flow.material);
                    }
                    // Also add direct descendants processings (if any)
                    if (flow.descendants && flow.descendants.processings) {
                        flow.descendants.processings.forEach((proc: Processing) => {
                            addNode(proc._id, 'processing', {
                                label: `Processing: ${proc.processingTypeId}`,
                                type: proc.processingTypeId,
                                description: proc.description,
                                date: proc.date,
                            });
                            addEdge(flow.material._id, proc._id);
                        });
                    }
                    // Order nodes by MATERIAL_FLOW_ORDER
                    const orderedNodes = Object.values(nodeMap)
                        .sort((a, b) => {
                            const aType = a.data.type;
                            const bType = b.data.type;
                            return MATERIAL_FLOW_ORDER.indexOf(aType) - MATERIAL_FLOW_ORDER.indexOf(bType);
                        });
                    // Assign positions: vertical by order, horizontal by sibling index
                    const groupedNodes = orderedNodes.reduce((acc, node) => {
                        acc[node.data.type] = acc[node.data.type] || [];
                        acc[node.data.type].push(node);
                        return acc;
                    }, {} as Record<string, Node[]>);
                    MATERIAL_FLOW_ORDER.forEach((type, idxGroup) => {
                        const nodesOfType = groupedNodes[type] || [];
                        const nrNodesOfType = nodesOfType.length;
                        nodesOfType.forEach((node, idx) => {
                            node.position = { x: 100 + (-nrNodesOfType / 2 * 300) + idx * 300, y: 100 + idxGroup * 220 };
                            node.width = 220;
                            node.height = 120;
                            allNodes.push(node);

                        });
                    });

                    allEdges.push(...edgeList);
                    setNodes(allNodes);
                    setEdges(allEdges);
                })
                .catch(() => setAlert('Nu s-a putut încărca fluxul materialului.'));
        }
    }, [selectedMaterialId]);
    return (
        <Container fluid className="p-3">
            {alert && <Alert variant="danger" onClose={() => setAlert(null)} dismissible>{alert}</Alert>}
            <div style={{ height: '80vh', border: '1px solid #ddd' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    attributionPosition="bottom-right"
                >
                    <Controls />
                    <Background variant={BackgroundVariant.Dots} gap={12} />
                </ReactFlow>
            </div>
        </Container>
    );
};

export default MaterialFlowView;
