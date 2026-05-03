"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, Heart, Calendar, Settings, PlusCircle, LayoutDashboard, MessageCircle, BarChart2, Wrench, IndianRupee, TrendingUp, Home } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import toast from "react-hot-toast";
import Image from "next/image";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTranslations } from "next-intl";

function ChatBadge() {
  const unread = useChatStore((s) => s.unreadTotal);
  if (unread === 0) return null;
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
    >
      {unread > 9 ? "9+" : unread}
    </motion.span>
  );
}

export default function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when clicking outside the navbar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t("loggedOut"));
      router.push("/");
    } catch {
      toast.error(t("logoutFailed"));
    } finally {
      setDropdownOpen(false);
    }
  };

  const isHome = pathname === "/";

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled || !isHome ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-zinc-100" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-rose-500 to-amber-500 shadow-lg ${
                scrolled || !isHome ? "shadow-rose-500/20" : "shadow-rose-500/40"
              }`}
            >
              <Home className="w-6 h-6 text-white" />
            </motion.div>
            <span className={`font-bold text-lg ${scrolled || !isHome ? "text-zinc-900 dark:text-white" : "text-white"}`}>
              Nest<span className="text-amber-500">ora</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/properties" className={`text-sm font-medium transition-colors hover:text-rose-500 ${scrolled || !isHome ? "text-zinc-600" : "text-white/90"}`}>
              {t("explore")}
            </Link>
            <Link href="/roommates" className={`text-sm font-medium transition-colors hover:text-rose-500 ${scrolled || !isHome ? "text-zinc-600" : "text-white/90"}`}>
              {t("roommates")}
            </Link>
            {user?.role === "owner" && (
              <Link href="/dashboard/properties/new" className={`text-sm font-medium transition-colors hover:text-rose-500 ${scrolled || !isHome ? "text-zinc-600" : "text-white/90"}`}>
                {t("listProperty")}
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            <DarkModeToggle />
            <LanguageSwitcher />
            {mounted && user ? (
              <div className="flex items-center gap-2">
                <NotificationCenter />
                <Link href="/chat" className={`relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${scrolled || !isHome ? "text-zinc-600 dark:text-zinc-300" : "text-white"}`}>
                  <MessageCircle className="w-5 h-5" />
                  <ChatBadge />
                </Link>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white border border-zinc-200 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Menu className="w-4 h-4 text-zinc-600" />
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.username} width={28} height={28} className="object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-rose-600">{user.username[0].toUpperCase()}</span>
                    )}
                  </div>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="font-semibold text-zinc-900 dark:text-white text-sm">{user.username}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          user.role === "owner" ? "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" :
                          user.role === "admin" ? "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400" :
                          "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}>{user.role}</span>
                      </div>
                      <div className="py-1">
                        <DropItem href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label={t("dashboard")} onClick={() => setDropdownOpen(false)} />
                        <DropItem href="/dashboard/rewards" icon={<TrendingUp className="w-4 h-4" />} label={t("rewards")} onClick={() => setDropdownOpen(false)} />
                        <DropItem href="/dashboard/bookings" icon={<Calendar className="w-4 h-4" />} label={t("bookings")} onClick={() => setDropdownOpen(false)} />
                        <DropItem href="/dashboard/rent-split" icon={<IndianRupee className="w-4 h-4" />} label={t("rentSplit")} onClick={() => setDropdownOpen(false)} />
                        <DropItem href="/dashboard/rent-tracker" icon={<IndianRupee className="w-4 h-4" />} label={t("rentTracker")} onClick={() => setDropdownOpen(false)} />
                        <DropItem href="/dashboard/maintenance" icon={<Wrench className="w-4 h-4" />} label={t("maintenance")} onClick={() => setDropdownOpen(false)} />
                        <DropItem href="/wishlist" icon={<Heart className="w-4 h-4" />} label={t("wishlist")} onClick={() => setDropdownOpen(false)} />
                        {user.role === "owner" && (
                          <>
                            <DropItem href="/dashboard/properties" icon={<LayoutDashboard className="w-4 h-4" />} label={t("myProperties")} onClick={() => setDropdownOpen(false)} />
                            <DropItem href="/dashboard/properties/new" icon={<PlusCircle className="w-4 h-4" />} label={t("addNewProperty")} onClick={() => setDropdownOpen(false)} />
                            <DropItem href="/dashboard/analytics" icon={<BarChart2 className="w-4 h-4" />} label={t("analytics")} onClick={() => setDropdownOpen(false)} />
                            <DropItem href="/dashboard/income" icon={<TrendingUp className="w-4 h-4" />} label={t("rentalIncome")} onClick={() => setDropdownOpen(false)} />
                          </>
                        )}
                        {user.role === "admin" && (
                          <DropItem href="/admin" icon={<Settings className="w-4 h-4" />} label={t("adminPanel")} onClick={() => setDropdownOpen(false)} />
                        )}
                        <DropItem href="/profile" icon={<User className="w-4 h-4" />} label={t("profile")} onClick={() => setDropdownOpen(false)} />
                      </div>
                      <div className="border-t border-zinc-100 py-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> {t("logout")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${scrolled || !isHome ? "text-zinc-700 hover:bg-zinc-100" : "text-white hover:bg-white/10"}`}>
                  {t("login")}
                </Link>
                <Link href="/auth/register" className="text-sm font-medium px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/25">
                  {t("signUp")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <DarkModeToggle />
            <LanguageSwitcher />
            {mounted && user && (
              <Link href="/chat" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <MessageCircle className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                <ChatBadge />
              </Link>
            )}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors touch-target"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5 text-zinc-600 dark:text-zinc-300" /> : <Menu className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 overflow-hidden"
            style={{ willChange: "height, opacity" }}
          >
            <div className="px-4 py-4 space-y-1">
              <Link href="/properties" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors touch-target">{t("explore")}</Link>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors touch-target">{t("dashboard")}</Link>
                  <Link href="/dashboard/rewards" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors touch-target">{t("rewards")}</Link>
                  <Link href="/dashboard/bookings" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors touch-target">{t("bookings")}</Link>
                  <Link href="/dashboard/rent-split" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors touch-target">{t("rentSplit")}</Link>
                  <Link href="/dashboard/maintenance" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors touch-target">{t("maintenance")}</Link>
                  <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors touch-target">{t("wishlist")}</Link>
                  <Link href="/chat" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors touch-target">
                    <span>{t("messages")}</span>
                    <ChatBadge />
                  </Link>
                  {user.role === "owner" && (
                    <>
                      <Link href="/dashboard/properties" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors touch-target">{t("myProperties")}</Link>
                      <Link href="/dashboard/properties/new" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors touch-target">+ {t("listProperty")}</Link>
                      <Link href="/dashboard/analytics" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors touch-target">{t("analytics")}</Link>
                    </>
                  )}
                  <Link href="/compare" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors touch-target">{t("compareProperties")}</Link>
                  <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button onClick={handleLogout} className="block w-full text-left py-3 px-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors touch-target">{t("logout")}</button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors touch-target">{t("login")}</Link>
                  <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="block py-3 px-3 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors touch-target">{t("signUp")}</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function DropItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[44px]">
      <span className="text-zinc-400 dark:text-zinc-500">{icon}</span> {label}
    </Link>
  );
}
