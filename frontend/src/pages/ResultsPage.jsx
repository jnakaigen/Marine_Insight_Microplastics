import React, { useState, useMemo, useEffect, useContext, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import Header from '../components/Header';
import { SummaryStatsContext } from "../context/SummaryStatsContext";

// 1. Import Recharts
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer 
} from 'recharts';

// ---------- STYLES ----------
const pageStyles = `
.theme-wrapper {
    background-color: var(--bg-color);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
}
.results-dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; background: var(--bg-color); }
.dashboard-header { text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 1rem; }
.dashboard-header h1 { color: var(--text-primary); margin-bottom: 5px; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.stat-card { background: var(--surface); padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); text-align: center; }
.stat-value { font-size: 2.2rem; font-weight: 700; color: #2980b9; }

.research-summary-card {
    background: var(--surface);
    border-left: 8px solid var(--accent);
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}
.research-summary-card p { white-space: pre-wrap; line-height: 1.8; color: var(--text-primary); font-size: 1rem; }

.charts-grid, .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.results-card { background: var(--surface); padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }

.summary-table { width: 100%; border-collapse: collapse; }
.summary-table td { padding: 0.8rem; border-bottom: 1px solid rgba(0,0,0,0.08); }
.summary-table td:last-child { font-weight: 600; text-align: right; }

/* GALLERY STYLES */
.image-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.gallery-item { 
    border: 1px solid rgba(0,0,0,0.08); 
    border-radius: 8px; 
    overflow: hidden; 
    background: var(--surface); 
    cursor: pointer; 
    transition: transform 0.2s ease;
}
.gallery-item:hover { transform: translateY(-5px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); }
.gallery-item img { width: 100%; display: block; height: 200px; object-fit: cover; }
.gallery-label { padding: 0.8rem; font-size: 0.85rem; text-align: center; background: var(--surface); }

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
.modal-content img { width: 100%; height: auto; border-radius: 8px; border: 3px solid var(--surface); }
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

/* SCIENTIFIC REPORT MODAL */
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
    background: var(--surface);
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
    background: var(--accent);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.report-modal-body {
    padding: 30px;
    overflow-y: auto;
    color: var(--text-primary);
    line-height: 1.8;
}
.report-modal-body h2 { border-bottom: 2px solid rgba(0,0,0,0.08); padding-bottom: 10px; margin-bottom: 20px; }
.report-modal-body p { white-space: pre-wrap; margin-bottom: 20px; }

/* DARK MODE OVERRIDES */
body[data-theme='dark'] .results-dashboard { background: transparent !important; color: var(--text-primary); }
body[data-theme='dark'] .results-dashboard .dashboard-header { border-bottom-color: rgba(255,255,255,0.14); }
body[data-theme='dark'] .results-dashboard .stat-card,
body[data-theme='dark'] .results-dashboard .research-summary-card,
body[data-theme='dark'] .results-dashboard .results-card,
body[data-theme='dark'] .results-dashboard .gallery-item,
body[data-theme='dark'] .results-dashboard .summary-table th,
body[data-theme='dark'] .results-dashboard .summary-table td,
body[data-theme='dark'] .results-dashboard .gallery-label {
    background: var(--surface);
    color: var(--text-primary);
    border-color: rgba(255,255,255,0.08);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
}
body[data-theme='dark'] .results-dashboard .research-summary-card { border-left-color: var(--accent); }
body[data-theme='dark'] .results-dashboard .summary-table th { background: rgba(255,255,255,0.06); }
body[data-theme='dark'] .results-dashboard .report-modal-container { background: var(--surface); color: var(--text-primary); }
body[data-theme='dark'] .results-dashboard .report-modal-body { color: var(--text-primary); }
body[data-theme='dark'] .results-dashboard .modal-content img { border-color: rgba(255,255,255,0.12); }

@media print {
    .modal-overlay, .report-modal-overlay, .actions-panel, header, .charts-grid button { display: none !important; }
    .results-dashboard { padding: 0; width: 100%; }
    .gallery-item { page-break-inside: avoid; transform: none !important; }
}
`;

// Dynamic Color Palette for Recharts
const COLORS = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#34495e'];

