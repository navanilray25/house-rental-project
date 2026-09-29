import React, { useState } from 'react';
import { formatCurrency, formatDate, STATUS_CONFIG } from '../../utils/formatters';
import { generateRentReceiptPDF } from '../../utils/receiptPdf';
import { Download, Eye, FileText, CheckCircle2, Clock, AlertTriangle, Filter } from 'lucide-react';
import ReceiptViewerModal from '../common/ReceiptViewerModal';

export default function PaymentHistory({ payments = [], houseSettings, onRefresh }) {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const currency = houseSettings?.currency || '₹';

  const filteredPayments = payments.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header & Filter Controls */}
      <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            My Payment Records & Receipts
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track verification status of past submissions and download official rent receipts.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            All ({payments.length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'rejected' ? 'bg-rose-600 text-white shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Table / List */}
      {filteredPayments.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h4 className="text-base font-semibold text-slate-700">No payment records found</h4>
          <p className="text-sm text-slate-500 mt-1">
            {filterStatus === 'all'
              ? 'You have not submitted any monthly rent or electricity payments yet.'
              : `No payments with "${filterStatus}" status.`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-6">Month & Year</th>
                <th className="py-3.5 px-6">Rent Amount</th>
                <th className="py-3.5 px-6">Electricity Units</th>
                <th className="py-3.5 px-6">Total Paid</th>
                <th className="py-3.5 px-6">Reference ID</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPayments.map((p) => {
                const statusInfo = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Month */}
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>{p.month} {p.year}</div>
                      <div className="text-xs text-slate-400 font-normal">
                        Submitted {formatDate(p.createdAt)}
                      </div>
                    </td>

                    {/* Rent */}
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {formatCurrency(p.rentAmount, currency)}
                    </td>

                    {/* Electricity */}
                    <td className="py-4 px-6 text-slate-700">
                      <span className="font-semibold text-amber-700">{p.electricityUnits} Units</span>
                      <span className="text-xs text-slate-400 block">
                        ({formatCurrency(p.electricityAmount, currency)})
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {formatCurrency(p.totalAmount, currency)}
                    </td>

                    {/* Ref */}
                    <td className="py-4 px-6 font-mono text-xs text-slate-500 max-w-[140px] truncate">
                      {p.transactionId || 'N/A'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusInfo.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                        {statusInfo.label}
                      </span>
                      {p.status === 'rejected' && p.adminRemarks && (
                        <div className="text-[11px] text-rose-600 mt-1 max-w-[200px] truncate" title={p.adminRemarks}>
                          Reason: {p.adminRemarks}
                        </div>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                        title="View Submission Details & Screenshot"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {p.status === 'approved' && (
                        <button
                          onClick={() => generateRentReceiptPDF(p, houseSettings)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition"
                          title="Download Rent Receipt PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt</span>
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

      {/* Detail Modal */}
      {selectedPayment && (
        <ReceiptViewerModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          houseSettings={houseSettings}
          isAdmin={false}
        />
      )}

    </div>
  );
}

