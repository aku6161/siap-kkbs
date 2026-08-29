import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { ComplaintForm } from './components/ComplaintForm';
import { ComplaintTracker } from './components/ComplaintTracker';
import { PublicStats } from './components/PublicStats';
import { AdminDashboard } from './components/AdminDashboard';
import { Complaint, ComplaintCategory, TabType } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('utama');
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory>('KEMUDAHAN');
  const [searchRef, setSearchRef] = useState<string>('');
  
  // Admin auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('siap_admin_token') ? true : false;
  });

  const handleAdminLogin = (token: string) => {
    sessionStorage.setItem('siap_admin_token', token);
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('siap_admin_token');
    setIsAdminLoggedIn(false);
  };

  const handleStartComplaint = (cat?: ComplaintCategory) => {
    if (cat) {
      setSelectedCategory(cat);
    }
    setActiveTab('aduan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackComplaint = (noRef?: string) => {
    if (noRef) {
      setSearchRef(noRef);
    }
    setActiveTab('semak');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplaintSubmitted = (complaint: Complaint) => {
    setSearchRef(complaint.noRujukan);
    setActiveTab('semak');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      {/* Frosted Ambient Glowing Orbs Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft Blue Orb top-left */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/25 rounded-full blur-3xl" />
        {/* Indigo/Purple Orb top-right */}
        <div className="absolute top-1/4 -right-20 w-[30rem] h-[30rem] bg-indigo-400/20 rounded-full blur-3xl" />
        {/* Emerald Orb center-left */}
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl" />
        {/* Amber Orb bottom-right */}
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl" />
        {/* Violet Orb bottom-left */}
        <div className="absolute -bottom-20 left-1/3 w-[28rem] h-[28rem] bg-violet-400/20 rounded-full blur-3xl" />
      </div>

      {/* Content wrapper above backdrop */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Universal Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdminLoggedIn={isAdminLoggedIn}
          onAdminLogout={handleAdminLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 pb-16">
          {activeTab === 'utama' && (
            <LandingPage
              onNavigate={setActiveTab}
              onSelectCategory={handleStartComplaint}
              onSearchRef={handleTrackComplaint}
            />
          )}

          {activeTab === 'aduan' && (
            <ComplaintForm
              initialCategory={selectedCategory}
              onSuccess={handleComplaintSubmitted}
              onCancel={() => setActiveTab('utama')}
            />
          )}

          {activeTab === 'semak' && (
            <ComplaintTracker
              initialRef={searchRef}
              onNavigateToCreate={() => setActiveTab('aduan')}
            />
          )}

          {activeTab === 'statistik' && (
            <PublicStats
              onNavigateToCreate={() => setActiveTab('aduan')}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard
              isAdminLoggedIn={isAdminLoggedIn}
              onLogin={handleAdminLogin}
              onLogout={handleAdminLogout}
            />
          )}
        </main>

        {/* Universal Footer */}
        <Footer
          onNavigate={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

      </div>
    </div>
  );
}

export default App;

