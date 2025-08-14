import React from 'react';
import {
    BaseEdge,
    EdgeProps,
    getBezierPath,
    EdgeLabelRenderer
} from 'reactflow';

interface CustomEdgeData {
    label?: string;
    isMainFlow?: boolean;
}

const CustomEdge: React.FC<EdgeProps<CustomEdgeData>> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
    selected
}) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const isMainFlow = data?.isMainFlow || false;

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    stroke: selected
                        ? '#339af0'
                        : isMainFlow
                            ? '#667eea'
                            : '#64748b',
                    strokeWidth: selected ? 4 : isMainFlow ? 3 : 2,
                    strokeDasharray: isMainFlow ? 'none' : '5,5',
                    opacity: selected ? 1 : 0.8,
                    filter: selected ? 'drop-shadow(0 2px 4px rgba(51, 154, 240, 0.3))' : 'none'
                }}
            />
            {data?.label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            background: selected ? '#339af0' : isMainFlow ? '#667eea' : '#64748b',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            pointerEvents: 'all',
                            border: '2px solid white',
                            fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}
                        className="nodrag nopan"
                    >
                        {data.label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default CustomEdge;
