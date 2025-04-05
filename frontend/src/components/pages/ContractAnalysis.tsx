// both options but upload only working

import React, { useState, useRef } from "react";
import axios from "axios";
import { Upload, AlertTriangle, CheckCircle, Info, Shield, Download, Camera } from "lucide-react";

interface AnalysisResult {
  analysis: string;
  timestamp: number;
}

export default function ContractAnalysis() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [tempAnalysis, setTempAnalysis] = useState<AnalysisResult | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      // Store current analysis if it exists
      if (analysis) {
        setTempAnalysis(analysis);
      }
      setAnalysis(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
      setFile(droppedFile);
      if (analysis) {
        setTempAnalysis(analysis);
      }
      setAnalysis(null);
    }
  };

  const startCamera = async () => {
    try {
      // Store current analysis if it exists
      if (analysis) {
        setTempAnalysis(analysis);
      }
      setAnalysis(null);
      setFile(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Failed to access camera. Please ensure camera permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    // Restore previous analysis if it exists
    if (tempAnalysis) {
      setAnalysis(tempAnalysis);
      setTempAnalysis(null);
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if using front camera
    if (video.style.transform.includes('scaleX(-1)')) {
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const capturedFile = new File([blob], "captured-document.jpg", { 
          type: "image/jpeg",
          lastModified: Date.now()
        });
        setFile(capturedFile);
        stopCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  const analyzeContract = async () => {
    if (!file) {
      setError("Please upload a contract file or capture an image.");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("contract", file);

    try {
      const response = await axios.post("http://localhost:5001/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.analysis) {
        const newAnalysis: AnalysisResult = {
          analysis: response.data.analysis,
          timestamp: Date.now()
        };
        setAnalysis(newAnalysis);
        setTempAnalysis(null); // Clear any stored temporary analysis
      } else {
        setError("No analysis result returned.");
      }
    } catch (error) {
      console.error("Error analyzing contract:", error);
      setError("Failed to analyze the contract.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!analysis || !file) return;

    const reportContent = `Contract Analysis Report
Generated: ${new Date(analysis.timestamp).toLocaleString()}
File: ${file.name}

${analysis.analysis}`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-analysis-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderAnalysisContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.toLowerCase().includes('risk') || line.toLowerCase().includes('warning')) {
        return (
          <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <p>{line}</p>
          </div>
        );
      }
      if (line.toLowerCase().includes('compliance') || line.toLowerCase().includes('violation') || line.toLowerCase().includes('obligations')) {
        return (
          <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg mb-2">
            <Info className="w-5 h-5 text-yellow-500 mt-0.5" />
            <p>{line}</p>
          </div>
        );
      }
      if (line.toLowerCase().includes('recommendations') || line.toLowerCase().includes('approved') || line.toLowerCase().includes('safe')) {
        return (
          <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg mb-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <p>{line}</p>
          </div>
        );
      }
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contract Analysis</h1>
        <p className="text-gray-600 mt-2">AI-powered contract review and risk assessment</p>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {showCamera ? (
            <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 flex justify-center gap-4">
                <button
                  onClick={captureImage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drop your contract here</h3>
              <p className="text-gray-500 mb-4">or</p>
              <div className="flex justify-center gap-4">
                <input 
                  type="file" 
                  className="hidden" 
                  id="file-upload" 
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,image/*"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Browse Files
                </label>
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Use Camera
                </button>
              </div>
              {file && <p className="mt-4 text-sm text-gray-500">{file.name}</p>}
            </div>
          )}

          <button
            onClick={analyzeContract}
            disabled={!file || loading}
            className={`mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full transition-colors ${
              loading || !file ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Analyzing..." : "Analyze Contract"}
          </button>

          {error && (
            <div className="mt-8 bg-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {analysis && (
            <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Analysis Results</h3>
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
              <div className="space-y-2">
                {renderAnalysisContent(analysis.analysis)}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Analysis Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Risk Assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Compliance Check</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Clause Analysis</span>
              </div>
            </div>
          </div>

          {analysis && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Quick Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  <span>Analysis completed {new Date(analysis.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  <span>Report available for download</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}











// // perffect working but only single option upload

// import React, { useState } from "react";
// import axios from "axios";
// import { Upload, AlertTriangle, CheckCircle, Info, Shield, Download } from "lucide-react";

// export default function ContractAnalysis() {
//   const [isDragging, setIsDragging] = useState(false);
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [analysis, setAnalysis] = useState<any | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files) {
//       setFile(event.target.files[0]);
//     }
//   };

//   const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//     event.preventDefault();
//     setIsDragging(false);
//     if (event.dataTransfer.files.length > 0) {
//       setFile(event.dataTransfer.files[0]);
//     }
//   };

//   const analyzeContract = async () => {
//     if (!file) {
//       alert("Please upload a contract file.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     const formData = new FormData();
//     formData.append("contract", file);

//     try {
//       const response = await axios.post("http://localhost:5001/analyze", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.data?.analysis) {
//         setAnalysis(response.data.analysis);
//       } else {
//         setError("No analysis result returned.");
//       }
//     } catch (error) {
//       console.error("Error analyzing contract:", error);
//       setError("Failed to analyze the contract.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadReport = () => {
//     if (!analysis || !file) return;

//     const reportContent = `Contract Analysis Report
// Generated: ${new Date().toLocaleString()}
// File: ${file.name}

// ${analysis}`;

//     const blob = new Blob([reportContent], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `contract-analysis-${new Date().toISOString().slice(0,10)}.txt`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   const renderAnalysisContent = (content: string) => {
//     return content.split('\n').map((line, index) => {
//       // Highlight risks
//       if (line.toLowerCase().includes('risk') || line.toLowerCase().includes('warning')) {
//         return (
//           <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg mb-2">
//             <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
//             <p>{line}</p>
//           </div>
//         );
//       }
//       // Highlight positive findings
//       if (line.toLowerCase().includes('compliance issues') || line.toLowerCase().includes('approved') || line.toLowerCase().includes('violation') || line.toLowerCase().includes('obligations')) {
//         return (
//           <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg mb-2">
//             <CheckCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
//             <p>{line}</p>
//           </div>
//         );
//       }
//       if (line.toLowerCase().includes('recommendations') || line.toLowerCase().includes('approved') || line.toLowerCase().includes('safety') || line.toLowerCase().includes('safe') || line.toLowerCase().includes('approval') || line.toLowerCase().includes('alternative')) {
//         return (
//           <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg mb-2">
//             <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
//             <p>{line}</p>
//           </div>
//         );
//       }
//       // Regular lines
//       return <p key={index} className="mb-2">{line}</p>;
//     });
//   };

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Contract Analysis</h1>
//         <p className="text-gray-600 mt-2">AI-powered contract review and risk assessment</p>
//       </header>

//       <div className="grid grid-cols-3 gap-6">
//         <div className="col-span-2">
//           <div
//             className={`border-2 border-dashed rounded-lg p-8 text-center ${
//               isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
//             }`}
//             onDragOver={(e) => {
//               e.preventDefault();
//               setIsDragging(true);
//             }}
//             onDragLeave={() => setIsDragging(false)}
//             onDrop={handleDrop}
//           >
//             <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold mb-2">Drop your contract here</h3>
//             <p className="text-gray-500 mb-4">or</p>
//             <input 
//               type="file" 
//               className="hidden" 
//               id="file-upload" 
//               onChange={handleFileUpload}
//               accept=".pdf,.doc,.docx,.txt"
//             />
//             <label
//               htmlFor="file-upload"
//               className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Browse Files
//             </label>
//             {file && <p className="mt-4 text-sm text-gray-500">{file.name}</p>}
//           </div>

//           <button
//             onClick={analyzeContract}
//             disabled={!file || loading}
//             className={`mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
//               loading || !file ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//           >
//             {loading ? "Analyzing..." : "Analyze Contract"}
//           </button>

//           {error && (
//             <div className="mt-8 bg-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2">
//               <AlertTriangle className="w-5 h-5" />
//               <span>{error}</span>
//             </div>
//           )}

//           {analysis && (
//             <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold">Analysis Results</h3>
//                 <button
//                   onClick={downloadReport}
//                   className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
//                 >
//                   <Download className="w-4 h-4" />
//                   Download Report
//                 </button>
//               </div>
//               <div className="space-y-2">
//                 {renderAnalysisContent(analysis)}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="space-y-6">
//           <div className="bg-white rounded-lg p-6 shadow-sm">
//             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//               <Shield className="w-5 h-5 text-blue-600" />
//               Analysis Features
//             </h3>
//             <div className="space-y-3">
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-5 h-5 text-green-500" />
//                 <span>Risk Assessment</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-5 h-5 text-green-500" />
//                 <span>Compliance Check</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-5 h-5 text-green-500" />
//                 <span>Clause Analysis</span>
//               </div>
//             </div>
//           </div>

//           {analysis && (
//             <div className="bg-white rounded-lg p-6 shadow-sm">
//               <h3 className="text-lg font-semibold mb-4">Quick Summary</h3>
//               <div className="space-y-3">
//                 <div className="flex items-center gap-2">
//                   <Info className="w-5 h-5 text-blue-500" />
//                   <span>Analysis completed</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Info className="w-5 h-5 text-blue-500" />
//                   <span>Report available for download</span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }











// shravan 

// import React, { useState } from "react";
// import axios from "axios";
// import { Upload, AlertTriangle, CheckCircle, Info, Shield } from "lucide-react";

// export default function ContractAnalysis() {
//   const [isDragging, setIsDragging] = useState(false);
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [analysis, setAnalysis] = useState<any | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files) {
//       setFile(event.target.files[0]);
//     }
//   };

//   const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
//     event.preventDefault();
//     setIsDragging(false);
//     if (event.dataTransfer.files.length > 0) {
//       setFile(event.dataTransfer.files[0]);
//     }
//   };

//   const analyzeContract = async () => {
//     if (!file) {
//       alert("Please upload a contract file.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     const formData = new FormData();
//     formData.append("contract", file);

//     try {
//       const response = await axios.post("http://localhost:5001/analyze", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.data?.analysis) {
//         setAnalysis(response.data.analysis);
//         console.log(response.data.analysis);
//       } else {
//         setError("No analysis result returned.");
//       }
//     } catch (error) {
//       console.error("Error analyzing contract:", error);
//       setError("Failed to analyze the contract.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Contract Analysis</h1>
//         <p className="text-gray-600 mt-2">AI-powered contract review and risk assessment</p>
//       </header>

//       <div className="grid grid-cols-3 gap-6">
//         <div className="col-span-2">
//           <div
//             className={`border-2 border-dashed rounded-lg p-8 text-center ${
//               isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
//             }`}
//             onDragOver={(e) => {
//               e.preventDefault();
//               setIsDragging(true);
//             }}
//             onDragLeave={() => setIsDragging(false)}
//             onDrop={handleDrop}
//           >
//             <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold mb-2">Drop your contract here</h3>
//             <p className="text-gray-500 mb-4">or</p>
//             <input type="file" className="hidden" id="file-upload" onChange={handleFileUpload} />
//             <label
//               htmlFor="file-upload"
//               className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Browse Files
//             </label>
//             {file && <p className="mt-4 text-sm text-gray-500">{file.name}</p>}
//           </div>

//           <button
//             onClick={analyzeContract}
//             disabled={!file || loading}
//             className={`mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
//               loading ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//           >
//             {loading ? "Analyzing..." : "Analyze Contract"}
//           </button>

//           {error && (
//             <div className="mt-8 bg-red-100 text-red-700 p-4 rounded-lg">
//               <AlertTriangle className="w-5 h-5 inline mr-2" />
//               <span>{error}</span>
//             </div>
//           )}

//           {analysis && (
//             <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
//               <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
//               <pre className="whitespace-pre-wrap text-gray-700">{analysis}</pre>
//             </div>
//           )}
//         </div>

//         <div className="space-y-4">
//           <div className="bg-white rounded-lg p-6 shadow-sm">
//             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//               <Shield className="w-5 h-5 text-blue-600" />
//               Compliance Status
//             </h3>
//             <div className="space-y-3">
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-5 h-5 text-green-500" />
//                 <span>GDPR Compliant</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-5 h-5 text-green-500" />
//                 <span>CCPA Compliant</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Info className="w-5 h-5 text-yellow-500" />
//                 <span>Labor Law Review Needed</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg p-6 shadow-sm">
//             <h3 className="text-lg font-semibold mb-4">Export Options</h3>
//             <div className="space-y-3">
//               <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                 Download Full Report
//               </button>
//               <button className="w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
//                 Export as PDF
//               </button>
//               <button className="w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
//                 Share with Team
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }













// // perfect running but not good UI - Jatin

// import React, { useState, useCallback } from 'react';
// import { Upload, AlertTriangle, CheckCircle, Info, Shield, Loader } from 'lucide-react';
// import axios from 'axios';

// interface AnalysisResult {
//   Summary: {
//     Overview: string;
//     "General Compliance Assessment": string;
//   };
//   "High-Risk Clauses": Array<{
//     "Clause Number/Reference": string;
//     "Issue/Risk": string;
//     "Regulation Violated": string;
//     "Suggested Revision": string;
//   }>;
//   "Key Areas for Improvement": string[];
//   "Final Compliance Rating": string;
// }

// export default function ContractAnalysis() {
//   const [isDragging, setIsDragging] = useState(false);
//   const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const riskScoreMap = {
//     "Low Risk": 25,
//     "Medium Risk": 50,
//     "High Risk": 75
//   };

//   const handleFileUpload = useCallback(async (file: File) => {
//     if (!file) return;
    
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
      
//       const response = await axios.post<AnalysisResult>(
//         'http://localhost:5001/analyze',
//         formData,
//         { headers: { 'Content-Type': 'multipart/form-data' } }
//       );
      
//       setAnalysis(response.data);
//     } catch (err) {
//       setError('Failed to analyze contract');
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const file = e.dataTransfer.files?.[0];
//     if (file) handleFileUpload(file);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) handleFileUpload(file);
//   };

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Contract Analysis</h1>
//         <p className="text-gray-600 mt-2">AI-powered contract review and risk assessment</p>
//       </header>

//       <div className="grid grid-cols-3 gap-6">
//         <div className="col-span-2">
//           <div 
//             className={`border-2 border-dashed rounded-lg p-8 text-center ${
//               isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
//             } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
//             onDragOver={(e) => {
//               e.preventDefault();
//               setIsDragging(true);
//             }}
//             onDragLeave={() => setIsDragging(false)}
//             onDrop={handleDrop}
//           >
//             {isLoading ? (
//               <div className="flex flex-col items-center">
//                 <Loader className="w-12 h-12 text-blue-500 animate-spin" />
//                 <p className="mt-4 text-gray-600">Analyzing document...</p>
//               </div>
//             ) : (
//               <>
//                 <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-semibold mb-2">Drop your contract here</h3>
//                 <p className="text-gray-500 mb-4">or</p>
//                 <label className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
//                   Browse Files
//                   <input
//                     type="file"
//                     accept="application/pdf"
//                     onChange={handleFileChange}
//                     className="hidden"
//                   />
//                 </label>
//                 <p className="text-sm text-gray-500 mt-4">
//                   Supported formats: PDF (Max size: 10MB)
//                 </p>
//               </>
//             )}
//           </div>

          
//         {analysis && (
//         <div>
//           {JSON.stringify(analysis, null,2)}
//         </div>
//       )}
//         </div>

//       </div>
//     </div>
//   );
// }










// OG

// import React, { useState } from 'react';
// import { Upload, AlertTriangle, CheckCircle, Info, Shield } from 'lucide-react';

// export default function ContractAnalysis() {
//   const [isDragging, setIsDragging] = useState(false);

//   const dummyAnalysis = {
//     riskScore: 75,
//     complianceScore: 92,
//     issues: [
//       {
//         type: 'high',
//         message: 'Non-standard liability clause detected',
//         clause: 'Section 8.2',
//         suggestion: 'Consider using standard liability limitation clause'
//       },
//       {
//         type: 'medium',
//         message: 'Vague termination terms',
//         clause: 'Section 12.1',
//         suggestion: 'Specify clear termination conditions and notice periods'
//       }
//     ]
//   };

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Contract Analysis</h1>
//         <p className="text-gray-600 mt-2">AI-powered contract review and risk assessment</p>
//       </header>

//       <div className="grid grid-cols-3 gap-6">
//         <div className="col-span-2">
//           <div 
//             className={`border-2 border-dashed rounded-lg p-8 text-center ${
//               isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
//             }`}
//             onDragOver={(e) => {
//               e.preventDefault();
//               setIsDragging(true);
//             }}
//             onDragLeave={() => setIsDragging(false)}
//             onDrop={(e) => {
//               e.preventDefault();
//               setIsDragging(false);
//               // Handle file drop
//             }}
//           >
//             <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold mb-2">Drop your contract here</h3>
//             <p className="text-gray-500 mb-4">or</p>
//             <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//               Browse Files
//             </button>
//             <p className="text-sm text-gray-500 mt-4">
//               Supported formats: PDF, DOCX, TXT (Max size: 10MB)
//             </p>
//           </div>

//           <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
//             <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
            
//             <div className="grid grid-cols-2 gap-4 mb-6">
//               <div className="p-4 bg-orange-50 rounded-lg">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm font-medium text-orange-800">Risk Score</span>
//                   <span className="text-orange-800 font-bold">{dummyAnalysis.riskScore}%</span>
//                 </div>
//                 <div className="w-full bg-orange-200 rounded-full h-2">
//                   <div 
//                     className="bg-orange-500 rounded-full h-2" 
//                     style={{ width: `${dummyAnalysis.riskScore}%` }}
//                   ></div>
//                 </div>
//               </div>

//               <div className="p-4 bg-green-50 rounded-lg">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm font-medium text-green-800">Compliance Score</span>
//                   <span className="text-green-800 font-bold">{dummyAnalysis.complianceScore}%</span>
//                 </div>
//                 <div className="w-full bg-green-200 rounded-full h-2">
//                   <div 
//                     className="bg-green-500 rounded-full h-2" 
//                     style={{ width: `${dummyAnalysis.complianceScore}%` }}
//                   ></div>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               {dummyAnalysis.issues.map((issue, index) => (
//                 <div 
//                   key={index}
//                   className={`p-4 rounded-lg ${
//                     issue.type === 'high' ? 'bg-red-50' : 'bg-yellow-50'
//                   }`}
//                 >
//                   <div className="flex items-start gap-3">
//                     <AlertTriangle className={`w-5 h-5 ${
//                       issue.type === 'high' ? 'text-red-500' : 'text-yellow-500'
//                     }`} />
//                     <div>
//                       <h4 className="font-semibold">{issue.message}</h4>
//                       <p className="text-sm text-gray-600 mt-1">
//                         Found in {issue.clause}
//                       </p>
//                       <p className="text-sm text-gray-600 mt-2">
//                         Suggestion: {issue.suggestion}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div className="bg-white rounded-lg p-6 shadow-sm">
//             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//               <Shield className="w-5 h-5 text-blue-600" />
//               Compliance Status
//             </h3>
//             <div className="space-y-3">
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-5 h-5 text-green-500" />
//                 <span>GDPR Compliant</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-5 h-5 text-green-500" />
//                 <span>CCPA Compliant</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Info className="w-5 h-5 text-yellow-500" />
//                 <span>Labor Law Review Needed</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg p-6 shadow-sm">
//             <h3 className="text-lg font-semibold mb-4">Export Options</h3>
//             <div className="space-y-3">
//               <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                 Download Full Report
//               </button>
//               <button className="w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
//                 Export as PDF
//               </button>
//               <button className="w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
//                 Share with Team
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }