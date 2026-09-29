import { isSupabaseConfigured, supabase } from '../supabase/client';
import {
  INITIAL_HOUSE_SETTINGS,
  INITIAL_USERS,
  INITIAL_PAYMENTS,
  INITIAL_NOTICES,
  INITIAL_COMPLAINTS,
} from '../utils/mockData';

// Local storage keys for offline/demo fallback
const STORAGE_KEYS = {
  SETTINGS: 'hrs_house_settings',
  USERS: 'hrs_users',
  PAYMENTS: 'hrs_payments',
  NOTICES: 'hrs_notices',
  COMPLAINTS: 'hrs_complaints',
};

// Initialize LocalStorage defaults if empty
function initializeLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_HOUSE_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_NOTICES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
  }
}

initializeLocalStorage();

function getLocal(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// ==========================================
// 1. HOUSE SETTINGS
// ==========================================
export async function getHouseSettings() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('house_settings')
        .select('*')
        .eq('id', 'default_config')
        .single();

      if (data && !error) {
        return {
          houseName: data.house_name,
          electricityRate: Number(data.electricity_rate),
          currency: data.currency || '₹',
          contactPhone: data.contact_phone,
          upiId: data.upi_id,
          address: data.address,
        };
      }
    } catch (err) {
      console.warn('Supabase getHouseSettings error:', err);
    }
  }
  return getLocal(STORAGE_KEYS.SETTINGS, INITIAL_HOUSE_SETTINGS);
}

export async function updateHouseSettings(newSettings) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('house_settings').upsert({
        id: 'default_config',
        house_name: newSettings.houseName,
        electricity_rate: Number(newSettings.electricityRate),
        currency: newSettings.currency || '₹',
        contact_phone: newSettings.contactPhone,
        upi_id: newSettings.upiId,
        address: newSettings.address,
      });
      return newSettings;
    } catch (err) {
      console.warn('Supabase updateHouseSettings error:', err);
    }
  }
  setLocal(STORAGE_KEYS.SETTINGS, newSettings);
  return newSettings;
}

// ==========================================
// 2. USERS & PROFILES
// ==========================================
export async function getAllUsers() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (data && !error) {
        return data.map((u) => ({
          uid: u.id,
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          roomNumber: u.room_number,
          baseRent: Number(u.base_rent),
          role: u.role,
          status: u.status,
          createdAt: u.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase getAllUsers error:', err);
    }
  }
  return getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export async function getUserProfile(uid) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (data && !error) {
        return {
          uid: data.id,
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          roomNumber: data.room_number,
          baseRent: Number(data.base_rent),
          role: data.role,
          status: data.status,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn('Supabase getUserProfile error:', err);
    }
  }
  const users = getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
  return users.find((u) => u.uid === uid || u.id === uid) || null;
}

export async function saveUserProfile(uid, profileData) {
  const safeName = profileData.name || (profileData.email ? profileData.email.split('@')[0] : 'Resident Student');
  const safeRoom = profileData.roomNumber || '101';
  const safeEmail = profileData.email || 'user@example.com';

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: uid,
        name: safeName,
        email: safeEmail,
        phone: profileData.phone || '',
        room_number: safeRoom,
        base_rent: Number(profileData.baseRent || 4500),
        role: profileData.role || 'student',
        status: profileData.status || 'active',
      });
      if (error) {
        console.error('❌ Supabase saveUserProfile error:', error.message || error);
        alert('Supabase Notice: ' + error.message + '\n\nPlease run disable_rls.sql in Supabase SQL editor to allow data to save.');
      } else {
        console.log('✅ Successfully saved profile into Supabase table "profiles"!', safeName);
      }

      return { id: uid, uid, ...profileData, name: safeName, roomNumber: safeRoom };
    } catch (err) {
      console.warn('Supabase saveUserProfile network error:', err);
    }
  }
  const users = getLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
  const index = users.findIndex((u) => u.uid === uid || u.id === uid);
  const updatedUser = { uid, id: uid, ...profileData };
  if (index >= 0) {
    users[index] = { ...users[index], ...updatedUser };
  } else {
    users.push(updatedUser);
  }
  setLocal(STORAGE_KEYS.USERS, users);
  return updatedUser;
}

