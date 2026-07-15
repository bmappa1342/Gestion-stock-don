// app/actions.ts
"use server"

import { Category } from "@prisma/client"
import prisma from "./lib/prisma"

export async function checkAndAddAssociation(email: string, name: string) {
    if (!email) return
    try {
        const existingAssociation = await prisma.association.findUnique({
            where: { email }
        })
        if (!existingAssociation && name) {
            await prisma.association.create({
                data: { email, name }
            })
        }
    } catch (error) {
        console.error(error)
    }
}
export async function getAssociation(email: string) {
    if (!email) return
    try {
        const existingAssociation = await prisma.association.findUnique({
            where: {
                email
            }
        })
        return existingAssociation
    } catch (error) {
        console.error(error)
    }
}

export async function createCategory(
    name: string,
    email: string,
    description?: string
) {

    if (!name) return
    try {

        const association = await getAssociation(email)
        if (!association) {
            throw new Error("No association with this email address.");
        }
        await prisma.category.create({
            data: {
                name,
                description: description || "",
                associationId: association.id
            }
        })

    } catch (error) {
        console.error(error)
    }
}

export async function updateCategory(
    id: string,
    email: string,
    name: string,
    description?: string,
) {

    if (!id || !email || !name) {
        throw new Error("The id, association email, and category name are required for the update.")
    }

    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("No association found with this email.");
        }

        await prisma.category.update({
            where: {
                id: id,
                associationId: association.id
            },
            data: {
                name,
                description: description || "",
            }
        })

    } catch (error) {
        console.error(error)
    }
}

export async function deleteCategory(id: string, email: string) {
    if (!id || !email) {
        throw new Error("The id and association email are required.")
    }

    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("No association found with this email.");
        }

        await prisma.category.delete({
            where: {
                id: id,
                associationId: association.id
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function readCategories(email: string): Promise<Category[] | undefined> {
    if (!email) {
        throw new Error("The association email is required.")
    }

    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("No association found with this email.");
        }

        const categories = await prisma.category.findMany({
            where: {
                associationId: association.id
            }
        })
        return categories
    } catch (error) {
        console.error(error)
    }
}