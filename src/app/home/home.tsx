"use client";

import React, { useState } from "react";
import { CalendarDays, Settings, LogOut, CheckCircle2 } from "lucide-react";
import CalendarTab from "../calender/page";
import SetupTab from "../setup/page";

export function Homepage() {
  const [mainTab, setMainTab] = useState<"bookings" | "setup">("bookings");
  const [pendingCount, setPendingCount] = useState<number>(3);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#faf5f2] text-[#2c221e] flex flex-col font-sans selection:bg-[#dfb0a3] selection:text-[#38231f]">
      {/* ======================================================== */}
      {/* 1. TOPBAR & NAVIGATION                                   */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#eee3dd] shadow-[0_2px_12px_rgba(74,45,49,0.04)]">
        {/* Hàng 1: Brand Logo + Desktop Tabs + Logout */}
        <div className="max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#4a2d31] to-[#6b3c41] flex items-center justify-center text-white font-serif text-base sm:text-lg font-bold shadow-sm">
              T
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-sm sm:text-base tracking-wider text-[#342420]">
                  TUỆ TUỆ
                </span>
                <span className="italic font-serif text-[#aa756b] font-medium text-xs sm:text-sm">
                  beauty
                </span>
              </div>
              <p className="text-[10px] text-[#8e7b75] leading-none hidden sm:block">
                Quản lý Salon 1 nhân sự
              </p>
            </div>
          </div>

          {/* CHUYỂN ĐỔI 2 PHẦN TRÊN DESKTOP/TABLET */}
          <div className="hidden sm:flex items-center p-1 bg-[#f4ebe6] rounded-2xl border border-[#ebdcd4]">
            <button
              onClick={() => setMainTab("bookings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mainTab === "bookings"
                  ? "bg-white text-[#4a2d31] shadow-sm font-bold"
                  : "text-[#7d6c65] hover:text-[#4a2d31]"
              }`}
            >
              <CalendarDays
                size={16}
                className={mainTab === "bookings" ? "text-[#a66258]" : ""}
              />
              <span>Lịch đặt hẹn</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#a66258] text-white">
                  {pendingCount} mới
                </span>
              )}
            </button>

            <button
              onClick={() => setMainTab("setup")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mainTab === "setup"
                  ? "bg-white text-[#4a2d31] shadow-sm font-bold"
                  : "text-[#7d6c65] hover:text-[#4a2d31]"
              }`}
            >
              <Settings
                size={16}
                className={mainTab === "setup" ? "text-[#a66258]" : ""}
              />
              <span>Setup Salon</span>
            </button>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#eee2db]">
              <div className="w-8 h-8 rounded-full bg-[#f2e2db] border border-[#e1cdc4] flex items-center justify-center text-xs font-bold text-[#6d4239]">
                TT
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#342420] leading-tight">
                  Chủ Nail
                </p>
                <p className="text-[10px] text-[#93817a]">Tuệ Tuệ</p>
              </div>
            </div>

            <a
              href="/login"
              title="Đăng xuất về Login"
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-medium text-[#49352F] hover:bg-[#f6eee9] hover:text-[#a66258] transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </a>
          </div>
        </div>

        {/* Hàng 2: MOBILE TABS ROW */}
        <div className="sm:hidden px-3 pt-1 pb-2.5 bg-white border-t border-[#f4eae4]">
          <div className="grid grid-cols-2 p-1 bg-[#f4ebe6] rounded-xl text-xs font-semibold gap-1">
            <button
              onClick={() => setMainTab("bookings")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all cursor-pointer ${
                mainTab === "bookings"
                  ? "bg-white text-[#4a2d31] shadow-sm font-bold"
                  : "text-[#7d6c65] hover:text-[#4a2d31]"
              }`}
            >
              <CalendarDays
                size={15}
                className={mainTab === "bookings" ? "text-[#a66258]" : ""}
              />
              <span>Lịch đặt hẹn</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#a66258] text-white font-bold leading-none">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMainTab("setup")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all cursor-pointer ${
                mainTab === "setup"
                  ? "bg-white text-[#4a2d31] shadow-sm font-bold"
                  : "text-[#7d6c65] hover:text-[#4a2d31]"
              }`}
            >
              <Settings
                size={15}
                className={mainTab === "setup" ? "text-[#a66258]" : ""}
              />
              <span>Setup Salon</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-5">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#342420] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-white/10 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Nội dung chính được tách thành 2 component */}
        {mainTab === "bookings" ? (
          <CalendarTab
            onShowToast={showToast}
            onPendingCountChange={setPendingCount}
          />
        ) : (
          <SetupTab onShowToast={showToast} />
        )}
      </main>
    </div>
  );
}

export default Homepage;
