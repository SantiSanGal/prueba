"use client";
import { useEffect, useState } from "react";

export default function RuteoPage() {
    const [points, setPoints] = useState<{ lat: number, lng: number }[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [vendorId, setVendorId] = useState<string>("");

    return (
        <div className="space-y-4">
            <select className="border p-2" value={vendorId} onChange={e => setVendorId(e.target.value)}>
                {vendors.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.first_name} {v.last_name}</option>
                ))}
            </select>
        </div>
    );
}
