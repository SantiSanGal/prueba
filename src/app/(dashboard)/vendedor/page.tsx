"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";

type Vendor = {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
};

type Supervisor = {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
};

export default function VendedorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVendedor, setIsVendor] = useState(false);

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "" });
  const [loading, setLoading] = useState(false);

  async function getToken() {
    const u = auth.currentUser ?? (await new Promise<any>(res => auth.onAuthStateChanged(res)));
    if (!u) throw new Error("No user");
    return u.getIdToken();
  }

  async function loadVendors() {
    const token = await getToken();
    const res = await fetch("/api/vendors", { headers: { Authorization: `Bearer ${token}` } });
    setVendors(await res.json());
  }

  async function loadMeAndMaybeSupervisors() {
    const token = await getToken();
    const meRes = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } });
    const me = await meRes.json();

    const roles: string[] = me.roles ?? [];
    const admin = roles.includes("super_admin");
    const vendor = roles.includes("vendedor");
    setIsAdmin(admin);
    setIsVendor(vendor);

    if (admin) {
      const supRes = await fetch("/api/supervisors", { headers: { Authorization: `Bearer ${token}` } });
      const list: Supervisor[] = await supRes.json();
      setSupervisors(list);
      if (list[0]?.id) setSelectedSupervisorId(list[0].id);
    }
  }


  useEffect(() => {
    (async () => {
      await loadMeAndMaybeSupervisors();
      await loadVendors();
    })().catch(console.error);
  }, []);

  async function create() {
    setLoading(true);
    try {
      const token = await getToken();
      const payload: any = { ...form };
      if (isAdmin) {
        if (!selectedSupervisorId) {
          alert("Selecciona un supervisor para asignar.");
          setLoading(false);
          return;
        }
        payload.supervisorUserId = selectedSupervisorId;
      }
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        alert(`Error ${res.status}: ${txt}`);
      }
      setForm({ firstName: "", lastName: "", email: "" });
      await loadVendors();
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
      const res = await fetch(`/api/vendors/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const txt = await res.text();
        alert(`Error ${res.status}: ${txt}`);
        return;
      }
      await loadVendors();
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
      const res = await fetch(`/api/vendors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        alert(`Error ${res.status}: ${txt}`);
        return;
      }
      await loadVendors();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Crear */}
      {!isVendedor &&
        <div className="w-full max-w-5xl">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Nombre"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <input
              className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Apellido"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
            <input
              className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            {isAdmin && (
              <select
                className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={selectedSupervisorId}
                onChange={(e) => setSelectedSupervisorId(e.target.value)}
              >
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} {s.email ? `(${s.email})` : ""}
                  </option>
                ))}
              </select>
            )}

            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              onClick={create}
              disabled={loading}
            >
              Crear
            </button>
          </div>
        </div>
      }

      {/* Listado */}
      <div className="w-full max-w-5xl overflow-hidden rounded-lg border border-stone-200">
        <table className="w-full">
          <thead className="border-b border-stone-200 bg-stone-100 text-sm font-medium text-stone-600">
            <tr>
              <th className="px-2.5 py-2 text-start font-medium">Nombre</th>
              <th className="px-2.5 py-2 text-start font-medium">Email</th>
              {
                !isVendedor &&
                <th className="px-2.5 py-2 text-start font-medium w-48">Acciones</th>
              }
            </tr>
          </thead>
          <tbody className="group text-sm text-stone-800">
            {vendors.map((v) => {
              const isEditing = v.id === editId;
              return (
                <tr key={v.id} className="border-b border-stone-200 last:border-0">
                  <td className="p-3">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          className="w-40 px-2 py-1 border border-stone-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        />
                        <input
                          className="w-40 px-2 py-1 border border-stone-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        />
                      </div>
                    ) : (
                      `${v.first_name} ${v.last_name}`
                    )}
                  </td>

                  <td className="p-3">
                    {isEditing ? (
                      <input
                        className="w-full px-2 py-1 border border-stone-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    ) : (
                      v.email ?? "-"
                    )}
                  </td>

                  {
                    !isVendedor &&
                    <td className="p-3">
                      {isEditing ? (
                        <div className="flex items-center gap-3">
                          <button
                            className="font-medium text-white  px-3 py-1 rounded bg-green-500 hover:text-primary disabled:opacity-50"
                            onClick={saveEdit}
                            disabled={loading}
                          >
                            Guardar
                          </button>
                          <button
                            className="font-medium bg-yellow-500 rounded hover:text-primary text-white px-3 py-1"
                            onClick={cancelEdit}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            className="font-medium bg-yellow-500 text-white  px-3 py-1 hover:text-primary rounded"
                            onClick={() => startEdit(v)}
                          >
                            Editar
                          </button>
                          <button
                            className="font-medium bg-red-500 rounded px-3 py-1 text-white  hover:underline disabled:opacity-50"
                            onClick={() => remove(v.id)}
                            disabled={loading}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  }
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
