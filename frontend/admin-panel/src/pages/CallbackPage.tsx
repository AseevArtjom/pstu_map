import { useHandleSignInCallback } from '@logto/react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function CallbackPage() {
    const navigate = useNavigate();
    const { isLoading } = useHandleSignInCallback(() => {
        navigate('/');
    });

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Завершение авторизации...
                </Typography>
            </Box>
        );
    }

    return null;
}