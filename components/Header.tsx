// src/components/Header.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getImagePath } from "../utils/imagePath";

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="bg-white border-b border-[#ececec]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="h-20 flex items-center justify-between">
          
          {/* 左：ロゴ */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={getImagePath('/_stanby_logo_color_alpha.png')}
              alt="スタンバイ"
              className="h-10 w-auto md:h-12"
            />
          </Link>

          {/* 右：ナビ */}
          <nav aria-label="Primary">
            <ul className="flex items-center gap-6 text-sm md:text-base font-semibold">
              <li>
                <Link
                  to="/characters"
                  className={`transition-colors ${
                    pathname === "/characters"
                      ? "text-orange-500"
                      : "text-orange-500 hover:text-orange-600"
                  }`}
                >
                  キャラクター紹介
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}