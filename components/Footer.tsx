// src/components/Footer.tsx
import React from "react";
import { getImagePath } from "../utils/imagePath";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#ececec]">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-left">
          {/* ロゴ */}
          <img
            src={getImagePath('/stanby_symbol_orange_circle_alpha.png')}
            alt="スタンバイ"
            className="h-10 w-auto"
          />

          {/* 説明文 */}
          <div className="flex flex-col leading-snug text-center md:text-left">
            <span className="text-gray-600 text-sm md:text-base">
              全国の求人サイトから一括検索できるスタンバイ
            </span>
            <span className="text-gray-600 text-sm md:text-base">
              次世代の仕事探しをもっと便利に！
            </span>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav>
          <ul className="flex flex-wrap justify-center md:justify-end gap-6 text-sm md:text-base font-semibold">
            <li>
              <a
                href="https://jp.stanby.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-orange-500"
              >
                求人一括検索サイトスタンバイ
              </a>
            </li>
            <li>
              <a
                href="https://jp.stanby.com/magazine/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-orange-500"
              >
                スタンバイplus
              </a>
            </li>
            <li>
              <a
                href="https://jp.stanby.com/stats/occupation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-orange-500"
              >
                給与マップ
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* コピーライト部分 */}
      <div className="bg-white text-center text-gray-500 text-xs py-4">
        © {new Date().getFullYear()} STANBY Inc. All rights reserved.
      </div>
    </footer>
  );
}