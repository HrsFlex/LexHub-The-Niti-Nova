import React, { useState, useEffect } from 'react';
import { Globe, Tag, TrendingUp, Clock, BookOpen, AlertCircle, Search, MapPin } from 'lucide-react';

interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export default function LegalNews() {
  const [selectedCategory, setSelectedCategory] = useState<'india' | 'global'>('india');
  const [selectedTopic, setSelectedTopic] = useState('indian law');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [globalNews, setGlobalNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const API_KEY = '876d7f67dae77fc1ef18a07ab1712dd6';
  const ARTICLES_PER_PAGE = 10;

  const indianTopics = [
    { name: "Indian Law", value: "indian law" },
    { name: "Supreme Court", value: "supreme court india" },
    { name: "High Courts", value: "high court india" },
    { name: "Constitutional Law", value: "indian constitutional law" },
    { name: "Criminal Law", value: "indian criminal law" }
  ];

  const globalTopics = [
    { name: "International Law", value: "international law" },
    { name: "Corporate Law", value: "global corporate law" },
    { name: "Human Rights", value: "international human rights" },
    { name: "Trade Law", value: "international trade law" }
  ];

  useEffect(() => {
    fetchIndianNews();
    fetchGlobalNews();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 300000);

    return () => clearInterval(interval);
  }, [selectedTopic, refreshKey]);

  const fetchIndianNews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = `${selectedTopic} india`;
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=${ARTICLES_PER_PAGE}&apikey=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]);
      }

      setNewsArticles(data.articles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Indian news');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGlobalNews = async () => {
    setIsLoadingGlobal(true);
    try {
      const query = "international law global";
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${ARTICLES_PER_PAGE}&apikey=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]);
      }

      setGlobalNews(data.articles || []);
    } catch (err) {
      console.error('Failed to fetch global news:', err);
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const filterArticles = () => {
    const articles = selectedCategory === 'india' ? newsArticles : globalNews;
    if (!searchQuery) return articles;
    return articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `${days} days ago`;
    }
  };

  const getTopics = () => selectedCategory === 'india' ? indianTopics : globalTopics;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Legal News & Updates</h1>
        <p className="text-gray-600 mt-2">Stay informed with the latest legal developments</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Category Toggle and Search */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategory('india')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    selectedCategory === 'india'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Indian
                </button>
                <button
                  onClick={() => setSelectedCategory('global')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    selectedCategory === 'global'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Global
                </button>
              </div>
            </div>
          </div>

          {/* News Articles */}
          {(selectedCategory === 'india' ? isLoading : isLoadingGlobal) ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filterArticles().map((article, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                >
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      loading="lazy"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{article.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(article.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {article.source.name}
                    </span>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Read Full Article
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Topics Filter */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              {selectedCategory === 'india' ? 'Indian Legal Topics' : 'Global Legal Topics'}
            </h3>
            <div className="space-y-2">
              {getTopics().map((topic) => (
                <button
                  key={topic.value}
                  onClick={() => setSelectedTopic(topic.value)}
                  className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                    selectedTopic === topic.value
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Trending
            </h3>
            <div className="space-y-3">
              {(selectedCategory === 'india' ? newsArticles : globalNews)
                .slice(0, 4)
                .map((article, index) => (
                  <a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 line-clamp-2">{article.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(article.publishedAt)}</p>
                  </a>
                ))}
            </div>
          </div>

          {/* Auto-refresh indicator */}
          <div className="text-center text-sm text-gray-500">
            Auto-refreshes every 5 minutes
          </div>
        </div>
      </div>
    </div>
  );
}






// OG

// import React, { useState } from 'react';
// import { Globe, Tag, TrendingUp, Clock, BookOpen } from 'lucide-react';

// export default function LegalNews() {
//   const [selectedRegion, setSelectedRegion] = useState('All');
//   const [selectedTopic, setSelectedTopic] = useState('All');

//   const dummyNews = [
//     {
//       title: "Supreme Court Ruling on Digital Privacy",
//       summary: "Landmark decision establishes new precedent for data protection",
//       date: "2 hours ago",
//       topic: "Data Privacy",
//       region: "Federal",
//       importance: "High",
//       readTime: "5 min"
//     },
//     {
//       title: "New Cybersecurity Regulations",
//       summary: "Government announces stricter compliance requirements for tech companies",
//       date: "5 hours ago",
//       topic: "Compliance",
//       region: "National",
//       importance: "High",
//       readTime: "8 min"
//     }
//   ];

//   const trendingTopics = [
//     { name: "Data Privacy", count: 128 },
//     { name: "Corporate Law", count: 95 },
//     { name: "Intellectual Property", count: 82 },
//     { name: "Employment Law", count: 76 }
//   ];

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Legal News & Updates</h1>
//         <p className="text-gray-600 mt-2">Stay informed with AI-curated legal developments</p>
//       </header>

//       <div className="grid grid-cols-3 gap-6">
//         <div className="col-span-2 space-y-6">
//           <div className="bg-white rounded-lg p-6 shadow-sm">
//             <div className="flex gap-4 mb-6">
//               <select 
//                 className="flex-1 rounded-lg border-gray-200"
//                 value={selectedRegion}
//                 onChange={(e) => setSelectedRegion(e.target.value)}
//               >
//                 <option>All Regions</option>
//                 <option>Federal</option>
//                 <option>State</option>
//                 <option>International</option>
//               </select>
//               <select
//                 className="flex-1 rounded-lg border-gray-200"
//                 value={selectedTopic}
//                 onChange={(e) => setSelectedTopic(e.target.value)}
//               >
//                 <option>All Topics</option>
//                 <option>Data Privacy</option>
//                 <option>Corporate Law</option>
//                 <option>Intellectual Property</option>
//               </select>
//             </div>

//             <div className="space-y-6">
//               {dummyNews.map((news, index) => (
//                 <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
//                   <div className="flex justify-between items-start mb-3">
//                     <h3 className="text-lg font-semibold text-gray-900">{news.title}</h3>
//                     <span className={`px-3 py-1 rounded-full text-sm ${
//                       news.importance === 'High' 
//                         ? 'bg-red-100 text-red-800' 
//                         : 'bg-blue-100 text-blue-800'
//                     }`}>
//                       {news.importance}
//                     </span>
//                   </div>
//                   <p className="text-gray-600 mb-3">{news.summary}</p>
//                   <div className="flex items-center gap-4 text-sm text-gray-500">
//                     <span className="flex items-center gap-1">
//                       <Clock className="w-4 h-4" />
//                       {news.date}
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <Globe className="w-4 h-4" />
//                       {news.region}
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <Tag className="w-4 h-4" />
//                       {news.topic}
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <BookOpen className="w-4 h-4" />
//                       {news.readTime} read
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="space-y-6">
//           <div className="bg-white rounded-lg p-6 shadow-sm">
//             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//               <TrendingUp className="w-5 h-5 text-blue-600" />
//               Trending Topics
//             </h3>
//             <div className="space-y-3">
//               {trendingTopics.map((topic, index) => (
//                 <div key={index} className="flex items-center justify-between">
//                   <span className="text-gray-700">{topic.name}</span>
//                   <span className="text-sm text-gray-500">{topic.count} articles</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="bg-white rounded-lg p-6 shadow-sm">
//             <h3 className="text-lg font-semibold mb-4">Quick Filters</h3>
//             <div className="space-y-2">
//               <button className="w-full px-4 py-2 text-left rounded-lg hover:bg-gray-50 text-blue-600">
//                 Breaking News
//               </button>
//               <button className="w-full px-4 py-2 text-left rounded-lg hover:bg-gray-50">
//                 Recent Updates
//               </button>
//               <button className="w-full px-4 py-2 text-left rounded-lg hover:bg-gray-50">
//                 Most Read
//               </button>
//               <button className="w-full px-4 py-2 text-left rounded-lg hover:bg-gray-50">
//                 Bookmarked
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }