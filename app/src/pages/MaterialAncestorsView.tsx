import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAncestors } from '../api/materials';
import MaterialTable from '../components/MaterialTable';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

const MaterialAncestorsView = () => {
    const handleDownloadPDF = () => {
        const pdf = new jsPDF({ orientation: 'landscape', format: 'a4' });
        // Define columns to export (same as MaterialTable)
        const columns = [
            { header: 'Tip', dataKey: 'tip' },
            { header: 'Human ID', dataKey: 'humanId' },
            { header: 'Specie', dataKey: 'specie' },
            { header: 'Cod Unic Aviz', dataKey: 'cod_unic_aviz' },
            { header: 'Data', dataKey: 'data' },
            { header: 'APV', dataKey: 'apv' },
            { header: 'Lat', dataKey: 'lat' },
            { header: 'Log', dataKey: 'log' },
            { header: 'Nr Placuta Rosie', dataKey: 'nr_placuta_rosie' }
        ];

        // Map ancestors to rows
        const rows = ancestors.map((m: any) => ({
            tip: m.tip || m.type || '-',
            id: m.id || m._id || '-',
            humanId: m.humanId || '-',
            specie: m.specie || '-',
            stare: m.state || '-',
            cod_unic_aviz: m.cod_unic_aviz || '-',
            data: m.data || '-',
            apv: m.apv || '-',
            lat: m.lat || '-',
            log: m.log || '-',
            nr_placuta_rosie: m.nr_placuta_rosie || '-',
            lungime: m.lungime || '-',
            diametru: m.diametru || '-',
            volum_placuta_rosie: m.volum_placuta_rosie || '-',
            volum_total: m.volum_total || '-',
            volum_net_paletizat: m.volum_net_paletizat || '-',
            volum_brut_paletizat: m.volum_brut_paletizat || '-',
            nr_bucati: m.nr_bucati || '-',
            observatii: m.observatii || '-',
            componente: Array.isArray(m.componente) ? m.componente.length : '-',
        }));

        autoTable(pdf, {
            head: [columns.map(col => col.header)],
            body: rows.map(row => columns.map(col => row[col.dataKey])),
            startY: 20,
            styles: { fontSize: 8 },
            margin: { left: 10, right: 10 },
        });
        pdf.save('ancestors-table.pdf');
    };
    const { id } = useParams<{ id: string }>();
    const [ancestors, setAncestors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAncestors() {
            setLoading(true);
            try {
                const result = await getAncestors(id);
                setAncestors(result);
            } catch (e) {
                setAncestors([]);
            }
            setLoading(false);
        }
        fetchAncestors();
    }, [id]);

    return (
        <Container>
            <h2>Ancestors of Material</h2>
            {loading ? (
                <div>Loading...</div>
            ) : ancestors.length === 0 ? (
                <div>No ancestors found.</div>
            ) : (
                <>
                    <Button className="mb-3" onClick={handleDownloadPDF} variant="primary">Download PDF</Button>
                    <div id="ancestors-table">
                        <MaterialTable materials={ancestors} onRowClick={() => { }} />
                    </div>
                </>
            )}
            <Button href={`/material/${id}`}>Back to Material</Button>
        </Container>
    );
};

export default MaterialAncestorsView;
