'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Home,
  Users,
  MessageSquare,
  Settings,
  ChevronDown,
} from 'lucide-react';
import OverviewDashboard from '@/components/admin/OverviewDashboard';
import PropertyListings from '@/components/admin/PropertyListings';
import UserDirectory from '@/components/admin/UserDirectory';
import LeadsManagement from '@/components/admin/LeadsManagement';
import ContentManagement from '@/components/admin/ContentManagement';

type DashboardTab = 'overview' | 'properties' | 'users' | 'leads' | 'content';

const tabs: Array<{
  id: DashboardTab;
  name: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    id: 'overview',
    name: 'Overview',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Dashboard stats & activity',
  },
  {
    id: 'properties',
    name: 'Properties',
    icon: <Home className="w-5 h-5" />,
    description: 'Manage all property listings',
  },
  {
    id: 'users',
    name: 'Users',
    icon: <Users className="w-5 h-5" />,
    description: 'Owners & tenants directory',
  },
  {
    id: 'leads',
    name: 'Leads',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Inquiries & follow-ups',
  },
  {
    id: 'content',
    name: 'Content',
    icon: <Settings className="w-5 h-5" />,
    description: 'Banners & notifications',
  },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'properties':
        return <PropertyListings />;
      case 'users':
        return <UserDirectory />;
      case 'leads':
        return <LeadsManagement />;
      case 'content':
        return <ContentManagement />;
      default:
        return <OverviewDashboard />;
    }
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* Sidebar Navigation - Desktop */}
      <div className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:border-r md:border-zinc-200 md:dark:border-zinc-800 md:bg-white md:dark:bg-zinc-900 md:shadow-sm md:flex md:flex-col md:z-40">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
            SST Admin
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Management Dashboard
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.icon}
              <div className="text-left">
                <div className="font-semibold text-sm">{tab.name}</div>
                <div className="text-xs opacity-70">{tab.description}</div>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              💡 Tip
            </p>
            <p className="text-blue-800 dark:text-blue-300">
              Use the tabs above to navigate between different admin sections.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-black text-zinc-900 dark:text-white">
            SST Admin
          </h2>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                isMobileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 p-4 space-y-2"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {tab.icon}
                <div>
                  <div className="font-semibold text-sm">{tab.name}</div>
                  <div className="text-xs opacity-70">{tab.description}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="md:pl-64">
        <div className="p-4 md:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="md:ml-64 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 px-4 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            © 2026 SST Home Solutions. All rights reserved.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Admin Dashboard v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
