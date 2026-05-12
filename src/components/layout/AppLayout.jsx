import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FilePlus, Users, ShieldCheck, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import UserAvatar from "@/components/user/UserAvatar";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/compliance", label: "Compliance", icon: ShieldCheck },
  { path: "/create", label: "New Plan", icon: FilePlus },
];

function UserMenu() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="User menu"
      >
        <UserAvatar user={user} size={32} />
        {user?.full_name && (
          <span className="hidden sm:inline text-sm font-medium text-primary-foreground/90 max-w-[120px] truncate">
            {user.full_name}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
          {/* Profile header */}
          <div className="flex items-center gap-3 p-3 border-b bg-muted/30">
            <UserAvatar user={user} size={40} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            </div>
          </div>
          {/* Menu items */}
          <div className="p-1">
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
              onClick={() => { setOpen(false); navigate("/profile"); }}
            >
              <User className="w-4 h-4 text-muted-foreground" /> My Profile
            </button>
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <img src="https://media.base44.com/images/public/6a034aa2348868f8459793ee/08d459ad8_generated_image.png" alt="Broker Tools Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-semibold tracking-tight">Section 125</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 -mt-0.5">Plan Document Creator</p>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <nav className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-white/15 text-primary-foreground"
                          : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden md:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="ml-2 pl-2 border-l border-white/20">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}