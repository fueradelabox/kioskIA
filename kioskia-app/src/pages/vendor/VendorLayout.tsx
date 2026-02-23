import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
    { to: '/vendedor', icon: 'point_of_sale', label: 'POS', end: true },
    { to: '/vendedor/dashboard', icon: 'analytics', label: 'Ventas', end: false },
]

export default function VendorLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1">
                <Outlet />
            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 px-4 pb-safe z-40">
                <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${isActive
                                    ? 'text-amber-500'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`material-icons-round text-2xl ${isActive ? 'scale-110' : ''} transition-transform`}>
                                        {item.icon}
                                    </span>
                                    <span className={`text-[10px] font-bold ${isActive ? 'text-amber-500' : ''}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    )
}
