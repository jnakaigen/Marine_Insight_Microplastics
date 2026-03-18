// import React, { useEffect, useState } from 'react';
// import Layout from '../components/Layout';
// import './ReportPage.css';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import { useContext } from "react";
// import { SummaryStatsContext } from "../context/SummaryStatsContext";
// const ReportPage = () => {
   
//     const { summaryStats } = useContext(SummaryStatsContext);
//     if (!summaryStats) {
//         return (
//             <Layout>
//                 <p style={{ textAlign: "center", marginTop: "50px" }}>
//                     Loading report data...
//                 </p>
//             </Layout>
//         );
//     }
//     // Create bins for particle size
// const sizeBins = {
//     "<300": 0,
//     "300-500": 0,
//     "500-1000": 0,
//     ">1000": 0
// };

// summaryStats?.averageAreas && Object.entries(summaryStats.averageAreas).forEach(([type, area]) => {
//     // you could also calculate from actual data if available
//     if (area < 300) sizeBins["<300"]++;
//     else if (area <= 500) sizeBins["300-500"]++;
//     else if (area <= 1000) sizeBins["500-1000"]++;
//     else sizeBins[">1000"]++;
// });

// // Convert counts to percentages for bar heights
// const totalSizes = Object.values(sizeBins).reduce((a, b) => a + b, 0);
// const sizePercentages = {};
// Object.keys(sizeBins).forEach(key => {
//     sizePercentages[key] = totalSizes > 0 ? (sizeBins[key] / totalSizes) * 100 : 0;
// });

// // Morphological percentages
// const typePercentages = {};
// Object.entries(summaryStats.typeCounts || {}).forEach(([type, count]) => {
//     typePercentages[type] = summaryStats.totalParticles > 0 ? (count / summaryStats.totalParticles) * 100 : 0;
// });


//     return (
//         <Layout>
//             {/* ---------- Header ---------- */}
//             <div className="report-header">
//                 <h1>Microplastic Analysis Report</h1>
//             </div>

//             {/* ---------- Actions ---------- */}
//             <div className="report-actions">
//                 <button className="btn">Export Report</button>
//                 <button className="btn">Share Report</button>
//             </div>

//             {/* ---------- Overview ---------- */}
//             <section className="section-card">
//                 <h2 className="section-title">Analysis Overview</h2>
//                 <div className="stats-overview">
//                     <div className="stat-item">
//                         {/* <div className="value">18</div> */}<div className="value">{summaryStats.totalParticles}</div>
//                         <div className="label">Total Particles Detected</div>
//                     </div>
//                     <div className="stat-item">
//                         <div className="value">~656 px²</div>
//                         <div className="label">Average Particle Area</div>
//                     </div>
//                     <div className="stat-item">
//                         {/* <div className="value">Fragment</div> */}<div className="value">
//                             {/* {summaryStats.mostCommon.toUpperCase()} */}
//                             {summaryStats.mostCommon?.toUpperCase() || "N/A"}

//                         </div>
//                         <div className="label">Dominant Morphology</div>
//                     </div>
//                 </div>
//             </section>

//             {/* ---------- Morphological Summary ---------- */}
//             <section className="section-card">
//                 <h2 className="section-title">Particle Morphological Summary</h2>
//                 <table className="data-table">
//                     <thead>
//                         <tr>
//                             <th>Class</th>
//                             <th>Average Area (px²)</th>
//                             <th>Remarks</th>
//                         </tr>
//                     </thead>
//                     {/* <tbody>
//                         <tr>
//                             <td>Fiber</td>
//                             <td>~490</td>
//                             <td>Long, thin elongated shapes</td>
//                         </tr>
//                         <tr>
//                             <td>Fragment</td>
//                             <td>~1250</td>
//                             <td>Irregular, moderately circular</td>
//                         </tr>
//                         <tr>
//                             <td>Film</td>
//                             <td>~820</td>
//                             <td>Sheet-like structure</td>
//                         </tr>
//                         <tr>
//                             <td>Pellet</td>
//                             <td>~62</td>
//                             <td>Spherical microbeads</td>
//                         </tr>
//                     </tbody> */}
//                     {/* <tbody>
//                         {Object.entries(summaryStats.averageAreas).map(([type, area]) => (
//                             <tr key={type}>
//                                 <td>{type.toUpperCase()}</td>
//                                 <td>~{area.toFixed(0)}</td>
//                                 <td>Derived from batch analysis</td>
//                             </tr>
//                         ))}
//                     </tbody> */}
//                     <tbody>
//                         {Object.entries(summaryStats.averageAreas || {}).map(([type, area]) => (
//                             <tr key={type}>
//                                 <td>{type.toUpperCase()}</td>
//                                 <td>~{area.toFixed(0)}</td>
//                                 <td>Derived from batch analysis</td>
//                             </tr>
//                         ))}
//                     </tbody>

