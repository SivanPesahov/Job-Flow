import useLocalStorage from "@/hooks/useLocalStorage.jsx";
import api from "@/lib/api.js";
import { TOKEN_KEY } from "@/lib/consts.js";
import { formatJWTToken } from "@/lib/jwt.utils.ts";
import { LoginFormValues as LoginCredentials } from "@/pages/LoginPage.tsx";
import { SignupFormValues } from "@/pages/SignupPage.tsx";
import { IUser } from "@/types/IUser";
import { isAxiosError } from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type SignupCredentials = Omit<SignupFormValues, "confirmPassword">;

type UserState = IUser | null | undefined;

interface AuthContextType {
  user: UserState;
  login: (cred: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  signup: (cred: SignupCredentials) => Promise<void>;
  uploadResume: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === null) {
    console.log(`AuthContext: Use inside AuthProvider`);
    throw "Use inside AuthProvider";
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>(undefined);
  const [token, setToken] = useLocalStorage(TOKEN_KEY);
  const navigate = useNavigate();

  async function uploadResume(url: string) {
    try {
      const { data } = await api.patch("/user", { resume_link: url });
      setUser((prev) => {
        return { ...prev, resume_link: url };
      });
      return data;
    } catch (error) {
      console.log(`AuthContext: `, error);
      if (isAxiosError(error))
        throw error.response?.data ? error.response.data : error.message;
      else throw (error as Error).message;
    }
  }

  async function login(cred: LoginCredentials) {
    try {
      const { data: token } = await api.post("/auth/login", cred);
      setToken(token);
    } catch (error) {
      console.log(`AuthContext: `, error);
      if (isAxiosError(error))
        throw error.response?.data ? error.response.data : error.message;
      else throw (error as Error).message;
    }
  }

  async function logout() {
    setToken(null);
  }

  async function signup(cred: SignupCredentials) {
    try {
      const { data } = await api.post("/auth/register", cred);
    } catch (error) {
      console.log(`AuthContext: `, error);
      if (isAxiosError(error))
        throw error.response?.data ? error.response.data : error.message;
      else throw (error as Error).message;
    }
  }

  useEffect(() => {
    console.log(`AuthContext: `, token);
    async function loadUser() {
      try {
        const { data: user } = await api.get<IUser>("/user");
        setUser(user);
      } catch (error) {
        console.log(`AuthContext: `, error);
      }
    }

    let timeout: NodeJS.Timeout;
    if (token) {
      loadUser();
      timeout = setTimeout(() => {
        console.log(`AuthContext: token expired`);
        setToken(null);
      }, formatJWTToken(token)?.exp * 1000 - Date.now());
    } else {
      setUser(null);
    }

    return () => timeout && clearTimeout(timeout);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, uploadResume }}>
      {children}
    </AuthContext.Provider>
  );
}
