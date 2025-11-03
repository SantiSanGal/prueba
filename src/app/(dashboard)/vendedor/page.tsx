"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";

type Vendor = {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
};

export default function VendedorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "" });
  const [loading, setLoading] = useState(false);

  async function getToken() {
    const u = auth.currentUser ?? (await new Promise<any>(res => auth.onAuthStateChanged(res)));
    if (!u) throw new Error("No user");
    return u.getIdToken();
  }

  async function load() {
    const token = await getToken();
    const res = await fetch("/api/vendors", { headers: { Authorization: `Bearer ${token}` } });
    setVendors(await res.json());
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function create() {
    setLoading(true);
    try {
      const token = await getToken();
      await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      setForm({ firstName: "", lastName: "", email: "" });
      await load();
    } finally {
      setLoading(false);
    }
  }

  function startEdit(v: Vendor) {
    setEditId(v.id);
    setEditForm({
      firstName: v.first_name,
      lastName: v.last_name,
      email: v.email ?? "",
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm({ firstName: "", lastName: "", email: "" });
  }

  async function saveEdit() {
    if (!editId) return;
    setLoading(true);
    try {
      const token = await getToken();
      await fetch(`/api/vendors/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      await load();
      cancelEdit();
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este vendedor? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    try {
      const token = await getToken();
      await fetch(`/api/vendors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Crear */}
      <div className="flex flex-wrap gap-2">
        <input
          className="border p-2"
          placeholder="Nombre"
          value={form.firstName}
          onChange={e => setForm({ ...form, firstName: e.target.value })}
        />
        <input
          className="border p-2"
          placeholder="Apellido"
          value={form.lastName}
          onChange={e => setForm({ ...form, lastName: e.target.value })}
        />
        <input
          className="border p-2"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <button
          className="bg-black text-white px-4 disabled:opacity-50"
          onClick={create}
          disabled={loading}
        >
          Crear
        </button>
      </div>

      {/* Listado */}
      <table className="w-full border">
        <thead>
          <tr>
            <th className="text-left p-2">Nombre</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2 w-48">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map(v => {
            const isEditing = v.id === editId;
            return (
              <tr key={v.id} className="border-t">
                <td className="p-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        className="border p-1"
                        value={editForm.firstName}
                        onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                      />
                      <input
                        className="border p-1"
                        value={editForm.lastName}
                        onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                      />
                    </div>
                  ) : (
                    `${v.first_name} ${v.last_name}`
                  )}
                </td>
                <td className="p-2">
                  {isEditing ? (
                    <input
                      className="border p-1 w-full"
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  ) : (
                    v.email ?? "-"
                  )}
                </td>
                <td className="p-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                        onClick={saveEdit}
                        disabled={loading}
                      >
                        Guardar
                      </button>
                      <button
                        className="bg-gray-300 px-3 py-1 rounded"
                        onClick={cancelEdit}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                        onClick={() => startEdit(v)}
                      >
                        Editar
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                        onClick={() => remove(v.id)}
                        disabled={loading}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}