// ==========================================
// 3. MONTHLY PAYMENTS
// ==========================================
export async function getAllPayments() {
  let supabasePayments = [];
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        supabasePayments = data.map((p) => ({
          id: p.id,
          studentId: p.student_id,
          studentName: p.student_name,
          roomNumber: p.room_number,
          month: p.month,
          year: p.year,
          rentAmount: Number(p.rent_amount),
          electricityUnits: Number(p.electricity_units),
          unitRate: Number(p.unit_rate),
          electricityAmount: Number(p.electricity_amount),
          otherAmount: Number(p.other_amount),
          totalAmount: Number(p.total_amount),
          paymentMode: p.payment_mode,
          transactionId: p.transaction_id,
          receiptUrl: p.receipt_url,
          status: p.status,
          adminRemarks: p.admin_remarks,
          createdAt: p.created_at,
          approvedAt: p.approved_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase getAllPayments error:', err);
    }
  }

  const localList = getLocal(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  if (supabasePayments.length > 0) {
    // Merge any local payments not yet in Supabase
    const supabaseIds = new Set(supabasePayments.map((p) => p.id));
    const extraLocal = localList.filter((p) => !supabaseIds.has(p.id));
    return [...supabasePayments, ...extraLocal].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
  return [...localList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getStudentPayments(studentId) {
  let supabasePayments = [];
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('payments').select('*');
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        supabasePayments = data.map((p) => ({
          id: p.id,
          studentId: p.student_id,
          studentName: p.student_name,
          roomNumber: p.room_number,
          month: p.month,
          year: p.year,
          rentAmount: Number(p.rent_amount),
          electricityUnits: Number(p.electricity_units),
          unitRate: Number(p.unit_rate),
          electricityAmount: Number(p.electricity_amount),
          otherAmount: Number(p.other_amount),
          totalAmount: Number(p.total_amount),
          paymentMode: p.payment_mode,
          transactionId: p.transaction_id,
          receiptUrl: p.receipt_url,
          status: p.status,
          adminRemarks: p.admin_remarks,
          createdAt: p.created_at,
          approvedAt: p.approved_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase getStudentPayments error:', err);
    }
  }

  const localList = getLocal(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  const matchingLocal = localList.filter(
    (p) => !studentId || p.studentId === studentId || p.studentId === 'unknown_student'
  );

  const fallbackList = matchingLocal.length > 0 ? matchingLocal : localList;

  if (supabasePayments.length > 0) {
    const supabaseIds = new Set(supabasePayments.map((p) => p.id));
    const extraLocal = fallbackList.filter((p) => !supabaseIds.has(p.id));
    return [...supabasePayments, ...extraLocal].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  return [...fallbackList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}


export async function submitMonthlyPayment(paymentData) {
  const paymentId = `pay_${Date.now()}`;
  const safeStudentId = paymentData.studentId || 'std_' + Date.now();
  const safeStudentName = paymentData.studentName || 'Student';
  const safeRoomNumber = paymentData.roomNumber || '101';

  const newPayment = {
    ...paymentData,
    id: paymentId,
    studentId: safeStudentId,
    studentName: safeStudentName,
    roomNumber: safeRoomNumber,
    status: 'pending',
    createdAt: new Date().toISOString(),
    adminRemarks: '',
  };

  // Always save locally immediately so the user NEVER loses this record
  const list = getLocal(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  list.unshift(newPayment);
  setLocal(STORAGE_KEYS.PAYMENTS, list);

  // Sync to Supabase if connected
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('payments').insert({
        id: paymentId,
        student_id: safeStudentId,
        student_name: safeStudentName,
        room_number: safeRoomNumber,
        month: paymentData.month,
        year: Number(paymentData.year),
        rent_amount: Number(paymentData.rentAmount) || 0,
        electricity_units: Number(paymentData.electricityUnits) || 0,
        unit_rate: Number(paymentData.unitRate) || 10,
        electricity_amount: Number(paymentData.electricityAmount) || 0,
        other_amount: Number(paymentData.otherAmount) || 0,
        total_amount: Number(paymentData.totalAmount) || 0,
        payment_mode: paymentData.paymentMode || 'upi',
        transaction_id: paymentData.transactionId || 'N/A',
        receipt_url: paymentData.receiptUrl || '',
        status: 'pending',
        admin_remarks: '',
      });

      if (error) {
        console.error('❌ Supabase payment insert error:', error.message || error);
        alert('Supabase Notice: ' + error.message + '\n\nPlease run disable_rls.sql in Supabase SQL editor to allow data to save.');
      } else {
        console.log('✅ Successfully saved payment into Supabase table "payments"!', paymentId);
      }

    } catch (err) {
      console.warn('Supabase submitMonthlyPayment network error:', err);
    }
  }

  return newPayment;
}


export async function updatePaymentStatus(paymentId, status, adminRemarks = '') {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('payments').update({
        status,
        admin_remarks: adminRemarks,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
      }).eq('id', paymentId);
      return true;
    } catch (err) {
      console.warn('Supabase updatePaymentStatus error:', err);
    }
  }

  const list = getLocal(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  const index = list.findIndex((p) => p.id === paymentId);
  if (index >= 0) {
    list[index] = {
      ...list[index],
      status,
      adminRemarks,
      approvedAt: status === 'approved' ? new Date().toISOString() : null,
    };
    setLocal(STORAGE_KEYS.PAYMENTS, list);
    return true;
  }
  return false;
}

// ==========================================
// 4. NOTICES
// ==========================================
export async function getNotices() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        return data.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          priority: n.priority,
          author: n.author,
          createdAt: n.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase getNotices error:', err);
    }
  }
  const list = getLocal(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function addNotice(noticeData) {
  const noticeId = `not_${Date.now()}`;
  const newNotice = {
    id: noticeId,
    ...noticeData,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('notices').insert({
        id: noticeId,
        title: noticeData.title,
        content: noticeData.content,
        priority: noticeData.priority,
        author: noticeData.author,
      });
      return newNotice;
    } catch (err) {
      console.warn('Supabase addNotice error:', err);
    }
  }

  const list = getLocal(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  list.unshift(newNotice);
  setLocal(STORAGE_KEYS.NOTICES, list);
  return newNotice;
}

export async function deleteNotice(noticeId) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('notices').delete().eq('id', noticeId);
      return true;
    } catch (err) {
      console.warn('Supabase deleteNotice error:', err);
    }
  }
  const list = getLocal(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  const filtered = list.filter((n) => n.id !== noticeId);
  setLocal(STORAGE_KEYS.NOTICES, filtered);
  return true;
}

// ==========================================
// 5. COMPLAINTS & MAINTENANCE
// ==========================================
export async function getComplaints(studentId = null) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;
      if (data && !error) {
        return data.map((c) => ({
          id: c.id,
          studentId: c.student_id,
          studentName: c.student_name,
          roomNumber: c.room_number,
          category: c.category,
          title: c.title,
          description: c.description,
          status: c.status,
          adminReply: c.admin_reply,
          createdAt: c.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase getComplaints error:', err);
    }
  }
  const list = getLocal(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  const filtered = studentId ? list.filter((c) => c.studentId === studentId) : list;
  return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function addComplaint(complaintData) {
  const complaintId = `comp_${Date.now()}`;
  const newComplaint = {
    id: complaintId,
    ...complaintData,
    status: 'open',
    adminReply: '',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('complaints').insert({
        id: complaintId,
        student_id: complaintData.studentId,
        student_name: complaintData.studentName,
        room_number: complaintData.roomNumber,
        category: complaintData.category,
        title: complaintData.title,
        description: complaintData.description,
        status: 'open',
      });
      return newComplaint;
    } catch (err) {
      console.warn('Supabase addComplaint error:', err);
    }
  }

  const list = getLocal(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  list.unshift(newComplaint);
  setLocal(STORAGE_KEYS.COMPLAINTS, list);
  return newComplaint;
}

export async function updateComplaintStatus(complaintId, status, adminReply = '') {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('complaints').update({
        status,
        admin_reply: adminReply,
      }).eq('id', complaintId);
      return true;
    } catch (err) {
      console.warn('Supabase updateComplaintStatus error:', err);
    }
  }
  const list = getLocal(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  const index = list.findIndex((c) => c.id === complaintId);
  if (index >= 0) {
    list[index] = { ...list[index], status, adminReply };
    setLocal(STORAGE_KEYS.COMPLAINTS, list);
    return true;
  }
  return false;
}

// ==========================================
// 6. FILE UPLOAD (RECEIPTS / IMAGES)
// ==========================================
export async function uploadReceiptFile(file, pathPrefix = 'receipts') {
  if (!file) return '';

  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${pathPrefix}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('receipts').upload(filePath, file);

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase Storage upload failed, using Data URL:', err);
    }
  }

  // Fallback Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Reset Demo Data
export function resetDemoData() {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_HOUSE_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_NOTICES));
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
  window.location.reload();
}
