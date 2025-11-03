"use client";
import { Sidebar } from "../../components/Sidebar";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children
}: { children: React.ReactNode }) {
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
        <div className="bg-slate-100 overflow-y-scroll w-screen h-screen antialiased text-slate-300 selection:bg-blue-600 selection:text-white">
            <div className="flex">
                <Sidebar />
                <div className="p-2 w-full text-slate-900">
                    {children}
                </div>
            </div>
        </div>
    )
}