import React from 'react';
import Layout from '../components/Layout';
import './EduAwareness.css';
import imgGlobalPresence from '../assets/edu/global-presence.jpeg';
import imgMorphologies from '../assets/edu/morphologies.jpeg';
import imgBioaccumulation from '../assets/edu/bioaccumulation.jpeg';
import imgTrojanHorse from '../assets/edu/trojan-horse.jpeg';
import impFishBivalve from '../assets/edu/fish-bivalve.jpeg';
import imgFragmentation from '../assets/edu/fragmentation.jpeg';
const EduAwareness = () => {
    return (
        <Layout>
            <div className="marine-viewport">
            <div className="ocean-overlay"></div>
            
            {/* Animated Bubble Engine - Visualizing the aquatic environment */}
            <div className="bubble-container">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="bubble"></div>
                ))}
            </div>

            <div className="content-frame">
                {/* 1. Strong Introduction */}
                <h1 className="main-glow-title">Microplastics: Small Particles, Global Crisis</h1>
                <div className='glass-hero'>
                    <p>
                        Microplastics (MPs) are synthetic polymer particles and fragments less than 5 mm in diameter. 
                        Driven by the light weight, low cost, and durability of plastic products, global plastic demand continues to surge, 
                        resulting in massive amounts of mismanaged waste entering natural environments. Due to their long life cycles, 
                        ease of migration, and resistance to biodegradation, microplastics have become ubiquitous contaminants across the globe. 
                    </p>
                    <p style={{ marginTop: '15px' }}>
                        Today, they permeate every environmental compartment imaginable: from densely populated urban estuaries and 
                        tropical wetlands, to deep-sea benthic sediments, high-altitude lakes, and even the remote sea ice of the Arctic and Antarctic. 
                        Their diminutive size allows them to easily bypass traditional wastewater treatment filtration, making them a pervasive threat to aquatic biodiversity and human health.
                    </p>
                </div>
                {/* Add this inside the first <div className='glass-hero'> after the <p> tags */}

                {/* 2. Primary vs Secondary Sources */}
                <h2 className="sub-glow-title">The Origins: Primary vs. Secondary Microplastics</h2>
                <div className="glass-hero">
                    <div className="content-image-wrapper" style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
                    <img src={imgFragmentation} alt="Plastic waste fragmentation diagram" />
                    <p className="image-caption">Larger plastic waste degrades into secondary microplastics through physical weathering, solar radiation, and microbial action.</p>
                </div>
                    <div className="impact-steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        <div className="step-box">
                            <h3 style={{ color: '#3498db', marginBottom: '10px' }}>Primary Microplastics</h3>
                            <p>
                                These are plastics deliberately manufactured to be microscopic in size. They include microbeads used in personal care items (like facial cleansers, toothpaste, and cosmetics), industrial abrasives, and small plastic pellets (nurdles) used as raw materials in plastic manufacturing. They frequently enter water systems directly through household sewage, industrial discharge, or accidental spills during transport.
                            </p>
                        </div>
                        <div className="step-box">
                            <h3 style={{ color: '#3498db', marginBottom: '10px' }}>Secondary Microplastics</h3>
                            <p>
                                These are formed from the continuous fragmentation of larger macro-plastic debris already in the environment. Items like synthetic clothing, packaging materials, fishing gear, and agricultural films break down over time due to solar radiation (UV degradation), oxidation, physical wear from wave action, and microbial activity.
                            </p>
                        </div>
                        <div className="step-box">
                            <h3 style={{ color: '#3498db', marginBottom: '10px' }}>Wastewater Treatment Plants (WWTPs)</h3>
                            <p>
                                WWTPs act as major conduits for microplastics. While large particles are removed, millions of smaller particles evade filtration and are discharged into river systems daily. Furthermore, microplastics trapped in activated sewage sludge are frequently repurposed as agricultural fertilizer, creating a secondary route for terrestrial and subsequent aquatic contamination via runoff.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Common Types and Polymers */}
                <h2 className="sub-glow-title">Morphologies and Polymer Behaviors</h2>
                <div className="glass-hero" style={{ marginBottom: '20px' }}>
                    <p>
                        The behavior of microplastics in water is heavily dictated by their polymer density. Low-density polymers like <strong>Polyethylene (PE)</strong> and <strong>Polypropylene (PP)</strong> typically float, remaining in surface waters where they are readily ingested by pelagic (surface-dwelling) organisms like zooplankton. High-density polymers like <strong>Polyethylene Terephthalate (PET)</strong> and <strong>Polyvinyl Chloride (PVC)</strong> tend to sink, accumulating in benthic sediments where they impact bottom-feeders.
                    </p>
                </div>
                <div className="content-image-wrapper" style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
                    <img src={imgMorphologies} alt="Types of microplastics: film, pellet, fiber, fragment" />
                    <p className="image-caption">Microplastics present in various forms, which dictate their environmental transport, buoyancy, and likelihood of ingestion by different species[cite: 36, 815].</p>
                </div>
                <div className='common-types-container'>
                    <div className='type-glass-card'>
                        <div className="card-id">01</div>
                        <h3>Fiber</h3>
                        <p>Originates primarily from synthetic textiles, washing machine wastewater, and degraded fishing nets. Fibers are the predominant shape found globally. Their thread-like structure makes them easily entangled in the gills and digestive tracts of small aquatic creatures.</p>
                    </div>
                    <div className="type-glass-card">
                        <div className="card-id">02</div>
                        <h3>Film</h3>
                        <p>Derived from flexible plastics like packaging wrappers and plastic bags. Because they are thin and have a high surface area, they easily float in the water column and can block sunlight necessary for algal photosynthesis.</p>
                    </div>
                    <div className="type-glass-card">
                        <div className="card-id">03</div>
                        <h3>Pellet / Sphere</h3>
                        <p>Often raw industrial materials or cosmetic microbeads. Spherical MPs are denser than water, causing them to sink. They are frequently mistaken for fish eggs and ingested by benthic invertebrates, amphipods, and echinoderms.</p>
                    </div>
                    <div className="type-glass-card">
                        <div className="card-id">04</div>
                        <h3>Fragment</h3>
                        <p>Resulting from the mechanical breakdown of hard plastics. Their jagged, irregular edges cause significant internal mechanical damage, cellular abrasions, and gastrointestinal blockage when consumed by aquatic life.</p>
                    </div>
                </div>

                {/* 4. Global Distribution */}
                <h2 className="sub-glow-title">A Ubiquitous Global Presence</h2>
                <div className="content-image-wrapper" style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
                    <img src={imgGlobalPresence} alt="Comparison of microplastic presence" />
                    <p className="image-caption">Microplastics are ubiquitous contaminants detected across diverse environmental compartments globally, including surface waters, sediments, and biological tissues[cite: 13, 38].</p>
                </div>
                <div className="glass-hero">
                    <div className="impact-steps-grid">
                        <div className="step-box">
                            <p>Microplastics (MPs) have transcended their points of origin to become a truly borderless environmental contaminant. Initially, scientific research heavily focused on marine systems and massive oceanic accumulation zones, such as the Great Pacific Garbage Patch. However, recent advancements have revealed a much more complex and widespread distribution, confirming their presence in nearly all environmental compartments, including soils, freshwater, the atmosphere, and remote cryospheric (frozen) regions.</p>
                        </div>
                        <div className="step-box">
                            <h3 style={{ color: '#e74c3c' }}>Marine Ecosystems and the Open Ocean</h3>
                            <p>The world's oceans act as the ultimate planetary sink for plastic waste. Approximately 4.8 million tons of plastic debris enter the global ocean annually due to improper disposal. Once in the marine environment, MPs are dispersed across surface waters, the water column, and deep-sea benthic trenches by ocean currents, monsoons, and wind patterns. Significant accumulations have been documented in the North Pacific Ocean, the Mediterranean Sea, the South China Sea, and the Bay of Bengal. Coastal areas, heavily impacted by tourism, fishing, and aquaculture, also show incredibly high retention rates of secondary microplastics originating from degraded maritime gear.</p>
                        </div>
                        <div className="step-box">
                            <h3 style={{ color: '#e74c3c' }}>Freshwater Systems: The Arteries of Pollution</h3>
                            <p>Rivers act as the primary arteries transporting terrestrial plastic waste to the seas. Major river systems, such as the Yangtze, Ganges, and Amazon, are recognized as massive conduits for microplastic transfer. Contamination in freshwater bodies varies drastically based on human activity. For instance, the German Rhine River and the North American Laurentian Great Lakes show immense surface accumulation. In highly urbanized and densely populated basins, such as the Yangtze and Pearl River basins in China, urban runoff, wastewater discharge, and industrial effluent lead to extreme pollution levels, severely affecting local freshwater ecosystems.</p>
                        </div>
                        <div className="step-box">
                            <h3 style={{ color: '#e74c3c' }}>Estuaries and Tropical Wetlands: Ecological Traps</h3>
                            <p>Estuaries, the transition zones between inland freshwater and marine ecosystems, are critical hotspots for microplastic accumulation. The intricate hydrology and low flow velocities of wetlands and estuaries cause them to act as ecological traps, sequestering massive amounts of microplastics within their sediments. Studies have shown that MP abundance in these areas—such as the Pearl River estuary, can significantly surpass that of adjacent offshore areas. Consequently, organisms residing in these vital nursery habitats frequently exhibit higher MP concentrations than those in neighboring, faster-flowing river systems.</p>
                        </div>
                        <div className="step-box">
                            <h3 style={{ color: '#e74c3c' }}>Aquatic Sediments: The Invisible Sinks</h3>
                            <p>
                                While floating plastics are highly visible, aquatic sediments represent a massive, invisible reservoir for denser microplastics. Particles settle out of the water column due to their specific density, biofouling (where organic matter accumulates on the plastic, increasing its weight), and co-sedimentation processes. Sediments in rivers, lakes, and coastal zones worldwide can contain hundreds to thousands of microplastic particles per kilogram. However, these benthic sinks are not permanent; environmental disturbances such as storms, hydrodynamic changes, or biological activity can resuspend microplastics back into the water column, creating a continuous cycle of redistribution and secondary pollution.
                            </p>
                        </div>

                        <div className="step-box">
                            <h3 style={{ color: '#e74c3c' }}>The Frozen Frontiers: Polar and High-Altitude Regions</h3>
                            <p>
                                One of the most alarming indicators of microplastics' global reach is their presence in remote and previously pristine regions. The Arctic and Antarctic are now significantly contaminated, with microplastics transported through long-range atmospheric circulation, ocean currents, and maritime activities. These particles become trapped in sea ice, snow, and glacial systems. Similarly, high-altitude regions such as the Tibetan Plateau exhibit microplastic contamination in surface waters, demonstrating that proximity to human activity is no longer required. Atmospheric deposition and wind-driven transport enable microplastics to reach even the most isolated environments on Earth.
                            </p>
                        </div>

                        <div className="step-box">
                            <h3 style={{ color: '#e74c3c' }}>Socioeconomic and Regional Disparities</h3>
                            <p>
                                The distribution of microplastics is strongly influenced by socioeconomic factors and the effectiveness of waste management systems. Developing regions in Southeast Asia, Sub-Saharan Africa, and South America often experience severe pollution due to inadequate waste infrastructure, open dumping, and rapid urbanization. In contrast, developed countries may show relatively lower concentrations in local freshwater systems due to advanced treatment technologies. However, they still contribute significantly to global marine pollution through high plastic consumption rates and legacy contamination, particularly in offshore environments.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 5. The Trojan Horse Effect */}
               
                <h2 className="sub-glow-title">The "Trojan Horse" Effect: Chemical Toxicity</h2>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '20px' }}>
                    <div className="content-image-wrapper" style={{ maxWidth: '600px', width: '100%' }}>
                        <img src={imgTrojanHorse} alt="Chemical toxicity of microplastics" />
                        <p className="image-caption">The 'Trojan Horse' effect: microplastics readily adsorb persistent organic pollutants (POPs) like PAHs and PCBs from the surrounding water, acting as toxic vectors when ingested.</p>
                    </div>
                </div>
                <div className="glass-hero">
                    <p>
                        Microplastics (MPs) are widely recognized for the physical damage they cause, but a major aspect of their toxicity lies in their ability to act as carriers for additional harmful substances. This phenomenon, known as the <strong>"Trojan Horse" effect</strong>, significantly amplifies their ecological impact by enabling them to transport and concentrate toxic compounds beyond their inherent chemical composition.
                    </p>

                    <h4 style={{ marginTop: '15px', color: '#e74c3c' }}>The Mechanics of Chemical Adsorption</h4>
                    <p>
                        Microplastics are highly effective at attracting and binding with surrounding substances due to their hydrophobic nature and large surface-area-to-volume ratio. These characteristics allow them to interact with and absorb contaminants present in aquatic environments. As a result, MPs function as microscopic <strong>"chemical sponges"</strong>, concentrating toxins on their surfaces through adsorption processes.
                    </p>

                    <h4 style={{ marginTop: '15px', color: '#e74c3c' }}>The Toxic Payload</h4>
                    <p>
                        The substances that accumulate on microplastic surfaces include a wide range of hazardous environmental pollutants:
                    </p>

                    <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '1.8' }}>
                        <li><strong>Heavy Metals:</strong> Toxic elements such as cadmium, lead, and mercury readily attach to MPs.</li>
                        <li><strong>Persistent Organic Pollutants (POPs):</strong> Long-lasting industrial chemicals including PCBs and PAHs.</li>
                        <li><strong>Pharmaceuticals:</strong> Antibiotics and medicinal residues present in water bodies can adhere to plastic particles.</li>
                        <li><strong>Intrinsic Additives:</strong> Plastics themselves contain harmful compounds such as bisphenol A (BPA) and phthalates, which are known endocrine disruptors.</li>
                    </ul>

                    <h4 style={{ marginTop: '15px', color: '#e74c3c' }}>Desorption and Internal Exposure</h4>
                    <p>
                        The real danger emerges when these contaminated microplastics are ingested by aquatic organisms. Once inside the digestive or respiratory systems, the adsorbed pollutants can desorb (release), leading to direct internal exposure. This process delivers concentrated doses of toxic substances such as POPs, PAHs, and antibiotics directly into biological systems.
                    </p>

                    <h4 style={{ marginTop: '15px', color: '#e74c3c' }}>Synergistic and Cumulative Damage</h4>
                    <p>
                        The combination of physical plastic particles and their associated chemical load results in synergistic toxicity, where the combined effects are more severe than individual exposures. Studies have shown that such interactions can disrupt hormone function, impair immune responses, and damage DNA integrity.
                    </p>

                    <p style={{ marginTop: '15px' }}>
                        For instance, MPs carrying BPA and phthalates have been directly linked to endocrine disruption and reproductive harm in aquatic organisms. These compounded effects intensify bioaccumulation and trophic transfer, allowing toxic substances to move up the food chain and magnify their ecological consequences.
                    </p>
                </div>

                {/* 6. Ecotoxicological Impacts on Aquatic Life */}
                <h2 className="sub-glow-title">Ecotoxicological Impacts Across the Food Web</h2>
                <div className="content-image-wrapper" style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
                    <img src={impFishBivalve} alt="Fish and bivalve mollusks affected by microplastics" />
                    <p className="image-caption">Filter-feeding bivalves and various fish species are highly susceptible to microplastic ingestion, leading to tissue damage, oxidative stress, and impaired reproduction[cite: 198, 898].</p>
                </div>
                <div className="impact-steps-grid">
                    <div className="step-box">
                        <strong style={{ fontSize: '1.2rem', color: '#f39c12' }}>Zooplankton & Microalgae</strong>
                        <p>Microplastics inhibit algal photosynthesis by blocking light and airflow via electrostatic attachment. Zooplankton ingest high concentrations of microplastics, which impede their feeding rates, delay reproduction, and alter the sinking rates of their fecal pellets, disrupting the ocean's biological carbon pump.</p>
                    </div>
                    <div className="step-box">
                        <strong style={{ fontSize: '1.2rem', color: '#f39c12' }}>Bivalves & Crustaceans</strong>
                        <p>Filter-feeders like mussels and oysters continuously pump contaminated water. Microplastics cause tissue damage, lysosomal destabilization, immunological suppression, and oxidative stress. Particles can even transfer from their digestive tracts into their circulatory systems (hemolymph) within hours.</p>
                    </div>
                    <div className="step-box">
                        <strong style={{ fontSize: '1.2rem', color: '#f39c12' }}>Fish Populations</strong>
                        <p>Fish actively prey on plastics that resemble their natural food (e.g., juvenile fish mistaking white plastics for brine shrimp). Ingestion causes false satiation, intestinal blockage, and liver inflammation. Micro- and nanoplastics can cross epithelial barriers, causing neurotoxicity, behavioral disorders (locomotor suppression), and endocrine disruption.</p>
                    </div>
                    <div className="step-box">
                        <strong style={{ fontSize: '1.2rem', color: '#f39c12' }}>Apex Predators</strong>
                        <p>Seabirds (like fulmars), sea turtles, and marine mammals suffer from chronic ingestion. Plastics cause gastrointestinal obstruction, starvation, and reduced reproductive success. Large filter-feeding whales consume massive volumes of microplastics, risking severe immune modulation and microbiome disturbances.</p>
                    </div>
                </div>

                {/* 7. How Microplastics Reach Humans */}
                <div className="human-impact glass-hero" style={{ marginTop: '3rem' }}>
                    <h2 className="sub-glow-title gold">The Return to Humans: Bioaccumulation & Health Risks</h2>
                    
                    <div className="food-chain-visual">
                        <div className="content-image-wrapper" style={{ maxWidth: '800px', margin: '0 auto 30px auto' }}>
                            <img src={imgBioaccumulation} alt="Bioaccumulation diagram from ocean to mammals" />
                            <p className="image-caption">Microplastics and their associated chemical loads transfer and biomagnify through aquatic trophic levels, moving from lower organisms up to apex predators and humans[cite: 156, 886].</p>
                        </div>
                    </div>

                    <div className="impact-steps-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <div className="step-box">
                            <h3 style={{ color: '#27ae60' }}>Exposure Pathways</h3>
                            <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '1.6' }}>
                                <li><strong>Ingestion:</strong> Consuming contaminated seafood, especially bivalves (mussels, oysters) eaten whole with their digestive tracts intact. Microplastics are also prevalent in commercial table salt, honey, beer, tap water, and bottled water.</li>
                                <li><strong>Inhalation:</strong> Airborne synthetic fibers released from clothing, furnishings, and tire wear suspend in urban air and are absorbed deep into the human respiratory system.</li>
                                <li><strong>Dermal Contact:</strong> Minor exposure through contaminated water or specific cosmetics, allowing nanoplastics to penetrate compromised skin barriers.</li>
                            </ul>
                        </div>
                        <div className="step-box">
                            <h3 style={{ color: '#27ae60' }}>Clinical Findings & Health Impacts</h3>
                            <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '1.6' }}>
                                <li><strong>Systemic Circulation:</strong> Recent biomonitoring has verified the presence of microplastics in human blood, lung tissue, breast milk, feces, and placentas, indicating internal circulation and potential prenatal transfer.</li>
                                <li><strong>Cellular Damage:</strong> Laboratory studies on human cells show diminished cell viability, mitochondrial impairment, and the generation of reactive oxygen species (ROS).</li>
                                <li><strong>Chronic Diseases:</strong> Prolonged exposure is linked to inflammatory responses, immune dysregulation, DNA damage, and severe endocrine disruption driven by plastic additives like BPA and phthalates.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 8. AI Monitoring & The Future */}
                <div className="ai glass-hero tech-section" style={{ marginTop: '3rem' }}>
                    <h2 className="sub-glow-title gold">How AI & Technology Provide Solutions</h2>
                    <div className="ai-grid">
                        <div className="ai-log">
                            <strong>Standardized Detection</strong>
                            <p>Currently, variations in sampling and analysis (FTIR vs. Raman spectroscopy) make global data comparison difficult. AI and machine learning algorithms can standardize the visual and spectral classification of polymers, ensuring rapid, bias-free identification of microscopic threats.</p>
                        </div>
                        <div className="ai-log">
                            <strong>Predictive Ecological Modeling</strong>
                            <p>AI can process vast hydrodynamic and ecotoxicological datasets to map pollution hotspots, predict trophic transfer rates, and establish early warning indicators. This allows policymakers to prioritize interventions and upgrade wastewater infrastructure effectively.</p>
                        </div>
                    </div>
                </div>

                <div className="strong-message" style={{ marginTop: '40px', padding: '30px', fontSize: '1.5rem' }}>
                    “Plastic pollution does not end in the ocean — it returns through the food chain, invading our bodies and our future.” 
                </div>
            </div>
        </div>
      </Layout>
    );
};

export default EduAwareness;