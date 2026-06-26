'use client'

import { X, Bell, Activity, TrendingUp } from 'lucide-react'
import { cn, relativeTime } from '@gitsols/utils'
import { STUB_NOTIFICATIONS, STUB_ACTIVITY, STUB_STATS } from '@gitsols/constants'
import { RightPanelType } from './AdminTopBar'

interface AdminRightSidebarProps {
  type: RightPanelType
  onClose: () => void
}

export default function AdminRightSidebar({ type, onClose }: AdminRightSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <aside className="fixed top-0 right-0 h-full z-50 w-72 bg-white border-l border-gray-100 shadow-xl flex flex-col animate-slide-in-right">
        <div className="flex-1 overflow-y-auto">
          {type === 'notifications' && <NotificationsPanel onClose={onClose} />}
          {type === 'activity' && <ActivityPanel onClose={onClose} />}
          {type === 'stats' && <StatsPanel onClose={onClose} />}
        </div>
      </aside>
    </>
  )
}

function PanelHeader({
  title,
  icon: Icon,
  onClose,
}: {
  title: string
  icon: React.ElementType
  onClose: () => void
}) {
  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-[#0F4C4C]" />
        <span className="text-sm font-semibold text-[#0F4C4C]">{title}</span>
      </div>
      <button
        onClick={onClose}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
        aria-label="Close panel"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const unread = STUB_NOTIFICATIONS.filter((n) => !n.read)
  const read = STUB_NOTIFICATIONS.filter((n) => n.read)

  const dotColor = {
    info: 'bg-[#0EA5E9]',
    warning: 'bg-[#F59E0B]',
    error: 'bg-[#EF4444]',
    success: 'bg-[#14B8A6]',
  }

  return (
    <div>
      <PanelHeader title="Notifications" icon={Bell} onClose={onClose} />
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">{unread.length} unread</span>
          <button className="text-[10px] font-medium text-[#0F4C4C] hover:underline">
            Mark all read
          </button>
        </div>

        {unread.length > 0 && (
          <div className="space-y-1 mb-3">
            {unread.map((n) => (
              <div
                key={n.id}
                className="flex gap-3 p-2.5 rounded-xl bg-gray-50 border-l-2 border-[#14B8A6] cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                    dotColor[n.type],
                  )}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{n.title}</p>
                  <p className="text-[10px] text-gray-500 truncate">{n.body}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{relativeTime(n.time)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {read.length > 0 && (
          <div className="opacity-70">
            <p className="text-[10px] font-medium text-gray-500 mb-2 px-1">
              Earlier ({read.length})
            </p>
            <div className="space-y-1">
              {read.map((n) => (
                <div
                  key={n.id}
                  className="flex gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                      dotColor[n.type],
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 truncate">{n.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{relativeTime(n.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityPanel({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <PanelHeader title="Activity" icon={Activity} onClose={onClose} />
      <div className="p-3 space-y-2">
        {STUB_ACTIVITY.map((a) => (
          <div key={a.id} className="flex gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-7 h-7 rounded-full bg-[#0F4C4C]/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-3 h-3 text-[#0F4C4C]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-700">
                <span className="font-medium text-[#0F4C4C]">{a.actor}</span>{' '}
                <span className="text-gray-500">{a.action}</span>{' '}
                <span className="font-medium">{a.target}</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{relativeTime(a.time)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <PanelHeader title="Quick stats" icon={TrendingUp} onClose={onClose} />
      <div className="p-3 space-y-2">
        <StatBlock label="Total users" value={STUB_STATS.totalUsers.toString()} />
        <StatBlock label="Active today" value={STUB_STATS.activeToday.toString()} />
        <StatBlock label="Weekly growth" value={`+${STUB_STATS.weeklyGrowth}%`} highlight />
        <StatBlock label="Uptime" value={`${STUB_STATS.uptime}%`} />
      </div>
    </div>
  )
}

function StatBlock({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-3',
        highlight ? 'bg-[#F0FDFA] border border-[#14B8A6]/25' : 'bg-gray-50',
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#14B8A6]/70 mb-1">
        {label}
      </p>
      <p className={cn('text-xl font-bold', highlight ? 'text-[#14B8A6]' : 'text-[#0F4C4C]')}>
        {value}
      </p>
    </div>
  )
}
