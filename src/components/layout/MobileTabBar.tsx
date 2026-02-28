import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Plus, Bell, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", icon: Home, label: "홈" },
  { path: "/search", icon: Search, label: "검색" },
  { path: "/create", icon: Plus, label: "만들기", isPrimary: true },
  { path: "/notifications", icon: Bell, label: "알림" },
  { path: "/profile", icon: User, label: "프로필" },
];

export function MobileTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleTab = (path: string) => {
    if (path === "/profile" && profile?.username) {
      navigate(`/profile/${profile.username}`);
    } else if (path === "/create" || path === "/notifications") {
      if (!user) {
        navigate("/auth/login");
        return;
      }
      navigate(path);
    } else {
      navigate(path);
    }
  };

  const isActive = (path: string) => {
    if (path === "/profile") return location.pathname.startsWith("/profile");
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Hide on auth pages
  if (location.pathname.startsWith("/auth") || location.pathname === "/onboarding") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ path, icon: Icon, label, isPrimary }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => handleTab(path)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
            >
              {isPrimary ? (
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center -mt-4 shadow-lg">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
              ) : (
                <motion.div
                  animate={active ? { scale: [1, 1.2, 1], y: [0, -3, 0] } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon
                    className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`}
                  />
                </motion.div>
              )}
              {!isPrimary && (
                <span
                  className={`text-[10px] ${active ? "text-primary font-medium" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
