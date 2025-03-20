import { useAuthContext } from "@/contexts/AuthContext.jsx";
import { cn } from "@/lib/utils.js";
import { ReactNode, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.tsx";
import { FaBars, FaTimes } from "react-icons/fa";

type TextNavLinkProps = {
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};
function TextNavLink({ to, className, children, onClick }: TextNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          isActive
            ? "text-foreground text-orange-700 dark:text-blue-500 border-b-4 dark:border-blue-900 border-orange-600"
            : "text-muted-foreground",
          "hover:text-foreground",
          className
        )
      }
      onClick={onClick} // Call the onClick function when the link is clicked
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMenuOpen(false);
    }, 300); // Duration of the closing animation in milliseconds
  };

  return (
    <header className="sticky top-0 z-[10000] flex h-16 items-center gap-4 border-b bg-opacity-30 lg:px-[9.8em] px-2 backdrop-blur-md backdrop-filter md:px-16">
      <nav className="flex w-full items-center gap-4 text-sm font-medium">
        <div className="flex w-full justify-between items-center">
          {/* Hamburger Menu for Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-2xl"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Links for Desktop */}
          <div className="hidden lg:flex gap-4">
            <TextNavLink to="/">Home</TextNavLink>
            <TextNavLink to="/dashboard">Dashboard</TextNavLink>
            <TextNavLink to="/dashboard/create">Create Job</TextNavLink>
            <TextNavLink to="/create-resume">Create Resume</TextNavLink>
            <TextNavLink to="/job-recommendations">
              Job Recommendations
            </TextNavLink>
          </div>

          {/* User and Theme Toggle */}
          <div className="ms-auto flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {user.firstName[0] + user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      closeMenu();
                      navigate("/profile");
                    }}
                  >
                    Profile Page
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      closeMenu();
                      logout();
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <TextNavLink to="/auth/login">Login</TextNavLink>
                <TextNavLink to="/auth/signup">Sign Up</TextNavLink>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={cn(
              "lg:hidden fixed top-10 left-0 right-0 z-[10000] flex flex-col gap-4 mt-4 dark:bg-black bg-white shadow-lg rounded-lg p-6 overflow-y-auto max-h-[calc(100vh-4rem)] transition-all duration-300",
              isClosing ? "opacity-0 transform -translate-y-10" : "opacity-100"
            )}
          >
            <TextNavLink
              to="/"
              onClick={closeMenu}
              className="text-gray-800 dark:text-gray-300 hover:text-blue-600 text-lg"
            >
              Home
            </TextNavLink>
            <TextNavLink
              to="/dashboard"
              onClick={closeMenu}
              className="text-gray-800 dark:text-gray-300 hover:text-blue-600 text-lg"
            >
              Dashboard
            </TextNavLink>
            <TextNavLink
              to="/dashboard/create"
              onClick={closeMenu}
              className="text-gray-800 dark:text-gray-300 hover:text-blue-600 text-lg"
            >
              Create Job
            </TextNavLink>
            <TextNavLink
              to="/create-resume"
              onClick={closeMenu}
              className="text-gray-800 dark:text-gray-300 hover:text-blue-600 text-lg"
            >
              Create Resume
            </TextNavLink>
            {user && (
              <TextNavLink
                to="/dashboard"
                onClick={closeMenu}
                className="text-gray-800 dark:text-gray-300 hover:text-blue-600 text-lg"
              >
                Job Tracker
              </TextNavLink>
            )}
            {user ? (
              <>
                <TextNavLink
                  to="/user"
                  onClick={closeMenu}
                  className="text-gray-800 dark:text-gray-300 hover:text-blue-600 text-lg"
                >
                  My Account
                </TextNavLink>
                <button
                  className="text-left w-full text-gray-800 dark:text-gray-300 hover:text-blue-600 text-lg"
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <TextNavLink
                  to="/auth/login"
                  onClick={closeMenu}
                  className="text-gray-800 dark:text-gray-300 hover:text-blue-600 text-lg"
                >
                  Login
                </TextNavLink>
                <TextNavLink
                  to="/auth/signup"
                  onClick={closeMenu}
                  className="text-gray-800 dark:text-gray-300 hover:text-blue-600 text-lg"
                >
                  Sign Up
                </TextNavLink>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
