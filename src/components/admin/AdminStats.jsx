import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, Clock, Users, Zap, CheckCircle2, TrendingUp } from 'lucide-react';

export default function AdminStats({ payments = [], users = [], houseSettings }) {
  const currency = houseSettings?.currency || '₹';

  // Calculations
  const approvedPayments = payments.filter((p) => p.status === 'approved');
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const students = users.filter((u) => u.role === 'student');

  const totalCollected = approvedPayments.reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0);
  const totalBaseRentCollected = approvedPayments.reduce((acc, p) => acc + (Number(p.rentAmount) || 0), 0);
  const totalElectricityCollected = approvedPayments.reduce((acc, p) => acc + (Number(p.electricityAmount) || 0), 0);
  const totalUnitsBilled = approvedPayments.reduce((acc, p) => acc + (Number(p.electricityUnits) || 0), 0);

  const pendingAmount = pendingPayments.reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      
      {/* Stat 1: Total Revenue Collected */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Rent Collected
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(totalCollected, currency)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Base Rent: {formatCurrency(totalBaseRentCollected, currency)}
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-50 rounded-full opacity-40 pointer-events-none" />
      </div>

      {/* Stat 2: Pending Approvals */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pending Verifications
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-amber-600">
            {pendingPayments.length} <span className="text-xs font-medium text-slate-500">submissions</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Worth {formatCurrency(pendingAmount, currency)} pending review
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-50 rounded-full opacity-40 pointer-events-none" />
      </div>

      {/* Stat 3: Active Students */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Resident Students
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900">
            {students.length} <span className="text-xs font-medium text-slate-500">tenants</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {new Set(students.map((s) => s.roomNumber).filter(Boolean)).size} assigned rooms
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-50 rounded-full opacity-40 pointer-events-none" />
      </div>

      {/* Stat 4: Electricity Units & Utility Revenue */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Electricity Units
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Zap className="w-5 h-5 fill-amber-400" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900">
            {totalUnitsBilled} <span className="text-xs font-medium text-slate-500">Units</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Billed: {formatCurrency(totalElectricityCollected, currency)} (@ {currency}{houseSettings?.electricityRate || 10}/u)
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-50 rounded-full opacity-40 pointer-events-none" />
      </div>

    </div>
  );
}

