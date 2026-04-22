"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, Heart, Calendar, Settings, PlusCircle, LayoutDashboard, MessageCircle, BarChart2, Wrench } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import Image from "next/image";
import NotificationBell from "@/components/notifications/NotificationBell";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/");
    setDropdownOpen(false);
  };

  const isHome = pathname === "/";

  return (
    <motion.nav
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
            <Image src="/logo.png" alt="MatchNest" width={36} height={36} style={{ width: 36, height: "auto" }} className="rounded-xl" />
            <span className={`font-bold text-lg ${scrolled || !isHome ? "text-zinc-900" : "text-white"}`}>
              Match<span className="text-amber-500">Nest</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/properties" className={`text-sm font-medium transition-colors hover:text-rose-500 ${scrolled || !isHome ? "text-zinc-600" : "text-white/90"}`}>
              Explore
            </Link>
            {user?.role === "owner" && (
              <Link href="/dashboard/properties/new" className={`text-sm font-medium transition-colors hover:text-rose-500 ${scrolled || !isHome ? "text-zinc-600" : "text-white/90"}`}>
                List Property
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            <DarkModeToggle />
            {mounted && user ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <Link href="/chat" className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${scrolled || !isHome ? "text-zinc-600 dark:text-zinc-300" : "text-white"}`}>
                  <MessageCircle className="w-5 h-5" />
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
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-zinc-100">
                        <p className="font-semibold text-zinc-900 text-sm">{user.username}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          user.role === "owner" ? "bg-rose-100 text-rose-600" :
                          user.role === "admin" ? "bg-purple-100 text-purple-600" :
                          "bg-zinc-100 text-zinc-500"
                        }`}>{user.role}</span>
                      </div>
                      <div className="py-1">
                        <DropItem href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" onClick={() => setDropdownOpen(false)} />
                        <DropItem href="/dashboard/bookings" icon={<Calendar className="w-4 h-4" />} label="My Bookings" onClick={() => setDropdownOpen(false)} />
                        <DropItem href="/dashboard/maintenance" icon={<Wrench className="w-4 h-4" />} label="Maintenance" onClick={() => setDropdownOpen(false)} />
                        <DropItem href="/wishlist" icon={<Heart className="w-4 h-4" />} label="Wishlist" onClick={() => setDropdownOpen(false)} />
                        {user.role === "owner" && (
                          <>
                            <DropItem href="/dashboard/properties" icon={<LayoutDashboard className="w-4 h-4" />} label="My Properties" onClick={() => setDropdownOpen(false)} />
                            <DropItem href="/dashboard/properties/new" icon={<PlusCircle className="w-4 h-4" />} label="Add Property" onClick={() => setDropdownOpen(false)} />
                            <DropItem href="/dashboard/analytics" icon={<BarChart2 className="w-4 h-4" />} label="Analytics" onClick={() => setDropdownOpen(false)} />
                          </>
                        )}
                        {user.role === "admin" && (
                          <DropItem href="/admin" icon={<Settings className="w-4 h-4" />} label="Admin Panel" onClick={() => setDropdownOpen(false)} />
                        )}
                        <DropItem href="/profile" icon={<User className="w-4 h-4" />} label="Profile" onClick={() => setDropdownOpen(false)} />
                      </div>
                      <div className="border-t border-zinc-100 py-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Logout
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
                  Login
                </Link>
                <Link href="/auth/register" className="text-sm font-medium px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/25">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-zinc-100">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-zinc-100 px-4 py-4 space-y-2"
          >
            <Link href="/properties" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-700">Explore</Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-700">Dashboard</Link>
                <Link href="/dashboard/bookings" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-700">Bookings</Link>
                <Link href="/dashboard/maintenance" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-700">Maintenance</Link>
                <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-700">Wishlist</Link>
                <Link href="/chat" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-700">Messages</Link>
                {user.role === "owner" && (
                  <>
                    <Link href="/dashboard/properties" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-700">My Properties</Link>
                    <Link href="/dashboard/properties/new" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-rose-500">+ Add Property</Link>
                  </>
                )}
                <Link href="/compare" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-700">Compare</Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 text-sm font-medium text-red-500">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-zinc-700">Login</Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-rose-500">Sign Up</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function DropItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
      <span className="text-zinc-400">{icon}</span> {label}
    </Link>
  );
}
