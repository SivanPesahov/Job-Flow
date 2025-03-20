import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/themeContext.tsx";
import AppLayout from "./layouts/AppLayout.tsx";
import AuthLayout from "./layouts/AuthLayout.tsx";
import ProtectedLayout from "./layouts/ProtectedLayout.tsx";
import { default as CreateJobPage } from "./pages/CreateJobPage.tsx";
import CreateResumePage from "./pages/CreateResumePage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import { JobDetails } from "./pages/JobDetailsPage.tsx";
import { JobRecommendationsPage } from "./pages/jobRecommendationsPage.tsx";
import LinkedinJobList from "./pages/LinkedinJobList";
import LoginPage from "./pages/LoginPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SignupPage from "./pages/SignupPage.tsx";

interface AppProps {}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "",
        element: <ProtectedLayout />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
            children: [
              {
                path: "create",
                element: <CreateJobPage />,
              },
              {
                path: "job/:jobId",
                element: <JobDetails />,
              },
            ],
          },
          {
            path: "create-resume",
            element: <CreateResumePage />,
          },
          { path: "profile", element: <ProfilePage /> },
          {
            path: "job-recommendations",
            element: <JobRecommendationsPage />,
            children: [
              {
                path: "linkedin",
                element: <LinkedinJobList />,
              },
            ],
          },
        ],
      },
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "signup",
            element: <SignupPage />,
          },
        ],
      },
    ],
  },
]);
export default function App({}: AppProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 20,
      },
    },
  });
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="theme">
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}
