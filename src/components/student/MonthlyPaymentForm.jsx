import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitMonthlyPayment, uploadReceiptFile } from '../../services/dataService';
import { MONTH_NAMES, formatCurrency, calculateElectricityCharge, calculateTotalAmount } from '../../utils/formatters';
import { Send, Upload, Zap, DollarSign, Calendar, CreditCard, CheckCircle2, Image as ImageIcon, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MonthlyPaymentForm({ houseSettings, onPaymentSubmitted }) {
  const { currentUser } = useAuth();

  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();

  const [month, setMonth] = useState(MONTH_NAMES[currentMonthIdx]);
  const [year, setYear] = useState(currentYear);
  const [roomNumber, setRoomNumber] = useState(currentUser?.roomNumber || '101');
  const [baseRent, setBaseRent] = useState(currentUser?.baseRent || 4500);

  useEffect(() => {
    if (currentUser?.roomNumber && currentUser.roomNumber !== 'N/A') {
      setRoomNumber(currentUser.roomNumber);
    }
    if (currentUser?.baseRent) {
      setBaseRent(currentUser.baseRent);
    }
  }, [currentUser]);

  // Meter Reading Mode: direct units OR meter difference
  const [meterMode, setMeterMode] = useState('direct'); // 'direct' or 'readings'
  const [electricityUnits, setElectricityUnits] = useState(35);
  const [previousMeter, setPreviousMeter] = useState('');
  const [currentMeter, setCurrentMeter] = useState('');

  const [otherAmount, setOtherAmount] = useState(100); // maintenance/water
  const [paymentMode, setPaymentMode] = useState('upi');
  const [transactionId, setTransactionId] = useState('');
  
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const currency = houseSettings?.currency || '₹';
  const unitRate = houseSettings?.electricityRate || 10;

  // Sync direct units when meter readings change
  useEffect(() => {
    if (meterMode === 'readings') {
      const prev = parseFloat(previousMeter) || 0;
      const curr = parseFloat(currentMeter) || 0;
      if (curr >= prev) {
        setElectricityUnits(curr - prev);
      }
    }
  }, [meterMode, previousMeter, currentMeter]);

  const electricityCost = calculateElectricityCharge(electricityUnits, unitRate);
  const totalAmount = calculateTotalAmount(baseRent, electricityUnits, unitRate, otherAmount);

  // Handle receipt image selection
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller image.');
        return;
      }
      setReceiptFile(file);
      const previewUrl = URL.createObjectURL(file);
      setReceiptPreview(previewUrl);
    }
  }

  // Handle submission
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!transactionId.trim()) {
      setErrorMessage('Please enter the Transaction ID / UTR or reference number.');
      return;
    }

    try {
      setIsSubmitting(true);

      let receiptUrl = '';
      if (receiptFile) {
        receiptUrl = await uploadReceiptFile(receiptFile, 'payment_receipts');
      }

      const safeStudentId = currentUser?.uid || 'std_' + Date.now();
      const safeStudentName = currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Resident Student');
      const safeRoomNumber = roomNumber || currentUser?.roomNumber || '101';

      const paymentRecord = {
        studentId: safeStudentId,
        studentName: safeStudentName,
        roomNumber: safeRoomNumber,
        month,
        year: Number(year),
        rentAmount: Number(baseRent),
        electricityUnits: Number(electricityUnits),
        unitRate: Number(unitRate),
        electricityAmount: Number(electricityCost),
        otherAmount: Number(otherAmount),
        totalAmount: Number(totalAmount),
        paymentMode,
        transactionId: transactionId.trim(),
        receiptUrl,
      };

      await submitMonthlyPayment(paymentRecord);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSuccessMessage(`Payment record for ${month} ${year} submitted successfully! Your landlord will verify it shortly.`);
      setTransactionId('');
      setReceiptFile(null);
      setReceiptPreview('');

      if (onPaymentSubmitted) {
        await onPaymentSubmitted();
      }

    } catch (err) {
      console.error('Submission failed:', err);
      setErrorMessage('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Main Submission Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-600" />
            Monthly Rent & Utility Submission Form
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Fill in your monthly rent and electricity units reading, attach your transaction slip, and submit for verification.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold">Submission Received!</div>
              <div>{successMessage}</div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Room Number & Billing Period */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                My Room Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Billing Month
              </label>
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {MONTH_NAMES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Billing Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>


          {/* Base Rent & Fixed Charges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Base Room Rent ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">{currency}</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={baseRent}
                  onChange={(e) => setBaseRent(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Maintenance / Water / Misc ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">{currency}</span>
                <input
                  type="number"
                  min="0"
                  value={otherAmount}
                  onChange={(e) => setOtherAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Electricity Units Section (Interactive Calculator) */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Electricity Meter Reading</h4>
                  <p className="text-xs text-slate-600">
                    House Rate: <strong className="text-amber-800">{currency}{unitRate} per unit</strong>
                  </p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex bg-amber-200/50 p-0.5 rounded-lg text-xs font-medium text-amber-900">
                <button
                  type="button"
                  onClick={() => setMeterMode('direct')}
                  className={`px-3 py-1 rounded-md transition ${meterMode === 'direct' ? 'bg-white shadow-sm font-bold text-slate-900' : 'hover:text-amber-950'}`}
                >
                  Direct Units
                </button>
                <button
                  type="button"
                  onClick={() => setMeterMode('readings')}
                  className={`px-3 py-1 rounded-md transition ${meterMode === 'readings' ? 'bg-white shadow-sm font-bold text-slate-900' : 'hover:text-amber-950'}`}
                >
                  Meter Difference
                </button>
              </div>
            </div>

            {meterMode === 'direct' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Electricity Units Consumed This Month
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={electricityUnits}
                    onChange={(e) => setElectricityUnits(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">Units</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Previous Meter Reading
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1020"
                    value={previousMeter}
                    onChange={(e) => setPreviousMeter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Current Meter Reading
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1065"
                    value={currentMeter}
                    onChange={(e) => setCurrentMeter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Calculated Electricity Banner */}
            <div className="flex items-center justify-between pt-2 border-t border-amber-200 text-xs">
              <span className="text-amber-900 font-medium">
                Calculation: {electricityUnits || 0} units × {currency}{unitRate}/unit
              </span>
              <span className="text-sm font-bold text-amber-950">
                = {formatCurrency(electricityCost, currency)}
              </span>
            </div>
          </div>

          {/* Payment Mode & UTR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="bank_transfer">Bank Transfer (NEFT / IMPS)</option>
                <option value="cash">Cash In Hand</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Transaction ID / UTR / Reference <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. UPI48910293812 or Cash"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Screenshot / Slip Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload Payment Proof / Screenshot (Optional but recommended)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {receiptPreview ? (
                <div className="flex items-center gap-3">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                  />
                  <span className="text-xs text-emerald-600 font-medium">Image attached</span>
                  <button
                    type="button"
                    onClick={() => { setReceiptFile(null); setReceiptPreview(''); }}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400">PNG, JPG or JPEG up to 5MB</span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>Submitting payment...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Monthly Payment ({formatCurrency(totalAmount, currency)})</span>
              </>
            )}
          </button>

        </form>

      </div>

      {/* Side Summary & Landlord Payment Info */}
      <div className="space-y-6">
        
        {/* Total Summary Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Payment Breakdown Summary
          </h3>

          <div className="space-y-3 text-sm border-b border-slate-800 pb-4">
            <div className="flex justify-between text-slate-300">
              <span>Room Rent:</span>
              <span className="font-semibold text-white">{formatCurrency(baseRent, currency)}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>Electricity ({electricityUnits || 0} units):</span>
              <span className="font-semibold text-amber-400">{formatCurrency(electricityCost, currency)}</span>
            </div>

            {Number(otherAmount) > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Maintenance / Water:</span>
                <span className="font-semibold text-white">{formatCurrency(otherAmount, currency)}</span>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Grand Total:</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(totalAmount, currency)}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-3">
            * Submissions are instantly flagged for verification on your landlord's dashboard.
          </p>
        </div>

        {/* Landlord Payment Details / Scan & Pay */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Landlord Payment Info</h4>
              <p className="text-xs text-slate-500">Pay directly before submitting form</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div>
              <span className="text-slate-500">Hostel / House:</span>
              <div className="font-semibold text-slate-800">{houseSettings?.houseName || 'Rental House'}</div>
            </div>

            <div>
              <span className="text-slate-500">UPI ID for Payment:</span>
              <div className="font-mono font-bold text-indigo-600 text-sm select-all">
                {houseSettings?.upiId || 'landlord@upi'}
              </div>
            </div>

            <div>
              <span className="text-slate-500">Landlord Contact Phone:</span>
              <div className="font-medium text-slate-800">{houseSettings?.contactPhone || 'N/A'}</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Copy the UPI ID above or scan the house QR code to transfer. Keep the transaction reference ID handy to enter in the form.
          </p>
        </div>

      </div>

    </div>
  );
}

