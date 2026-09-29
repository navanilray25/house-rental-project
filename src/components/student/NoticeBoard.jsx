import React from 'react';
import { formatDate } from '../../utils/formatters';
import { Bell, AlertCircle, Info, Calendar } from 'lucide-react';

export default function NoticeBoard({ notices = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          House Notice Board & Announcements
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Stay informed about maintenance schedules, house rules, and important notices from the management ownergit add ..
        </p>
      </div>

      {notices.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-slate-100 rounded-xl">
          <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No notices posted at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => {
            const isUrgent = notice.priority === 'urgent';
            return (
              <div
                key={notice.id}
                className={`p-5 rounded-2xl border transition ${
                  isUrgent
                    ? 'bg-rose-50/50 border-rose-200 shadow-sm shadow-rose-100'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isUrgent ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 uppercase tracking-wider">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Urgent Notice
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Info className="w-3.5 h-3.5 text-indigo-500" />
                        General Announcement
                      </span>
                    )}
                    <h3 className="font-bold text-base text-slate-900">{notice.title}</h3>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(notice.createdAt)}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed mt-2">
                  {notice.content}
                </p>

                {notice.author && (
                  <div className="mt-3 text-xs text-slate-400 font-medium">
                    Posted by: <span className="text-slate-600">{notice.author}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

