"use client";
import { useEffect, useState } from "react";

export default function VendedorPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input className="border p-2" placeholder="Nombre"
               value={form.firstName} onChange={e=>setForm({...form, firstName: e.target.value})}/>
        <input className="border p-2" placeholder="Apellido"
               value={form.lastName} onChange={e=>setForm({...form, lastName: e.target.value})}/>
        <input className="border p-2" placeholder="Email"
               value={form.email} onChange={e=>setForm({...form, email: e.target.value})}/>
        <button className="bg-black text-white px-4">Crear</button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="text-left p-2">Nombre</th>
            <th className="text-left p-2">Email</th>
          </tr>
        </thead>
        <tbody>

        </tbody>
      </table>
    </div>
  );
}