"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Category } from "@/types";

const emptyForm = { name: "", description: "", isActive: true };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/categories?all=true`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load categories");
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat._id);
    setForm({ name: cat.name, description: cat.description, isActive: cat.isActive });
    setImageFile(null);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    if (editingId) fd.append("isActive", String(form.isActive));
    if (imageFile) fd.append("image", imageFile);

    try {
      const url = editingId ? `${API_URL}/api/categories/${editingId}` : `${API_URL}/api/categories`;
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save category");
      setShowForm(false);
      loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete category");
      loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div>
                 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-ink">Categories</h2>
        <button onClick={openCreate} className="flex w-fit items-center gap-2 rounded-full bg-rust px-5 py-2 text-sm font-medium text-white hover:bg-rust-dark">
          <Plus size={16} /> New Category
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-brass/30 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-ink">{editingId ? "Edit Category" : "New Category"}</h3>
            <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-ink/50" /></button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-ink/70">Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none" rows={3} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="mt-1 w-full text-sm" />
          </div>

          {editingId && (
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active (visible to customers)
            </label>
          )}

          <button type="submit" disabled={saving} className="rounded-full bg-rust px-6 py-2 text-sm font-medium text-white hover:bg-rust-dark disabled:opacity-60">
            {saving ? "Saving..." : editingId ? "Update Category" : "Create Category"}
          </button>
        </form>
      )}

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-brass/30 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink/60">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-ink/60">No categories yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-brass/30 bg-cream/50 text-left text-ink/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b border-brass/10 last:border-0">
                  <td className="px-4 py-3 text-ink">{cat.name}</td>
                  <td className="px-4 py-3 text-ink/70">{cat.productCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${cat.isActive ? "bg-green-100 text-green-700" : "bg-ink/10 text-ink/50"}`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(cat)} className="mr-3 text-ink/60 hover:text-rust"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(cat._id)} className="text-ink/60 hover:text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}