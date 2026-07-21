"use client"
import { readProductById, updateProduct } from '@/app/actions'
import ProductImage from '@/app/components/ProductImage'
import Wrapper from '@/app/components/Wrapper'
import { FormDataType, Product } from '@/type'
import { useUser } from '@clerk/nextjs'
import { FileImage } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const Page = ({ params }: { params: Promise<{ productId: string }> }) => {

    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string
    const [product, setProduct] = useState<Product | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [formData, setFormData] = useState<FormDataType>({
        id: "",
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        categoryName: ""
    })
    const router = useRouter()

    const fetchProduct = async () => {
        try {
            const { productId } = await params
            if (email) {
                const fetchedProduct = await readProductById(productId, email)
                if (fetchedProduct) {
                    setProduct(fetchedProduct)
                    setFormData({
                        id: fetchedProduct.id,
                        name: fetchedProduct.name,
                        description: fetchedProduct.description,
                        price: fetchedProduct.price,
                        imageUrl: fetchedProduct.imageUrl,
                        categoryName: fetchedProduct.categoryName
                    })
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchProduct()
    }, [email])


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        setFile(selectedFile)
        if (selectedFile) {
            setPreviewUrl(URL.createObjectURL(selectedFile))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        let imageUrl = formData?.imageUrl

        e.preventDefault()
        try {
            if (file) {
                const resDelete = await fetch("/api/upload", {
                    method: "DELETE",
                    body: JSON.stringify({ path: formData.imageUrl }),
                    headers: { 'Content-Type': 'application/json' }
                })
                const dataDelete = await resDelete.json()
                if (!dataDelete.success) {
                    throw new Error("Erreur lors de la suppression de l’image.")
                }

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

                imageUrl = data.path
                formData.imageUrl = imageUrl

                await updateProduct(formData, email)
                toast.success("Produit mis à jour avec succès !")
                router.push("/products")
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message)
        }
    }

    return (
        <Wrapper>
            <div className='flex justify-center items-center w-full min-h-[80vh] py-8'>
                {product ? (
                    <div className='bg-base-100 shadow-xl rounded-3xl p-6 md:p-10 w-full max-w-5xl'>
                        
                        {/* En-tête */}
                        <div className='mb-8'>
                            <h1 className='text-3xl font-extrabold mb-2'>
                                Mise à jour du produit
                            </h1>
                            <p className='text-base-content/60 text-sm'>
                                Modifiez les informations ci-dessous pour mettre à jour votre produit.
                            </p>
                        </div>

                        <div className='flex flex-col lg:flex-row gap-10'>
                            
                            {/* Colonne Formulaire */}
                            <form className='space-y-5 flex-1' onSubmit={handleSubmit}>
                                
                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text font-semibold">Nom du produit</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Nom"
                                        className='input input-bordered w-full focus:input-primary'
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text font-semibold">Description</span></label>
                                    <textarea
                                        name="description"
                                        placeholder="Description"
                                        className='textarea textarea-bordered w-full h-28 focus:textarea-primary'
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className="form-control w-full">
                                        <label className="label"><span className="label-text font-semibold">Catégorie</span></label>
                                        <input
                                            type="text"
                                            name="categoryName"
                                            className='input input-bordered w-full bg-base-200 text-base-content/60 cursor-not-allowed'
                                            value={formData.categoryName}
                                            onChange={handleInputChange}
                                            disabled
                                        />
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label"><span className="label-text font-semibold">Prix Unitaire (€)</span></label>
                                        <input
                                            type="number"
                                            name="price"
                                            placeholder="0.00"
                                            className='input input-bordered w-full focus:input-primary'
                                            value={formData.price}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-control w-full pt-2">
                                    <label className="label"><span className="label-text font-semibold">Changer l'image</span></label>
                                    <input
                                        type="file"
                                        accept='image/*'
                                        className='file-input file-input-bordered file-input-primary w-full'
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <button type='submit' className='btn btn-primary w-full mt-6 shadow-sm text-lg'>
                                    Enregistrer les modifications
                                </button>
                            </form>

                            {/* Colonne Aperçu des images */}
                            <div className='flex flex-col gap-6 lg:w-[320px]'>
                                
                                {/* Image actuelle */}
                                <div className='hidden md:flex flex-col'>
                                    <label className="label"><span className="label-text font-semibold">Image actuelle</span></label>
                                    <div className='w-full border-2 border-base-200 bg-base-200/30 h-[220px] p-4 flex justify-center items-center rounded-3xl'>
                                        {formData.imageUrl && formData.imageUrl !== "" ? (
                                            <ProductImage
                                                src={formData.imageUrl}
                                                alt={product.name}
                                                heightClass='h-40'
                                                widthClass='w-40 object-contain rounded-xl shadow-sm'
                                            />
                                        ) : (
                                            <FileImage strokeWidth={1.5} className='h-12 w-12 text-base-content/30' />
                                        )}
                                    </div>
                                </div>

                                {/* Nouvel aperçu (si une image est sélectionnée) */}
                                <div className='flex flex-col'>
                                    <label className="label hidden md:flex"><span className="label-text font-semibold text-primary">Nouvel aperçu</span></label>
                                    <div className={`w-full border-2 border-dashed h-[220px] p-4 flex flex-col justify-center items-center rounded-3xl transition-all ${previewUrl ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-200/30'}`}>
                                        {previewUrl && previewUrl !== "" ? (
                                            <ProductImage
                                                src={previewUrl}
                                                alt="preview"
                                                heightClass='h-40'
                                                widthClass='w-40 object-contain rounded-xl shadow-md'
                                            />
                                        ) : (
                                            <div className='flex flex-col items-center text-base-content/40 wiggle-animation'>
                                                <FileImage strokeWidth={1.5} className='h-12 w-12 mb-3 text-primary/50' />
                                                <span className='text-sm text-center'>Aucun nouveau fichier</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='flex justify-center items-center w-full min-h-[50vh]'>
                        <span className="loading loading-spinner text-primary w-12 h-12"></span>
                    </div>
                )}
            </div>
        </Wrapper>
    )
}

export default Page