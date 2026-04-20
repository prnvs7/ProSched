import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen flex flex-col">
        <div key={location.pathname} className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 pt-16 lg:pt-8 animate-fade-in">
          <Outlet />
        </div>
        <footer className="lg:ml-0 px-6 py-4 text-center text-xs text-muted-foreground border-t border-border">
          ProSched © 2025 — Production Management System
        </footer>
      </main>
    </div>
  );
}
