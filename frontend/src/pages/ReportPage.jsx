

// export default ReportPage;
import React, { useContext, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import "./ReportPage.css";
import { Link, useLocation, useParams } from "react-router-dom";
import { SummaryStatsContext } from "../context/SummaryStatsContext";
import { API } from "../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const buildAnalyticsFromPayload = (payload) => {
  const results = Array.isArray(payload?.results) ? payload.results : [];
  const DPI = 96;
  const PIXEL_TO_MM2 = Math.pow(25.4 / DPI, 2);
  const typeCounts = { fiber: 0, fragment: 0, film: 0, pellet: 0 };
  const areaByType = { fiber: 0, fragment: 0, film: 0, pellet: 0 };
  let totalParticles = 0;
  let totalAreaPx = 0;

  results.forEach((img) => {
    (img.detection_details || []).forEach((det) => {
      const type = (det.type || "").toLowerCase();
      const areaPx = Number(det.area) || 0;
      if (typeCounts.hasOwnProperty(type)) {
        typeCounts[type] += 1;
        areaByType[type] += areaPx * PIXEL_TO_MM2;
        totalParticles += 1;
      }
      totalAreaPx += areaPx;
    });
  });

  return {
    imageCount: results.length,
    totalParticles,
    typeCounts,
    areaByType,
    totalArea: (totalAreaPx * PIXEL_TO_MM2).toFixed(4),
    mostCommon: totalParticles === 0 ? "N/A" : Object.keys(typeCounts).reduce((a, b) => typeCounts[b] > typeCounts[a] ? b : a),
    research: results[0]?.scientific_report || "Scientific data not found.",
  };
};

const ReportPage = () => {
  const context = useContext(SummaryStatsContext);
  const summaryStats = context?.summaryStats;
  const setSummaryStats = context?.setSummaryStats;
  const { id: batchId } = useParams();
  const location = useLocation();
  const [reportData, setReportData] = useState(location.state?.analysisData || null);
  const [loading, setLoading] = useState(Boolean(batchId) && !summaryStats);
  const [error, setError] = useState(null);

  const PIXEL_TO_MM = 0.1;
  const AREA_CONVERSION_FACTOR = Math.pow(PIXEL_TO_MM, 2);

  useEffect(() => {
    if (summaryStats || !batchId) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token") || localStorage.getItem("access");
    setLoading(true);

    fetch(API(`/batch/${batchId}/`), {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load report data.");
        return res.json();
      })
      .then((data) => {
        const normalizedData = {
          ...data,
          results: Array.isArray(data.results)
            ? data.results.map((item) => ({
                ...item,
                annotated_image: item.annotated_image || item.annotated_image_base64,
                graph_image: item.graph_image || item.graph_image_base64,
              }))
            : [],
        };
        setReportData(normalizedData);
        const analytics = buildAnalyticsFromPayload(normalizedData);
        if (setSummaryStats) setSummaryStats(analytics);
        setError(null);
      })
      .catch((err) => {
        console.error("Error loading report data:", err);
        setError(err.message || "Unable to load report data.");
      })
      .finally(() => setLoading(false));
  }, [batchId, summaryStats, setSummaryStats]);

  const analytics = useMemo(() => {
    if (summaryStats) return summaryStats;
    if (!reportData) return null;
    return buildAnalyticsFromPayload(reportData);
  }, [summaryStats, reportData]);

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: "center", marginTop: "50px" }}>
          Loading report data...
        </p>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <div style={{ textAlign: "center", marginTop: "50px", padding: "0 20px" }}>
          <h2>No report data available</h2>
          <p>{error || "Run an analysis first or open the report from a completed batch."}</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ padding: "12px 24px", display: "inline-block", marginTop: "12px" }}>
            Go to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  const toMm2 = (pxValue) => (Number(pxValue) || 0) * AREA_CONVERSION_FACTOR;
  const areaByType = analytics.areaByType || {
    fiber: 0,
    fragment: 0,
    film: 0,
    pellet: 0,
  };

  const totalAreaSumMm = Object.values(areaByType).reduce((acc, val) => acc + toMm2(val), 0);
  const avgAreaMm = analytics.totalParticles > 0 ? totalAreaSumMm / analytics.totalParticles : 0;

  const sizeBins = useMemo(() => {
    const bins = { "<0.5": 0, "0.5-1.0": 0, "1.0-5.0": 0, ">5.0": 0 };

    Object.values(areaByType).forEach((areaPx) => {
      const value = toMm2(areaPx);
      if (value < 0.5) bins["<0.5"] += 1;
      else if (value <= 1.0) bins["0.5-1.0"] += 1;
      else if (value <= 5.0) bins["1.0-5.0"] += 1;
      else bins[">5.0"] += 1;
    });

    return bins;
  }, [areaByType]);

  const totalSizes = Object.values(sizeBins).reduce((a, b) => a + b, 0);
  const sizePercentages = {};
  Object.keys(sizeBins).forEach((key) => {
    sizePercentages[key] = totalSizes > 0 ? (sizeBins[key] / totalSizes) * 100 : 0;
  });

  const typePercentages = {};
  Object.entries(analytics.typeCounts || {}).forEach(([type, count]) => {
    typePercentages[type] = analytics.totalParticles > 0 ? (count / analytics.totalParticles) * 100 : 0;
  });

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
              <div className="value">{analytics.totalParticles}</div>
              <div className="label">Total Particles</div>
            </div>
            <div className="stat-item">
              <div className="value">~{avgAreaMm.toFixed(3)} mm²</div>
              <div className="label">Avg Particle Area</div>
            </div>
            <div className="stat-item">
              <div className="value">{analytics.mostCommon?.toUpperCase() || "N/A"}</div>
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