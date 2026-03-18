

// export default ResultsPage;
import React, { useState, useMemo, useEffect, useContext, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import Header from '../components/Header';
import { SummaryStatsContext } from "../context/SummaryStatsContext";

// ---------- STYLES ----------
const pageStyles = `
.results-dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; background: #f4f7f6; }
.dashboard-header { text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 1rem; }
.dashboard-header h1 { color: #2c3e50; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.stat-card { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); text-align: center; }
.stat-value { font-size: 2.2rem; font-weight: 700; color: #2980b9; }

.research-summary-card {
    background: #fff;
    border-left: 8px solid #0077be;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}
.research-summary-card p { white-space: pre-wrap; line-height: 1.8; color: #34495e; font-size: 1rem; }

.details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.results-card { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }

.summary-table { width: 100%; border-collapse: collapse; }
.summary-table td { padding: 0.8rem; border-bottom: 1px solid #f0f0f0; }
.summary-table td:last-child { font-weight: 600; text-align: right; }

/* GALLERY STYLES */
.image-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.gallery-item { 
    border: 1px solid #eee; 
    border-radius: 8px; 
    overflow: hidden; 
    background: #fff; 
    cursor: pointer; 
    transition: transform 0.2s ease;
}
.gallery-item:hover { transform: translateY(-5px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); }
.gallery-item img { width: 100%; display: block; height: 200px; object-fit: cover; }
.gallery-label { padding: 0.8rem; font-size: 0.85rem; text-align: center; background: #f9f9f9; }

/* MODAL STYLES */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}
.modal-content { position: relative; max-width: 90vw; max-height: 90vh; }
.modal-content img { width: 100%; height: auto; border-radius: 8px; border: 3px solid white; }
.close-button {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 2.5rem;
    cursor: pointer;
}

/* SCIENTIFIC REPORT MODAL STYLES */
.report-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
}
.report-modal-container {
    background: #fff;
    width: 90%;
    max-width: 850px;
    max-height: 85vh;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.report-modal-header {
    padding: 20px;
    background: #0077be;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.report-modal-body {
    padding: 30px;
    overflow-y: auto;
    color: #2c3e50;
    line-height: 1.8;
}
.report-modal-body h2 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
.report-modal-body p { white-space: pre-wrap; margin-bottom: 20px; }

@media print {
    .modal-overlay, .report-modal-overlay, .actions-panel, header { display: none !important; }
    .results-dashboard { padding: 0; width: 100%; }
    .gallery-item { page-break-inside: avoid; transform: none !important; }
}
`;

const ResultsPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const componentRef = useRef(null);
    const [data, setData] = useState(location.state?.analysisData || null);
    const [loading, setLoading] = useState(!data);
    const [selectedImage, setSelectedImage] = useState(null); 
    const [showReportModal, setShowReportModal] = useState(false); // New state
    const { setSummaryStats } = useContext(SummaryStatsContext);

    const handleDownloadPDF = () => {
        if (!componentRef.current) return;
        const element = componentRef.current;
        const opt = {
            margin: 0.5,
            filename: `MarineInsight_Batch_${id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        html2pdf().set(opt).from(element).save();
    };

    const handleDownloadCSV = () => {
        if (!data?.results) return;
        const DPI = 96;
        const PIXEL_TO_MM2 = Math.pow(25.4 / DPI, 2);
        const headers = ["Batch ID", "Image Name", "Detection Type", "Area (pixels)", "Area (mm2)"];
        const rows = [];
        data.results.forEach(img => {
            (img.detection_details || []).forEach(det => {
                const areaPx = Number(det.area) || 0;
                const areaMm2 = (areaPx * PIXEL_TO_MM2).toFixed(4);
                rows.push([id, `"${img.image_name || 'Frame'}"`, `"${det.type}"`, areaPx, areaMm2].join(","));
            });
        });
        const csvString = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `MarineInsight_Batch_${id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (!data && id) {
            setLoading(true);
            axios.get(`http://127.0.0.1:8000/api/batch/${id}/`)
                .then(res => setData(res.data))
                .catch(err => console.error("API Error:", err))
                .finally(() => setLoading(false));
        }
    }, [id, data]);

    const analytics = useMemo(() => {
        if (!data?.results) return null;
        const DPI = 96; 
        const PIXEL_TO_MM2 = Math.pow(25.4 / DPI, 2); 
        const typeCounts = { fiber: 0, fragment: 0, film: 0, pellet: 0 };
        const areaByType = { fiber: 0, fragment: 0, film: 0, pellet: 0 };
        let totalParticles = 0, totalAreaPx = 0;
        data.results.forEach(img => {
            (img.detection_details || []).forEach(det => {
                const type = (det.type || "").toLowerCase();
                const areaPx = Number(det.area) || 0;
                if (typeCounts.hasOwnProperty(type)) {
                    typeCounts[type]++;
                    areaByType[type] += (areaPx * PIXEL_TO_MM2);
                    totalParticles++;
                }
                totalAreaPx += areaPx;
            });
        });
        return {
            imageCount: data.results.length,
            totalParticles,
            typeCounts,
            areaByType, 
            totalArea: (totalAreaPx * PIXEL_TO_MM2).toFixed(4), 
            mostCommon: totalParticles === 0 ? "N/A" : Object.keys(typeCounts).reduce((a, b) => typeCounts[b] > typeCounts[a] ? b : a),
            research: data.results[0]?.scientific_report || "Scientific data not found."
        };
    }, [data]);

    useEffect(() => { if (analytics) setSummaryStats(analytics); }, [analytics, setSummaryStats]);

    if (loading) return <div style={{textAlign: "center", padding: 100}}>Generating Report...</div>;

    return (
        <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <Header type="main" />
            <style>{pageStyles}</style>

            {/* Scientific Report Modal (Separate View) */}
            {showReportModal && (
                <div className="report-modal-overlay" onClick={() => setShowReportModal(false)}>
                    <div className="report-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="report-modal-header">
                            <h3 style={{margin: 0}}>🔬 MarineInsight Scientific Assessment</h3>
                            <button onClick={() => setShowReportModal(false)} style={{background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer'}}>&times;</button>
                        </div>
                        <div className="report-modal-body">
                            <h2>Detailed Research Report</h2>
                            <p>{analytics?.research}</p>
                        </div>
                    </div>
                </div>
            )}

            <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />

            <div ref={componentRef}>
                <div className="results-dashboard">
                    <header className="dashboard-header">
                        <h1>Microplastic Analysis Batch Report</h1>
                        <p>ID: {id}</p>
                    </header>

                    {analytics && (
                        <>
                            <div className="research-summary-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <h3>🔬 Scientific Context</h3>
                                    <button 
                                        onClick={() => setShowReportModal(true)}
                                        style={{background: '#0077be', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
                                    >
                                        View Full Analysis
                                    </button>
                                </div>
                                <p style={{marginTop: '15px', maxHeight: '100px', overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'}}>
                                    {analytics.research}
                                </p>
                            </div>

                            <div className="stats-grid">
                                <StatCard title="Total Images" value={analytics.imageCount} />
                                <StatCard title="Detections" value={analytics.totalParticles} />
                                <StatCard title="Dominant Type" value={analytics.mostCommon.toUpperCase()} />
                            </div>

                            <div className="details-grid">
                                <SummaryTable title="Count Breakdown" data={analytics.typeCounts} total={analytics.totalParticles} />
                                <SummaryTable title="Area Breakdown" data={analytics.areaByType} total={analytics.totalArea} unit="mm²" />
                            </div>

                            <div className="results-card">
                                <h3 style={{marginBottom: '1.5rem'}}>📸 Analyzed Images Gallery</h3>
                                <div className="image-gallery-grid">
                                    {data.results.map((img, i) => (
                                        <div key={i} className="gallery-item" onClick={() => setSelectedImage(img)}>
                                            <img src={img.annotated_image || img.processed_image_url} alt="analysis" />
                                            <div className="gallery-label">
                                                <strong>{img.image_name || `Frame ${i + 1}`}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'center', gap: '20px', margin: '3rem 0'}}>
                <button style={{background: '#3498db', color: 'white', padding: '1rem 2rem', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold'}} onClick={handleDownloadPDF}>
                    Download PDF Report
                </button>
                <button style={{background: '#27ae60', color: 'white', padding: '1rem 2rem', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold'}} onClick={handleDownloadCSV}>
                    Export CSV Data
                </button>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---
const ImageModal = ({ image, onClose }) => {
    if (!image) return null;
    const src = image.annotated_image || image.processed_image_url;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <img src={src} alt="Analyzed Result" />
                <div style={{color: 'white', textAlign: 'center', marginTop: '10px'}}>{image.image_name || "Analyzed Frame"}</div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value }) => (
    <div className="stat-card">
        <div style={{fontSize: "0.9rem", color: "#7f8c8d", fontWeight: 600}}>{title}</div>
        <div className="stat-value">{value}</div>
    </div>
);

const SummaryTable = ({ title, data, total, unit = "" }) => (
    <div className="results-card">
        <h3 style={{marginBottom: "1rem", borderBottom: "1px solid #eee"}}>{title}</h3>
        <table className="summary-table">
            <tbody>
                {Object.entries(data).map(([type, val]) => (
                    <tr key={type}>
                        <td>{type.toUpperCase()}</td>
                        <td>{typeof val === 'number' ? val.toFixed(unit ? 2 : 0) : val} {unit}</td>
                    </tr>
                ))}
                <tr style={{fontWeight: 'bold'}}>
                    <td>TOTAL</td>
                    <td>{total} {unit}</td>
                </tr>
            </tbody>
        </table>
    </div>
);

export default ResultsPage;