const ResultsPage = () => {
    const { id: urlId } = useParams();
    const location = useLocation();
    const componentRef = useRef(null);
    
    const [data, setData] = useState(location.state?.analysisData || null);
    const [loading, setLoading] = useState(!data);
    const [selectedImage, setSelectedImage] = useState(null); 
    const [showReportModal, setShowReportModal] = useState(false);
    
    const { setSummaryStats } = useContext(SummaryStatsContext);
    const batchId = urlId || data?.batch_id || 'Unknown';

    // -----------------------------------------------------------------
    // PDF & CSV DOWNLOAD LOGIC
    // -----------------------------------------------------------------
    const handleDownloadPDF = () => {
        if (!analytics?.research) {
            alert("Report data is not available yet.");
            return;
        }

        let formattedText = analytics.research.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        const printContainer = document.createElement("div");
        printContainer.innerHTML = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #2c3e50;">
                <h1 style="color: #0077be; text-align: center; border-bottom: 2px solid #0077be; padding-bottom: 10px; margin-bottom: 20px;">
                    MarineInsight Scientific Assessment
                </h1>
                <h3 style="color: #34495e;">Batch ID: ${batchId}</h3>
                <div style="white-space: pre-wrap; line-height: 1.8; font-size: 14px; text-align: justify;">
                    ${formattedText}
                </div>
            </div>
        `;

        const opt = {
            margin: 0.5,
            filename: `MarineInsight_Report_Batch_${batchId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(printContainer).save();
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
                rows.push([batchId, `"${img.filename || img.image_name || 'Frame'}"`, `"${det.type}"`, areaPx, areaMm2].join(","));
            });
        });
        const csvString = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `MarineInsight_Batch_${batchId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // -----------------------------------------------------------------
    // API FETCH
    // -----------------------------------------------------------------
    useEffect(() => {
        const token = localStorage.getItem('token') || localStorage.getItem('access');
        if (!data && batchId !== 'Unknown') {
            setLoading(true);
            axios.get(`http://127.0.0.1:8000/api/batch/${batchId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setData(res.data))
                .catch(err => console.error("API Error:", err))
                .finally(() => setLoading(false));
        }
    }, [batchId, data]);

    // -----------------------------------------------------------------
    // DATA MEMOIZATION (Prepared for Recharts)
    // -----------------------------------------------------------------
    const analytics = useMemo(() => {
        if (!data?.results) return null;
        const DPI = 96; 
        const PIXEL_TO_MM2 = Math.pow(25.4 / DPI, 2); 
        
        const typeCounts = {};
        const areaByType = {};
        const areaPxByType = {}; 
        let totalParticles = 0, totalAreaPx = 0;
        
        data.results.forEach(img => {
            (img.detection_details || []).forEach(det => {
                const type = (det.type || "unknown").toLowerCase();
                const areaPx = Number(det.area) || 0;
                
                if (!typeCounts[type]) {
                    typeCounts[type] = 0;
                    areaByType[type] = 0;
                    areaPxByType[type] = 0;
                }
                
                typeCounts[type]++;
                areaByType[type] += (areaPx * PIXEL_TO_MM2);
                areaPxByType[type] += areaPx; 
                totalParticles++;
                totalAreaPx += areaPx;
            });
        });

        // Map data directly into Recharts array format
        const chartData = Object.keys(typeCounts).map(type => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: typeCounts[type], // For Pie Chart
            avgArea: typeCounts[type] > 0 ? Math.round(areaPxByType[type] / typeCounts[type]) : 0 // For Bar Chart
        }));
        
        return {
            imageCount: data.results.length,
            totalParticles,
            typeCounts,
            areaByType, 
            totalArea: (totalAreaPx * PIXEL_TO_MM2).toFixed(4), 
            mostCommon: totalParticles === 0 ? "N/A" : Object.keys(typeCounts).reduce((a, b) => typeCounts[b] > typeCounts[a] ? b : a),
            research: data.results[0]?.scientific_report || "Scientific data not found.",
            chartData, // Used for Recharts
        };
    }, [data]);

    useEffect(() => { if (analytics) setSummaryStats(analytics); }, [analytics, setSummaryStats]);

    if (loading) return <div style={{textAlign: "center", padding: 100, color: 'var(--text-primary)'}}>Loading Analysis...</div>;

    // -----------------------------------------------------------------
    // CUSTOM RECHARTS TOOLTIPS
    // -----------------------------------------------------------------
    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percent = analytics.totalParticles > 0 ? ((data.value / analytics.totalParticles) * 100).toFixed(1) : 0;
            return (
                <div style={{ backgroundColor: 'var(--surface)', padding: '10px 15px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{`${data.name}: ${data.value} counts (${percent}%)`}</p>
                </div>
            );
        }
        return null;
    };

    const CustomBarTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: 'var(--surface)', padding: '10px 15px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{`${label}: ${payload[0].value} px² (Avg)`}</p>
                </div>
            );
        }
        return null;
    };

    // -----------------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------------
    return (
        <div className="theme-wrapper" style={{ minHeight: '100vh' }}>
            <Header type="main" />
            <style>{pageStyles}</style>

            {/* Scientific Report Modal */}
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
                        <p style={{ color: 'var(--text-primary)', opacity: 0.8 }}>ID: {batchId}</p>
                    </header>

                    {analytics && (
                        <>
                            {/* Research Card */}
                            <div className="research-summary-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <h3 style={{ margin: 0 }}>📋 Scientific Context</h3>
                                    <button 
                                        onClick={() => setShowReportModal(true)}
                                        style={{background: '#0077be', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
                                    >
                                        View Full Analysis
                                    </button>
                                </div>
                                <p style={{marginTop: '15px', maxHeight: '100px', overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'}}>
                                    {analytics.research}
                                </p>
                            </div>

                            {/* Stat Tiles */}
                            <div className="stats-grid">
                                <StatCard title="Total Images" value={analytics.imageCount} />
                                <StatCard title="Total Detections" value={analytics.totalParticles} />
                                <StatCard title="Dominant Type" value={analytics.mostCommon.toUpperCase()} />
                            </div>
                            
                            {/* RECHARTS SECTION */}
                            <div className="charts-grid">
                                {/* Pie Chart */}
                                <div className="results-card">
                                    <h3 style={{ marginBottom: "1.5rem", textAlign: 'center' }}>Particle Count Distribution</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie 
                                                data={analytics.chartData} 
                                                cx="50%" cy="50%" 
                                                innerRadius={60} outerRadius={110} 
                                                dataKey="value"
                                                stroke="var(--surface)" // Match background to prevent ugly borders
                                                strokeWidth={2}
                                            >
                                                {analytics.chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip content={<CustomPieTooltip />} />
                                            <RechartsLegend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--text-primary)', paddingTop: '20px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Bar Chart */}
                                <div className="results-card">
                                    <h3 style={{ marginBottom: "1.5rem", textAlign: 'center' }}>Average Area by Class</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analytics.chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.2)" vertical={false} />
                                            <XAxis dataKey="name" stroke="var(--text-primary)" tick={{ fill: 'var(--text-primary)' }} axisLine={false} tickLine={false} />
                                            <YAxis stroke="var(--text-primary)" tick={{ fill: 'var(--text-primary)' }} axisLine={false} tickLine={false} />
                                            <RechartsTooltip cursor={{fill: 'rgba(150,150,150,0.1)'}} content={<CustomBarTooltip />} />
                                            <Bar dataKey="avgArea" radius={[4, 4, 0, 0]}>
                                                {analytics.chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Tables */}
                            <div className="details-grid">
                                <SummaryTable title="Count Breakdown" data={analytics.typeCounts} total={analytics.totalParticles} />
                                <SummaryTable title="Total Area Breakdown" data={analytics.areaByType} total={analytics.totalArea} unit="mm²" />
                            </div>

                            {/* Gallery */}
                            <div className="results-card">
                                <h3 style={{marginBottom: '1.5rem'}}>📷 Analyzed Images Gallery</h3>
                                <div className="image-gallery-grid">
                                    {data.results.map((img, i) => (
                                        <div key={i} className="gallery-item" onClick={() => setSelectedImage(img)}>
                                            <img src={img.annotated_image || img.processed_image_url} alt="analysis" />
                                            <div className="gallery-label" style={{ color: 'var(--text-primary)' }}>
                                                <strong>{img.filename || img.image_name || `Frame ${i + 1}`}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
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
        <div style={{fontSize: "0.95rem", opacity: 0.8, fontWeight: 600, color: 'var(--text-primary)'}}>{title}</div>
        <div className="stat-value">{value}</div>
    </div>
);

const SummaryTable = ({ title, data, total, unit = "" }) => (
    <div className="results-card">
        <h3 style={{marginBottom: "1rem", borderBottom: "1px solid rgba(150,150,150,0.2)", paddingBottom: '10px'}}>{title}</h3>
        <table className="summary-table">
            <tbody>
                {Object.entries(data).map(([type, val]) => (
                    <tr key={type}>
                        <td>{type.toUpperCase()}</td>
                        <td>{typeof val === 'number' ? val.toFixed(unit ? 2 : 0) : val} {unit}</td>
                    </tr>
                ))}
                <tr style={{fontWeight: 'bold', borderTop: '2px solid rgba(150,150,150,0.2)'}}>
                    <td>TOTAL</td>
                    <td>{total} {unit}</td>
                </tr>
            </tbody>
        </table>
    </div>
);

export default ResultsPage;