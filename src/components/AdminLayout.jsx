import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import NotificationsModal from "./NotificationsModal.jsx";
import SettingsModal from "./SettingsModal.jsx";
import { adminNav, adminMobileNav } from "../config/nav.js";

export default function AdminLayout({ title, subtitle, actions, children }) {
  const { pathname } = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="bg-background text-text-primary font-body-md min-h-screen flex flex-col md:flex-row">
      <header className="md:hidden flex justify-between items-center px-container-margin py-stack-sm w-full bg-surface z-40 sticky top-0">
        <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface">Padel Pro</span>
        <button
          onClick={() => setShowNotifs(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high active:scale-90 transition-all text-primary"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border-subtle h-screen sticky top-0 p-container-margin shrink-0">
        <div className="mb-stack-lg flex items-center gap-inline-gutter px-2">
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              sports_tennis
            </span>
          </div>
          <span className="text-headline-lg font-headline-lg text-on-surface">Padel Pro</span>
        </div>
        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {adminNav.map((item) => {
            const active = item.to === pathname;
            const classes =
              "flex items-center gap-inline-gutter px-4 py-3 rounded-lg transition-all active:scale-95 " +
              (active ? "bg-primary-container text-text-primary font-bold" : "text-secondary hover:bg-surface-container-high");
            const content = (
              <>
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body-md">{item.label}</span>
              </>
            );
            if (item.action === "settings") {
              return (
                <button key={item.key} onClick={() => setShowSettings(true)} className={classes + " w-full text-left"}>
                  {content}
                </button>
              );
            }
            return (
              <Link key={item.key} to={item.to} className={classes}>
                {content}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-container-margin md:p-stack-lg overflow-x-hidden mb-24 md:mb-0">
        <div className="max-w-7xl mx-auto">
          {(title || actions) && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-stack-lg gap-stack-md">
              <div>
                {title && <h2 className="text-headline-xl font-headline-xl text-text-primary mb-2">{title}</h2>}
                {subtitle && <p className="text-body-md font-body-md text-text-secondary">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </main>

      <nav className="md:hidden flex justify-around items-end pb-6 pt-2 px-6 w-full fixed bottom-0 z-50 rounded-t-xl bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md border-t border-border-subtle dark:border-outline-variant shadow-lg">
        {adminMobileNav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.key}
              to={item.to}
              className={
                active
                  ? "flex items-center justify-center bg-primary dark:bg-primary-fixed text-on-primary dark:text-on-primary-fixed rounded-full w-12 h-12 mb-2 shadow-md scale-110 transition-transform duration-300 ease-out"
                  : "flex items-center justify-center text-on-surface-variant dark:text-on-secondary-fixed-variant w-12 h-12 hover:text-primary transition-all"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
            </Link>
          );
        })}
      </nav>

      <NotificationsModal open={showNotifs} onClose={() => setShowNotifs(false)} />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
