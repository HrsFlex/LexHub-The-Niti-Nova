import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Scale, Loader2 } from "lucide-react";

const DocumentComparison: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfContent, setPdfContent] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Function to send the uploaded file to the backend
  const analyzeDocument = async () => {
    if (!file) {
      setError("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    setError(null);
    setPdfContent(null);
    setComparisonResult(null);
    setShowComparison(false); // Reset comparison view

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      // Send the file to the backend for text extraction and Groq analysis
      const response = await axios.post("http://localhost:5002/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPdfContent(response.data.pdfContent);
      // Remove any stars from the response
      const cleanedResponse = response.data.groqResponse.replace(/\*/g, '');
      setComparisonResult(cleanedResponse);
    } catch (err) {
      setError("Error analyzing PDF. Please try again.");
      console.error("❌ Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center p-8">
      <motion.h2
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        📜 Document Comparison
      </motion.h2>

      <div className="bg-gray-400 p-6 rounded-xl shadow-lg flex flex-col items-center w-full max-w-lg">
        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center gap-2">
          <UploadCloud size={20} />
          <span>{file ? file.name : "Upload PDF File"}</span>
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
        </label>

        <button
          onClick={analyzeDocument}
          disabled={loading}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
          {loading ? "Analyzing..." : "Analyze PDF"}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {pdfContent && (
        <motion.div
          className="mt-6 bg-gray-800 p-4 rounded-xl shadow-lg w-full max-w-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl text-white font-semibold flex items-center gap-2">
            <FileText size={20} />
            Extracted PDF Content:
          </h3>
          <div className="max-h-60 overflow-auto bg-gray-900 p-3 rounded-lg shadow-inner mt-2">
            <pre className="text-gray-300 text-sm">{pdfContent}</pre>
          </div>

          <button
            onClick={() => setShowComparison(true)}
            className="mt-4 w-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
          >
            <Scale size={20} />
            Show Comparisons
          </button>
        </motion.div>
      )}

      {showComparison && comparisonResult && (
        <motion.div
          className="mt-6 bg-gray-800 p-4 rounded-xl shadow-lg w-full max-w-3xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl text-white font-semibold flex items-center gap-2">
            <Scale size={20} />
            Comparison with New Indian Laws:
          </h3>
          <div className="max-h-60 overflow-auto bg-gray-900 p-3 rounded-lg shadow-inner mt-2">
            <pre className="text-gray-300 text-sm">{comparisonResult}</pre>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DocumentComparison;













// thik thak UI hai

// import React, { useState } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { UploadCloud, FileText, Scale, Loader2 } from "lucide-react";

// const DocumentComparison: React.FC = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [pdfContent, setPdfContent] = useState<string | null>(null);
//   const [comparisonResult, setComparisonResult] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showComparison, setShowComparison] = useState(false);

//   // Handle file selection
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setFile(e.target.files[0]);
//     }
//   };

//   // Function to send the uploaded file to the backend
//   const analyzeDocument = async () => {
//     if (!file) {
//       setError("Please upload a PDF file.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setPdfContent(null);
//     setComparisonResult(null);
//     setShowComparison(false); // Reset comparison view

//     const formData = new FormData();
//     formData.append("pdf", file);

//     try {
//       // Send the file to the backend for text extraction and Groq analysis
//       const response = await axios.post("http://localhost:5002/analyze", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setPdfContent(response.data.pdfContent);
//       setComparisonResult(response.data.groqResponse);
//     } catch (err) {
//       setError("Error analyzing PDF. Please try again.");
//       console.error("❌ Analysis error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white text-black flex flex-col items-center p-8">
//       <motion.h2
//         className="text-3xl font-bold mb-6"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         📜 Document Comparison
//       </motion.h2>

//       <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center w-full max-w-lg">
//         <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center gap-2">
//           <UploadCloud size={20} />
//           <span>{file ? file.name : "Upload PDF File"}</span>
//           <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
//         </label>

//         <button
//           onClick={analyzeDocument}
//           disabled={loading}
//           className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
//         >
//           {loading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
//           {loading ? "Analyzing..." : "Analyze PDF"}
//         </button>

//         {error && <p className="text-red-500 mt-2">{error}</p>}
//       </div>

//       {pdfContent && (
//         <motion.div
//           className="mt-6 bg-gray-800 p-4 rounded-xl shadow-lg w-full max-w-2xl"
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           <h3 className="text-xl font-semibold flex items-center gap-2">
//             <FileText size={20} />
//             Extracted PDF Content:
//           </h3>
//           <div className="max-h-60 overflow-auto bg-gray-900 p-3 rounded-lg shadow-inner mt-2">
//             <pre className="text-gray-300 text-sm">{pdfContent}</pre>
//           </div>

//           <button
//             onClick={() => setShowComparison(true)}
//             className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
//           >
//             <Scale size={20} />
//             Show Comparisons
//           </button>
//         </motion.div>
//       )}

//       {showComparison && comparisonResult && (
//         <motion.div
//           className="mt-6 bg-gray-800 p-4 rounded-xl shadow-lg w-full max-w-2xl"
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           <h3 className="text-xl font-semibold flex items-center gap-2">
//             <Scale size={20} />
//             Comparison with New Indian Laws:
//           </h3>
//           <div className="max-h-60 overflow-auto bg-gray-900 p-3 rounded-lg shadow-inner mt-2">
//             <pre className="text-gray-300 text-sm">{comparisonResult}</pre>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default DocumentComparison;














// working but not good UI

// import React, { useState } from "react";
// import axios from "axios";

// const DocumentComparison: React.FC = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [pdfContent, setPdfContent] = useState<string | null>(null);
//   const [comparisonResult, setComparisonResult] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showComparison, setShowComparison] = useState(false);

//   // Handle file selection
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setFile(e.target.files[0]);
//     }
//   };

//   // Function to send the uploaded file to the backend
//   const analyzeDocument = async () => {
//     if (!file) {
//       setError("Please upload a PDF file.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setPdfContent(null);
//     setComparisonResult(null);
//     setShowComparison(false); // Reset comparison view

//     const formData = new FormData();
//     formData.append("pdf", file);

//     try {
//       // Send the file to the backend for text extraction and Groq analysis
//       const response = await axios.post("http://localhost:5002/analyze", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setPdfContent(response.data.pdfContent);
//       setComparisonResult(response.data.groqResponse);
//     } catch (err) {
//       setError("Error analyzing PDF. Please try again.");
//       console.error("❌ Analysis error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container">
//       <h2>Document Comparison</h2>
//       <input type="file" accept="application/pdf" onChange={handleFileChange} />
//       <button onClick={analyzeDocument} disabled={loading}>
//         {loading ? "Analyzing..." : "Analyze PDF"}
//       </button>

//       {error && <p className="error">{error}</p>}

//       {pdfContent && (
//         <div>
//           <h3>Extracted PDF Content:</h3>
//           <pre>{pdfContent}</pre>

//           {/* Show Comparison button only after PDF text is extracted */}
//           <button onClick={() => setShowComparison(true)}>Show Comparisons</button>
//         </div>
//       )}

//       {/* Show comparison result only when button is clicked */}
//       {showComparison && comparisonResult && (
//         <div>
//           <h3>Comparison with New Indian Laws:</h3>
//           <pre>{comparisonResult}</pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentComparison;













// import React, { useState } from "react";
// import axios from "axios";

// const DocumentComparison: React.FC = () => {
//   const [file1, setFile1] = useState<File | null>(null);
//   const [pdfContent, setPdfContent] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Handle file selection
//   const handleFileChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     setFile: React.Dispatch<React.SetStateAction<File | null>>
//   ) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setFile(e.target.files[0]);
//     }
//   };

//   // Function to send the uploaded file to the backend for analysis
//   const analyzeDocument = async () => {
//     if (!file1) {
//       setError("Please upload the old PDF.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setPdfContent(null);

//     const formData = new FormData();
//     formData.append("pdf1", file1);

//     try {
//       // Send the form data to the backend
//       const response = await axios.post("http://localhost:5002/analyze", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       // Display the content of the PDF
//       setPdfContent(response.data.analysis.pdfContent);
//     } catch (err: any) {
//       setError("Error analyzing PDF. Please try again.");
//       console.error("❌ Analysis error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container">
//       <h2>Document Comparison</h2>
//       <input
//         type="file"
//         accept="application/pdf"
//         onChange={(e) => handleFileChange(e, setFile1)}
//       />
//       <button onClick={analyzeDocument} disabled={loading}>
//         {loading ? "Analyzing..." : "Analyze PDF"}
//       </button>
//       {error && <p className="error">{error}</p>}
//       {pdfContent && (
//         <div>
//           <h3>Old Document Content:</h3>
//           <pre>{pdfContent}</pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentComparison;







