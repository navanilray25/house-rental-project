import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentPayments, getNotices, getComplaints } from '../services/dataService';
import MonthlyPaymentForm from '../components/student/MonthlyPaymentForm';
import PaymentHistory from '../components/student/PaymentHistory';
import NoticeBoard from '../components/student/NoticeBoard';
import StudentComplaints from '../components/student/StudentComplaints';
import { Send, FileText, Bell, Wrench, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { STATUS_CONFIG, formatCurrency } from '../utils/formatters';

export default function StudentDashboard({ houseSettings }) {
  const { currentUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'history' | 'notices' | 'complaints'
  const [payments, setPayments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editRoom, setEditRoom] = useState(currentUser?.roomNumber || '101');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditRoom(currentUser.roomNumber || '101');
      setEditPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!editName.trim() || !editRoom.trim()) return;
    setProfileSaving(true);
    try {
      await updateProfile({
        name: editName.trim(),
        roomNumber: editRoom.trim(),
        phone: editPhone.trim(),
      });
      setShowProfileModal(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setProfileSaving(false);
    }
  }

  async function loadData() {
    if (!currentUser) return;
    try {
      const [pList, nList, cList] = await Promise.all([
        getStudentPayments(currentUser.uid),
        getNotices(),
        getComplaints(currentUser.uid),
      ]);
      setPayments(pList);
      setNotices(nList);
      setComplaints(cList);
    } catch (err) {
      console.error('Error loading student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Latest payment status badge
  const latestPayment = payments[0] || null;
  const statusInfo = latestPayment ? STATUS_CONFIG[latestPayment.status] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resident Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {currentUser?.name || 'Student'}!
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-slate-300 text-sm">
                Assigned Room: <span className="font-mono font-bold text-indigo-300 bg-slate-800/80 px-2 py-0.5 rounded">Room #{currentUser?.roomNumber || '101'}</span> • {houseSettings?.houseName}
              </span>
              <button
                onClick={() => setShowProfileModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-indigo-200 border border-white/20 transition cursor-pointer"
              >
                ✏️ Edit Room & Name
              </button>
            </div>
          </div>


          {/* Latest Payment Status Quick Card */}
          {latestPayment ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-right">
              <div className="text-xs text-slate-300 font-medium">
                Latest Bill: {latestPayment.month} {latestPayment.year}
              </div>
              <div className="mt-1 flex items-center justify-end gap-1.5">
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusInfo?.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo?.dotClass}`} />
                  {statusInfo?.label}
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-1 font-mono">
                {formatCurrency(latestPayment.totalAmount, houseSettings?.currency)}
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-xs text-slate-300">
              No bills submitted yet this month.
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('submit')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'submit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Submit Monthly Rent</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3.5 px-4 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Payment History & Receipts ({payments.length})</span>
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
          <span>Notices ({notices.length})</span>
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
          <span>Maintenance Desk ({complaints.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'submit' && (
          <MonthlyPaymentForm
            houseSettings={houseSettings}
            onPaymentSubmitted={() => {
              loadData();
              setActiveTab('history');
            }}
          />
        )}

        {activeTab === 'history' && (
          <PaymentHistory
            payments={payments}
            houseSettings={houseSettings}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'notices' && (
          <NoticeBoard notices={notices} />
        )}

        {activeTab === 'complaints' && (
          <StudentComplaints
            complaints={complaints}
            onRefresh={loadData}
          />
        )}
      </div>

      {/* Edit Profile & Room Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit My Room & Student Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nil Roy"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="121345789"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition disabled:opacity-60"
                >
                  {profileSaving ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

