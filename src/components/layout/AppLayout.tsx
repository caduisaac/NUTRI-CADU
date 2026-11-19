import React from 'react'
import { Sidebar } from './Sidebar'

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col">
      <Sidebar />
      <div className="flex-1 md:pl-64 flex flex-col">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

