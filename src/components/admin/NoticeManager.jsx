import React, { useState } from 'react';
import { addNotice, deleteNotice } from '../../services/dataService';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Bell, PlusCircle, Trash2, AlertCircle, Info, Calendar } from 'lucide-react';

export default function NoticeManager({ notices = [], onRefresh }) {
  const { currentUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await addNotice({
        title: title.trim(),
        content: content.trim(),
        priority,
        author: currentUser?.name || 'Landlord',
      });
      setTitle('');
      setContent('');
      setShowAddForm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error posting notice:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(noticeId) {
    if (confirm('Are you sure you want to delete this notice?')) {
      try {
        await deleteNotice(noticeId);
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error('Error deleting notice:', err);
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            House Announcements & Notice Board
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Publish notices to student dashboards about rent deadlines, maintenance schedules, or house rules.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Post New Notice'}</span>
        </button>
      </div>

      {/* Add Notice Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notice Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Overhead Tank Cleaning this Weekend"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="normal">Normal Announcement</option>
                <option value="urgent">Urgent / Important Alert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notice Details</label>
            <textarea
              required
              rows={3}
              placeholder="Write the full message for students..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              {isSubmitting ? 'Posting...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      )}

      {/* Notices List */}
      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm">No notices currently published.</p>
          </div>
        ) : (
          notices.map((n) => {
            const isUrgent = n.priority === 'urgent';
            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                  isUrgent ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {isUrgent ? (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                        Urgent
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        General
                      </span>
                    )}
                    <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                    <span className="text-xs text-slate-400">• {formatDate(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">{n.content}</p>
                </div>

                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                  title="Delete notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

