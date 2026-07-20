"use client"
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import CategoryModal from '../components/CategoryModal'
import { useUser } from '@clerk/nextjs'
import { createCategory, deleteCategory, readCategories, updateCategory } from '../actions'
import { toast } from 'react-toastify'
import { Category } from '@prisma/client'
import EmptyState from '../components/EmptyState'
import { Pencil, Trash, Plus } from 'lucide-react'

const Page = () => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const loadCategories = async () => {
    if (email) {
      const data = await readCategories(email)
      if (data)
        setCategories(data)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [email])

  const openCreateModal = () => {
    setName("");
    setDescription("");
    setEditMode(false);
    (document.getElementById("category_modal") as HTMLDialogElement)?.showModal()
  }

  const closeModal = () => {
    setName("");
    setDescription("");
    setEditMode(false);
    (document.getElementById("category_modal") as HTMLDialogElement)?.close()
  }

  const handleCreateCategory = async () => {
    setLoading(true)
    if (email) {
      await createCategory(name, email, description)
    }
    await loadCategories()
    closeModal()
    setLoading(false)
    toast.success("Category create successful.")
  }

  const handleUpdateCategory = async () => {
    if (!editingCategoryId) return
    setLoading(true)
    if (email) {
      await updateCategory(editingCategoryId, email, name, description)
    }
    await loadCategories()
    closeModal()
    setLoading(false)
    toast.success("Category edit successful.")
  }

  const openEditModal = (category: Category) => {
    setName(category.name);
    setDescription(category.description || "");
    setEditMode(true);
    setEditingCategoryId(category.id);
    (document.getElementById("category_modal") as HTMLDialogElement)?.showModal()
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this category? All associated products will be deleted as well")
    if (!confirmDelete) return;
    await deleteCategory(categoryId, email);
    await loadCategories();
    toast.success("Category deleted successful.")
  }

  return (
    <Wrapper>
      <div className='w-full max-w-7xl mx-auto py-8'>
        
        {/* En-tête de la page */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
          <div>
            <h1 className='text-3xl font-extrabold mb-2'>Categories</h1>
            <p className='text-base-content/60 text-sm'>
              Manage your product categories and organize your store.
            </p>
          </div>
          <button 
            className='btn btn-primary shadow-sm'
            onClick={openCreateModal}
          >
            <Plus className='w-5 h-5 mr-1' />
            Add Category
          </button>
        </div>

        {/* Liste des catégories (Grille) */}
        {categories.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {categories.map((category) => (
              <div 
                key={category.id} 
                className='bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200 hover:shadow-md transition-all flex flex-col justify-between group'
              >
                <div className='mb-4'>
                  <h3 className='text-xl font-bold text-base-content mb-2 line-clamp-1'>
                    {category.name}
                  </h3>
                  <p className='text-sm text-base-content/70 line-clamp-3'>
                    {category.description || <span className="italic opacity-50">No description provided</span>}
                  </p>
                </div>
                
                {/* Actions (Boutons d'édition et suppression) */}
                <div className='flex justify-end gap-2 mt-4 pt-4 border-t border-base-200/50'>
                  <button 
                    className='btn btn-sm btn-ghost text-base-content/70 hover:text-primary hover:bg-primary/10' 
                    onClick={() => openEditModal(category)}
                    title="Edit category"
                  >
                    <Pencil className='w-4 h-4' />
                  </button>
                  <button 
                    className='btn btn-sm btn-ghost text-base-content/70 hover:text-error hover:bg-error/10' 
                    onClick={() => handleDeleteCategory(category.id)}
                    title="Delete category"
                  >
                    <Trash className='w-4 h-4' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='bg-base-100 rounded-3xl p-10 border border-base-200 shadow-sm'>
            <EmptyState
              message="No category found. Create your first one!"
              IconComponent='Group'
            />
          </div>
        )}
      </div>

      <CategoryModal
        name={name}
        description={description}
        loading={loading}
        onclose={closeModal}
        onChangeName={setName}
        onChangeDescription={setDescription}
        onSubmit={editMode ? handleUpdateCategory : handleCreateCategory}
        editMode={editMode}
      />
    </Wrapper>
  )
}

export default Page