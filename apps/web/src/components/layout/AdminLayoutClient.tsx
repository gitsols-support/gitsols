'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminTopBar, { RightPanelType } from './AdminTopBar'
import AdminRightSidebar from './AdminRightSidebar'
import AdminSidebarDrawer from './AdminSidebarDrawer'
import { ToastProvider } from '@/components/admin/Toast'

interface AdminLayoutClientProps {
  children: React.ReactNode
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [rightPanel, setRightPanel] = useState<RightPanelType>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ⌘K / Ctrl+K opens the quick-view drawer from anywhere in the shell
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setDrawerOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <ToastProvider>
    <div className="h-screen overflow-hidden bg-[#F4F8F7] flex">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopBar
          onIconClick={(type) => setRightPanel((prev) => (prev === type ? null : type))}
          activePanelType={rightPanel}
          sidebarCollapsed={collapsed}
          onSidebarToggle={() => setCollapsed((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">{children}</main>
      </div>

      {rightPanel && <AdminRightSidebar type={rightPanel} onClose={() => setRightPanel(null)} />}

      <AdminSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
    </ToastProvider>
  )
}
