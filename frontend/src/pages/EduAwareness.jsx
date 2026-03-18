

// export default EduAwareness
import React from 'react';
import './EduAwareness.css';

const EduAwareness = () => {
    return (
        <div className="marine-viewport">
            <div className="ocean-overlay"></div>
            
            {/* Animated Bubble Engine - Visualizing the aquatic environment */}
            <div className="bubble-container">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bubble"></div>
                ))}
            </div>

            <div className="content-frame">
                {/* 1. Strong Introduction [cite: 2, 49] */}
                <h1 className="main-glow-title">Microplastics: Small Particles, Big Impact</h1>
                <div className='glass-hero'>
                    <p>
                        Microplastics are synthetic polymer particles less than 5 mm in diameter that have 
                        become ubiquitous contaminants in aquatic ecosystems. This page explores 
                        their dispersion patterns, ecological consequences, and the rising concerns 
                        regarding human health.
                    </p>
                </div>

                {/* 2. Common Types [cite: 9, 51] */}
                <h2 className="sub-glow-title">Common Types of Microplastics</h2>
                <div className='common-types-container'>
                    <div className='type-glass-card'>
                        <div className="card-id">01</div>
                        <h3>Fiber</h3>
                        <p>Originates from synthetic textiles and fishing gear; thread-like structures can easily clog the digestive systems of small aquatic creatures.</p>
                    </div>
                    <div className="type-glass-card">
                        <div className="card-id">02</div>
                        <h3>Film</h3>
                        <p>Derived from thin, flexible items like bags; their high surface area allows them to float and block sunlight for underwater habitats.</p>
                    </div>
                    <div className="type-glass-card">
                        <div className="card-id">03</div>
                        <h3>Pellet</h3>
                        <p>Raw industrial granules that act as "chemical sponges," adsorbing and concentrating toxic heavy metals from the surrounding water.</p>
                    </div>
                    <div className="type-glass-card">
                        <div className="card-id">04</div>
                        <h3>Fragment</h3>
                        <p>Resulting from the physical weathering of hard plastics; jagged edges cause significant internal mechanical damage to animal tissues.</p>
                    </div>
                </div>

                {/* 3. AI Monitoring [cite: 24, 52] */}
                <div className="ai glass-hero tech-section">
                    <h2 className="sub-glow-title gold">How AI Helps</h2>
                    <div className="ai-grid">
                        <div className="ai-log">
                            <strong>Automatic Detection</strong>
                            <p>AI identifies and categorizes microplastics automatically, ensuring that no microscopic threat goes unnoticed.</p>
                        </div>
                        <div className="ai-log">
                            <strong>Efficiency at Scale</strong>
                            <p>Processing is significantly faster than traditional manual analysis, providing instant results for environmental monitoring.</p>
                        </div>
                    </div>
                </div>

 
                <div className="human-impact glass-hero">
                    <h2 className="sub-glow-title">How Microplastics Reach Humans</h2>
                    
                    <div className="food-chain-visual">
                        <div className="chain-node">Plankton</div>
                        <div className="chain-arrow">→</div>
                        <div className="chain-node">Small Fish</div>
                        <div className="chain-arrow">→</div>
                        <div className="chain-node">Large Fish</div>
                        <div className="chain-arrow">→</div>
                        <div className="chain-node human">Humans</div>
                    </div>
                    
                    

                    <div className="impact-steps-grid">
                        <div className="step-box">
                            <strong>1. Ingestion</strong>
                            <p>Organisms at the bottom of the food chain, like plankton, mistake microplastics for food sources.</p>
                        </div>
                        <div className="step-box">
                            <strong>2. Bioaccumulation</strong>
                            <p>Microplastics and associated chemical additives accumulate within an organism's tissues over time.</p>
                        </div>
                        <div className="step-box">
                            <strong>3. Biomagnification</strong>
                            <p>Toxins become increasingly concentrated as they move up the food chain to larger predators.</p>
                        </div>
                        <div className="step-box">
                            <strong>4. Human Consumption</strong>
                            <p>Humans ingest these concentrated microplastics through the consumption of seafood and water.</p>
                        </div>
                    </div>

                    {/* 5. Final Message [cite: 44, 56] */}
                   
                </div>
                 <div className="strong-message">
                        “Plastic pollution does not end in the ocean — it returns through the food chain.” 
                    </div>
            </div>
        </div>
    );
};

export default EduAwareness;