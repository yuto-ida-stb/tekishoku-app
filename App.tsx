// src/App.tsx
import React from "react";
import { HashRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Characters from "./pages/Characters";
import DiagnosisFlow from "./flows/DiagnosisFlow";
import ConditionDiagnosisFlow from "./flows/ConditionDiagnosisFlow";
import ScrollToTop from "./components/ScrollToTop";
import CharacterDetailScreen from "./components/CharacterDetailScreen";
import CategoryJobsScreen from "./components/CategoryJobsScreen";
import SecondStageResultScreen from "./components/SecondStageResultScreen";

const FinalResultWrapper = () => {
  const navigate = useNavigate();
  return <SecondStageResultScreen onRestart={() => navigate("/")} />;
};

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* 一覧 */}
        <Route path="/characters" element={<Characters />} />
        {/* 詳細（クリック後に飛ぶ先） */}
        <Route path="/characters/:name" element={<CharacterDetailScreen />} />
        <Route path="/categories/:categoryName" element={<CategoryJobsScreen />} />
        <Route path="/diagnosis" element={<DiagnosisFlow />} />
        <Route path="/diagnosis/conditions" element={<ConditionDiagnosisFlow />} />
        <Route path="/diagnosis/final-result" element={<FinalResultWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </HashRouter>
  );
}
