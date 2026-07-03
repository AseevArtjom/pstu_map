import { useHandleSignInCallback } from '@logto/react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

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
                    height: '100vh',
                    background: "conic-gradient(" +
                        "rgb(20, 20, 35) 0.25turn," +
                        "rgb(14, 14, 26) 0.25turn 0.5turn," +
                        "rgb(20, 20, 35) 0.5turn 0.75turn," +
                        "rgb(14, 14, 26) 0.75turn) 0px 0px / 40px 40px"
                }}
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    return null;
}