// src/pages/Characters.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { CHARACTERS } from "../data/Characters";
import { getImagePath } from "../utils/imagePath";

export default function CharacterList() {
  const navigate = useNavigate();

  const handleClick = (name: string) => {
    navigate(`/characters/${encodeURIComponent(name)}`);
  };

  return (
    <section className="bg-[#f5f5f5] max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-800 mb-10">
        全10種類の性格タイプ
      </h2>

      {/* 高さをそろえるために items-stretch を追加 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
        {CHARACTERS.map((char, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(char.name)}
            // カードを白背景に変更
            className="flex flex-col h-full text-left bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {/* 画像の比率を16:9（aspect-video）に変更 */}
            <div className="w-full aspect-video overflow-hidden bg-gray-100">
              <img
                src={getImagePath(char.image)}
                alt={char.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* テキスト部分も flex で高さ調整 */}
            <div className="p-5 flex-1 flex flex-col">
              {/* キャラクター名をデフォルト色 (gray-800) に変更 */}
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {char.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                {char.shortDescription}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}