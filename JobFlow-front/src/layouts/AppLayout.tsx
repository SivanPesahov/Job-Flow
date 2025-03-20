import Navbar from "@/components/Navbar.jsx";
import { Toaster } from "@/components/ui/toaster.jsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <>
      <AuthProvider>
        <TooltipProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <Outlet />
            <Toaster />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </>
  );
}
