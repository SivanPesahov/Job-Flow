import { useAuthContext } from "@/contexts/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedLayout() {
  const { user } = useAuthContext();
  return (
    <>{user === null ? <Navigate to={"/auth/login"}></Navigate> : <Outlet />}</>
  );
}
