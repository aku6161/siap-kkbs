import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { ComplaintForm } from './components/ComplaintForm';
import { ComplaintTracker } from './components/ComplaintTracker';
import { PublicStats } from './components/PublicStats';
import { AdminDashboard } from './components/AdminDashboard';
import { DynamicHexagonBackground } from './components/DynamicHexagonBackground';
import { Complaint, ComplaintCategory, TabType } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('utama');
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory>('KEMUDAHAN');
  const [searchRef, setSearchRef] = useState<string>('');
  
  // Auto-detect ?ref= parameter from URL (e.g. when officer/user clicks Telegram button)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        setSearchRef(refParam.trim().toUpperCase());
        setActiveTab('semak');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Admin auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('siap_admin_token') ? true : false;
    } catch {
      return false;
    }
  });

  const handleAdminLogin = (token: string) => {
    try {
      sessionStorage.setItem('siap_admin_token', token);
    } catch {
      // Ignore storage restrictions
    }
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('siap_admin_token');
    } catch {
      // Ignore storage restrictions
    }
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
    <div className="relative min-h-screen text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      {/* Dynamic Hexagon Motion Graphics Background */}
      <DynamicHexagonBackground />

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

