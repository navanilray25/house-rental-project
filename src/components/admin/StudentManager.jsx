import React, { useState } from 'react';
import { saveUserProfile } from '../../services/dataService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Users, UserPlus, Edit2, Check, X, Phone, Mail, Home } from 'lucide-react';

export default function StudentManager({ users = [], houseSettings, onRefresh }) {
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRoom, setEditRoom] = useState('');
  const [editRent, setEditRent] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newRent, setNewRent] = useState(4500);

  const currency = houseSettings?.currency || '₹';
  const students = users.filter((u) => u.role === 'student');

  function startEdit(student) {
    setEditingUserId(student.uid || student.id);
    setEditRoom(student.roomNumber || '');
    setEditRent(student.baseRent || 4500);
    setEditPhone(student.phone || '');
  }

  async function handleSaveEdit(student) {
    const uid = student.uid || student.id;
    try {
      await saveUserProfile(uid, {
        ...student,
        roomNumber: editRoom.trim(),
        baseRent: Number(editRent),
        phone: editPhone.trim(),
      });
      setEditingUserId(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error updating student:', err);
    }
  }

  async function handleToggleStatus(student) {
    const uid = student.uid || student.id;
    const nextStatus = student.status === 'vacated' ? 'active' : 'vacated';
    try {
      await saveUserProfile(uid, {
        ...student,
        status: nextStatus,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  }

  async function handleAddStudent(e) {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    try {
      const uid = `usr_${Date.now()}`;
      await saveUserProfile(uid, {
        uid,
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        roomNumber: newRoom.trim(),
        baseRent: Number(newRent),
        role: 'student',
        status: 'active',
        createdAt: new Date().toISOString(),
      });

      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewRoom('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error adding student:', err);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Student Tenant & Room Directory
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage student room allocations, default monthly base rents, and contact details.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Student List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <th className="py-3.5 px-6">Student Info</th>
              <th className="py-3.5 px-6">Room Number</th>
              <th className="py-3.5 px-6">Monthly Base Rent</th>
              <th className="py-3.5 px-6">Contact Phone</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {students.map((st) => {
              const uid = st.uid || st.id;
              const isEditing = editingUserId === uid;
              const isVacated = st.status === 'vacated';

              return (
                <tr key={uid} className={`hover:bg-slate-50/80 transition ${isVacated ? 'opacity-60 bg-slate-50/40' : ''}`}>
                  
                  {/* Name & Email */}
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    <div>{st.name}</div>
                    <div className="text-xs text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      {st.email}
                    </div>
                  </td>

                  {/* Room Number */}
                  <td className="py-4 px-6">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editRoom}
                        onChange={(e) => setEditRoom(e.target.value)}
                        placeholder="e.g. 101"
                        className="w-20 px-2 py-1 text-xs border border-indigo-400 rounded-md font-mono"
                      />
                    ) : (
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md text-xs border border-indigo-200">
                        Room #{st.roomNumber || 'Unassigned'}
                      </span>
                    )}
                  </td>

                  {/* Base Rent */}
                  <td className="py-4 px-6 font-medium text-slate-800">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editRent}
                        onChange={(e) => setEditRent(e.target.value)}
                        className="w-24 px-2 py-1 text-xs border border-indigo-400 rounded-md"
                      />
                    ) : (
                      <span>{formatCurrency(st.baseRent || 4500, currency)}</span>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-6 text-slate-600">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-32 px-2 py-1 text-xs border border-indigo-400 rounded-md"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{st.phone || 'N/A'}</span>
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleStatus(st)}
                      title="Click to toggle Active / Vacated status"
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border transition ${
                        isVacated
                          ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                      }`}
                    >
                      {isVacated ? 'Vacated' : 'Active Tenant'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(st)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Save Changes"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(st)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Add New Resident Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Mehra"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 202"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base Rent ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newRent}
                    onChange={(e) => setNewRent(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98..."
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

