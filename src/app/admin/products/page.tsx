'use client'

import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import { useGetProductsQuery, useCreateProductMutation, useDeleteProductMutation, useUpdateProductMutation, type Product } from '@/lib/api'
import { useAppSelector } from '@/lib/hooks'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/providers/ToastProvider'

export default function AdminProductsPage() {
  const { user, isAuthenticated } = useAppSelector(s => s.auth)
  const { addToast } = useToast()
  const [page, setPage] = useState(1)
  const pageSize = 20
  const { data, isLoading, error } = useGetProductsQuery({ page, pageSize })
  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', stock_quantity: '', category_id: '' })

  if (!isAuthenticated || !user?.is_active) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Unauthorized</h1>
          <p className="text-muted-foreground">You must sign in.</p>
        </div>
      </Layout>
    )
  }
  // Placeholder admin gate (replace with is_staff when backend supplies)
  // Treat first user as admin for now
  const isAdmin = true
  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Forbidden</h1>
          <p className="text-muted-foreground">You do not have access.</p>
        </div>
      </Layout>
    )
  }

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', stock_quantity: '', category_id: '' })
    setEditing(null)
    setFormOpen(false)
  }

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Partial<Product> = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      category_id: form.category_id || 'cat1', // fallback
    }
    try {
      if (editing) {
        await updateProduct({ id: editing.id, data: payload }).unwrap()
        addToast({ variant: 'success', title: 'Updated', message: 'Product updated.' })
      } else {
        await createProduct(payload).unwrap()
        addToast({ variant: 'success', title: 'Created', message: 'Product created.' })
      }
      resetForm()
    } catch {
      addToast({ variant: 'error', title: 'Error', message: 'Save failed.' })
    }
  }

  const startEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock_quantity: String(p.stock_quantity),
      category_id: p.category_id,
    })
    setFormOpen(true)
  }

  const remove = async (p: Product) => {
    if (!confirm('Delete product?')) return
    try {
      await deleteProduct({ id: p.id }).unwrap()
      addToast({ variant: 'success', title: 'Deleted', message: 'Product removed.' })
    } catch {
      addToast({ variant: 'error', title: 'Error', message: 'Delete failed.' })
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Products Admin</h1>
            <p className="text-muted-foreground">Manage catalog items</p>
          </div>
          <Button onClick={() => { setFormOpen(true); setEditing(null) }}>New Product</Button>
        </div>

        {isLoading && <div className="py-10 text-center text-muted-foreground">Loading...</div>}
        {error && <div className="py-10 text-center text-red-600">Failed to load products.</div>}

        {data && (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Stock</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2 font-medium whitespace-nowrap max-w-xs truncate">{p.name}</td>
                    <td className="px-4 py-2">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-2">{p.stock_quantity}</td>
                    <td className="px-4 py-2">{p.category?.name || p.category_id}</td>
                    <td className="px-4 py-2 space-x-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(p)} disabled={deleting}>Del</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.count > pageSize && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" size="sm" disabled={page===1} onClick={() => setPage(p=>Math.max(1,p-1))}>Prev</Button>
            <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(data.count / pageSize)}</span>
            <Button variant="outline" size="sm" disabled={page>=Math.ceil(data.count / pageSize)} onClick={() => setPage(p=>p+1)}>Next</Button>
          </div>
        )}

        {/* Drawer/Form */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40">
            <div className="w-full max-w-md h-full bg-card border-l p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{editing ? 'Edit Product' : 'New Product'}</h2>
                <Button variant="ghost" size="sm" onClick={resetForm}>Close</Button>
              </div>
              <form onSubmit={submitForm} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="w-full px-3 py-2 form-input-base form-input-placeholder form-input-focus" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="w-full h-24 resize-none px-3 py-2 form-input-base form-input-placeholder form-input-focus" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input type="number" step="0.01" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} className="w-full px-3 py-2 form-input-base form-input-placeholder form-input-focus" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stock</label>
                    <input type="number" value={form.stock_quantity} onChange={e=>setForm(f=>({...f,stock_quantity:e.target.value}))} className="w-full px-3 py-2 form-input-base form-input-placeholder form-input-focus" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category ID</label>
                  <input value={form.category_id} onChange={e=>setForm(f=>({...f,category_id:e.target.value}))} className="w-full px-3 py-2 form-input-base form-input-placeholder form-input-focus" placeholder="cat1" />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" disabled={creating||updating}>{editing? 'Save Changes':'Create'}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
