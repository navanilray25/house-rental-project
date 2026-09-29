import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../supabase/client';
import { getUserProfile, saveUserProfile, getAllUsers } from '../services/dataService';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const LOCAL_SESSION_KEY = 'hrs_active_session_uid';

// Helper to construct a robust user object
function buildUserObject(sessionUser, profile = null) {
  const meta = sessionUser?.user_metadata || {};
  const emailName = sessionUser?.email ? sessionUser.email.split('@')[0] : 'User';
  const name = profile?.name || meta.name || emailName;
  const roomNumber = profile?.roomNumber || meta.roomNumber || meta.room_number || '101';
  const phone = profile?.phone || meta.phone || '';
  const role = profile?.role || meta.role || 'student';
  const baseRent = Number(profile?.baseRent || meta.baseRent || 4500);

  return {
    uid: sessionUser.id,
    id: sessionUser.id,
    email: sessionUser.email,
    name,
    roomNumber,
    phone,
    role,
    baseRent,
    status: profile?.status || 'active',
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // If Supabase Auth is active
    if (isSupabaseConfigured && supabase) {
      // 1. Check existing session
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          try {
            const profile = await getUserProfile(session.user.id);
            const userObj = buildUserObject(session.user, profile);
            setCurrentUser(userObj);

            // Auto-sync profile to Supabase database if missing
            if (!profile || !profile.name) {
              saveUserProfile(session.user.id, userObj).catch(() => {});
            }
          } catch (e) {
            console.error('Failed to fetch user profile:', e);
            setCurrentUser(buildUserObject(session.user));
          }
        }
        setLoading(false);
      });

      // 2. Auth state listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            try {
              const profile = await getUserProfile(session.user.id);
              const userObj = buildUserObject(session.user, profile);
              setCurrentUser(userObj);
            } catch (e) {
              console.error('Error on auth state change:', e);
              setCurrentUser(buildUserObject(session.user));
            }
          } else {
            setCurrentUser(null);
          }
          setLoading(false);
        }
      );

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }

    // Offline / Demo Mode session persistence
    const savedUid = localStorage.getItem(LOCAL_SESSION_KEY) || 'admin_001';
    async function loadDemoUser() {
      try {
        const user = await getUserProfile(savedUid);
        if (user) {
          setCurrentUser(user);
        } else {
          const all = await getAllUsers();
          setCurrentUser(all[0] || null);
        }
      } catch (err) {
        console.error('Error loading demo user:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDemoUser();
  }, []);

  // Login handler
  async function login(email, password) {
    setAuthError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setAuthError(error.message);
          return { success: false, error: error.message };
        }

        const profile = await getUserProfile(data.user.id);
        const userObj = buildUserObject(data.user, profile);
        setCurrentUser(userObj);
        return { success: true, user: userObj };
      } catch (err) {
        setAuthError(err.message);
        return { success: false, error: err.message };
      }
    }

    // Demo / Local Login
    const allUsers = await getAllUsers();
    const found = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (found) {
      setCurrentUser(found);
      localStorage.setItem(LOCAL_SESSION_KEY, found.uid);
      return { success: true, user: found };
    }

    const errorMsg = 'Invalid credentials. Use demo accounts or register your details.';
    setAuthError(errorMsg);
    return { success: false, error: errorMsg };
  }

  // Registration handler
  async function register({ name, email, password, phone, roomNumber, role = 'student', adminKey = '' }) {
    setAuthError(null);

    // Verify admin passcode if registering as admin
    if (role === 'admin') {
      const validKey = import.meta.env.VITE_ADMIN_SECRET_KEY || 'admin123';
      if (adminKey !== validKey) {
        const msg = 'Invalid Admin Passcode! Contact the owner to register as an administrator.';
        setAuthError(msg);
        return { success: false, error: msg };
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name,
              roomNumber: role === 'student' ? roomNumber : 'Office',
              room_number: role === 'student' ? roomNumber : 'Office',
              phone,
              role,
            },
          },
        });

        if (error) {
          let friendlyMsg = error.message;
          if (error.message?.toLowerCase().includes('rate limit') || error.status === 429) {
            friendlyMsg = 'Supabase email limit exceeded! Quick fix: In Supabase Dashboard, go to Authentication > Providers > Email, turn OFF "Confirm email" and click Save.';
          }
          setAuthError(friendlyMsg);
          return { success: false, error: friendlyMsg };
        }

        const uid = data.user?.id || `usr_${Date.now()}`;
        const profileData = {
          uid,
          id: uid,
          name,
          email: email.trim(),
          phone,
          roomNumber: role === 'student' ? roomNumber : 'Office',
          role,
          baseRent: 4500,
          status: 'active',
          createdAt: new Date().toISOString(),
        };

        await saveUserProfile(uid, profileData);
        setCurrentUser(profileData);
        return { success: true, user: profileData };
      } catch (err) {
        setAuthError(err.message);
        return { success: false, error: err.message };
      }
    }

    // Demo / Local Registration
    const uid = `usr_${Date.now()}`;
    const newUser = {
      uid,
      id: uid,
      name,
      email: email.trim(),
      phone,
      roomNumber: role === 'student' ? roomNumber : 'Office',
      role,
      baseRent: 4500,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await saveUserProfile(uid, newUser);
    setCurrentUser(newUser);
    localStorage.setItem(LOCAL_SESSION_KEY, uid);
    return { success: true, user: newUser };
  }

  // Logout handler
  async function logout() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setCurrentUser(null);
  }

  // Update current user details locally and in DB
  async function updateProfile(fields) {
    if (!currentUser) return;
    const updated = { ...currentUser, ...fields };
    setCurrentUser(updated);
    await saveUserProfile(currentUser.uid, updated);
  }

  const value = {
    currentUser,
    userRole: currentUser?.role || 'student',
    isAdmin: currentUser?.role === 'admin',
    isStudent: currentUser?.role === 'student',
    loading,
    authError,
    login,
    register,
    logout,
    updateProfile,
    isSupabase: isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
