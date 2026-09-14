"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, Plus, X, FolderOpen, ImageIcon } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Category } from "@/types";
import { Spinner } from "@/components/ui/LoadingState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

interface AdminCategory extends Category {
  productCount?: number;
}

const emptyForm = {
  name: "",
  description: "",
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/categories?all=true`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load categories");
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(c: AdminCategory) {
    setEditingId(c._id);
    setForm({
      name: c.name,
      description: c.description || "",
      isActive: c.isActive,
    });
    setImageFile(null);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }

    setSaving(true);

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("isActive", String(form.isActive));
    if (imageFile) fd.append("image", imageFile);

    try {
      const url = editingId ? `${API_URL}/api/categories/${editingId}` : `${API_URL}/api/categories`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        body: fd,
      });
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
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete category");
      loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div>
      <AdminPageHeader
        icon={FolderOpen}
        title="Categories"
        description="Organize your product catalog"
      >
        <button
          onClick={openCreate}
          className="flex w-fit items-center gap-2 rounded-full bg-rust px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rust-dark"
        >
          <Plus size={16} /> New Category
        </button>
      </AdminPageHeader>

      {error && !showForm && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span>⚠️ {error}</span>
          <button
            onClick={loadCategories}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-brass/20 bg-white p-6 shadow-[0_1px_3px_rgba(43,36,32,0.06)]"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-ink">{editingId ? "Edit Category" : "New Category"}</h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={18} className="text-ink/50" />
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-ink/70">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">
              Image {editingId && "(leave empty to keep current image)"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active (visible to customers)
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-rust px-6 py-2 text-sm font-medium text-white hover:bg-rust-dark disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Update Category" : "Create Category"}
          </button>
        </form>
      )}

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-brass/20 bg-white shadow-[0_1px_3px_rgba(43,36,32,0.06)]">
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <Spinner />
          </div>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-ink/60">No categories yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-brass/20 bg-cream/50 text-left text-ink/60">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id} className="border-b border-brass/10 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream">
                          {c.image?.url ? (
                            <Image
                              src={c.image.url}
                              alt={c.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={16} className="text-ink/25" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{c.name}</p>
                          {c.description && (
                            <p className="truncate text-xs text-ink/45">{c.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink/70">{c.productCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          c.isActive ? "bg-green-100 text-green-700" : "bg-ink/10 text-ink/50"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(c)} className="mr-3 text-ink/60 hover:text-rust">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="text-ink/60 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
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