//                 </table>
//             </section>

//             {/* ---------- Charts ---------- */}
//             <section className="section-card">
//                 <div className="charts-container">
//                     <div className="chart">
//                         <h3 className="chart-title">Size Distribution</h3>

//                         {/* <div className="bar-chart">
//                             <div className="bar" style={{ height: '15%' }}>
//                                 <div className="bar-label">&lt;300 px²</div>
//                             </div>
//                             <div className="bar" style={{ height: '35%' }}>
//                                 <div className="bar-label">300–500 px²</div>
//                             </div>
//                             <div className="bar" style={{ height: '70%' }}>
//                                 <div className="bar-label">500–1000 px²</div>
//                             </div>
//                             <div className="bar" style={{ height: '95%' }}>
//                                 <div className="bar-label">&gt;1000 px²</div>
//                             </div>
//                         </div> */}
//                         <div className="bar-chart">
//     {Object.entries(sizePercentages).map(([label, percent]) => (
//         <div key={label} className="bar" style={{ height: `${percent}%` }}>
//             <div className="bar-label">{label} px²</div>
//         </div>
//     ))}
// </div>


//                     </div>


//                     {/* <div className="chart">
//                         <h3 className="chart-title">Morphological Distribution</h3>
//                         <div className="bar-chart">
//                             <div className="bar bar-green" style={{ height: '90%' }}>
//                                 <div className="bar-label">Fiber</div>
//                             </div>
//                             <div className="bar bar-green" style={{ height: '65%' }}>
//                                 <div className="bar-label">Fragment</div>
//                             </div>
//                             <div className="bar bar-green" style={{ height: '45%' }}>
//                                 <div className="bar-label">Film</div>
//                             </div>
//                             <div className="bar bar-green" style={{ height: '25%' }}>
//                                 <div className="bar-label">Pellet</div>
//                             </div>
//                         </div>
                       

//                     </div> */}
//                     <div className="chart">
//     <h3 className="chart-title">Morphological Distribution</h3>
//     <div className="bar-chart">
//         {Object.entries(typePercentages).map(([type, percent]) => (
//             <div key={type} className="bar bar-green" style={{ height: `${percent}%` }}>
//                 <div className="bar-label">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
//             </div>
//         ))}
//     </div>
// </div>

//                 </div>
//             </section>

//             {/* ---------- Insights ---------- */}
//             <section className="section-card">
//                 <h2 className="section-title">AI Insights & Interpretation</h2>
//                 <ul className="insights-list">
//                     <li>
//                         The analysis confirms that <strong>fragments dominate</strong> the dataset with large areas (~1250 px²),
//                         exhibiting near-circular shapes and moderate size. matching their elongated textile morphology.
//                     </li>
//                     <li>
//                         <strong>Fibers</strong> matching their elongated textile morphology (~490 px²).
//                     </li>
//                     <li>
//                         <strong>Films</strong> show flexible, variable forms, indicating thin sheet-like particles (~820 px²).
//                     </li>
//                     <li>
//                         <strong>Pellets</strong> have small areas (~62 px²), suggesting spherical industrial microbeads.
//                     </li>
//                     <li>
//                         Overall, these quantitative shape metrics validate the model’s
//                         ability to distinguish between microplastic morphologies with measurable precision.
//                     </li>
//                 </ul>

//             </section>

//             {/* ---------- CTA ---------- */}
//             <div style={{ textAlign: 'center', marginTop: '20px' }}>
//                 <Link
//                     to="/upload"
//                     className="btn btn-primary"
//                     style={{ padding: '15px 40px', fontSize: '1.1em' }}
//                 >
//                     Start New Analysis
//                 </Link>
//             </div>
//         </Layout>
//     );
// };

// export default ReportPage;


