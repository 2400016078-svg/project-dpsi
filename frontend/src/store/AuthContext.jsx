import { createContext, useContext, useState, useEffect } from "react";
import { seedSupabase } from "../services/seedSupabase";
import { supabase } from "../lib/supabaseClient";
import {
  getStoredSession, clearSession, login as supabaseLogin, logout as supabaseLogout,
  verifySession, getSiswaProfileByUserId, getOrtuProfileByUserId,
  touchActivity, isSessionExpired, setSessionExpiredFlag,
} from "../services/supabaseAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [siswaProfile, setSiswaProfile] = useState(null);
  const [ortuProfile, setOrtuProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const session = getStoredSession();

    if (session && isSessionExpired()) {
      clearSession();
      setSessionExpiredFlag();
      setSessionExpired(true);
      setLoading(false);
      return;
    }

    seedSupabase().then(() => {
      const current = getStoredSession();
      if (current && current.id) {
        verifySession(current).then((valid) => {
          if (valid) {
            setUser(current);
            touchActivity();
            loadProfile(current);
          } else {
            clearSession();
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const handleActivity = () => touchActivity();
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("popstate", handleActivity);

    const interval = setInterval(() => {
      if (getStoredSession() && isSessionExpired()) {
        clearSession();
        setSessionExpiredFlag();
        setSessionExpired(true);
        setUser(null);
        setSiswaProfile(null);
        setOrtuProfile(null);
      }
    }, 60 * 1000);

    return () => {
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("popstate", handleActivity);
      clearInterval(interval);
    };
  }, [user]);

  async function loadProfile(u) {
    if (!u) return;
    if (u.role === "siswa") {
      const p = await getSiswaProfileByUserId(u.id);
      if (p) setSiswaProfile(p);
    } else if (u.role === "orang_tua") {
      const p = await getOrtuProfileByUserId(u.id);
      if (p) {
        setOrtuProfile(p);
        const siswa = await supabase.from("siswa_profiles").select("nama_siswa").eq("id", p.id_siswa).maybeSingle();
        if (siswa.data) p.linked_nama_siswa = siswa.data.nama_siswa;
      }
    }
  }

  const login = async (username, password) => {
    const u = await supabaseLogin(username, password);
    if (u) {
      setUser(u);
      await loadProfile(u);
    }
    return u;
  };

  const logout = () => {
    supabaseLogout();
    setUser(null);
    setSiswaProfile(null);
    setOrtuProfile(null);
    setSessionExpired(false);
  };

  return (
    <AuthContext.Provider value={{ user, siswaProfile, ortuProfile, loading, sessionExpired, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
