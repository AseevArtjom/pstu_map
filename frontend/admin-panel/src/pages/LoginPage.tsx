import { useLogto } from '@logto/react';
import { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function LoginPage() {
    const { signIn, isAuthenticated, isLoading } = useLogto();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            signIn('http://localhost:5174/callback');
        }
    }, [isLoading, isAuthenticated, signIn]);

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
            }}
        >
            <CircularProgress sx={{ mb: 2, color: '#2F80ED' }} />
        </Box>
    );
}