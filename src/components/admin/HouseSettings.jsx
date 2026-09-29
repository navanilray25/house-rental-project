import React, { useState } from 'react';
import { updateHouseSettings, resetDemoData } from '../../services/dataService';
import { Settings, Zap, DollarSign, Building2, Phone, QrCode, Save, RefreshCw, AlertTriangle } from 'lucide-react';

export default function HouseSettings({ houseSettings, onRefresh }) {
  const [houseName, setHouseName] = useState(houseSettings?.houseName || 'Student House Rental');
  const [electricityRate, setElectricityRate] = useState(houseSettings?.electricityRate || 10);
  const [currency, setCurrency] = useState(houseSettings?.currency || '₹');
  const [contactPhone, setContactPhone] = useState(houseSettings?.contactPhone || '');
  const [upiId, setUpiId] = useState(houseSettings?.upiId || '');
  const [address, setAddress] = useState(houseSettings?.address || '');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateHouseSettings({
        ...houseSettings,
        houseName: houseName.trim(),
        electricityRate: Number(electricityRate),
        currency: currency.trim(),
        contactPhone: contactPhone.trim(),
        upiId: upiId.trim(),
        address: address.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error saving house settings:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (confirm('Are you sure you want to reset all data back to original seed demo values? This will reload the page.')) {
      resetDemoData();
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          House & Utility Configuration
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure house billing parameters, electricity rate per meter unit, and student payment details.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
          Configuration updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* House Name & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Hostel / House Name
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Property Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 14/B University Road"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Electricity Unit Rate & Currency */}
        <div className="p-5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>Electricity Meter Unit Pricing Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Electricity Rate Per Unit ({currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={electricityRate}
                  onChange={(e) => setElectricityRate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-amber-800 font-semibold">
                  {currency} / unit
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Used to automatically calculate student electricity charges: <code className="bg-white px-1 rounded">Units × Rate</code>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="₹ or $"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Landlord Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Landlord UPI ID (For Student Payment Transfers)
            </label>
            <div className="relative">
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. landlord@okhdfcbank"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Shown to students when filing their monthly payment form.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Landlord Contact Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Store to Factory Defaults</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}

