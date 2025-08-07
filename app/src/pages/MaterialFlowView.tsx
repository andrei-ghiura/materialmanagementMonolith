import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, useIonAlert } from '@ionic/react';
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
import { useMemo } from 'react';
import { getAll } from '../api/materials';

import { Material } from '../types';
import { getProcessingHistory, Processing } from '../api/processings';
import { MaterialMappings } from '../config/materialMappings';
import { useIonViewWillEnter, useIonRouter } from '@ionic/react';

const MaterialFlowView: React.FC = () => {
    const [presentAlert] = useIonAlert();
    const router = useIonRouter();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
            router.push(`/material/${node.data._id}`);
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

    const loadData = async () => {
        try {
            const [materials, processings] = await Promise.all([
                getAll(),
                getProcessingHistory()
            ]);
            processData(materials, processings);
        } catch (error) {
            console.error('Failed to load data:', error);
            presentAlert({
                header: 'Eroare',
                message: 'Nu s-au putut încărca datele.',
                buttons: ['OK'],
            });
        }
    };

    useIonViewWillEnter(() => {
        loadData();
    });

    // ReactFlow configuration
    const flowStyle = useMemo(() => ({
        width: '100%',
        height: 'calc(100vh - 56px)',
        minWidth: '1800px' // Increased to accommodate wider spacing
    }), []);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Fluxul Materialelor</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
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
            </IonContent>
        </IonPage>
    );
};

export default MaterialFlowView;
