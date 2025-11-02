"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto mt-24 space-y-3">
      <input className="border p-2 w-full" placeholder="Email"
             value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Contraseña" type="password"
             value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="bg-black text-white px-4 py-2 w-full">Entrar</button>
      {err && <p className="text-red-500 text-sm">{err}</p>}
    </form>
  );
}
