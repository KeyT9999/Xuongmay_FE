import React, { useState, useMemo } from 'react';
import { UserRole } from './types'; // Keep types if needed or cleanup later
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import ProtectedRoute from './src/components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UserManagementPage from './src/pages/UserManagementPage';
import ProfilePage from './src/pages/ProfilePage';

const AppContent: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!currentUser) {
    return null;
  }

  const menuItems = useMemo(() => {
    const profile = [{ id: 'profile', label: 'Hồ Sơ Cá Nhân', role: null }];
    const users = [{ id: 'users', label: 'Quản Lý Người Dùng', role: UserRole.ADMIN }];

    if (currentUser.role === UserRole.ADMIN) {
      return [...profile, ...users];
    }

    return profile;
  }, [currentUser]);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfilePage />;
      case 'users': return <UserManagementPage />;
      default: return <ProfilePage />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9fafb]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        menuItems={menuItems}
        userRole={currentUser.role}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          user={currentUser}
        />
        <main className="flex-1 overflow-y-auto px-10 py-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default App;