// import React, { useContext } from "react";
// import Layout from "../components/Layout";
// import "./ReportPage.css";
// import { Link } from "react-router-dom";
// import { SummaryStatsContext } from "../context/SummaryStatsContext";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// const ReportPage = () => {
//   const { summaryStats } = useContext(SummaryStatsContext);

//   if (!summaryStats) {
//     return (
//       <Layout>
//         <p style={{ textAlign: "center", marginTop: "50px" }}>
//           Loading report data...
//         </p>
//       </Layout>
//     );
//   }

//   // ---------- Particle Size Bins ----------
//   const sizeBins = {
//     "<300": 0,
//     "300-500": 0,
//     "500-1000": 0,
//     ">1000": 0,
//   };

//   summaryStats?.averageAreas &&
//     Object.entries(summaryStats.averageAreas).forEach(([type, area]) => {
//       if (area < 300) sizeBins["<300"]++;
//       else if (area <= 500) sizeBins["300-500"]++;
//       else if (area <= 1000) sizeBins["500-1000"]++;
//       else sizeBins[">1000"]++;
//     });

//   const totalSizes = Object.values(sizeBins).reduce((a, b) => a + b, 0);
//   const sizePercentages = {};
//   Object.keys(sizeBins).forEach((key) => {
//     sizePercentages[key] =
//       totalSizes > 0 ? (sizeBins[key] / totalSizes) * 100 : 0;
//   });

//   // ---------- Morphological Percentages ----------
//   const typePercentages = {};
//   Object.entries(summaryStats.typeCounts || {}).forEach(([type, count]) => {
//     typePercentages[type] =
//       summaryStats.totalParticles > 0 ? (count / summaryStats.totalParticles) * 100 : 0;
//   });

//   // ---------- Export PDF Function ----------
//   const handleExportPDF = () => {
//     const input = document.getElementById("reportContent");
//     html2canvas(input, { scale: 2 }).then((canvas) => {
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "mm", "a4");
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

//       if (pdfHeight < pdf.internal.pageSize.getHeight()) {
//         pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//       } else {
//         let heightLeft = pdfHeight;
//         let position = 0;
//         while (heightLeft > 0) {
//           pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
//           heightLeft -= pdf.internal.pageSize.getHeight();
//           position -= pdf.internal.pageSize.getHeight();
//           if (heightLeft > 0) pdf.addPage();
//         }
//       }
//       pdf.save("Microplastic_Report.pdf");
//     });
//   };

//   return (
//     <Layout>
//       {/* Wrap entire report content in a div for PDF capture */}
//       <div id="reportContent">
//         {/* ---------- Header ---------- */}
//         <div className="report-header">
//           <h1>Microplastic Analysis Report</h1>
//         </div>

//         {/* ---------- Actions ---------- */}
//         <div className="report-actions">
//           <button className="btn" onClick={handleExportPDF}>
//             Export Report
//           </button>
//           <button className="btn">Share Report</button>
//         </div>

//         {/* ---------- Overview ---------- */}
//         <section className="section-card">
//           <h2 className="section-title">Analysis Overview</h2>
//           <div className="stats-overview">
//             <div className="stat-item">
//               <div className="value">{summaryStats.totalParticles}</div>
//               <div className="label">Total Particles Detected</div>
//             </div>
//             <div className="stat-item">
//               <div className="value">~656 px²</div>
//               <div className="label">Average Particle Area</div>
//             </div>
//             <div className="stat-item">
//               <div className="value">{summaryStats.mostCommon?.toUpperCase() || "N/A"}</div>
//               <div className="label">Dominant Morphology</div>
//             </div>
//           </div>
//         </section>

//         {/* ---------- Morphological Summary ---------- */}
//         <section className="section-card">
//           <h2 className="section-title">Particle Morphological Summary</h2>
//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th>Class</th>
//                 <th>Average Area (px²)</th>
//                 <th>Remarks</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.entries(summaryStats.averageAreas || {}).map(([type, area]) => (
//                 <tr key={type}>
//                   <td>{type.toUpperCase()}</td>
//                   <td>~{area.toFixed(0)}</td>
//                   <td>Derived from batch analysis</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </section>

