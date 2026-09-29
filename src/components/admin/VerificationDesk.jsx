import React, { useState } from 'react';
import { formatCurrency, formatDate, STATUS_CONFIG, MONTH_NAMES } from '../../utils/formatters';
import { updatePaymentStatus } from '../../services/dataService';
import { generateRentReceiptPDF } from '../../utils/receiptPdf';
import { CheckCircle2, XCircle, Eye, Download, Search, Filter, ShieldCheck, Zap, FileSpreadsheet } from 'lucide-react';
import ReceiptViewerModal from '../common/ReceiptViewerModal';

export default function VerificationDesk({ payments = [], houseSettings, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending'); // default to pending for admin focus
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const currency = houseSettings?.currency || '₹';

  // Filter logic
  const filtered = payments.filter((p) => {
    // Search
    const matchesSearch =
      p.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.roomNumber?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

    // Month
    const matchesMonth = selectedMonth === 'all' || p.month === selectedMonth;

    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Direct approve
  async function handleDirectApprove(paymentId) {
    setActionLoadingId(paymentId);
    try {
      await updatePaymentStatus(paymentId, 'approved', 'Approved by landlord.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error approving payment:', err);
    } finally {
      setActionLoadingId(null);
    }
  }

  // Reject with remark
  async function handleReject(paymentId, reason) {
    setActionLoadingId(paymentId);
    try {
      await updatePaymentStatus(paymentId, 'rejected', reason);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error rejecting payment:', err);
    } finally {
      setActionLoadingId(null);
    }
  }

  // Export filtered payments to CSV
  function exportToCSV() {
    if (filtered.length === 0) return;

    const headers = ['Student Name', 'Room No', 'Month', 'Year', 'Base Rent', 'Elec Units', 'Unit Rate', 'Elec Total', 'Other Charges', 'Grand Total', 'Mode', 'Transaction ID', 'Status', 'Submitted Date'];
    const rows = filtered.map((p) => [
      `"${p.studentName || ''}"`,
      `"${p.roomNumber || ''}"`,
      `"${p.month || ''}"`,
      p.year || '',
      p.rentAmount || 0,
      p.electricityUnits || 0,
      p.unitRate || 10,
      p.electricityAmount || 0,
      p.otherAmount || 0,
      p.totalAmount || 0,
      `"${p.paymentMode || ''}"`,
      `"${p.transactionId || ''}"`,
      `"${p.status || ''}"`,
      `"${formatDate(p.createdAt)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rental_Payments_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header & Filter Controls */}
      <div className="p-6 border-b border-slate-200 space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Student Payment Verification Desk
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Verify monthly rent submissions, check electricity unit calculations against meter logs, and confirm receipt proofs.
            </p>
          </div>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            title="Download CSV report"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export to CSV</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by student name, room # or UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Months</option>
            {MONTH_NAMES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedStatus === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Pending ({payments.filter((p) => p.status === 'pending').length})
            </button>
            <button
              onClick={() => setSelectedStatus('approved')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedStatus === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setSelectedStatus('rejected')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedStatus === 'rejected' ? 'bg-rose-600 text-white shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              All ({payments.length})
            </button>
          </div>

        </div>

      </div>

      {/* Table Content */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h4 className="text-base font-semibold text-slate-700">No submissions found</h4>
          <p className="text-sm text-slate-500 mt-1">
            There are no student payment submissions matching your current search and filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-5">Student / Room</th>
                <th className="py-3.5 px-5">Period</th>
                <th className="py-3.5 px-5">Base Rent</th>
                <th className="py-3.5 px-5">Electricity Reading</th>
                <th className="py-3.5 px-5">Total Paid</th>
                <th className="py-3.5 px-5">Transaction Reference</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((p) => {
                const statusInfo = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                const isPending = p.status === 'pending';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Student & Room */}
                    <td className="py-4 px-5 font-semibold text-slate-900">
                      <div>{p.studentName}</div>
                      <div className="text-xs text-indigo-600 font-mono font-medium">
                        Room #{p.roomNumber}
                      </div>
                    </td>

                    {/* Period */}
                    <td className="py-4 px-5 text-slate-700">
                      <span className="font-medium">{p.month} {p.year}</span>
                      <span className="text-xs text-slate-400 block">{formatDate(p.createdAt)}</span>
                    </td>

                    {/* Base Rent */}
                    <td className="py-4 px-5 text-slate-700 font-medium">
                      {formatCurrency(p.rentAmount, currency)}
                    </td>

                    {/* Electricity Units */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                        <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{p.electricityUnits} Units</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatCurrency(p.electricityAmount, currency)} (@ {currency}{p.unitRate || 10}/u)
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-5 font-extrabold text-slate-900">
                      {formatCurrency(p.totalAmount, currency)}
                    </td>

                    {/* Transaction / Receipt */}
                    <td className="py-4 px-5">
                      <div className="font-mono text-xs text-slate-700 truncate max-w-[150px]" title={p.transactionId}>
                        {p.transactionId}
                      </div>
                      <div className="text-[11px] text-slate-400 uppercase">
                        Mode: {p.paymentMode || 'UPI'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusInfo.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      {/* Detailed Inspect */}
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
                        title="View Full Calculation & Receipt Proof"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Review</span>
                      </button>

                      {/* Quick 1-Click Approve */}
                      {isPending && (
                        <button
                          disabled={actionLoadingId === p.id}
                          onClick={() => handleDirectApprove(p.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
                          title="Quick Approve"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {/* Download Receipt if approved */}
                      {p.status === 'approved' && (
                        <button
                          onClick={() => generateRentReceiptPDF(p, houseSettings)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg"
                          title="Download Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selectedPayment && (
        <ReceiptViewerModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onApprove={handleDirectApprove}
          onReject={handleReject}
          isAdmin={true}
          houseSettings={houseSettings}
        />
      )}

    </div>
  );
}

