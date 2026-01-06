// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";
import { getImagePath } from "../utils/imagePath";

type HomeProps = {
  onStart?: () => void; 
};

export default function Home({ onStart }: HomeProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onStart) {
      onStart();
    } else {
      navigate("/diagnosis");
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-71px)] w-full overflow-hidden">

      {/* ▼ 背景画像（キャラクター全体） */}
      <img
        src={getImagePath('/sample02.jpg')}
        alt="背景キャラクター"
        className="absolute inset-0 w-full h-full object-cover object-bottom"
      />

      {/* ▼ 下から白フェード */}
      <div className="absolute bottom-0 inset-x-0 h-52 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>

      {/* ▼ 文字＆ボタン */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24">

        {/* タイトル line-heightを1.25(tight)に固定。sm:text-5xlなどのデフォルト行送りを上書き */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-xl leading-tight sm:leading-tight md:leading-tight mb-6">
          主婦のための<br />
          かんたん適職診断
        </h1>

        {/* サブコピー */}
        <p className="text-white text-lg sm:text-xl md:text-2xl drop-shadow-md mb-8 leading-relaxed">
          毎日の家事や子育ての中に隠れている<br />
          自信を持って新しいスタートを切りませんか？
        </p>

        {/* ボタン: ホバー色もブランドカラーに近い明度の調整に留める */}
        <button
          onClick={handleClick}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-full text-lg sm:text-xl shadow-xl
                     transform hover:scale-105 transition-all duration-200"
        >
          適職診断をはじめる
        </button>

      </div>
    </main>
  );
}