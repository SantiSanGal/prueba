"use client"
import { IoBrowsersOutline, IoCalculator } from "react-icons/io5"
import { onAuthStateChanged, signOut } from "firebase/auth";
import { SidebarMenuItem } from "./SidebarMenuItem"
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

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
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        return onAuthStateChanged(auth, (u) => {
            if (!u) router.replace("/login");
            setUser(u);
        });
    }, [router]);

    if (!user) return null;
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
                        console.log({ menuItem });

                        return (
                            <SidebarMenuItem
                                key={menuItem.path}
                                {...menuItem}
                            />
                        )
                    })
                }
                <button onClick={() => signOut(auth)} className="text-sm text-gray-500">
                    Salir
                </button>
            </div>
        </div>
    )
}
