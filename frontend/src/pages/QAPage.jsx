

// export default QAPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';

const QAPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [protocols, setProtocols] = useState({
        organicMatter: false,
        sampleDrying: false,
        ftirVerification: false,
        stereoMicroscope: false,
        distinctMorphology: false,
        backgroundClarity: false,
        resolutionCheck: false,
        exifRotation: false
    });

    const handleToggle = (key) => {
        setProtocols(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const isComplete = Object.values(protocols).every(Boolean);

    const handleProceed = () => {
        if (isComplete) {
            navigate('/upload', { state: { qaVerified: true } });
        }
    };

    // Internal CSS Styles
    const styles = {
        container: {
            maxWidth: '850px',
            margin: '40px auto',
            padding: '40px',
            backgroundColor: isDark ? '#111820' : '#ffffff',
            borderRadius: '12px',
            boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.45)' : '0 10px 30px rgba(0, 0, 0, 0.05)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e1e8ed',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
        },
        header: {
            borderBottom: isDark ? '2px solid rgba(255,255,255,0.18)' : '2px solid #2c3e50',
            marginBottom: '30px',
            paddingBottom: '10px'
        },
        section: (borderColor) => ({
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: isDark ? '#0f1720' : '#f8fafc',
            borderRadius: '8px',
            borderLeft: `5px solid ${borderColor || (isDark ? '#4dd0b4' : '#3498db')}`
        }),
        sectionTitle: {
            marginTop: 0,
            color: isDark ? '#e3e8ee' : '#2c3e50',
            fontSize: '1.2rem',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        item: {
            display: 'flex',
            alignItems: 'flex-start',
            padding: '10px',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background 0.2s',
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'transparent'
        },
        checkbox: {
            width: '18px',
            height: '18px',
            marginRight: '12px',
            marginTop: '3px',
            accentColor: '#3498db'
        },
        label: {
            fontSize: '0.95rem',
            color: isDark ? '#cbd5e0' : '#34495e',
            lineHeight: '1.5'
        },
        button: {
            width: '100%',
            marginTop: '20px',
            padding: '18px',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '8px',
            border: 'none',
            cursor: isComplete ? 'pointer' : 'not-allowed',
            backgroundColor: isComplete ? '#2c3e50' : (isDark ? '#2c3e5080' : '#cbd5e0'),
            color: isComplete ? '#ffffff' : '#718096',
            transition: 'all 0.3s ease'
        }
    };

    return (
        <Layout>
            <div style={styles.container}>
                <header style={styles.header}>
                    {/* Use the isDark variable to toggle text color */}
                    <h1 style={{ margin: 0, color: isDark ? '#e3e8ee' : '#1a2a3a' }}>🔬 Pre-Upload Quality Assurance</h1>
                    <p style={{ color: isDark ? '#94a3b8' : '#5e6e7e', marginTop: '5px' }}>
                        Compliance with laboratory standards is required for analysis.
                    </p>
                </header>

                {/* 1. Sample Preparation */}
                <section style={styles.section('#3498db')}>
                    <h3 style={styles.sectionTitle}>🧪 1. Sample Preparation & Purity </h3>
                    <div style={styles.item}>
                        <input type="checkbox" style={styles.checkbox} checked={protocols.organicMatter} onChange={() => handleToggle('organicMatter')} />
                        <span style={styles.label}><strong>Organic Matter Removal:</strong> Have samples undergone digestion and density separation? </span>
                    </div>
                    <div style={styles.item}>
                        <input type="checkbox" style={styles.checkbox} checked={protocols.sampleDrying} onChange={() => handleToggle('sampleDrying')} />
                        <span style={styles.label}><strong>Sample Drying:</strong> Are samples dry and free from moisture/glare? </span>
                    </div>
                </section>

                {/* 2. Chemical Verification */}
                <section style={styles.section('#9b59b6')}>
                    <h3 style={styles.sectionTitle}>⚛️ 2. Chemical Verification</h3>
                    <div style={styles.item}>
                        <input type="checkbox" style={styles.checkbox} checked={protocols.ftirVerification} onChange={() => handleToggle('ftirVerification')} />
                        <span style={styles.label}><strong>Particle Verification:</strong> Verified a subset using μ-FTIR Spectroscopy? </span>
                    </div>
                </section>

                {/* 3. Imaging Standards */}
                <section style={styles.section('#e67e22')}>
                    <h3 style={styles.sectionTitle}>📷 3. Imaging Standards </h3>
                    <div style={styles.item}>
                        <input type="checkbox" style={styles.checkbox} checked={protocols.stereoMicroscope} onChange={() => handleToggle('stereoMicroscope')} />
                        <span style={styles.label}><strong>Microscopy Usage:</strong> Captured using a stereo-microscope? </span>
                    </div>
                    <div style={styles.item}>
                        <input type="checkbox" style={styles.checkbox} checked={protocols.distinctMorphology} onChange={() => handleToggle('distinctMorphology')} />
                        <span style={styles.label}><strong>Distinct Morphologies:</strong> Clearly shows Fiber, Film, Fragment, or Pellet? </span>
                    </div>
                    <div style={styles.item}>
                        <input type="checkbox" style={styles.checkbox} checked={protocols.backgroundClarity} onChange={() => handleToggle('backgroundClarity')} />
                        <span style={styles.label}><strong>Background Clarity:</strong> Is background uniform (e.g., filter paper)? </span>
                    </div>
                </section>

                {/* 4. Image File Requirements */}
                <section style={styles.section('#2ecc71')}>
                    <h3 style={styles.sectionTitle}>📂 4. Image File Requirements</h3>
                    <div style={styles.item}>
                        <input type="checkbox" style={styles.checkbox} checked={protocols.resolutionCheck} onChange={() => handleToggle('resolutionCheck')} />
                        <span style={styles.label}><strong>Resolution:</strong> Sufficient to distinguish particles &lt; 5mm?</span>
                    </div>
                    <div style={styles.item}>
                        <input type="checkbox" style={styles.checkbox} checked={protocols.exifRotation} onChange={() => handleToggle('exifRotation')} />
                        <span style={styles.label}><strong>Orientation:</strong> Checked for no EXIF rotation issues? </span>
                    </div>
                </section>

                <button 
                    disabled={!isComplete} 
                    onClick={handleProceed}
                    style={styles.button}
                >
                    {isComplete ? "Proceed to Upload" : "Complete All Protocols to Proceed"}
                </button>
            </div>
        </Layout>
    );
};

export default QAPage;