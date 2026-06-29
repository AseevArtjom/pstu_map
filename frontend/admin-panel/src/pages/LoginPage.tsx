import { useLogto } from '@logto/react';
import { Button, Container, Box, Typography, Paper } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

export default function LoginPage() {
    const { signIn } = useLogto();

    const handleLogin = () => {
        signIn('http://localhost:5174/callback');
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                    <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                        PSTU Map Admin
                    </Typography>
                    <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>
                        Панель управления интерактивной картой университета
                    </Typography>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<LoginIcon />}
                        onClick={handleLogin}
                        sx={{ py: 1.5, textTransform: 'none', fontSize: '16px' }}
                    >
                        Войти через Logto
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
}