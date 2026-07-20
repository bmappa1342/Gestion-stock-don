"use client"
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { Category } from '@prisma/client'
import { FormDataType } from '@/type'
import { createProduct, readCategories } from '../actions'
import { FileImage } from 'lucide-react'
import ProductImage from '../components/ProductImage'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const Page = () => {

  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    unit: "",
    imageUrl: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (email) {
          const data = await readCategories(email)
          if (data)
            setCategories(data)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories", error)
      }
    }
    fetchCategories()
  }, [email])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleSubmit = async () => {
    // Vérifie les champs du formulaire
    if (!formData.name || !formData.description || !formData.price || !formData.categoryId || !formData.unit) {
      toast.error("Veuillez remplir tous les champs du formulaire.")
      return
    }

    if (!file) {
      toast.error("Veuillez sélectionner une image.")
      return
    }

    try {
      const imageData = new FormData()
      imageData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: imageData
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error("Erreur lors de l’upload de l’image.")
      }

      // Ajout de l'image dans le formData
      formData.imageUrl = data.path

      // Création du produit
      await createProduct(formData, email)

      toast.success("Produit créé avec succès")
      router.push("/products")

    } catch (error) {
      console.log(error)
      toast.error("Il y a une erreur")
    }
  }

  return (
    <Wrapper>
      <div className='flex justify-center items-center w-full min-h-[80vh] py-8'>
        <div className='bg-base-100 shadow-xl rounded-3xl p-6 md:p-10 w-full max-w-5xl'>
          
          <div className='mb-8'>
            <h1 className='text-3xl font-extrabold mb-2'>
              Créer un produit
            </h1>
            <p className='text-base-content/60 text-sm'>
              Remplissez les informations ci-dessous pour ajouter un nouveau produit à votre catalogue.
            </p>
          </div>

          <section className='flex flex-col lg:flex-row gap-10'>
            {/* Colonne Formulaire */}
            <div className='space-y-5 flex-1'>
              
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-semibold">Nom du produit</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ex: Tomates fraîches"
                  className='input input-bordered w-full focus:input-primary'
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label"><span className="label-text font-semibold">Description</span></label>
                <textarea
                  name="description"
                  placeholder="Décrivez votre produit en quelques mots..."
                  className='textarea textarea-bordered w-full h-28 focus:textarea-primary'
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Grille pour Prix, Catégorie et Unité */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-semibold">Prix</span></label>
                  <input
                    type="number"
                    name="price"
                    placeholder="0.00"
                    className='input input-bordered w-full focus:input-primary'
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-semibold">Catégorie</span></label>
                  <select
                    className='select select-bordered w-full focus:select-primary'
                    value={formData.categoryId}
                    onChange={handleChange}
                    name='categoryId'
                  >
                    <option value="" disabled>Sélectionner...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control w-full md:col-span-2">
                  <label className="label"><span className="label-text font-semibold">Unité de mesure</span></label>
                  <select
                    className='select select-bordered w-full focus:select-primary'
                    value={formData.unit}
                    onChange={handleChange}
                    name='unit'
                  >
                    <option value="" disabled>Sélectionner l'unité...</option>
                    <option value="g">Gramme (g)</option>
                    <option value="kg">Kilogramme (kg)</option>
                    <option value="l">Litre (l)</option>
                    <option value="m">Mètre (m)</option>
                    <option value="cm">Centimètre (cm)</option>
                    <option value="h">Heure (h)</option>
                    <option value="pcs">Pièce(s) / Unité(s)</option>
                  </select>
                </div>
              </div>

              <div className="form-control w-full pt-2">
                <label className="label"><span className="label-text font-semibold">Image du produit</span></label>
                <input
                  type="file"
                  accept='image/*'
                  className='file-input file-input-bordered file-input-primary w-full'
                  onChange={handleFileChange}
                />
              </div>

              <button 
                onClick={handleSubmit} 
                className='btn btn-primary w-full mt-6 shadow-sm text-lg'
              >
                Créer le produit
              </button>
            </div>

            {/* Colonne Aperçu de l'image */}
            <div className='lg:w-[400px] flex flex-col'>
              <label className="label hidden lg:flex"><span className="label-text font-semibold">Aperçu visuel</span></label>
              <div className='flex-1 min-h-[300px] border-2 border-dashed border-base-300 bg-base-200/30 rounded-3xl flex flex-col justify-center items-center p-6 transition-all'>
                {previewUrl && previewUrl !== "" ? (
                  <div className='relative w-full h-full flex justify-center items-center'>
                    <ProductImage
                      src={previewUrl}
                      alt="preview"
                      heightClass='h-64'
                      widthClass='w-64 object-contain rounded-xl shadow-sm'
                    />
                  </div>
                ) : (
                  <div className='flex flex-col items-center text-base-content/40 wiggle-animation'>
                    <FileImage strokeWidth={1.5} className='h-16 w-16 mb-4 text-primary/50' />
                    <p className='text-sm text-center'>Aucune image sélectionnée</p>
                    <p className='text-xs text-center mt-1'>L'aperçu apparaîtra ici</p>
                  </div>
                )}
              </div>
            </div>

          </section>
        </div>
      </div>
    </Wrapper>
  )
}

export default Page