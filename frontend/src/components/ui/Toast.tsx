import { Toaster } from 'react-hot-toast'

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#111827',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#10B981', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#EF4444', secondary: '#fff' },
        },
      }}
    />
  )
}
