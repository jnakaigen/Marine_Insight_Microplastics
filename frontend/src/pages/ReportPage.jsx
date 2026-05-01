

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