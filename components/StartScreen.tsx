// src/components/StartScreen.tsx
import React from 'react';
import { getImagePath } from '../utils/imagePath';

interface StartScreenProps {
  onStart: () => void;
}

type CharacterSpec = {
  title: string;
  image: string;
  desc: string;
};

const CHARACTERS: CharacterSpec[] = [
  { title: '家計の金庫番長', image: '/kakei_no_kinkobancho.png', desc: '数字や情報を正確に整理し、落ち着いて判断できる。家計管理のように、仕事でも丁寧さと正確性が光り、ミスなく進める場面で頼りにされるタイプです。' },
  { title: 'ご近所の広報部長', image: '/gokinjo_no_koho_bucho.png', desc: '人と話すのが大好きで、有益な情報を分かりやすく伝えるのが得意。明るいコミュニケーションと気配りで、初対面の相手とも自然に打ち解けます。' },
  { title: '献立パズルの名参謀', image: '/kondate_puzzle_no_meisanbo.png', desc: '限られた条件の中で最高の段取りを考え出す戦略家。ゴールから逆算して今やるべきことを冷静に判断するその思考力は、多くの仕事で求められる才能です。' },
  { title: 'おもてなしコーディネーター', image: '/omotenashi_coordinator.png', desc: '相手の気持ちを思いやり、喜んでもらえる行動が自然にできるムードメーカー。場の空気を読みながら丁寧に動ける姿は、周囲に安心感を与えます。' },
  { title: 'お買い物マスター', image: '/okaimono_master.png', desc: '膨大な情報の中から本当に価値のあるものを見抜くプロの目利き。トレンドと実用性のバランス感覚に優れており、多くの人が頼りにするスキルと言えるでしょう。' },
  { title: '時短改善リーダー', image: '/jitan_kaizen_leader.png', desc: '効率を考え、より良い方法を生み出せる改革者。現状を当たり前とせず、課題を見つけては改善していく視点は、あらゆる組織の成長に不可欠な才能です。' },
  { title: '思い出編集長', image: '/omoide_henshucho.png', desc: '日常の中から最高の瞬間を切り取り、魅力的に表現できるクリエイター。多くの情報の中から何が一番大切かを見抜くセンスは唯一無二のものです。' },
  { title: '暮らし彩るハンドメイド職人', image: '/kurashi_irodoru_handmade_shokunin.png', desc: '手作業が得意で、イメージを丁寧に形にする職人気質。細かい作業への集中力が高く、同じ作業を丁寧に繰り返すことが苦にならない丁寧さが強みです。' },
  { title: 'イベント演出ディレクター', image: '/event_enshutsu_director.png', desc: 'みんなが最高に楽しめる企画を考え、実行するプロデューサー。周りを巻き込み、一つの目標に向かってチームを動かす統率力を持っています。' },
  { title: '縁の下のサポート部長', image: '/en_no_shita_support_bucho.png', desc: '誰かを支えることに喜びを感じ、困っている人に気づいてさっと手を差し伸べられる。相手が求めることを察し、先回りして行動する気配りは組織の潤滑油となります。' },
];

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ===== Main Visual ===== */}
      <main>
        <div className="relative w-full h-[40vh] sm:h-[50vh] lg:h-[60vh] overflow-hidden bg-orange-100">
          <img src={getImagePath('/sample.jpg')} alt="メインビジュアル" className="w-full h-full object-cover object-center animate-fade-in" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* ===== Copy & CTA ===== */}
        <section className="relative -mt-20 z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 md:p-12 border border-white/50">
            <p className="font-heading tracking-tight text-3xl md:text-5xl lg:text-6xl font-bold text-orange-500 mb-6 leading-tight">
              <span className="inline-block transform hover:scale-105 transition-transform duration-300">その家事、</span><br className="sm:hidden" />
              <span className="inline-block transform hover:scale-105 transition-transform duration-300 delay-100">実はすごい</span><br className="sm:hidden" />
              <span className="inline-block transform hover:scale-105 transition-transform duration-300 delay-200">才能です</span>
            </p>
            <p className="font-body text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed mb-10 max-w-2xl mx-auto">
              毎日の家事や子育ての中に隠れている<br className="hidden sm:block" />
              あなたの素晴らしい才能を見つけて、<br className="hidden sm:block" />
              自信を持って新しいスタートを切りませんか？
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onStart}
                className="group relative bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 px-12 rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-lg md:text-2xl tracking-wide w-full sm:w-auto overflow-hidden"
              >
                <span className="relative z-10">あなたのお仕事スキルを診断</span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              </button>
              <p className="font-body text-sm text-gray-500 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                所要時間：約3分 / 完全無料
              </p>
            </div>
          </div>
        </section>

        {/* ===== Section Title ===== */}
        <section className="text-center py-16 px-4 mt-12">
          <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-500 text-sm font-bold mb-4">CHARACTERS</span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            あなたの隠れた才能は？
          </h2>
          <p className="font-heading text-lg md:text-xl text-gray-600">
            性格タイプは、全<span className="text-orange-500 font-bold mx-1 text-2xl">{CHARACTERS.length}</span>種類
          </p>
          <div className="w-16 h-1 bg-orange-500 mx-auto mt-6 rounded-full"></div>
        </section>

        {/* ===== キャラクター一覧 ===== */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CHARACTERS.map((c) => (
              <article
                key={c.title}
                className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                  <img
                    src={getImagePath(c.image)}
                    alt={c.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-gray-800 mb-3 group-hover:text-orange-500 transition-colors">
                    {c.title}
                  </h3>
                  <p className="font-body text-sm md:text-base text-gray-600 leading-relaxed flex-1">
                    {c.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}