import React from 'react';
import { 
  Scale, 
  FileText, 
  Newspaper, 
  GitCompare, 
  FileSpreadsheet,
  Brain,
  TrendingUp
} from 'lucide-react';

const features = [
  {
    icon: Scale,
    title: 'Case Research',
    description: 'Search and analyze case law with AI-powered insights',
    color: 'bg-blue-500'
  },
  {
    icon: FileText,
    title: 'Contract Analysis',
    description: 'Automated risk assessment and compliance checking',
    color: 'bg-purple-500'
  },
  {
    icon: Newspaper,
    title: 'Legal News',
    description: 'Stay updated with AI-curated legal developments',
    color: 'bg-green-500'
  },
  {
    icon: GitCompare,
    title: 'Document Comparison',
    description: 'Compare and track changes in legal documents',
    color: 'bg-orange-500'
  },
  {
    icon: FileSpreadsheet,
    title: 'Forms Assistant',
    description: 'Smart form filling with AI guidance',
    color: 'bg-red-500'
  }
];

const stats = [
  { label: 'Cases Analyzed', value: '2,547' },
  { label: 'Documents Processed', value: '12,843' },
  { label: 'Forms Generated', value: '5,291' }
];

export default function Dashboard() {
  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to LexHub </h1>
          <p className="text-gray-600 mt-2">Your AI-powered legal assistant</p>
        </header>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm">
              <p className="text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className={`${feature.color} p-4`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-6 right-6">
          <button className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors">
            <Brain className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}