//         {/* ---------- Charts ---------- */}
//         <section className="section-card">
//           <div className="charts-container">
//             <div className="chart">
//               <h3 className="chart-title">Size Distribution</h3>
//               <div className="bar-chart">
//                 {Object.entries(sizePercentages).map(([label, percent]) => (
//                   <div key={label} className="bar" style={{ height: `${percent}%` }}>
//                     <div className="bar-label">{label} px²</div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="chart">
//               <h3 className="chart-title">Morphological Distribution</h3>
//               <div className="bar-chart">
//                 {Object.entries(typePercentages).map(([type, percent]) => (
//                   <div key={type} className="bar bar-green" style={{ height: `${percent}%` }}>
//                     <div className="bar-label">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ---------- Insights ---------- */}
//         <section className="section-card">
//           <h2 className="section-title">AI Insights & Interpretation</h2>
//           <ul className="insights-list">
//             <li>
//               The analysis confirms that <strong>fragments dominate</strong> the dataset with large areas (~1250 px²),
//               exhibiting near-circular shapes and moderate size. matching their elongated textile morphology.
//             </li>
//             <li>
//               <strong>Fibers</strong> matching their elongated textile morphology (~490 px²).
//             </li>
//             <li>
//               <strong>Films</strong> show flexible, variable forms, indicating thin sheet-like particles (~820 px²).
//             </li>
//             <li>
//               <strong>Pellets</strong> have small areas (~62 px²), suggesting spherical industrial microbeads.
//             </li>
//             <li>
//               Overall, these quantitative shape metrics validate the model’s
//               ability to distinguish between microplastic morphologies with measurable precision.
//             </li>
//           </ul>
//         </section>

//         {/* ---------- CTA ---------- */}
//         <div style={{ textAlign: "center", marginTop: "20px" }}>
//           <Link
//             to="/upload"
//             className="btn btn-primary"
//             style={{ padding: "15px 40px", fontSize: "1.1em" }}
//           >
//             Start New Analysis
//           </Link>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default ReportPage;
// import React, { useContext, useMemo } from "react";
// import Layout from "../components/Layout";
// import "./ReportPage.css";
// import { Link } from "react-router-dom";
// import { SummaryStatsContext } from "../context/SummaryStatsContext";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// const ReportPage = () => {
//   const { summaryStats } = useContext(SummaryStatsContext);

//   if (!summaryStats) {
//     return (
//       <Layout>
//         <p style={{ textAlign: "center", marginTop: "50px" }}>
//           Loading report data...
//         </p>
//       </Layout>
//     );
//   }

//   // ---------- SAFE AREA DATA ----------
//   const areaByType = summaryStats.areaByType || {
//     fiber: 0,
//     fragment: 0,
//     film: 0,
//     pellet: 0,
//   };

//  const totalAreaSum = Object.values(areaByType).reduce((acc, val) => acc + Number(val), 0);
// const avgArea = summaryStats.totalParticles > 0 
//   ? totalAreaSum / summaryStats.totalParticles 
//   : 0;

//   // ---------- SIZE DISTRIBUTION (FIXED) ----------
//   const sizeBins = useMemo(() => {
//     const bins = {
//       "<300": 0,
//       "300-500": 0,
//       "500-1000": 0,
//       ">1000": 0,
//     };

//     Object.values(areaByType).forEach((area) => {
//       const value = Number(area) || 0;
//       if (value < 300) bins["<300"]++;
//       else if (value <= 500) bins["300-500"]++;
//       else if (value <= 1000) bins["500-1000"]++;
//       else bins[">1000"]++;
//     });

//     return bins;
//   }, [areaByType]);

//   const totalSizes = Object.values(sizeBins).reduce((a, b) => a + b, 0);

//   const sizePercentages = {};
//   Object.keys(sizeBins).forEach((key) => {
//     sizePercentages[key] =
//       totalSizes > 0 ? (sizeBins[key] / totalSizes) * 100 : 0;
//   });

//   // ---------- MORPHOLOGICAL PERCENTAGES ----------
//   const typePercentages = {};
//   Object.entries(summaryStats.typeCounts || {}).forEach(([type, count]) => {
//     typePercentages[type] =
//       summaryStats.totalParticles > 0
//         ? (count / summaryStats.totalParticles) * 100
//         : 0;
//   });

//   // ---------- EXPORT PDF ----------
//   const handleExportPDF = () => {
//     const input = document.getElementById("reportContent");
//     html2canvas(input, { scale: 2 }).then((canvas) => {
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "mm", "a4");
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

//       if (pdfHeight < pdf.internal.pageSize.getHeight()) {
//         pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//       } else {
//         let heightLeft = pdfHeight;
//         let position = 0;
//         while (heightLeft > 0) {
//           pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
//           heightLeft -= pdf.internal.pageSize.getHeight();
//           position -= pdf.internal.pageSize.getHeight();
//           if (heightLeft > 0) pdf.addPage();
//         }
//       }
//       pdf.save("Microplastic_Report.pdf");
//     });
//   };

//   return (
//     <Layout>
//       <div id="reportContent">
//         {/* HEADER */}
//         <div className="report-header">
//           <h1>Microplastic Analysis Report</h1>
//         </div>

//         {/* ACTIONS */}
//         <div className="report-actions">
//           <button className="btn" onClick={handleExportPDF}>
//             Export Report
//           </button>
//           <button className="btn">Share Report</button>
//         </div>

//         {/* OVERVIEW */}
//         <section className="section-card">
//           <h2 className="section-title">Analysis Overview</h2>
//           <div className="stats-overview">
//             <div className="stat-item">
//               <div className="value">{summaryStats.totalParticles}</div>
//               <div className="label">Total Particles Detected</div>
//             </div>

//             {/* ✅ FIXED (Dynamic) */}
//             <div className="stat-item">
//               <div className="value">~{Number(avgArea).toFixed(2)} px²</div>
//               <div className="label">Average Particle Area</div>
//             </div>

//             <div className="stat-item">
//               <div className="value">
//                 {summaryStats.mostCommon?.toUpperCase() || "N/A"}
//               </div>
//               <div className="label">Dominant Morphology</div>
//             </div>
//           </div>
//         </section>

//         {/* MORPHOLOGICAL TABLE (FIXED) */}
//         <section className="section-card">
//           <h2 className="section-title">Particle Morphological Summary</h2>
//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th>Class</th>
//                 <th>Total Area (px²)</th>
//                 <th>Remarks</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.entries(areaByType).map(([type, area]) => (
//                 <tr key={type}>
//                   <td>{type.toUpperCase()}</td>
//                   <td>{Number(area).toFixed(2)}</td>
//                   <td>Derived from batch detection analytics</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </section>

//         {/* CHARTS */}
//         <section className="section-card">
//           <div className="charts-container">
//             <div className="chart">
//               <h3 className="chart-title">Size Distribution</h3>
//               <div className="bar-chart">
//                 {Object.entries(sizePercentages).map(([label, percent]) => (
//                   <div
//                     key={label}
//                     className="bar"
//                     style={{ height: `${percent}%` }}
//                   >
//                     <div className="bar-label">{label} px²</div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="chart">
//               <h3 className="chart-title">Morphological Distribution</h3>
//               <div className="bar-chart">
//                 {Object.entries(typePercentages).map(([type, percent]) => (
//                   <div
//                     key={type}
//                     className="bar bar-green"
//                     style={{ height: `${percent}%` }}
//                   >
//                     <div className="bar-label">
//                       {type.charAt(0).toUpperCase() + type.slice(1)}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* CTA */}
//         <div style={{ textAlign: "center", marginTop: "20px" }}>
//           <Link
//             to="/qa"
//             className="btn btn-primary"
//             style={{ padding: "15px 40px", fontSize: "1.1em" }}
//           >
//             Start New Analysis
//           </Link>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default ReportPage;
import React, { useContext, useMemo } from "react";
import Layout from "../components/Layout";
import "./ReportPage.css";
import { Link } from "react-router-dom";
import { SummaryStatsContext } from "../context/SummaryStatsContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ReportPage = () => {
  const { summaryStats } = useContext(SummaryStatsContext);

  // Define conversion factor (Example: 1px = 0.1mm, so 1px² = 0.01mm²)
  // Adjust 'PIXEL_TO_MM' based on your specific camera calibration
  const PIXEL_TO_MM = 0.1; 
  const AREA_CONVERSION_FACTOR = Math.pow(PIXEL_TO_MM, 2);

  if (!summaryStats) {
    return (
      <Layout>
        <p style={{ textAlign: "center", marginTop: "50px" }}>
          Loading report data...
        </p>
      </Layout>
    );
  }

  // ---------- DATA CONVERSION HELPER ----------
  const toMm2 = (pxValue) => (Number(pxValue) || 0) * AREA_CONVERSION_FACTOR;

  // ---------- SAFE AREA DATA (Converted) ----------
  const areaByType = summaryStats.areaByType || {
    fiber: 0,
    fragment: 0,
    film: 0,
    pellet: 0,
  };

  const totalAreaSumMm = Object.values(areaByType).reduce(
    (acc, val) => acc + toMm2(val), 
    0
  );

  const avgAreaMm = summaryStats.totalParticles > 0 
    ? totalAreaSumMm / summaryStats.totalParticles 
    : 0;

  // ---------- SIZE DISTRIBUTION (Logic updated for mm²) ----------
  const sizeBins = useMemo(() => {
    const bins = {
      "<0.5": 0,
      "0.5-1.0": 0,
      "1.0-5.0": 0,
      ">5.0": 0,
    };

    Object.values(areaByType).forEach((areaPx) => {
      const value = toMm2(areaPx);
      if (value < 0.5) bins["<0.5"]++;
      else if (value <= 1.0) bins["0.5-1.0"]++;
      else if (value <= 5.0) bins["1.0-5.0"]++;
      else bins[">5.0"]++;
    });

    return bins;
  }, [areaByType]);

  const totalSizes = Object.values(sizeBins).reduce((a, b) => a + b, 0);
  const sizePercentages = {};
  Object.keys(sizeBins).forEach((key) => {
    sizePercentages[key] = totalSizes > 0 ? (sizeBins[key] / totalSizes) * 100 : 0;
  });

  // ---------- MORPHOLOGICAL PERCENTAGES ----------
  const typePercentages = {};
  Object.entries(summaryStats.typeCounts || {}).forEach(([type, count]) => {
    typePercentages[type] =
      summaryStats.totalParticles > 0 ? (count / summaryStats.totalParticles) * 100 : 0;
  });

  // ---------- EXPORT PDF ----------
  const handleExportPDF = () => {
    const input = document.getElementById("reportContent");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      if (pdfHeight < pdf.internal.pageSize.getHeight()) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      } else {
        let heightLeft = pdfHeight;
        let position = 0;
        while (heightLeft > 0) {
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
          position -= pdf.internal.pageSize.getHeight();
          if (heightLeft > 0) pdf.addPage();
        }
      }
      pdf.save("Microplastic_Report.pdf");
    });
  };

  return (
    <Layout>
      <div id="reportContent">
        <div className="report-header">
          <h1>Microplastic Analysis Report</h1>
        </div>

        <div className="report-actions">
          <button className="btn" onClick={handleExportPDF}>Export Report</button>
          <button className="btn">Share Report</button>
        </div>

        <section className="section-card">
          <h2 className="section-title">Analysis Overview</h2>
          <div className="stats-overview">
            <div className="stat-item">
              <div className="value">{summaryStats.totalParticles}</div>
              <div className="label">Total Particles</div>
            </div>
            <div className="stat-item">
              <div className="value">~{avgAreaMm.toFixed(3)} mm²</div>
              <div className="label">Avg Particle Area</div>
            </div>
            <div className="stat-item">
              <div className="value">{summaryStats.mostCommon?.toUpperCase() || "N/A"}</div>
              <div className="label">Dominant Morphology</div>
            </div>
          </div>
        </section>

        <section className="section-card">
          <h2 className="section-title">Particle Morphological Summary</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Total Area (mm²)</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(areaByType).map(([type, area]) => (
                <tr key={type}>
                  <td>{type.toUpperCase()}</td>
                  <td>{toMm2(area).toFixed(4)}</td>
                  <td>Metric conversion applied</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="section-card">
          <div className="charts-container">
            <div className="chart">
              <h3 className="chart-title">Size Distribution (mm²)</h3>
              <div className="bar-chart">
                {Object.entries(sizePercentages).map(([label, percent]) => (
                  <div key={label} className="bar" style={{ height: `${percent}%` }}>
                    <div className="bar-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart">
              <h3 className="chart-title">Morphological Distribution</h3>
              <div className="bar-chart">
                {Object.entries(typePercentages).map(([type, percent]) => (
                  <div key={type} className="bar bar-green" style={{ height: `${percent}%` }}>
                    <div className="bar-label">{type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/qa" className="btn btn-primary" style={{ padding: "15px 40px" }}>
            Start New Analysis
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ReportPage;