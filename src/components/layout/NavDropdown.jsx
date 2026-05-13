import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NavDropdown({ label, icon: Icon, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const location = useLocation();

  const isActive = items.some((item) => location.pathname === item.path);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
          isActive
            ? "bg-white/15 text-primary-foreground"
            : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
        )}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span className="hidden md:inline">{label}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-48 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden py-1">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {ItemIcon && <ItemIcon className="w-4 h-4 text-muted-foreground" />}
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}