import { useAuthContext } from "@/contexts/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom";

export default function AuthLayout() {
  const { user } = useAuthContext();
  return <>{user ? <Navigate to={"/"}></Navigate> : <Outlet />}</>;
}
