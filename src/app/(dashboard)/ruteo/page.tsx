"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import Map from "@/components/Map";

export default function RuteoPage() {
    const [points, setPoints] = useState<{ lat: number, lng: number }[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [vendorId, setVendorId] = useState<string>("");

    useEffect(() => {
        (async () => {
            const u = await new Promise<any>(res => auth.onAuthStateChanged(res));
            if (!u) return;
            const token = await u.getIdToken();
            const res = await fetch("/api/vendors", { headers: { Authorization: `Bearer ${token}` } });
            const list = await res.json();
            setVendors(list);
            if (list[0]?.id) setVendorId(list[0].id);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (!vendorId) return;
            const u = auth.currentUser!;
            const token = await u.getIdToken();
            const res = await fetch(`/api/routes/${vendorId}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setPoints(data.points);
        })();
    }, [vendorId]);

    return (
        <div className="space-y-4">
            <select className="border p-2" value={vendorId} onChange={e => setVendorId(e.target.value)}>
                {vendors.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.first_name} {v.last_name}</option>
                ))}
            </select>
            <Map points={points} />
        </div>
    );
}
