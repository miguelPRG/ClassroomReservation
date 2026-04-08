import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import './index.css'
import App from './App.tsx'

document.documentElement.classList.add("dark")

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

let ReactQueryDevtools: any = null

if (import.meta.env.DEV) {
  // @ts-ignore - devDependency loaded only in development
  ReactQueryDevtools = (await import('@tanstack/react-query-devtools')).ReactQueryDevtools
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
      {ReactQueryDevtools && <ReactQueryDevtools />}
    </QueryClientProvider>
  </StrictMode>,
)
