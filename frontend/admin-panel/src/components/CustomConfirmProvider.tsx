import { ConfirmProvider } from "material-ui-confirm";
import type { ReactNode } from "react";

interface CustomConfirmProviderProps {
    children: ReactNode;
}

export default function CustomConfirmProvider({ children }: CustomConfirmProviderProps) {
    return (
        <ConfirmProvider
            defaultOptions={{
                title: 'Подтвердите действие',
                confirmationText: 'Подтвердить',
                cancellationText: 'Отмена',
                dialogProps: {
                    maxWidth: 'xs',
                    sx: {
                        '& .MuiPaper-root': {
                            bgcolor: '#14161A',
                            backgroundImage: 'none',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.6)',
                        },
                        '& .MuiDialogTitle-root': {
                            fontSize: '1.15rem',
                            fontWeight: 600,
                            color: '#E4E6EB',
                            pb: 1.5,
                        },
                        '& .MuiDialogContent-root': {
                            py: '8px !important',
                        },
                        '& .MuiDialogContentText-root': {
                            color: 'rgba(228, 230, 235, 0.8) !important',
                            fontSize: '0.95rem',
                        },
                        '& .MuiDialogActions-root': {
                            p: 2.5,
                            gap: 1.5,
                        },
                    }
                },
                confirmationButtonProps: {
                    variant: 'contained',
                    color: 'primary',
                    sx: {
                        bgcolor: '#2F80ED',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '8px',
                        px: 2.5,
                        py: 1,
                        '&:hover': {
                            bgcolor: '#1b6fd1',
                        },
                    },
                },
                cancellationButtonProps: {
                    variant: 'text',
                    sx: {
                        color: 'rgba(228, 230, 235, 0.6)',
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: '8px',
                        px: 2,
                        py: 1,
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            color: '#E4E6EB',
                        },
                    },
                },
            }}
        >
            {children}
        </ConfirmProvider>
    );
}