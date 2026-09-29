import React, { useState } from 'react';
import { updateComplaintStatus } from '../../services/dataService';
import { formatDate } from '../../utils/formatters';
import { Wrench, CheckCircle2, Clock, AlertCircle, MessageSquare, Send } from 'lucide-react';

export default function ComplaintDesk({ complaints = [], onRefresh }) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const filtered = complaints.filter((c) => {
    if (selectedStatus === 'all') return true;
    return c.status === selectedStatus;
  });

  async function handleStatusChange(complaintId, newStatus) {
    try {
      await updateComplaintStatus(complaintId, newStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }

  async function handleSendReply(complaint) {
    if (!replyText.trim()) return;
    try {
      await updateComplaintStatus(complaint.id, complaint.status, replyText.trim());
      setActiveReplyId(null);
      setReplyText('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error replying to complaint:', err);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" />
            Student Maintenance & Repair Desk
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track student complaints, dispatch technicians, and communicate status updates.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            All ({complaints.length})
          </button>
          <button
            onClick={() => setSelectedStatus('open')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedStatus === 'open' ? 'bg-amber-500 text-white shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Open ({complaints.filter((c) => c.status === 'open').length})
          </button>
          <button
            onClick={() => setSelectedStatus('in_progress')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedStatus === 'in_progress' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setSelectedStatus('resolved')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedStatus === 'resolved' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No maintenance requests under this filter.</p>
          </div>
        ) : (
          filtered.map((comp) => {
            const isReplying = activeReplyId === comp.id;

            return (
              <div key={comp.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                        {comp.category}
                      </span>
                      <h3 className="font-bold text-base text-slate-900">{comp.title}</h3>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Raised by <strong className="text-slate-700">{comp.studentName}</strong> (Room #{comp.roomNumber}) • {formatDate(comp.createdAt)}
                    </div>
                    <p className="text-sm text-slate-700 mt-2">{comp.description}</p>
                  </div>

                  {/* Status Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-500">Status:</label>
                    <select
                      value={comp.status}
                      onChange={(e) => handleStatusChange(comp.id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none ${
                        comp.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : comp.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="open">Open / Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Existing Reply */}
                {comp.adminReply && (
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Your Response to Student: </span>
                      {comp.adminReply}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                {isReplying ? (
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add an update for the student (e.g. Plumber arriving at 3 PM)..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleSendReply(comp)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                    <button
                      onClick={() => { setActiveReplyId(null); setReplyText(''); }}
                      className="px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      onClick={() => { setActiveReplyId(comp.id); setReplyText(comp.adminReply || ''); }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{comp.adminReply ? 'Update response note' : 'Reply / Add note to student'}</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

