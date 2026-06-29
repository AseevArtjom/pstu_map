import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {LogtoProvider} from "@logto/react";
import {logtoConfig} from "./config/logtoConfig.ts";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LogtoProvider config={logtoConfig}>
        <App />
    </LogtoProvider>
  </StrictMode>,
)
