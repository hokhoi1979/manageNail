"use client";

import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Heart,
  CalendarDays,
  Sparkle,
  AlertCircle,
} from "lucide-react";
import { authService } from "@/src/libs/services/auth.service";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/libs/store/auth.store";
import { toast } from "sonner";

export function Login() {
  const [email, setEmail] = useState("admin@tuetuebeauty.vn");
  const [password, setPassword] = useState("Tuetue@2026");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState("");

  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsLoading(true);
    setLoginError("");
    setLoginSuccess(false);

    try {
      const res = await authService.login({
        email,
        password,
      });

      setAuth(res.user, res.tokens);
      setLoginSuccess(true);
      toast.success("Đăng nhập thành công!");
      router.push("/home");
    } catch (error: unknown) {
      console.error("Login error:", error);

      const message =
        error instanceof Error
          ? error.message === "Invalid login credentials"
            ? "Email hoặc mật khẩu không chính xác!"
            : error.message
          : "Đã xảy ra lỗi. Vui lòng thử lại!";

      setLoginError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh w-full bg-[#faf5f2] text-[#2c221e] flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-x-hidden selection:bg-[#dfb0a3] selection:text-[#38231f]">
      {/* Nail Art Full-Screen Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1600&q=85"
          alt="Luxury Nail Studio Background"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Lớp phủ tông kem hồng ấm + làm mờ nhẹ để tôn khung đăng nhập */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdf8f5]/80 via-[#f7eae4]/75 to-[#e8cfc7]/80 backdrop-blur-[6px]" />
        <div className="absolute top-[-10%] left-[-8%] w-[320px] sm:w-[540px] h-[320px] sm:h-[540px] rounded-full bg-[#f6ded4]/60 blur-[110px]" />
        <div className="absolute bottom-[-10%] right-[-6%] w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] rounded-full bg-[#d8a79c]/40 blur-[120px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[440px] lg:max-w-[1100px] lg:min-h-[640px] bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_24px_60px_rgba(74,45,49,0.16)] border border-white/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Ẩn trên mobile/tablet để không gây scroll, chỉ hiện từ màn hình lớn (lg) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#4a2d31] via-[#5c373b] to-[#3a2024] p-10 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#aa756b]/30 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#aa756b]/30 border border-[#dfb3a9]/40 flex items-center justify-center text-white font-serif text-2xl font-bold shadow-inner shrink-0">
                T
              </div>

              <div>
                <h2 className="font-serif text-lg tracking-widest font-semibold flex items-center gap-1.5 text-white">
                  TUỆ TUỆ{" "}
                  <span className="italic font-normal font-serif text-[#e5b9af]">
                    beauty
                  </span>
                </h2>

                <p className="text-[11px] text-[#e3cfc9] tracking-wider uppercase font-medium">
                  HỆ THỐNG QUẢN TRỊ Nail
                </p>
              </div>
            </div>

            <div className="mt-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 text-[#f5dbd4] border border-white/15 backdrop-blur-md">
                <Sparkles size={12} className="text-[#f7c2b6]" />
                Phiên bản Quản lý 2.0
              </span>

              <h1 className="font-serif text-3xl font-normal leading-tight mt-3 text-[#fffbf9]">
                Nâng niu nét đẹp, <br />
                <span className="italic font-serif text-[#f2c7bd]">
                  vận hành chuẩn xác.
                </span>
              </h1>

              <p className="mt-2 text-xs text-[#dec2bb] leading-relaxed font-light">
                Không gian quản lý đặt lịch, dịch vụ và thời gian mở cửa dành
                riêng cho Nail Tuệ Tuệ Nail & Beauty.
              </p>
            </div>
          </div>

          {/* Nail Art Image */}
          <div className="relative z-10 my-7">
            <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80"
                alt="Tuệ Tuệ Nail Art"
                className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#2c181b]/90 via-[#3a2125]/30 to-transparent" />

              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#aa756b]/80 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-white">
                    Signature Nail Art
                  </span>

                  <p className="text-xs font-semibold text-[#fff4f1] mt-1">
                    Thiết kế Móng Nghệ Thuật & Dưỡng Sinh
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-[#fad4cb] font-medium flex items-center gap-1">
                    <Sparkle size={11} className="text-[#ffbfae]" />
                    Tuệ Tuệ Studio
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-[#b3776d]/40 flex items-center justify-center text-[#ffdad1] shrink-0">
                <CalendarDays size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  Theo dõi lịch hẹn trực quan
                </p>

                <p className="text-[11px] text-[#dec2bb] truncate">
                  Cập nhật tức thời: Chờ xác nhận • Đã xác nhận • Đã từ chối
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-[#d6b7b0]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#dfb3a9]" />
              Quản lý nội bộ Nail
            </span>

            <span className="text-[#f5dbd4]/80">Hotline: 090 123 4567</span>
          </div>
        </div>

        {/* Right Column (Form đăng nhập) */}
        <div className="lg:col-span-7 p-5 sm:p-8 lg:p-12 flex flex-col justify-between bg-transparent">
          {/* Mobile Compact Brand Banner */}
          <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-[#f0e4dd]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4a2d31] to-[#5c373b] flex items-center justify-center text-white font-serif text-lg font-bold shadow-sm shrink-0">
                T
              </div>
              <div>
                <h2 className="font-serif text-sm tracking-wider font-semibold text-[#342420] leading-none">
                  TUỆ TUỆ{" "}
                  <span className="italic font-normal text-[#a66258]">
                    beauty
                  </span>
                </h2>
                <p className="text-[10px] text-[#82716b] uppercase tracking-wider mt-0.5">
                  Quản trị nội bộ
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#f9eee9] text-[#8c5449]">
              <Sparkles size={11} className="text-[#a86558]" />
              v2.0
            </span>
          </div>

          <div className="max-w-md mx-auto w-full my-auto">
            {/* Header */}
            <div className="mb-4 sm:mb-7">
              <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#f9eee9] text-[#8c5449] mb-3">
                <Sparkles size={13} className="text-[#a86558]" />
                Đăng nhập tài khoản Nail
              </div>

              <h2 className="text-xl sm:text-3xl font-bold text-[#342420] tracking-tight">
                Chào mừng trở lại!
              </h2>

              <p className="text-xs sm:text-sm text-[#82716b] mt-1">
                Nhập email và mật khẩu để vào trang quản trị đặt lịch.
              </p>
            </div>

            {/* Success Alert */}
            {loginSuccess && (
              <div className="mb-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>Đăng nhập thành công!</strong> Đang chuyển hướng...
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#513e38] mb-1">
                  Email quản trị Nail
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9e8a83]">
                    <Mail size={16} />
                  </div>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError("");
                    }}
                    placeholder="admin@tuetuebeauty.vn"
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#fdfbf9]/90 border rounded-xl text-base sm:text-sm text-[#342420] placeholder-[#b29f98] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#aa756b]/30 transition-all ${
                      loginError
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#e5d8d0] focus:border-[#a66258]"
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#513e38]">
                    Mật khẩu
                  </label>

                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(
                        "Vui lòng liên hệ quản trị viên để đặt lại mật khẩu.",
                      );
                    }}
                    className="text-xs text-[#a66258] hover:text-[#7f3f35] font-medium transition-colors"
                  >
                    Quên mật khẩu?
                  </a>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9e8a83]">
                    <Lock size={16} />
                  </div>

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError("");
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-11 py-2.5 sm:py-3 bg-[#fdfbf9]/90 border rounded-xl text-base sm:text-sm text-[#342420] placeholder-[#b29f98] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#aa756b]/30 transition-all ${
                      loginError
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#e5d8d0] focus:border-[#a66258]"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9e8a83] hover:text-[#5e4942] transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Red Error Message */}
                {loginError && (
                  <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                    <AlertCircle
                      size={15}
                      className="text-red-500 shrink-0 mt-0.5"
                    />
                    <span className="text-xs text-red-600 font-medium leading-snug">
                      {loginError}
                    </span>
                  </div>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#a66258] border-[#dfcfc7] focus:ring-[#a66258] accent-[#5c373b]"
                  />

                  <span className="text-xs text-[#6e5d57]">
                    Ghi nhớ đăng nhập
                  </span>
                </label>

                <span className="text-[11px] text-[#a66258] font-medium">
                  Bảo mật nội bộ
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-1 py-2.5 sm:py-3 px-5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#4a2d31] via-[#5c373b] to-[#4a2d31] hover:from-[#5a363b] hover:to-[#5a363b] active:scale-[0.99] shadow-[0_8px_20px_rgba(74,45,49,0.22)] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 mt-4 border-t border-[#f5ebe6] lg:border-none lg:pt-6">
            <p className="text-[11px] text-[#a4938d] flex items-center justify-center gap-1">
              <span>Tuệ Tuệ Beauty Studio</span>
              <span>•</span>
              <Heart size={11} className="text-[#c7867a] fill-[#c7867a]" />
              <span>Dành cho nhân sự Nail</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
