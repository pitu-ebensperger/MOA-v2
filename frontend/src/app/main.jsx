import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@config/react-query'
import { handleAuthError } from '@/utils/handleAuthError.js'
import { AuthProvider } from "@/context/AuthContext.jsx"
import { CartProvider } from "@/context/CartContext.jsx"
import { App } from '@/app/App.jsx'
import { MessageProvider } from '@/components/ui'
import { SpeedInsights } from '@vercel/speed-insights/react'

import '../styles/global.css'
import '../styles/tokens.css'
import '../styles/shadcn-theme.css'
import '../styles/components/buttons.css'
import '../styles/messaging-system.css'

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      keepPreviousData: true,
      retry: (failureCount, error) => {
        if (handleAuthError(error)) return false
        if (error?.status >= 400 && error?.status < 500) return false
        return failureCount < 2
      },
      onError: (error) => {
        console.error('[React Query Error]', error)
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error('[Mutation Error]', error)
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
            <MessageProvider />
            {import.meta.env.PROD && <SpeedInsights />}
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
