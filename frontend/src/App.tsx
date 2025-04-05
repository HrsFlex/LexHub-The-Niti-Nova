import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CaseResearch from './components/pages/CaseResearch';
import ContractAnalysis from './components/pages/ContractAnalysis';
import LegalNews from './components/pages/LegalNews';
import DocumentComparison from './components/pages/DocumentComparison';
import FormsAssistant from './components/pages/FormsAssistant';
import ChatWidget from './components/ChatWidget';
import FamilyCourtForm from './components/pages/FamilyCourtForm';
import BailForm from './components/pages/BailFormFiller';
import AffidavitOfServiceForm from './components/pages/AffidavitOfServiceForm';
import SurrenderPetitionForm from './components/pages/SurrenderPetitionForm';
import FindLawyer from './components/pages/FindLawyer';
import CaseAnalytics from './components/pages/CaseAnalytics';
import Auth from './components/pages/Auth';
import { AuthProvider } from './contexts/AuthContext';


export default App