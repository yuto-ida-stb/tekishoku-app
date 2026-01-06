// src/components/CharacterList.tsx
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
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-800 mb-10">
        全10種類の性格タイプ
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {CHARACTERS.map((char) => (
          <button
            key={char.name}
            type="button"
            onClick={() => handleClick(char.name)}
            className="text-left bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={getImagePath(char.image)}
                alt={char.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {char.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {char.shortDescription}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}