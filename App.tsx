
import React, { useState, useMemo } from 'react';
import { 
  UserRole, 
  Style, 
  StyleStatus, 
  WorkOrder,
  Material
} from './types';
import { MOCK_STYLES, MOCK_MATERIALS } from './constants';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import ProtectedRoute from './src/components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TechPage from './pages/TechPage';
import AccountingPage from './pages/AccountingPage';
import PlanningPage from './pages/PlanningPage';
import WarehousePage from './pages/WarehousePage';
import FactoryPage from './pages/FactoryPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './src/pages/UserManagementPage';
import ProfilePage from './src/pages/ProfilePage';

const AppContent: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [styles, setStyles] = useState<Style[]>(MOCK_STYLES);
  const [materials, setMaterials] = useState<Material[]>(MOCK_MATERIALS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  if (!currentUser) {
    return null;
  }

  const menuItems = useMemo(() => {
    const profile = [{ id: 'profile', label: 'Hồ Sơ Cá Nhân', role: null }]; // Available for all roles
    const base = [{ id: 'dashboard', label: 'Tổng Quan', role: UserRole.ADMIN }];
    const users = [{ id: 'users', label: 'Quản Lý Người Dùng', role: UserRole.ADMIN }];
    const tech = [{ id: 'tech', label: 'Kỹ Thuật (Style/BOM)', role: UserRole.TECH }];
    const accounting = [{ id: 'accounting', label: 'Kế Toán (Giá)', role: UserRole.ACCOUNTANT }];
    const planning = [{ id: 'planning', label: 'Kế Hoạch (WO)', role: UserRole.PLANNER }];
    const warehouse = [{ id: 'warehouse', label: 'Kho Vật Tư', role: UserRole.WAREHOUSE }];
    const production = [{ id: 'production', label: 'Sản Xuất (Xưởng)', role: UserRole.FACTORY_MANAGER }];

    if (currentUser.role === UserRole.ADMIN) {
      return [...profile, ...base, ...users, ...tech, ...accounting, ...planning, ...warehouse, ...production];
    }

    const roleMap: Partial<Record<UserRole, any[]>> = {
      [UserRole.TECH]: tech,
      [UserRole.ACCOUNTANT]: accounting,
      [UserRole.PLANNER]: planning,
      [UserRole.WAREHOUSE]: warehouse,
      [UserRole.FACTORY_MANAGER]: production,
    };

    return [...profile, ...(roleMap[currentUser.role] || base)];
  }, [currentUser]);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfilePage />;
      case 'dashboard': return <DashboardPage styles={styles} workOrders={workOrders} />;
      case 'users': return <UserManagementPage />;
      case 'tech': return <TechPage styles={styles} onUpdateStyles={setStyles} materials={materials} />;
      case 'accounting': return <AccountingPage styles={styles} onUpdateStyles={setStyles} />;
      case 'planning': return <PlanningPage styles={styles} workOrders={workOrders} onUpdateWorkOrders={setWorkOrders} onUpdateStyles={setStyles} />;
      case 'warehouse': return <WarehousePage materials={materials} onUpdateMaterials={setMaterials} workOrders={workOrders} />;
      case 'production': return <FactoryPage workOrders={workOrders} onUpdateWorkOrders={setWorkOrders} styles={styles} />;
      default: return <DashboardPage styles={styles} workOrders={workOrders} />;
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
