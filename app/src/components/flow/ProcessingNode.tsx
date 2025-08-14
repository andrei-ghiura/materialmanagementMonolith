import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface ProcessingNodeData {
    label: string;
    type?: string;
    description?: string;
    date?: string;
    parameters?: Record<string, unknown>;
}

const ProcessingNode: React.FC<NodeProps<ProcessingNodeData>> = ({ data, selected }) => {
    return (
        <div
            className={`processing-node ${selected ? 'selected' : ''}`}
            style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: selected ? '3px solid #339af0' : '2px solid #e9ecef',
                borderRadius: '12px',
                padding: '16px',
                minWidth: '240px',
                maxWidth: '280px',
                boxShadow: selected
                    ? '0 6px 20px rgba(51, 154, 240, 0.4)'
                    : '0 3px 10px rgba(79, 172, 254, 0.3)',
                color: 'white',
                fontSize: '13px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Processing icon */}
            <div
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: '24px',
                    height: '24px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}
            >
                ⚙️
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '3px 6px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    display: 'inline-block'
                }}>
                    PROCESARE
                </div>

                {/* Processing type */}
                <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    marginBottom: '6px',
                    lineHeight: '1.2'
                }}>
                    {data.type || 'Processing'}
                </div>

                {/* Description if available */}
                {data.description && (
                    <div style={{
                        fontSize: '11px',
                        opacity: 0.9,
                        marginBottom: '6px',
                        lineHeight: '1.3'
                    }}>
                        {data.description}
                    </div>
                )}

                {/* Date */}
                {data.date && (
                    <div style={{
                        fontSize: '10px',
                        opacity: 0.8,
                        marginTop: '4px'
                    }}>
                        📅 {data.date}
                    </div>
                )}
            </div>

            {/* Connection handles */}
            <Handle
                type="target"
                position={Position.Top}
                id="top"
                style={{
                    background: '#fff',
                    border: '2px solid #00f2fe',
                    width: '10px',
                    height: '10px',
                    top: '-5px'
                }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                style={{
                    background: '#fff',
                    border: '2px solid #00f2fe',
                    width: '10px',
                    height: '10px',
                    bottom: '-5px'
                }}
            />
        </div>
    );
};

export default ProcessingNode;
