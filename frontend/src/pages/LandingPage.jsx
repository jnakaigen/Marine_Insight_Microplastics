import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './LandingPage.css';

import heroVideo from '../assets/water-video.mp4';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const main = useRef();

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // HERO animation
        tl.from('.hero-content h1', { opacity: 0, y: 80, duration: 1 });
        tl.from('.hero-content p', { opacity: 0, y: 40, duration: 0.8 }, "-=0.6");
        tl.from('.hero-buttons', { opacity: 0, scale: 0.8, duration: 0.5 }, "-=0.5");

        // FEATURE CARDS animation
        gsap.utils.toArray('.feature-item').forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                opacity: 0,
                y: 60,
                duration: 0.6,
                delay: i * 0.1, // nice stagger feel
            });
        });

        // Force recalculation (important on refresh)
        ScrollTrigger.refresh();

    }, { scope: main, revertOnUpdate: true });

    return (
        <>
            <Header type="landing" />

            <main ref={main}>

                {/* 🌊 GLOBAL VIDEO BACKGROUND */}
                <div className="global-video-wrapper">
                    <video autoPlay loop muted playsInline className="global-video">
                        <source src={heroVideo} type="video/mp4" />
                    </video>
                    {/* Gradient Overlay to blend it naturally as you scroll */}
                    <div className="global-video-overlay"></div>
                </div>

                {/* HERO SECTION */}
                <section className="hero">
                    <div className="container hero-content">
                        <h1>
                            See the Invisible.<br />
                            <span>Track Microplastics in Seconds.</span>
                        </h1>

                        <p>
                            Upload your sample and let AI detect, classify, and quantify microplastics instantly.
                            No manual effort. No wasted hours.
                        </p>

                        <div className="hero-buttons">
                            <Link to="/signnup" className="btn btn-primary">
                                Start Analysis
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section id="features" className="section-transparent">
                    <div className="container">

                        <h2 className="section-title">Built for Real Research</h2>

                        <p className="section-subtitle">
                            Not another gimmick tool. A full pipeline - from detection to reporting.
                        </p>

                        <div className="features-grid">

                            <div className="feature-item">
                                <div className="icon">⚡</div>
                                <h3>Instant Detection</h3>
                                <p>
                                    AI automatically detects particles - even the smallest ones.
                                </p>
                            </div>

                            <div className="feature-item">
                                <div className="icon">🧬</div>
                                <h3>Smart Classification</h3>
                                <p>
                                    Fibers, fragments, films, pellets - classified using deep learning precision.
                                </p>
                            </div>

                            <div className="feature-item">
                                <div className="icon">📊</div>
                                <h3>Clean Reports</h3>
                                <p>
                                    Export-ready insights with charts, counts, and clarity.
                                </p>
                            </div>

                        </div>

                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
};

export default LandingPage;