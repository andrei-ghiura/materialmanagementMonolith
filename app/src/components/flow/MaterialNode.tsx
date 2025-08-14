import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MaterialMappings } from '../../config/materialMappings';

interface MaterialNodeData {
    label: string;
    humanId?: string;
    type?: string;
    specie?: string;
    stare?: string;
    data?: string;
    apv?: string;
    lungime?: number;
    diametru?: number;
    volum?: number;
    isMain?: boolean;
}

const MaterialNode: React.FC<NodeProps<MaterialNodeData>> = ({ data, selected }) => {
    const isMain = data.isMain;

    return (
        <div
            className={`material-node ${selected ? 'selected' : ''} ${isMain ? 'main-node' : ''}`}
            style={{
                background: isMain ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: selected ? '3px solid #339af0' : '2px solid #e9ecef',
                borderRadius: '16px',
                padding: '16px',
                minWidth: '240px',
                maxWidth: '280px',
                boxShadow: selected
                    ? '0 8px 24px rgba(51, 154, 240, 0.3)'
                    : isMain
                        ? '0 8px 24px rgba(102, 126, 234, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.15)',
                color: 'white',
                fontSize: '14px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background pattern for visual interest */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    transform: 'translate(20px, -20px)',
                    zIndex: 0
                }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}


                {/* Main title */}
                <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    lineHeight: '1.3'
                }}>
                    {data.label || 'Material'}
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        opacity: 0.9
                    }}>
                        #{data.humanId}
                    </div>
                </div>

                {/* Properties grid */}
                <div style={{
                    display: 'grid',
                    gap: '6px',
                    marginBottom: '12px'
                }}>
                    {data.specie && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ opacity: 0.8, fontSize: '12px' }}>Specie:</span>
                            <span style={{ fontSize: '12px', fontWeight: '500' }}>
                                {MaterialMappings.getWoodSpeciesLabel(data.specie)}
                            </span>
                        </div>
                    )}

                    {data.stare && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ opacity: 0.8, fontSize: '12px' }}>Stare:</span>
                            <span style={{ fontSize: '12px', fontWeight: '500' }}>{data.stare}</span>
                        </div>
                    )}

                    {data.data && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ opacity: 0.8, fontSize: '12px' }}>Data:</span>
                            <span style={{ fontSize: '12px', fontWeight: '500' }}>{data.data}</span>
                        </div>
                    )}

                    {(data.lungime || data.diametru || data.volum) && (
                        <div style={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                            paddingTop: '6px',
                            marginTop: '6px'
                        }}>
                            {data.lungime && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                    <span style={{ opacity: 0.8, fontSize: '11px' }}>L:</span>
                                    <span style={{ fontSize: '11px', fontWeight: '500' }}>{data.lungime}m</span>
                                </div>
                            )}
                            {data.diametru && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                    <span style={{ opacity: 0.8, fontSize: '11px' }}>Ø:</span>
                                    <span style={{ fontSize: '11px', fontWeight: '500' }}>{data.diametru}cm</span>
                                </div>
                            )}
                            {data.volum && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ opacity: 0.8, fontSize: '11px' }}>Vol:</span>
                                    <span style={{ fontSize: '11px', fontWeight: '500' }}>{data.volum}m³</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* APV badge if present */}
                {data.apv && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textAlign: 'center',
                        marginTop: '8px'
                    }}>
                        APV: {data.apv}
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
                    border: '2px solid #339af0',
                    width: '12px',
                    height: '12px',
                    top: '-6px'
                }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                style={{
                    background: '#fff',
                    border: '2px solid #339af0',
                    width: '12px',
                    height: '12px',
                    bottom: '-6px'
                }}
            />
        </div>
    );
};

export default MaterialNode;
