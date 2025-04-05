import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, FileText, ScrollText, FileCheck } from 'lucide-react';

const formTypes = [
  {
    id: 'family-court',
    title: 'Family Court Form',
    description: 'Legal documentation for family-related proceedings and petitions',
    image: 'https://matrimonialadvocates.com/wp-content/uploads/2020/04/Jurisdiction-of-family-courts-in-india-400x300.jpg',
    icon: Scale,
    path: '/forms/family-court'
  },
  {
    id: 'bail-form',
    title: 'Bail Application Form',
    description: 'Application for bail in criminal proceedings',
    image: 'https://www.dubeyandcompany.com/wp-content/uploads/2020/08/application-for-anticipatory-bail-in-india.jpg',
    icon: FileText,
    path: '/forms/bail'
  },
  {
    id: 'affidavit',
    title: 'Affidavit of Service',
    description: 'Legal document certifying the delivery of court papers',
    image: 'https://lh6.googleusercontent.com/proxy/pylCRKW-eiohVItQ7_qaWESHV-aU959iDEAQvlcZa5E6IayUlOJT7C_6diS6UOZuubyC_QI_eOjpZ5NsHlex_8JcYJFb9r2IEG3zJ5dogJ6I6pA=s0-d',
    icon: ScrollText,
    path: '/forms/affidavit'
  },
  {
    id: 'surrender',
    title: 'Surrender Petition',
    description: 'Formal application for voluntary surrender in legal proceedings',
    image: 'https://section1.in/wp-content/uploads/2024/03/surrender-1.jpg',
    icon: FileCheck,
    path: '/forms/surrender'
  }
];

export default function FormsAssistant() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Legal Forms Assistant</h1>
        <p className="text-gray-600 mt-2">Select the type of form you need to fill</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {formTypes.map((form) => (
          <div
            key={form.id}
            onClick={() => navigate(form.path)}
            className="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80 z-10" />
            <img
              src={form.image}
              alt={form.title}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end text-white">
              <div className="mb-4">
                <form.icon className="w-10 h-10 text-blue-400 mb-3" />
                <h3 className="text-2xl font-bold mb-2">{form.title}</h3>
                <p className="text-gray-200">{form.description}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-300">Click to fill form</span>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center transform group-hover:translate-x-2 transition-transform duration-300">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}