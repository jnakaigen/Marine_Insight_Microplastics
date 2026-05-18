// import React, { useState } from 'react';
// import axios from 'axios';

// function Analysis() {
//   const [file, setFile] = useState(null);
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [preview, setPreview] = useState(null);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     setFile(selectedFile);
//     setPreview(URL.createObjectURL(selectedFile)); // Show the image before analyzing
//   };

//   const analyzeImage = async () => {
//     if (!file) return alert("Please upload a microscopic image!");
    
//     setLoading(true);
//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const response = await axios.post('https://marine-insight-microplastics.onrender.com/detect', formData);
//       setData(response.data);
//     } catch (error) {
//       console.error("Connection Error:", error);
//       alert("Backend not running! Start uvicorn first.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
//       <h2 style={{ color: '#005f73' }}>MarineInsight Analysis Tool</h2>
//       <p>Upload your microscopic sample to calculate count, shape, and size.</p>

//       {/* Upload Section */}
//       <div style={{ border: '2px dashed #94d2bd', padding: '30px', textAlign: 'center', borderRadius: '15px' }}>
//         <input type="file" onChange={handleFileChange} accept="image/*" />
//         {preview && <img src={preview} alt="Preview" style={{ width: '200px', display: 'block', margin: '20px auto' }} />}
        
//         <button 
//           onClick={analyzeImage} 
//           disabled={loading}
//           style={{ padding: '10px 20px', backgroundColor: '#005f73', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
//         >
//           {loading ? "AI is Processing..." : "Start Detection"}
//         </button>
//       </div>

//       {/* Result Section (Matching PPT Page 21) */}
//       {data && (
//         <div style={{ marginTop: '40px' }}>
//           <h3>Detection Report</h3>
//           <p><strong>Total Microplastics Found:</strong> {data.total}</p>
          
//           <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
//             <thead>
//               <tr style={{ backgroundColor: '#e9d8a6' }}>
//                 <th style={{ border: '1px solid #ddd', padding: '8px' }}>Particle ID</th>
//                 <th style={{ border: '1px solid #ddd', padding: '8px' }}>Shape / Category</th>
//                 <th style={{ border: '1px solid #ddd', padding: '8px' }}>Area (px²)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.details.map((item, index) => (
//                 <tr key={index}>
//                   <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
//                   <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.type}</td>
//                   <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.area.toFixed(2)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Analysis;
import React, { useState } from 'react';
import axios from 'axios';

function Analysis() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setData(null); // Clear old results when a new file is picked
    }
  };

  const analyzeImage = async () => {
    if (!file) return alert("Please upload a microscopic image!");
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file); // Matches request.FILES['file'] in Django

    try {
      // Ensure this matches your Django URL
      const response = await axios.post('http://localhost:8000/api/detect/', formData);
      setData(response.data);
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Error: Make sure the Django backend is running and CORS is configured!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2 style={{ color: '#005f73', textAlign: 'center' }}>MarineInsight Analysis Tool</h2>
      <p style={{ textAlign: 'center' }}>AI-powered detection of microplastic count, shape, and size.</p>

      {/* Upload Section */}
      <div style={{ border: '2px dashed #94d2bd', padding: '30px', textAlign: 'center', borderRadius: '15px', backgroundColor: '#f9f9f9' }}>
        <input type="file" onChange={handleFileChange} accept="image/*" style={{ marginBottom: '20px' }} />
        
        <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Show AI Result if available, otherwise show preview */}
            {data ? (
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div>
                        <h4 style={{ color: '#005f73' }}>Annotated Result</h4>
                        <img src={data.annotated_image} alt="AI Result" style={{ width: '100%', maxWidth: '450px', borderRadius: '10px', border: '3px solid #005f73' }} />
                    </div>
                    {data.graph_image && (
                      <div>
                          <h4 style={{ color: '#005f73' }}>Area Distribution</h4>
                          <img src={data.graph_image} alt="Analysis Graph" style={{ width: '100%', maxWidth: '400px', borderRadius: '10px' }} />
                      </div>
                    )}
                </div>
            ) : (
                preview && (
                    <div>
                        <h4>Image Preview</h4>
                        <img src={preview} alt="Preview" style={{ width: '300px', borderRadius: '5px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
                    </div>
                )
            )}
        </div>
        
        <button 
          onClick={analyzeImage} 
          disabled={loading}
          style={{ 
            padding: '12px 25px', 
            backgroundColor: loading ? '#ccc' : '#005f73', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? "AI is Processing..." : "Start Detection"}
        </button>
      </div>

      {/* Result Table Section */}
      {data && (
        <div style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#005f73' }}>Ecological Risk Report</h3>
            <span style={{ backgroundColor: '#005f73', color: 'white', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold' }}>
                Total Particles: {data.total_detections}
            </span>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 15px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9d8a6', color: '#005f73' }}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Area (px²)</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Risk Assessment</th>
              </tr>
            </thead>
            <tbody>
              {data.detections.map((item, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}><strong>{item.type}</strong></td>
                  <td style={styles.td}>{item.area.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: item.priority === 'CRITICAL' ? '#d90429' : item.priority === 'HIGH' ? '#f77f00' : '#fcbf49'
                    }}>
                      {item.priority}
                    </span>
                  </td>
                  <td style={styles.td}>{item.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  th: { border: '1px solid #ddd', padding: '12px', textAlign: 'left' },
  td: { border: '1px solid #ddd', padding: '10px' }
};

export default Analysis;