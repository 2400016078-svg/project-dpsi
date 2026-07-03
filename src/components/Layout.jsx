import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  NotebookPen,
  Settings,
  Users,
  BookOpen,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { getAvatar } from "../utils/data";

const navByRole = {
  siswa: [
    { label: "Beranda", path: "/siswa/dashboard", icon: LayoutDashboard },
    { label: "Kuesioner", path: "/siswa/kuesioner", icon: ClipboardList },
  ],
  guru_bk: [
    { label: "Beranda BK", path: "/bk/dashboard", icon: LayoutDashboard },
    { label: "Daftar Siswa", path: "/bk/siswa", icon: Users },
    { label: "Rekapitulasi", path: "/bk/rekapitulasi-angkatan", icon: BarChart3 },
    { label: "Riwayat Catatan", path: "/bk/catatan-riwayat", icon: NotebookPen },
  ],
  orang_tua: [
    { label: "Dashboard", path: "/orang-tua/dashboard", icon: User },
  ],
  admin: [
    { label: "Beranda Admin", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Manajemen Pengguna", path: "/admin/pengguna", icon: Users },
    { label: "Data Master NISN", path: "/admin/master-nisn", icon: BookOpen },
  ],
};

const breadcrumbMap = {
  "/bk/dashboard": [{ label: "Beranda BK", path: "/bk/dashboard" }],
  "/bk/siswa": [{ label: "Beranda BK", path: "/bk/dashboard" }, { label: "Daftar Siswa", path: "/bk/siswa" }],
  "/bk/siswa/:uuid/konseling": [
    { label: "Beranda BK", path: "/bk/dashboard" },
    { label: "Daftar Siswa", path: "/bk/siswa" },
    { label: "Detail & Konseling", path: null },
  ],
  "/bk/rekapitulasi-angkatan": [{ label: "Beranda BK", path: "/bk/dashboard" }, { label: "Rekapitulasi", path: null }],
  "/bk/catatan-riwayat": [{ label: "Beranda BK", path: "/bk/dashboard" }, { label: "Riwayat Catatan", path: null }],
  "/admin/dashboard": [{ label: "Beranda Admin", path: "/admin/dashboard" }],
  "/admin/pengguna": [{ label: "Beranda Admin", path: "/admin/dashboard" }, { label: "Manajemen Pengguna", path: null }],
  "/admin/master-nisn": [{ label: "Beranda Admin", path: "/admin/dashboard" }, { label: "Data Master NISN", path: null }],
};

function getBreadcrumbs(pathname) {
  const match = breadcrumbMap[pathname];
  if (match) return match;
  if (pathname.startsWith("/bk/siswa/") && pathname.endsWith("/konseling")) {
    return breadcrumbMap["/bk/siswa/:uuid/konseling"];
  }
  return null;
}

function ProfileDropdown({ user, profileOpen, setProfileOpen, profileRef, compact, onLogout }) {
  const navigate = useNavigate();
  const avatar = getAvatar(user.id);
  const avatarEl = avatar ? (
    <img src={avatar} alt="" className={`${compact ? "w-7 h-7" : "w-8 h-8"} rounded-full object-cover border-2 border-gray-100 shadow-sm`} />
  ) : (
    <span className={`${compact ? "w-7 h-7 text-xs" : "w-8 h-8 text-xs"} rounded-full bg-gradient-to-br from-primary-medium to-primary-dark text-white flex items-center justify-center font-bold shadow-sm`}>
      {user.username.charAt(0).toUpperCase()}
    </span>
  );

  return (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => setProfileOpen(!profileOpen)}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-dark transition px-2 py-1.5 rounded-xl hover:bg-gray-50 min-h-[44px]"
      >
        {avatarEl}
        {!compact && <span className="font-medium hidden sm:inline">@{user.username}</span>}
        {!compact && <ChevronDown size={14} className={`text-gray-400 transition ${profileOpen ? "rotate-180" : ""}`} />}
      </button>

      {profileOpen && (
          <div
            className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-medium py-2 z-50"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 capitalize font-medium">
              {user.role.replace("_", " ")} — @{user.username}
            </div>
            <button
              onClick={() => { console.log("navigate settings"); navigate("/pengaturan-akun"); setProfileOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 min-h-[44px]"
            >
              <Settings size={14} />
              Pengaturan Akun
            </button>
            <button
              onClick={() => { console.log("logout clicked"); onLogout(); setProfileOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error-light/50 transition flex items-center gap-2 min-h-[44px]"
            >
              <LogOut size={14} />
              Keluar (Logout)
            </button>
          </div>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Safety net: if user becomes null on a PROTECTED page (session expired / logout),
  // redirect to /login. Don't redirect on public pages (login, registration).
  // MUST be before the early return on !user so hook order is always the same.
  const publicPaths = ["/login", "/daftar/siswa", "/daftar/orang-tua"];
  useEffect(() => {
    if (!user && !publicPaths.includes(location.pathname)) {
      navigate("/login", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // handleLogout is a plain function, NOT a hook — safe to define before the early return.
  // MUST be before the early return to ensure every render has the same hook identity count.
  const handleLogout = () => {
    console.log("logout clicked");
    try {
      logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    // Use window.location for a hard redirect that forces a clean page load,
    // clearing all React state regardless of hooks / state propagation timing.
    window.location.href = "/login";
  };

  if (!user || location.pathname === "/login") return <>{children}</>;

  const role = user.role;
  const navItems = navByRole[role] || [];
  const showBreadcrumb = role === "guru_bk" || role === "admin";
  const breadcrumbs = showBreadcrumb ? getBreadcrumbs(location.pathname) : null;

  const sidebarContent = (
    <>
      <div className="p-5 shrink-0">
        <h2 className="font-heading text-lg font-bold text-white">SAMI-SMK</h2>
        <p className="text-xs text-blue-200/80 capitalize mt-0.5">{role.replace("_", " ")}</p>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-blue-100/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          {(() => {
            const avatar = getAvatar(user.id);
            return avatar ? (
              <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-white/20" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-white/15 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </span>
            );
          })()}
          <span className="text-xs text-blue-200/60 truncate">@{user.username}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-3 text-sm text-red-200 bg-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-100 transition min-h-[44px]"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 min-h-screen shrink-0 bg-gradient-to-b from-indigo-900 via-primary-dark to-indigo-800">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full flex flex-col bg-gradient-to-b from-indigo-900 via-primary-dark to-indigo-800">
            <div className="flex items-center justify-between p-4 shrink-0">
              <h2 className="font-heading text-lg font-bold text-white">SAMI-SMK</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-white/70 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Desktop Top Header */}
        <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 shrink-0 min-h-[64px]">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs ? (
              breadcrumbs.map((cr, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={14} className="text-gray-300" />}
                  {cr.path ? (
                    <Link to={cr.path} className="text-primary-medium hover:underline font-medium">
                      {cr.label}
                    </Link>
                  ) : (
                    <span className="text-gray-800 font-semibold">{cr.label}</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">SAMI-SMK</span>
            )}
          </div>

          <ProfileDropdown user={user} profileOpen={profileOpen} setProfileOpen={setProfileOpen} profileRef={profileRef} compact={false} onLogout={handleLogout} />
        </header>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-3 py-2 bg-white border-b border-gray-100 shrink-0 min-h-[56px]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-primary-dark p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Menu size={24} />
          </button>
          <h1 className="font-heading font-bold text-primary-dark text-sm truncate mx-1">SAMI-SMK</h1>
          <ProfileDropdown user={user} profileOpen={profileOpen} setProfileOpen={setProfileOpen} profileRef={profileRef} compact onLogout={handleLogout} />
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>

        {/* Mobile Bottom Nav for Siswa & Orang Tua */}
        {navItems.length > 1 && (
          <nav className="md:hidden flex bg-white border-t border-gray-100 shrink-0 safe-area-bottom">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex-1 flex flex-col items-center pt-2 pb-1 text-[11px] transition min-h-[56px] ${
                    active ? "text-primary-dark font-semibold" : "text-gray-400"
                  }`}
                >
                  <Icon size={22} className="shrink-0" />
                  <span className="mt-0.5 text-center leading-[1.2]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
