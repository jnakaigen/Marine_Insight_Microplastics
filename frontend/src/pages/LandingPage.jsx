import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './LandingPage.css';
import heroImage from '../assets/analyzed-sample.jpg';

// 1. Import GSAP and its hooks
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';


gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const main = useRef(); 

    
    useGSAP(() => {
        
        const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
        
        tl.from('.hero h1', { opacity: 0, y: 40, duration: 1 });
        tl.from('.hero p', { opacity: 0, y: 20, duration: 0.8 }, "-=0.5");
        tl.from('.hero .btn', { opacity: 0, y: 20, duration: 0.5 }, "-=0.5");

        // --- Scroll-Triggered Animation for Features ---
        gsap.from('.feature-item', {
            scrollTrigger: {
                trigger: '.features-grid',
                start: 'top 80%', // Start animation when the top of the grid is 80% down the viewport
            },
            opacity: 0,
            y: 50,
            duration: 0.6,
            stagger: 0.2 
        });

        
         gsap.from('.step', {
            scrollTrigger: {
                trigger: '.steps-container',
                start: 'top 80%',
            },
            opacity: 0,
            y: 50,
            duration: 0.6,
            stagger: 0.2
        });

    }, { scope: main }); 

    return (
        <>
            <Header type="landing" />
          
            <main ref={main}>
                <section className="hero" style={{ backgroundImage: `linear-gradient(rgba(0, 50, 100, 0.6), rgba(0, 20, 40, 0.6)), url(${heroImage})` }}>
                    <div className="container">
                        <h1>Automate Microplastic Analysis with AI</h1>
                        <p>Upload your water sample images to instantly detect, classify, and quantify microplastic pollution with cutting-edge accuracy. Get comprehensive reports in minutes, not days.</p>
                        <Link to="/signnup" className="btn btn-light">Start Your Free Analysis</Link>
                    </div>
                </section>

                <section id="features" className="section section-light">
                    <div className="container">
                        <h2 className="section-title">Powerful Features, Precise Results</h2>
                        <p className="section-subtitle">Our platform simplifies the complex task of microplastic analysis with a robust, AI-driven workflow designed for researchers, environmental agencies, and labs.</p>
                        <div className="features-grid">
                            <div className="feature-item">
                                <h3>AI-Powered Detection</h3>
                                <p>Our advanced algorithms automatically identify potential microplastic particles in your images, distinguishing them from organic matter and other debris.</p>
                            </div>
                            <div className="feature-item">
                                <h3>Multi-Stage Classification</h3>
                                <p>Particles are categorized by type (fiber, fragment, film) and refined by properties like size, shape, and color for highly detailed quantification.</p>
                            </div>
                            <div className="feature-item">
                                <h3>Comprehensive Reporting</h3>
                                <p>Generate detailed, shareable reports complete with data visualizations, statistical summaries, and AI-driven insights to support your research and decision-making.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="how-it-works" className="section">
                    <div className="container">
                        <h2 className="section-title">Get Started in Three Simple Steps</h2>
                        <div className="steps-container">
                            <div className="step">
                                <div className="step-number">1</div>
                                <h3>Upload Your Image</h3>
                                <p>Drag and drop your high-resolution water sample image in JPEG or PNG format.</p>
                            </div>
                            <div className="step">
                                <div className="step-number">2</div>
                                <h3>AI Performs Analysis</h3>
                                <p>Our system instantly processes the image, running a two-stage analysis to detect and classify every particle.</p>
                            </div>
                            <div className="step">
                                <div className="step-number">3</div>
                                <h3>Receive Your Report</h3>
                                <p>Access your dashboard to view the results, download raw data, and generate a full, insightful report.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="section cta-section">
                    <div className="container">
                        <h2 className="section-title">Ready to Revolutionize Your Research?</h2>
                        <p>Join the growing community of scientists and researchers using AI to accelerate the fight against microplastic pollution. Create your free account today.</p>
                        <Link to="/signnup" className="btn btn-light">Get Started Now</Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default LandingPage;