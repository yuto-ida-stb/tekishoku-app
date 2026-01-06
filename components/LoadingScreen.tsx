import React, { useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/95 rounded-3xl shadow-xl px-6 py-10 flex flex-col items-center space-y-6">

        {/* メインテキスト */}
        <div className="text-center space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            あなたの隠れた才能を解析中…
          </h2>

          {/* バウンスする3点ドット */}
          <div className="flex justify-center space-x-1">
            <span
              className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>

          <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
            家事や子育ての経験から、<br />
            あなたにぴったりのタイプを分析しています。
          </p>
        </div>

        {/* プログレスバー */}
        <div className="w-full pt-2">
          <div className="h-2 bg-orange-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 animate-pulse"
              style={{ width: "75%" }}
            />
          </div>
        </div>

        <p className="text-xs text-gray-400">
          画面を閉じずに、そのままお待ちください。
        </p>
      </div>
    </div>
  );
}
