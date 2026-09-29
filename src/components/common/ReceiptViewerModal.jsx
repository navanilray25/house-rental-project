import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Download, FileText, Calendar, Zap, CreditCard, Hash, MessageSquare, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, STATUS_CONFIG } from '../../utils/formatters';
import { generateRentReceiptPDF } from '../../utils/receiptPdf';

export default function ReceiptViewerModal({
  payment,
  onClose,
  onApprove,
  onReject,
  isAdmin = false,
  houseSettings,
}) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!payment) return null;

  const statusInfo = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
  const currency = houseSettings?.currency || '₹';

  async function handleApprove() {
    setActionLoading(true);
    await onApprove(payment.id);
    setActionLoading(false);
    onClose();
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejecting the payment submission.');
      return;
    }
    setActionLoading(true);
    await onReject(payment.id, rejectReason);
    setActionLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Monthly Rent Submission Details</h3>
              <p className="text-xs text-slate-400">
                {payment.month} {payment.year} • Room #{payment.roomNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Top Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs text-slate-500 font-medium">Student Tenant</span>
              <div className="text-base font-semibold text-slate-900">{payment.studentName}</div>
              <div className="text-xs text-slate-500">Room #{payment.roomNumber}</div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Status</span>
              <div className="mt-0.5">
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border ${statusInfo.badgeClass}`}>
                  <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                  {statusInfo.label}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Submitted on {formatDate(payment.createdAt)}
              </div>
            </div>
          </div>

          {/* Unit & Rent Breakdown Card */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200 font-semibold text-xs text-slate-700 uppercase tracking-wider">
              Payment & Utility Calculations
            </div>
            <div className="divide-y divide-slate-100 text-sm">
              
              {/* Base Rent */}
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Monthly Base Room Rent</span>
                <span className="font-semibold text-slate-900">{formatCurrency(payment.rentAmount, currency)}</span>
              </div>

              {/* Electricity Units */}
              <div className="px-4 py-3 bg-amber-50/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-slate-800 font-medium">Electricity Bill</span>
                  </div>
                  <span className="font-semibold text-slate-900">{formatCurrency(payment.electricityAmount, currency)}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 pl-6">
                  Reading: <strong className="text-slate-700">{payment.electricityUnits} Units</strong> consumed × <strong className="text-slate-700">{currency}{payment.unitRate || houseSettings?.electricityRate || 10}/unit</strong>
                </div>
              </div>

              {/* Additional Dues */}
              {Number(payment.otherAmount) > 0 && (
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-slate-600">Maintenance / Water / Misc.</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(payment.otherAmount, currency)}</span>
                </div>
              )}

              {/* Total Row */}
              <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                <span className="font-bold text-sm">Total Paid by Student</span>
                <span className="font-extrabold text-lg text-emerald-400">{formatCurrency(payment.totalAmount, currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment Transaction Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                Payment Mode
              </div>
              <div className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                {payment.paymentMode || 'Online / UPI'}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Transaction ID / UTR
              </div>
              <div className="text-sm font-mono font-semibold text-slate-800 break-all">
                {payment.transactionId || 'Not provided'}
              </div>
            </div>
          </div>

          {/* Receipt Proof Screenshot */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Attached Payment Screenshot / Receipt Proof
            </label>
            {payment.receiptUrl ? (
              <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
                <img
                  src={payment.receiptUrl}
                  alt="Payment receipt proof"
                  className="max-h-72 max-w-full mx-auto rounded-lg object-contain shadow-sm"
                />
                <a
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
                >
                  View full image in new tab ↗
                </a>
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs text-slate-500">No screenshot attached with this submission.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Verified via transaction reference / bank credit.</p>
              </div>
            )}
          </div>

          {/* Admin Remarks Note */}
          {payment.adminRemarks && (
            <div className={`p-4 rounded-xl border ${
              payment.status === 'rejected' 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                <MessageSquare className="w-4 h-4" />
                Landlord / Admin Feedback Note:
              </div>
              <p className="text-sm">{payment.adminRemarks}</p>
            </div>
          )}

          {/* Rejection input box for Admin */}
          {isAdmin && showRejectInput && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-3">
              <label className="block text-xs font-bold text-rose-800">
                Reason for Rejection (Visible to student):
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. UTR number not found in bank statement, or electricity meter reading incorrect."
                className="w-full text-sm p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                rows={2}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRejectInput(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleReject}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          
          {/* Download PDF button if approved */}
          {payment.status === 'approved' ? (
            <button
              onClick={() => generateRentReceiptPDF(payment, houseSettings)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              Download Official PDF Receipt
            </button>
          ) : (
            <div className="text-xs text-slate-500">
              Receipt download is unlocked once approved by landlord.
            </div>
          )}

          {/* Admin Approval / Rejection Controls */}
          {isAdmin && payment.status === 'pending' && !showRejectInput && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setShowRejectInput(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 border border-rose-300 transition"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Payment
              </button>
            </div>
          )}

          {/* Close button if no admin action required */}
          {(!isAdmin || payment.status !== 'pending' || showRejectInput) && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-200 transition ml-auto"
            >
              Close
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

