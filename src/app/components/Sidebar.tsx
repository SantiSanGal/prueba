import { IoBrowsersOutline, IoCalculator } from "react-icons/io5"
import { SidebarMenuItem } from "./SidebarMenuItem"

const menuItems = [
    {
        path: '/vendedor',
        icon: <IoBrowsersOutline size={40} />,
        title: 'Vendedor',
        subTitle: 'Lista de Vendedores'
    },
    {
        path: '/ruteo',
        icon: <IoCalculator size={40} />,
        title: 'Rutas',
        subTitle: 'Rutas'
    },
]

export const Sidebar = () => {
    return (
        <div id="menu"
            style={{ width: '600px' }}
            className="bg-gray-900 min-h-screen z-10 text-slate-300 w-64 left-0 overflow-y-scroll">
            <div id="logo" className="my-4 px-6">
                <h1 className="text-lg md:text-2xl font-bold text-white">Dash<span className="text-blue-500">8</span>.</h1>
            </div>

            <div id="nav" className="w-full px-6">
                {
                    menuItems.map(menuItem => {
                        console.log({menuItem});
                        
                        return (
                        <SidebarMenuItem
                            key={menuItem.path}
                            {...menuItem}
                        />
                    )
                    })
                }
            </div>
        </div>
    )
}
