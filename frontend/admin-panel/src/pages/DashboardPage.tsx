import { useLogto } from '@logto/react';
import { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

export default function DashboardPage() {
    const { signOut, getIdTokenClaims } = useLogto();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        (async () => {
            const claims = await getIdTokenClaims();
            if (claims?.roles?.includes('admin')) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        })();
    }, [getIdTokenClaims]);

    if (isAdmin === null) {
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

    if (isAdmin === false) {
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
                <Typography variant="h5" gutterBottom sx={{ color: 'error.main' }}>
                    Доступ запрещен
                </Typography>
                <Typography gutterBottom sx={{ color: 'text.secondary', mb: 2 }}>
                    У вашей учетной записи нет прав администратора.
                </Typography>
                <Button variant="outlined" onClick={() => signOut('http://localhost:5174')}>
                    Выйти
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Панель администратора
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                Добро пожаловать! Здесь вы сможете управлять корпусами, комнатами и иконками.
            </Typography>
            <Button
                variant="contained"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={() => signOut('http://localhost:5174')}
            >
                Выйти из системы
            </Button>
        </Box>
    );
}