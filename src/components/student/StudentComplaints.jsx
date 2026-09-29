import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addComplaint } from '../../services/dataService';
import { formatDate } from '../../utils/formatters';
import { Wrench, PlusCircle, CheckCircle2, Clock, AlertCircle, MessageSquare } from 'lucide-react';

const CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing (Tap / Washroom)' },
  { value: 'electrical', label: 'Electrical (Fan / Light / Plug)' },
  { value: 'cleaning', label: 'Cleaning & Housekeeping' },
  { value: 'wifi', label: 'Wi-Fi & Internet' },
  { value: 'furniture', label: 'Bed / Table / Furniture' },
  { value: 'other', label: 'Other Room Issue' },
];

export default function StudentComplaints({ complaints = [], onRefresh }) {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('plumbing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setStatusMsg('');
    try {
      await addComplaint({
        studentId: currentUser.uid,
        studentName: currentUser.name,
        roomNumber: currentUser.roomNumber || 'N/A',
        category,
        title: title.trim(),
        description: description.trim(),
      });

      setStatusMsg('Maintenance ticket raised successfully!');
      setTitle('');
      setDescription('');
      setShowForm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error raising complaint:', err);
      setStatusMsg('Failed to raise ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Raise Action */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" />
            Room Maintenance & Complaint Desk
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Need repairs or facing issues in your room? Report them directly to management here.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'Raise New Issue'}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          {statusMsg}
        </div>
      )}

      {/* Complaint Submission Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 animate-in fade-in duration-200">
          <h3 className="font-bold text-base text-slate-900 mb-4">Report an Issue / Repair Request</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Issue Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bathroom shower not working"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Issue Description & Details
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe the issue clearly (e.g., when did it start, exact spot in the room)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Previous Complaints */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h3 className="font-bold text-base text-slate-900 mb-4">My Past Maintenance Requests</h3>

        {complaints.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Wrench className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No maintenance requests raised yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 space-y-4">
            {complaints.map((comp) => {
              const statusBadge = {
                open: { bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock, label: 'Open / Pending' },
                in_progress: { bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: AlertCircle, label: 'In Progress' },
                resolved: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2, label: 'Resolved' },
              }[comp.status] || { bg: 'bg-slate-100 text-slate-700 border-slate-300', icon: Clock, label: comp.status };

              const Icon = statusBadge.icon;

              return (
                <div key={comp.id} className="pt-4 first:pt-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                          {comp.category}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{comp.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{comp.description}</p>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusBadge.bg}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {statusBadge.label}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Reported {formatDate(comp.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Landlord Response Box */}
                  {comp.adminReply && (
                    <div className="mt-3 p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-indigo-800">Management Response: </span>
                        {comp.adminReply}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

