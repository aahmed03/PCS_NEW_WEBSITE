import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white/90 backdrop-blur-md shadow-lg rounded-full px-4 py-2 flex gap-2 border border-border">
      <button
        onClick={() => changeLang("en")}
        className={`text-sm font-medium px-2 py-1 rounded-full ${
          i18n.language === "en" ? "bg-primary text-white" : "text-foreground"
        }`}
      >
        EN
      </button>

      <button
        onClick={() => changeLang("es")}
        className={`text-sm font-medium px-2 py-1 rounded-full ${
          i18n.language === "es" ? "bg-primary text-white" : "text-foreground"
        }`}
      >
        ES
      </button>
    </div>
  );
}
