"use client"
import { UserButton, useUser } from '@clerk/nextjs'
import { ListTree, Menu, PackagePlus, ShoppingBasket, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { checkAndAddAssociation } from '../actions'

const NavBar = () => {
    const { user } = useUser()
    const pathname = usePathname()
    const [menuOpens, setMenuOpens] = useState(false)

    const navLink = [
        { href: "/categories", label: "Catégories", icon: ListTree },
        //{ href: "/new-product", label: "Nouveau produit", icon: PackagePlus },
        { href: "/products", label: "Mes Produits", icon: ShoppingBasket },
    ]

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress && user.fullName) {
            checkAndAddAssociation(user?.primaryEmailAddress?.emailAddress, user.fullName)
        }
    }, [user])

    // Fonction pour fermer le menu mobile après un clic
    const closeMenu = () => setMenuOpens(false)

    // Rendu des liens (utilisable pour desktop et mobile)
    const renderLinks = (isMobile: boolean = false) => (
        <>
            {navLink.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href
                const activeClass = isActive 
                    ? 'bg-primary text-primary-content hover:bg-primary/90 shadow-sm' 
                    : 'btn-ghost text-base-content/70 hover:bg-base-200 hover:text-base-content'

                return (
                    <Link
                        href={href}
                        key={href}
                        onClick={isMobile ? closeMenu : undefined}
                        className={`btn btn-sm rounded-xl flex gap-2 items-center justify-start ${activeClass} ${isMobile ? 'w-full btn-md text-base' : ''}`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-primary-content' : 'text-primary'}`} />
                        {label}
                    </Link>
                )
            })}
        </>
    )

    return (
        <header className='sticky top-0 z-50 w-full border-b border-base-200 bg-base-100/80 backdrop-blur-md shadow-sm'>
            <div className='max-w-7xl mx-auto px-5 lg:px-8 py-3 flex justify-between items-center'>
                
                {/* Logo */}
                <Link href="/" className='flex items-center gap-2 group transition-transform active:scale-95'>
                    <div className='bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors'>
                        <PackagePlus className='w-6 h-6 text-primary' />
                    </div>
                    <span className='font-extrabold text-xl tracking-tight'>
                        Don<span className="text-primary">Stock</span>
                    </span>
                </Link>

                {/* Bouton Menu Mobile */}
                <button 
                    className='btn btn-ghost btn-sm btn-circle sm:hidden' 
                    onClick={() => setMenuOpens(!menuOpens)}
                    aria-label="Menu"
                >
                    <Menu className='w-5 h-5 text-base-content/80' />
                </button>

                {/* Navigation Desktop */}
                <nav className='hidden sm:flex items-center gap-2'>
                    {renderLinks()}
                    <div className='pl-4 ml-4 border-l border-base-300'>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </nav>
            </div>

            {/* --- Menu Mobile (Drawer) --- */}
            
            {/* Overlay sombre en arrière-plan */}
            {menuOpens && (
                <div 
                    className="fixed inset-0 bg-black/40 z-40 sm:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeMenu}
                />
            )}

            {/* Panneau latéral */}
            <div className={`fixed top-0 bottom-0 left-0 w-3/4 max-w-sm bg-base-100 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out sm:hidden ${menuOpens ? "translate-x-0" : "-translate-x-full"}`}>
                
                {/* En-tête du menu mobile */}
                <div className='p-5 flex justify-between items-center border-b border-base-200'>
                    <div className='flex items-center gap-3'>
                        <UserButton afterSignOutUrl="/" />
                        <span className="font-semibold text-sm text-base-content/80">Mon Profil</span>
                    </div>
                    <button 
                        className='btn btn-ghost btn-sm btn-circle' 
                        onClick={closeMenu}
                    >
                        <X className='w-5 h-5' />
                    </button>
                </div>

                {/* Liens du menu mobile */}
                <nav className='p-5 flex flex-col gap-3 flex-1 overflow-y-auto'>
                    <div className='text-xs font-bold text-base-content/40 uppercase tracking-wider mb-2'>
                        Menu principal
                    </div>
                    {renderLinks(true)}
                </nav>
                
                {/* Pied de page du menu mobile */}
                <div className="p-5 border-t border-base-200 text-xs text-base-content/40 text-center">
                    DonStock © {new Date().getFullYear()}
                </div>
            </div>
        </header>
    )
}

export default NavBar