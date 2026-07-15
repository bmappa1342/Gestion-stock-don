"use client"
import { UserButton, useUser } from '@clerk/nextjs'
import { Icon, ListTree, Menu, PackagePlus, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { checkAndAddAssociation } from '../actions'

const NavBar = () => {
    const {user} = useUser()

    const pathname = usePathname()
    const [menuOpens, setMenuOpens] = useState(false)

    const navLink = [
        {href: "/categories" , label: "Categories", icon: ListTree}
    ]

    useEffect(()=>{
        if(user?.primaryEmailAddress?.emailAddress && user.fullName){
            checkAndAddAssociation(user?.primaryEmailAddress?.emailAddress , user.fullName)
        }
    }, [user])
    const renderLink = (baseClass : string) =>(
        <>
        {navLink.map(({href, label, icon: Icon}) =>{
            const isActive = pathname === href
            const activeClass = isActive ? 'btn-primary' : 'btn-ghost'
            return(
                <Link
                href={href}
                key={href}
                className={`${baseClass} ${activeClass} btn-sm flex gap-2 items-center`}
                >
                <Icon className='w-4 h-4'></Icon>
                {label}
                </Link>
            )

        })}
        </>
    )
  return (
    <div className='border-b border-base-300 px-5 md:px-[10%] py-5 relative'>
        <div className='flex justify-between items-center'>
        <div className='flex items-center'>
            <div className='p-2'>
                <PackagePlus className='w-6 h-6 text-primary'></PackagePlus>

            </div>
            <span className='font-bold text-xl'>
                DonSotck
            </span>

        </div>
        <button className='btn w-fit sm:hidden btn-sm' onClick={()=>setMenuOpens(!menuOpens)}>
            <Menu className='w-4 h-4'></Menu>
        </button>
        <div className='hidden space-x-2 sm:flex items-center'>
            {renderLink("btn")}
            <UserButton></UserButton>
        </div>
        </div>

        <div className={`absolute top-0 w-full bg-base-100 h-screen flex-col gap-2 p-4 transition-all duration-300 sm:hidden 
            z-50 ${menuOpens? "left-0": "-left-full"}`}>
                <div className='flex justify-between'>
                    <UserButton></UserButton>
                 <button className='btn w-fit sm:hidden btn-sm' onClick={()=>setMenuOpens(!menuOpens)}>
                 <X className='w-4 h-4'></X>
                </button>
                </div>
 {renderLink("btn")}
        </div>
       </div>
  )
}

export default NavBar