import React, { useState, useMemo } from "react";
import axios from "axios";
import { Search, Filter, BookOpen, BrainCircuit, Loader, AlertCircle, CheckCircle2, Scale, Gavel } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Case {
  title: string;
  summary: string;
  relevance: number;
  date: string;
  jurisdiction: string;
  type: 'civil' | 'criminal';
}

interface Filters {
  jurisdiction: string;
  dateRange: string;
  caseType: string;
}

export default function CaseResearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [similarCases, setSimilarCases] = useState<Case[]>([]);
  const [filters, setFilters] = useState<Filters>({
    jurisdiction: "All Jurisdictions",
    dateRange: "Last 5 years",
    caseType: "All Types"
  });

  const generateSimilarCases = (analysis: string): Case[] => {
    const text = analysis.toLowerCase();
    
    // Extract key information from analysis
    const sections = text.match(/section \d+[A-Z]?/g) || [];
    const legalTerms = text.match(/\b(act|law|court|rights|case|judgment|appeal|petition)\b/g) || [];
    const amounts = text.match(/₹[\d,]+/g) || [];
    const isCriminal = text.includes('criminal') || text.includes('offense') || text.includes('prosecution');
    
    // Helper function to generate random date within range
    const getRandomDate = (daysAgo: number) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
      return date.toISOString().split('T')[0];
    };

    const jurisdictions = ['Supreme Court', 'High Court', 'District Court'];
    const cases: Case[] = [];

    // Case 1: Most recent and directly relevant
    cases.push({
      title: `Recent Judgment on ${sections[0] || legalTerms[0] || 'Similar Matter'}`,
      summary: `Latest precedent involving ${amounts[0] ? `claims of ${amounts[0]} and ` : ''}interpretation of ${sections[0] || 'similar provisions'}`,
      relevance: 95,
      date: getRandomDate(30),
      jurisdiction: text.includes('supreme court') ? 'Supreme Court' : jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
      type: isCriminal ? 'criminal' : 'civil'
    });

    // Case 2: Related precedent
    cases.push({
      title: `Precedent Case on ${sections[1] || legalTerms[1] || 'Related Matter'}`,
      summary: `Established guidelines for ${sections[1] || 'similar cases'} with comprehensive interpretation`,
      relevance: 88,
      date: getRandomDate(60),
      jurisdiction: text.includes('high court') ? 'High Court' : jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
      type: isCriminal ? 'criminal' : 'civil'
    });

    // Case 3: Similar context case
    cases.push({
      title: `Reference Case on ${sections[2] || legalTerms[2] || 'Similar Context'}`,
      summary: `Similar case involving ${amounts[0] ? 'comparable claims and ' : ''}related legal principles`,
      relevance: 82,
      date: getRandomDate(90),
      jurisdiction: jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
      type: isCriminal ? 'criminal' : 'civil'
    });

    return cases;
  };

  const filteredCases = useMemo(() => {
    return similarCases.filter(case_ => {
      const dateRangeFilter = () => {
        const caseDate = new Date(case_.date);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - caseDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'Last month':
            return diffDays <= 30;
          case 'Last year':
            return diffDays <= 365;
          default: // Last 5 years
            return diffDays <= 1825;
        }
      };

      return (
        (filters.jurisdiction === 'All Jurisdictions' || case_.jurisdiction === filters.jurisdiction) &&
        (filters.caseType === 'All Types' || 
          (filters.caseType === 'Civil' && case_.type === 'civil') ||
          (filters.caseType === 'Criminal' && case_.type === 'criminal')) &&
        dateRangeFilter()
      );
    });
  }, [similarCases, filters]);

  const analyzeWithAI = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/analyze", {
        query: searchQuery,
      });
      setAiResponse(response.data.analysis);
      const generatedCases = generateSimilarCases(response.data.analysis);
      setSimilarCases(generatedCases);
    } catch (error) {
      console.error("Error analyzing:", error);
      setAiResponse("Failed to analyze case.");
      setSimilarCases([]);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <Gavel className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Case Research</h1>
            <p className="text-gray-600 mt-2">Search and analyze legal precedents with AI assistance</p>
          </div>
        </div>
      </header>

      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Describe your legal issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 hover:shadow-md"
            />
          </div>
          <motion.button
            onClick={analyzeWithAI}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <BrainCircuit className="w-5 h-5" />
            )}
            Analyze with AI
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {aiResponse && (
          <motion.div
            className="mb-8 bg-gradient-to-br from-white to-blue-50 p-8 rounded-xl shadow-lg border border-blue-100"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div 
              className="flex items-center gap-3 mb-6"
              variants={itemVariants}
            >
              <div className="p-3 bg-blue-600 rounded-full">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">AI Analysis Results</h2>
            </motion.div>

            <div className="space-y-6">
              {aiResponse.split("\n").map((line, index) => {
                if (!line.trim()) return null;
                
                const isHighlight = line.startsWith("*");
                const isWarning = line.toLowerCase().includes("warning") || line.toLowerCase().includes("caution");
                const isSuccess = line.toLowerCase().includes("recommended") || line.toLowerCase().includes("positive");

                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`p-4 rounded-lg ${
                      isHighlight
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : isWarning
                        ? "bg-amber-50 border-l-4 border-amber-500"
                        : isSuccess
                        ? "bg-green-50 border-l-4 border-green-500"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isWarning && <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />}
                      {isSuccess && <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />}
                      <p 
                        className={`text-gray-800 leading-relaxed ${
                          isHighlight ? "font-semibold" : ""
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: line
                            .replace(/\*\*(.*?)\*\*/g, "<span class='text-blue-600 font-semibold'>$1</span>")
                            .replace(/Section (\d+[A-Z]?)/g, "<span class='text-purple-600 font-semibold'>Section $1</span>")
                            .replace(/(₹|Rs\.?)\s?([\d,]+)/g, "<span class='text-red-600 font-semibold'>$1$2</span>")

                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      {similarCases.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCases.length} of {similarCases.length} cases
          </p>
        </div>
      )}

      {/* Lawyer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Section - Moved after analysis */}
        {similarCases.length > 0 && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                  <select 
                    className="w-full rounded-md border-gray-200 focus:ring-blue-500"
                    value={filters.jurisdiction}
                    onChange={(e) => setFilters(prev => ({ ...prev, jurisdiction: e.target.value }))}
                  >
                    <option>All Jurisdictions</option>
                    <option>Supreme Court</option>
                    <option>High Court</option>
                    <option>District Court</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select 
                    className="w-full rounded-md border-gray-200 focus:ring-blue-500"
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  >
                    <option>Last 5 years</option>
                    <option>Last year</option>
                    <option>Last month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                  <select 
                    className="w-full rounded-md border-gray-200 focus:ring-blue-500"
                    value={filters.caseType}
                    onChange={(e) => setFilters(prev => ({ ...prev, caseType: e.target.value }))}
                  >
                    <option>All Types</option>
                    <option>Civil</option>
                    <option>Criminal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cases List */}
        <div className={`${similarCases.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          {filteredCases.map((case_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    {case_.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{case_.summary}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {case_.relevance}% Relevant
                </span>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{case_.date}</span>
                <span>{case_.jurisdiction}</span>
                <span className={`capitalize ${case_.type === 'criminal' ? 'text-red-600' : 'text-blue-600'}`}>
                  {case_.type}
                </span>
              </div>
            </motion.div>
          ))}
          
          {filteredCases.length === 0 && similarCases.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              No cases match the selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}











// working perfecttt

// import React, { useState, useMemo } from "react";
// import axios from "axios";
// import { Search, Filter, BookOpen, BrainCircuit, Loader, AlertCircle, CheckCircle2, Scale } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// interface Case {
//   title: string;
//   summary: string;
//   relevance: number;
//   date: string;
//   jurisdiction: string;
//   type: 'civil' | 'criminal';
// }

// interface Filters {
//   jurisdiction: string;
//   dateRange: string;
//   caseType: string;
// }

// export default function CaseResearch() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [aiResponse, setAiResponse] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [similarCases, setSimilarCases] = useState<Case[]>([]);
//   const [filters, setFilters] = useState<Filters>({
//     jurisdiction: "All Jurisdictions",
//     dateRange: "Last 5 years",
//     caseType: "All Types"
//   });

//   const generateSimilarCases = (analysis: string): Case[] => {
//     const text = analysis.toLowerCase();
    
//     // Extract key information from analysis
//     const sections = text.match(/section \d+[A-Z]?/g) || [];
//     const legalTerms = text.match(/\b(act|law|court|rights|case|judgment|appeal|petition)\b/g) || [];
//     const amounts = text.match(/₹[\d,]+/g) || [];
//     const isCriminal = text.includes('criminal') || text.includes('offense') || text.includes('prosecution');
    
//     // Helper function to generate random date within range
//     const getRandomDate = (daysAgo: number) => {
//       const date = new Date();
//       date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
//       return date.toISOString().split('T')[0];
//     };

//     const jurisdictions = ['Supreme Court', 'High Court', 'District Court'];
//     const cases: Case[] = [];

//     // Case 1: Most recent and directly relevant
//     cases.push({
//       title: `Recent Judgment on ${sections[0] || legalTerms[0] || 'Similar Matter'}`,
//       summary: `Latest precedent involving ${amounts[0] ? `claims of ${amounts[0]} and ` : ''}interpretation of ${sections[0] || 'similar provisions'}`,
//       relevance: 95,
//       date: getRandomDate(30),
//       jurisdiction: text.includes('supreme court') ? 'Supreme Court' : jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
//       type: isCriminal ? 'criminal' : 'civil'
//     });

//     // Case 2: Related precedent
//     cases.push({
//       title: `Precedent Case on ${sections[1] || legalTerms[1] || 'Related Matter'}`,
//       summary: `Established guidelines for ${sections[1] || 'similar cases'} with comprehensive interpretation`,
//       relevance: 88,
//       date: getRandomDate(60),
//       jurisdiction: text.includes('high court') ? 'High Court' : jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
//       type: isCriminal ? 'criminal' : 'civil'
//     });

//     // Case 3: Similar context case
//     cases.push({
//       title: `Reference Case on ${sections[2] || legalTerms[2] || 'Similar Context'}`,
//       summary: `Similar case involving ${amounts[0] ? 'comparable claims and ' : ''}related legal principles`,
//       relevance: 82,
//       date: getRandomDate(90),
//       jurisdiction: jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
//       type: isCriminal ? 'criminal' : 'civil'
//     });

//     return cases;
//   };

//   const filteredCases = useMemo(() => {
//     return similarCases.filter(case_ => {
//       const dateRangeFilter = () => {
//         const caseDate = new Date(case_.date);
//         const today = new Date();
//         const diffDays = Math.floor((today.getTime() - caseDate.getTime()) / (1000 * 60 * 60 * 24));
        
//         switch (filters.dateRange) {
//           case 'Last month':
//             return diffDays <= 30;
//           case 'Last year':
//             return diffDays <= 365;
//           default: // Last 5 years
//             return diffDays <= 1825;
//         }
//       };

//       return (
//         (filters.jurisdiction === 'All Jurisdictions' || case_.jurisdiction === filters.jurisdiction) &&
//         (filters.caseType === 'All Types' || 
//           (filters.caseType === 'Civil' && case_.type === 'civil') ||
//           (filters.caseType === 'Criminal' && case_.type === 'criminal')) &&
//         dateRangeFilter()
//       );
//     });
//   }, [similarCases, filters]);

//   const analyzeWithAI = async () => {
//     if (!searchQuery.trim()) return;
//     setLoading(true);
//     try {
//       const response = await axios.post("http://localhost:5000/analyze", {
//         query: searchQuery,
//       });
//       setAiResponse(response.data.analysis);
//       const generatedCases = generateSimilarCases(response.data.analysis);
//       setSimilarCases(generatedCases);
//     } catch (error) {
//       console.error("Error analyzing:", error);
//       setAiResponse("Failed to analyze case.");
//       setSimilarCases([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const containerVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.6,
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, x: -20 },
//     visible: {
//       opacity: 1,
//       x: 0,
//       transition: { duration: 0.4 }
//     }
//   };

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Case Research</h1>
//         <p className="text-gray-600 mt-2">Search and analyze legal precedents with AI assistance</p>
//       </header>

//       <motion.div 
//         className="mb-8"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="flex gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Describe your legal issue..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 hover:shadow-md"
//             />
//           </div>
//           <motion.button
//             onClick={analyzeWithAI}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300"
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//           >
//             {loading ? (
//               <Loader className="w-5 h-5 animate-spin" />
//             ) : (
//               <BrainCircuit className="w-5 h-5" />
//             )}
//             Analyze with AI
//           </motion.button>
//         </div>
//       </motion.div>

//       <AnimatePresence>
//         {aiResponse && (
//           <motion.div
//             className="mb-8 bg-gradient-to-br from-white to-blue-50 p-8 rounded-xl shadow-lg border border-blue-100"
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//             exit="hidden"
//           >
//             <motion.div 
//               className="flex items-center gap-3 mb-6"
//               variants={itemVariants}
//             >
//               <div className="p-3 bg-blue-600 rounded-full">
//                 <Scale className="w-6 h-6 text-white" />
//               </div>
//               <h2 className="text-2xl font-bold text-gray-900">AI Analysis Results</h2>
//             </motion.div>

//             <div className="space-y-6">
//               {aiResponse.split("\n").map((line, index) => {
//                 if (!line.trim()) return null;
                
//                 const isHighlight = line.startsWith("*");
//                 const isWarning = line.toLowerCase().includes("warning") || line.toLowerCase().includes("caution");
//                 const isSuccess = line.toLowerCase().includes("recommended") || line.toLowerCase().includes("positive");

//                 return (
//                   <motion.div
//                     key={index}
//                     variants={itemVariants}
//                     className={`p-4 rounded-lg ${
//                       isHighlight
//                         ? "bg-blue-50 border-l-4 border-blue-500"
//                         : isWarning
//                         ? "bg-amber-50 border-l-4 border-amber-500"
//                         : isSuccess
//                         ? "bg-green-50 border-l-4 border-green-500"
//                         : "bg-white"
//                     }`}
//                   >
//                     <div className="flex items-start gap-3">
//                       {isWarning && <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />}
//                       {isSuccess && <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />}
//                       <p 
//                         className={`text-gray-800 leading-relaxed ${
//                           isHighlight ? "font-semibold" : ""
//                         }`}
//                         dangerouslySetInnerHTML={{
//                           __html: line
//                             .replace(/\*\*(.*?)\*\*/g, "<span class='text-blue-600 font-semibold'>$1</span>")
//                             .replace(/Section (\d+[A-Z]?)/g, "<span class='text-purple-600 font-semibold'>Section $1</span>")
//                             .replace(/₹([\d,]+)/g, "<span class='text-red-600 font-semibold'>₹$1</span>")
//                         }}
//                       />
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="grid grid-cols-3 gap-6">
//         <div className="col-span-1 bg-white rounded-lg p-6 shadow-sm">
//           <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//             <Filter className="w-5 h-5" />
//             Filters
//           </h2>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
//               <select 
//                 className="w-full rounded-md border-gray-200 focus:ring-blue-500"
//                 value={filters.jurisdiction}
//                 onChange={(e) => setFilters(prev => ({ ...prev, jurisdiction: e.target.value }))}
//               >
//                 <option>All Jurisdictions</option>
//                 <option>Supreme Court</option>
//                 <option>High Court</option>
//                 <option>District Court</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
//               <select 
//                 className="w-full rounded-md border-gray-200 focus:ring-blue-500"
//                 value={filters.dateRange}
//                 onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
//               >
//                 <option>Last 5 years</option>
//                 <option>Last year</option>
//                 <option>Last month</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
//               <select 
//                 className="w-full rounded-md border-gray-200 focus:ring-blue-500"
//                 value={filters.caseType}
//                 onChange={(e) => setFilters(prev => ({ ...prev, caseType: e.target.value }))}
//               >
//                 <option>All Types</option>
//                 <option>Civil</option>
//                 <option>Criminal</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="col-span-2 space-y-4">
//           {filteredCases.map((case_, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300"
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                     <BookOpen className="w-5 h-5 text-blue-600" />
//                     {case_.title}
//                   </h3>
//                   <p className="text-gray-600 mt-1">{case_.summary}</p>
//                 </div>
//                 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
//                   {case_.relevance}% Relevant
//                 </span>
//               </div>
//               <div className="flex gap-4 text-sm text-gray-500">
//                 <span>{case_.date}</span>
//                 <span>{case_.jurisdiction}</span>
//                 <span className={`capitalize ${case_.type === 'criminal' ? 'text-red-600' : 'text-blue-600'}`}>
//                   {case_.type}
//                 </span>
//               </div>
//             </motion.div>
//           ))}
          
//           {filteredCases.length === 0 && similarCases.length > 0 && (
//             <div className="text-center py-8 text-gray-500">
//               No cases match the selected filters
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }












// fully working Jatin

// import React, { useState } from "react";
// import axios from "axios";
// import { Search, Filter, BookOpen, BrainCircuit, Loader } from "lucide-react";
// import { motion } from "framer-motion";
// import { FaBalanceScale } from "react-icons/fa";

// export default function CaseResearch() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [aiResponse, setAiResponse] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const dummyCases = [
//     {
//       title: "Smith vs State of California",
//       summary: "Precedent case regarding digital privacy rights",
//       relevance: 95,
//       date: "2023-12-10",
//       jurisdiction: "California Supreme Court",
//     },
//     {
//       title: "Digital Rights Foundation vs Tech Corp",
//       summary: "Landmark case on data protection compliance",
//       relevance: 88,
//       date: "2023-11-15",
//       jurisdiction: "Federal Court",
//     },
//   ];

//   const analyzeWithAI = async () => {
//     if (!searchQuery.trim()) return;
//     setLoading(true);
//     try {
//       const response = await axios.post("http://localhost:5000/analyze", {
//         query: searchQuery,
//       });
//       setAiResponse(response.data.analysis);
//     } catch (error) {
//       console.error("Error analyzing:", error);
//       setAiResponse("Failed to analyze case.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Case Research</h1>
//         <p className="text-gray-600 mt-2">Search and analyze legal precedents with AI assistance</p>
//       </header>

//       <div className="mb-8">
//         <div className="flex gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Describe your legal issue..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//           <button
//             onClick={analyzeWithAI}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
//           >
//             {loading ? <Loader className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
//             Analyze with AI
//           </button>
//         </div>
//       </div>

      
// {aiResponse && (
//   <motion.div
//     className="mb-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200"
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.5 }}
//   >
//     <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
//       <FaBalanceScale className="text-blue-600" /> 🔍 AI Analysis
//     </h2>
//     <div className="space-y-3 text-gray-700">
//       {aiResponse.split("\n").map((line, index) => (
//         <motion.p
//           key={index}
//           className="flex items-start gap-2"
//           initial={{ opacity: 0, x: -10 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.3, delay: index * 0.1 }}
//           dangerouslySetInnerHTML={{
//             __html: line
//               .replace(/\*\*(.*?)\*\*/g, "<strong class='text-gray-900'>$1</strong>") // Bold for titles
//               .replace(
//                 /(₹[\d,]+)/g,
//                 `<span class='text-red-600 font-bold flex items-center'><FaRupeeSign class='mr-1' />$1</span>` // Red for amounts with ₹ icon
//               )
//               .replace(
//                 /(Section \d+[A-Z]? of the IPC)/g,
//                 `<strong class='text-blue-600 flex items-center'><FaGavel class='mr-1' />$1</strong>` // Blue bold for IPC sections with gavel icon
//               )
//           }}
//         />
//       ))}
//     </div>
//   </motion.div>
// )}



//       <div className="grid grid-cols-3 gap-6">
//         <div className="col-span-1 bg-white rounded-lg p-6 shadow-sm">
//           <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//             <Filter className="w-5 h-5" />
//             Filters
//           </h2>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
//               <select className="w-full rounded-md border-gray-200 focus:ring-blue-500">
//                 <option>All Jurisdictions</option>
//                 <option>Federal Court</option>
//                 <option>State Courts</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
//               <select className="w-full rounded-md border-gray-200 focus:ring-blue-500">
//                 <option>Last 5 years</option>
//                 <option>Last year</option>
//                 <option>Last month</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
//               <select className="w-full rounded-md border-gray-200 focus:ring-blue-500">
//                 <option>All Types</option>
//                 <option>Civil</option>
//                 <option>Criminal</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="col-span-2 space-y-4">
//           {dummyCases.map((case_, index) => (
//             <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                     <BookOpen className="w-5 h-5 text-blue-600" />
//                     {case_.title}
//                   </h3>
//                   <p className="text-gray-600 mt-1">{case_.summary}</p>
//                 </div>
//                 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
//                   {case_.relevance}% Relevant
//                 </span>
//               </div>
//               <div className="flex gap-4 text-sm text-gray-500">
//                 <span>{case_.date}</span>
//                 <span>{case_.jurisdiction}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }












// OG

// import React, { useState } from 'react';
// import { Search, Filter, BookOpen, BrainCircuit } from 'lucide-react';

// export default function CaseResearch() {
//   const [searchQuery, setSearchQuery] = useState('');

//   const dummyCases = [
//     {
//       title: "Smith vs State of California",
//       summary: "Precedent case regarding digital privacy rights",
//       relevance: 95,
//       date: "2023-12-10",
//       jurisdiction: "California Supreme Court"
//     },
//     {
//       title: "Digital Rights Foundation vs Tech Corp",
//       summary: "Landmark case on data protection compliance",
//       relevance: 88,
//       date: "2023-11-15",
//       jurisdiction: "Federal Court"
//     }
//   ];

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Case Research</h1>
//         <p className="text-gray-600 mt-2">Search and analyze legal precedents with AI assistance</p>
//       </header>

//       <div className="mb-8">
//         <div className="flex gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Describe your legal issue or search for specific cases..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//           <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
//             <BrainCircuit className="w-5 h-5" />
//             Analyze with AI
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-3 gap-6">
//         <div className="col-span-1 bg-white rounded-lg p-6 shadow-sm">
//           <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//             <Filter className="w-5 h-5" />
//             Filters
//           </h2>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
//               <select className="w-full rounded-md border-gray-200 focus:ring-blue-500">
//                 <option>All Jurisdictions</option>
//                 <option>Federal Court</option>
//                 <option>State Courts</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
//               <select className="w-full rounded-md border-gray-200 focus:ring-blue-500">
//                 <option>Last 5 years</option>
//                 <option>Last year</option>
//                 <option>Last month</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
//               <select className="w-full rounded-md border-gray-200 focus:ring-blue-500">
//                 <option>All Types</option>
//                 <option>Civil</option>
//                 <option>Criminal</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="col-span-2 space-y-4">
//           {dummyCases.map((case_, index) => (
//             <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                     <BookOpen className="w-5 h-5 text-blue-600" />
//                     {case_.title}
//                   </h3>
//                   <p className="text-gray-600 mt-1">{case_.summary}</p>
//                 </div>
//                 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
//                   {case_.relevance}% Relevant
//                 </span>
//               </div>
//               <div className="flex gap-4 text-sm text-gray-500">
//                 <span>{case_.date}</span>
//                 <span>{case_.jurisdiction}</span>
//               </div>
//               <div className="mt-4 flex gap-2">
//                 <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                   View Full Case
//                 </button>
//                 <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
//                   Save for Later
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }