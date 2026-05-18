import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './UploadPage.css';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext'; // 1. Imported useTheme

const UploadPage = () => {
    // 2. Initialize Dark Mode State
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [location, setLocation] = useState('');
    const [beachname, setbeachname] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]); 
    const [data, setData] = useState(null);
    const navigate = useNavigate();
    const fileInputRef = useRef(null); 
    const [loading, setLoading] = useState(false);

    const [qaChecks, setQaChecks] = useState({
        material: true,
        attire: true,
        blank: true
    });

    useEffect(() => {
        return () => previews.forEach(url => URL.revokeObjectURL(url));
    }, [previews]);

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setSelectedFiles(files);
            setData(null);

            const filePreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(filePreviews);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            alert("Please select images first");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        let ts = timestamp;
        if (ts) {
            if (!ts.includes(":")) ts += ":00";
            ts += ":00";
        } else {
            ts = new Date().toISOString();
        }

        selectedFiles.forEach(file => {
            formData.append('files', file);
            formData.append('location', location);
            formData.append('beachname', beachname);
            formData.append('timestamp', ts);
        });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post("https://marine-insight-microplastics.onrender.com/api/detect/", formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            setData(response.data);
            const normalizedData = {
                ...response.data,
                results: response.data.results.map(r => ({
                    ...r,
                    annotated_image: r.annotated_image || r.annotated_image_base64,
                    graph_image: r.graph_image || r.graph_image_base64
                }))
            };

            navigate('/results', {
                state: {
                    analysisData: normalizedData,
                }
            });

        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Image analysis failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="upload-container" style={{ color: isDark ? '#e3e8ee' : '#333' }}>
                <div className="upload-section">
                    <h1>Detect & Classify Microplastics with AI</h1>
                    <p style={{ color: isDark ? '#94a3b8' : '#666' }}>
                        Upload your water sample images for automated analysis.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="upload-box" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `2px dashed ${isDark ? 'rgba(255,255,255,0.2)' : '#ccc'}`, // Dynamic Border
                            padding: '40px',
                            borderRadius: '8px',
                            gap: '15px',
                            textAlign: 'center',
                            backgroundColor: isDark ? '#111820' : '#fafafa' // Dynamic Background
                        }}>
                            {/* 🖼️ IMAGE PREVIEW AREA */}
                            {previews.length > 0 ? (
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                                    gap: '10px', 
                                    width: '100%', 
                                    marginBottom: '10px' 
                                }}>
                                    {previews.map((url, index) => (
                                        <img 
                                            key={index} 
                                            src={url} 
                                            alt="preview" 
                                            style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', border: `1px solid ${isDark ? '#333' : '#ddd'}` }} 
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="icon" style={{ fontSize: '48px', color: isDark ? '#64748b' : '#888' }}>☁️</div>
                            )}

                            <p style={{ margin: 0, fontSize: '1rem', color: isDark ? '#e3e8ee' : '#333' }}>
                                {previews.length > 0 ? `${previews.length} file(s) selected` : "Drag & drop your image here"}
                            </p>
                            <input
                                type="file"
                                accept="image/jpeg,image/png"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple
                            />
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleBrowseClick}
                                style={{
                                    backgroundColor: isDark ? '#1e293b' : '#fff',
                                    color: isDark ? '#e3e8ee' : '#555',
                                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#ccc'
                                }}
                            >
                                {previews.length > 0 ? "Change Files" : "Browse Files"}
                            </button>

                            <div style={{ width: '100%', marginTop: '20px', textAlign: 'left' }}>
                                <label style={{ fontWeight: '600', color: isDark ? '#e3e8ee' : '#333' }}>Sampling Location(city):</label>
                                <input
                                    type="text"
                                    placeholder="Enter sampling location (e.g., Lake Shore, Kerala)"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#ccc'}`,
                                        borderRadius: '6px',
                                        marginTop: '8px',
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        color: isDark ? '#fff' : '#333'
                                    }}
                                    required
                                />
                            </div>
                            <div style={{ width: '100%', marginTop: '20px', textAlign: 'left' }}>
                                <label style={{ fontWeight: '600', color: isDark ? '#e3e8ee' : '#333' }}>Sampling Location(beach):</label>
                                <input
                                    type="text"
                                    placeholder="Enter sampling location (e.g., Lake Shore, Kerala)"
                                    value={beachname}
                                    onChange={(e) => setbeachname(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#ccc'}`,
                                        borderRadius: '6px',
                                        marginTop: '8px',
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        color: isDark ? '#fff' : '#333'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ width: '100%', marginTop: '15px', textAlign: 'left' }}>
                                <label style={{ fontWeight: '600', color: isDark ? '#e3e8ee' : '#333' }}>Date & Time of Analysis:</label>
                                <input
                                    type="datetime-local"
                                    value={timestamp}
                                    onChange={(e) => setTimestamp(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#ccc'}`,
                                        borderRadius: '6px',
                                        marginTop: '8px',
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        color: isDark ? '#fff' : '#333',
                                        colorScheme: isDark ? 'dark' : 'light' // Fixes the calendar icon
                                    }}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>
                                {loading ? "Analyzing..." : "Start Analysis"}
                            </button>
                        </div>
                    </form>
                </div>

                <section className="info-section">
                    <h2>How Marine Insight Works</h2>
                    <div className="info-columns">
                        <div>
                            <h3>Image Requirements</h3>
                            <p>For accurate analysis, please ensure your water sample images meet the following criteria:</p>
                            <ul>
                                <li>High resolution (minimum 1920x1080 pixels recommended).</li>
                                <li>Clear focus on microplastic particles with minimal blurring.</li>
                                <li>Consistent lighting conditions, avoiding harsh shadows or overexposure.</li>
                                <li>JPEG or PNG format, maximum file size 10MB.</li>
                            </ul>
                        </div>
                        <div>
                            <h3>Our Multi-Stage Analysis</h3>
                            <p>Our AI performs a comprehensive two-stage analysis to detect and classify microplastics:</p>
                            <ul>
                                <li>
                                    <strong>Stage 1: Detection & Counting</strong><br />
                                    Identifies and counts individual microplastic particles in each image.
                                </li>
                                <li>
                                    <strong>Stage 2: Segmentation & Morphology Analysis</strong><br />
                                    Generates pixel-level masks for each particle and measures its area (px²).
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default UploadPage;