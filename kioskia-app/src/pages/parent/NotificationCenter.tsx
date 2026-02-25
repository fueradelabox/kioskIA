import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../../hooks/useParentData'
import type { Id } from '../../../convex/_generated/dataModel'

const typeConfig: Record<string, { icon: string; color: string }> = {
    purchase: { icon: 'shopping_cart', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    low_balance: { icon: 'account_balance_wallet', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    goal_completed: { icon: 'emoji_events', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
    recharge: { icon: 'add_card', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    achievement: { icon: 'military_tech', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    system: { icon: 'info', color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400' },
}

export default function NotificationCenter() {
    const notifications = useNotifications()
    const markRead = useMarkNotificationRead()
    const markAllRead = useMarkAllNotificationsRead()

    const unreadCount = notifications.filter(n => !n.read).length

    const handleClickNotification = async (id: Id<"notifications">, read: boolean) => {
        if (!read) {
            await markRead({ notificationId: id })
        }
    }

    const handleMarkAllRead = async () => {
        await markAllRead({})
    }

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
    }

    return (
        <div className="max-w-3xl mx-auto p-5 md:p-10 space-y-6">
            <div className="flex items-center justify-between animate-slide-up">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                        Notificaciones 🔔
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-icons-round text-sm">done_all</span>
                        Marcar todo leído
                    </button>
                )}
            </div>

            {notifications.length === 0 && (
                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center animate-slide-up">
                    <span className="material-icons-round text-6xl text-gray-200 dark:text-gray-700 mb-4 block">notifications_off</span>
                    <p className="text-gray-400 font-medium">No tienes notificaciones</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Las alertas aparecerán aquí automáticamente</p>
                </div>
            )}

            <div className="space-y-2">
                {notifications.map((notif, i) => {
                    const config = typeConfig[notif.type] ?? typeConfig.system
                    return (
                        <button
                            key={notif._id}
                            onClick={() => handleClickNotification(notif._id, notif.read)}
                            className={`w-full text-left bg-white dark:bg-surface-dark rounded-xl border p-4 transition-all animate-slide-up hover:shadow-sm ${notif.read
                                ? 'border-gray-100 dark:border-gray-800 opacity-70'
                                : 'border-gray-200 dark:border-gray-700 shadow-sm'
                                }`}
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
                                    <span className="material-icons-round text-lg">{config.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className={`font-semibold text-sm truncate ${notif.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                            {notif.title}
                                        </p>
                                        {!notif.read && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">{notif.message}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 shrink-0 mt-1">{formatTime(notif._creationTime)}</span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
