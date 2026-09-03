"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Product, Category } from "@/types";

const emptyForm = {
  name: "", description: "", price: "", discountPrice: "",
  category: "", brand: "", stock: "", sku: "", isFeatured: false, isActive: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_URL}/api/products?all=true&limit=100`, { credentials: "include" }),
        fetch(`${API_URL}/api/categories?all=true`, { credentials: "include" }),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (!prodRes.ok) throw new Error(prodData.message || "Failed to load products");
      setProducts(prodData.products);
      setCategories(catData.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFiles(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditingId(p._id);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      discountPrice: p.discountPrice != null ? String(p.discountPrice) : "",
      category: p.category?._id || "", brand: p.brand || "", stock: String(p.stock),
      sku: p.sku || "", isFeatured: p.isFeatured, isActive: p.isActive,
    });
    setImageFiles(null);
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
    fd.append("price", form.price);
    fd.append("discountPrice", form.discountPrice);
    fd.append("category", form.category);
    fd.append("brand", form.brand);
    fd.append("stock", form.stock);
    fd.append("sku", form.sku);
    fd.append("isFeatured", String(form.isFeatured));
    if (editingId) fd.append("isActive", String(form.isActive));
    if (imageFiles) Array.from(imageFiles).forEach((file) => fd.append("images", file));

    try {
      const url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;
      const res = await fetch(url, { method: editingId ? "PUT" : "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save product");
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete product");
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-ink">Products</h2>
        <button onClick={openCreate} className="flex w-fit items-center gap-2 rounded-full bg-rust px-5 py-2 text-sm font-medium text-white hover:bg-rust-dark">
          <Plus size={16} /> New Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-brass/30 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-ink">{editingId ? "Edit Product" : "New Product"}</h3>
            <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-ink/50" /></button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink/70">Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70">Category</label>
              <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Description</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-ink/70">Price</label>
              <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="mt-1 w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70">Discount Price</label>
              <input type="number" step="0.01" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                className="mt-1 w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70">Stock</label>
              <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="mt-1 w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70">SKU</label>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="mt-1 w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Brand</label>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="mt-1 w-full rounded-lg border border-brass/30 px-3 py-2 text-sm focus:border-rust focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink/70">Images {editingId && "(adds to existing images)"}</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(e.target.files)} className="mt-1 w-full text-sm" />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              Featured
            </label>
            {editingId && (
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active (visible to customers)
              </label>
            )}
          </div>

          <button type="submit" disabled={saving} className="rounded-full bg-rust px-6 py-2 text-sm font-medium text-white hover:bg-rust-dark disabled:opacity-60">
            {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
          </button>
        </form>
      )}

            <div className="relative mt-6 overflow-hidden rounded-2xl border border-brass/30 bg-white">
        {loading ? (
          <p className="p-6 text-sm text-ink/60">Loading...</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-ink/60">No products yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-brass/30 bg-cream/50 text-left text-ink/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-brass/10 last:border-0">
                  <td className="px-4 py-3 text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-ink/70">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-ink/70">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-ink/70">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${p.isActive ? "bg-green-100 text-green-700" : "bg-ink/10 text-ink/50"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)} className="mr-3 text-ink/60 hover:text-rust"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(p._id)} className="text-ink/60 hover:text-red-600"><Trash2 size={16} /></button>
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