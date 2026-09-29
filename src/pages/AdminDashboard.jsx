import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllPayments, getAllUsers, getNotices, getComplaints } from '../services/dataService';
import AdminStats from '../components/admin/AdminStats';
import VerificationDesk from '../components/admin/VerificationDesk';
import StudentManager from '../components/admin/StudentManager';
import HouseSettings from '../components/admin/HouseSettings';
import NoticeManager from '../components/admin/NoticeManager';
import ComplaintDesk from '../components/admin/ComplaintDesk';
import { Shield, ShieldCheck, Users, Settings, Bell, Wrench } from 'lucide-react';

export default function AdminDashboard({ houseSettings, onSettingsUpdated }) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications' | 'students' | 'settings' | 'notices' | 'complaints'
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadAllData() {
    try {
      const [pList, uList, nList, cList] = await Promise.all([
        getAllPayments(),
        getAllUsers(),
        getNotices(),
        getComplaints(),
      ]);
      setPayments(pList);
      setUsers(uList);
      setNotices(nList);
      setComplaints(cList);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const openComplaintsCount = complaints.filter((c) => c.status === 'open').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200 mb-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Landlord Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {houseSettings?.houseName || 'Rental Management'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Logged in as <strong className="text-slate-800">{currentUser?.name}</strong> • Real-time student rent & unit tracker
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <AdminStats
        payments={payments}
        users={users}
        houseSettings={houseSettings}
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'verifications'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Payment Verifications</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.2 rounded-full text-xs bg-amber-500 text-white font-bold animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'students'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students & Rooms</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'complaints'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Maintenance Desk</span>
          {openComplaintsCount > 0 && (
            <span className="px-2 py-0.2 rounded-full text-xs bg-rose-500 text-white font-bold">
              {openComplaintsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'notices'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notices</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>House & Utility Rates</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'verifications' && (
          <VerificationDesk
            payments={payments}
            houseSettings={houseSettings}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'students' && (
          <StudentManager
            users={users}
            houseSettings={houseSettings}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'complaints' && (
          <ComplaintDesk
            complaints={complaints}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'notices' && (
          <NoticeManager
            notices={notices}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'settings' && (
          <HouseSettings
            houseSettings={houseSettings}
            onRefresh={() => {
              loadAllData();
              if (onSettingsUpdated) onSettingsUpdated();
            }}
          />
        )}
      </div>

    </div>
  );
}

