import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useLogto } from '@logto/react';
import { Box, CircularProgress } from '@mui/material';
import LoginPage from "./pages/LoginPage.tsx";
import CallbackPage from "./pages/CallbackPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import type {JSX} from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, isLoading } = useLogto();

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/callback',
        element: <CallbackPage />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <DashboardPage />
            </ProtectedRoute>
        ),
        children: [],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);