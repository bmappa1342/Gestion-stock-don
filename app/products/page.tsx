"use client"
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { Product } from '@/type'
import { deleteProduct, readProducts } from '../actions'
import EmptyState from '../components/EmptyState'
import ProductImage from '../components/ProductImage'
import Link from 'next/link'
import { Trash, Pencil, Plus } from 'lucide-react'
import { toast } from 'react-toastify'

const Page = () => {
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string
    const [products, setProducts] = useState<Product[]>([])

    const fetchProducts = async () => {
        try {
            if (email) {
                const products = await readProducts(email)
                if (products) {
                    setProducts(products)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (email)
            fetchProducts()
    }, [email])

    const handleDeleteProduct = async (product: Product) => {
        const confirmDelete = confirm("Voulez-vous vraiment supprimer ce produit ?")
        if (!confirmDelete) return;
        try {
            if (product.imageUrl) {
                const resDelete = await fetch("/api/upload", {
                    method: "DELETE",
                    body: JSON.stringify({ path: product.imageUrl }),
                    headers: { 'Content-Type': 'application/json' }
                })
                const dataDelete = await resDelete.json()
                if (!dataDelete.success) {
                    throw new Error("Erreur lors de la suppression de l’image.")
                } else {
                    if (email) {
                        await deleteProduct(product.id, email)
                        await fetchProducts()
                        toast.success("Produit supprimé avec succès")
                    }
                }
            }
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de la suppression.")
        }
    }

    return (
        <Wrapper>
            <div className='w-full max-w-7xl mx-auto py-8'>
                
                {/* En-tête de la page */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
                    <div>
                        <h1 className='text-3xl font-extrabold mb-2'>Mes Produits</h1>
                        <p className='text-base-content/60 text-sm'>
                            Consultez et gérez l'ensemble de votre catalogue de produits.
                        </p>
                    </div>
                    {/* Lien vers la page de création (ajuste le href selon ta route exacte) */}
                    <Link href="/new-product" className='btn btn-primary shadow-sm'>
                        <Plus className='w-5 h-5 mr-1' />
                        Nouveau Produit
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className='bg-base-100 rounded-3xl p-10 border border-base-200 shadow-sm'>
                        <EmptyState
                            message='Aucun produit disponible. Commencez par en ajouter un !'
                            IconComponent='PackageSearch'
                        />
                    </div>
                ) : (
                    <div className='bg-base-100 rounded-3xl shadow-sm border border-base-200 overflow-hidden'>
                        <div className='overflow-x-auto'>
                            <table className='table w-full'>
                                {/* En-tête du tableau */}
                                <thead className='bg-base-200/50 text-base-content/80'>
                                    <tr>
                                        <th className='w-12'>#</th>
                                        <th>Image</th>
                                        <th>Nom du produit</th>
                                        <th>Description</th>
                                        <th>Prix</th>
                                        <th>Quantité</th>
                                        <th>Catégorie</th>
                                        <th className='text-right'>Actions</th>
                                    </tr>
                                </thead>
                                
                                {/* Corps du tableau */}
                                <tbody>
                                    {products.map((product, index) => (
                                        <tr key={product.id} className='hover:bg-base-200/50 transition-colors group'>
                                            <th className='text-base-content/50 font-normal'>{index + 1}</th>
                                            
                                            <td>
                                                <div className='avatar'>
                                                    <div className="mask mask-squircle w-12 h-12 bg-base-200 flex items-center justify-center">
                                                        <ProductImage
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            heightClass='h-full'
                                                            widthClass='w-full object-cover'
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td className='font-bold text-base'>
                                                {product.name}
                                            </td>
                                            
                                            <td>
                                                <div className='max-w-[200px] truncate text-sm text-base-content/70' title={product.description}>
                                                    {product.description}
                                                </div>
                                            </td>
                                            
                                            <td className='font-extrabold text-primary text-lg'>
                                                {product.price} €
                                            </td>
                                            
                                            <td className='capitalize font-medium'>
                                                {product.quantity} <span className="text-base-content/60 text-sm">{product.unit}</span>
                                            </td>
                                            
                                            <td>
                                                <span className="badge badge-neutral badge-sm py-3 px-3">
                                                    {product.categoryName}
                                                </span>
                                            </td>
                                            
                                            {/* Colonne Actions */}
                                            <td>
                                                <div className='flex items-center justify-end gap-2'>
                                                    <Link 
                                                        href={`/update-product/${product.id}`} 
                                                        className='btn btn-sm btn-ghost text-base-content/70 hover:text-primary hover:bg-primary/10'
                                                        title="Modifier"
                                                    >
                                                        <Pencil className='w-4 h-4' />
                                                    </Link>
                                                    
                                                    <button 
                                                        onClick={() => handleDeleteProduct(product)}
                                                        className='btn btn-sm btn-ghost text-base-content/70 hover:text-error hover:bg-error/10'
                                                        title="Supprimer"
                                                    >
                                                        <Trash className='w-4 h-4' />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Wrapper>
    )
}

export default Page