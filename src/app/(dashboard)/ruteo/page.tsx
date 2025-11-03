"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import Map from "@/components/Map";

const puntos = [
  { lat: -25.295, lng: -57.636 },
  { lat: -25.296, lng: -57.633 },
  { lat: -25.299, lng: -57.631 },
  { lat: -25.301, lng: -57.628 },
];

export default function RuteoPage() {
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

    return (
        <div className="space-y-4">
            <select className="border p-2" value={vendorId} onChange={e => setVendorId(e.target.value)}>
                {vendors.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.first_name} {v.last_name}</option>
                ))}
            </select>
            <Map points={puntos} />
        </div>
    );
}
