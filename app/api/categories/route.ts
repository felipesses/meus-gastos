import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, users } from "@/lib/schema";
import { eq, and, asc } from "drizzle-orm";
import * as z from "zod";
import { auth } from "@clerk/nextjs/server";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters long.")
    .max(50, "Category name cannot exceed 50 characters."),
  isCustom: z.boolean().default(true).optional(),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validationResult = categorySchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "Validation error (POST category):",
        validationResult.error.errors
      );
      return new NextResponse(
        "Invalid data: " +
          validationResult.error.errors.map((e) => e.message).join(", "),
        { status: 400 }
      );
    }

    const { name, isCustom } = validationResult.data;

    // Ensure user exists in DB before creating category
    const [userInDb] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));
    if (!userInDb) {
      console.error(
        `User with clerkUserId ${clerkUserId} not found in the database.`
      );
      return new NextResponse(
        "User not synchronized in the database. Please try again or contact support.",
        { status: 404 }
      );
    }

    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.name, name),
          eq(categories.userId, userInDb.clerkUserId)
        )
      );

    if (existingCategory) {
      return new NextResponse(
        "Category with this name already exists for this user.",
        { status: 409 }
      );
    }

    const data = {
      userId: userInDb.clerkUserId,
      name: name,
      isCustom: isCustom ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [newCategory] = await db.insert(categories).values(data).returning();

    console.log("Category created:", newCategory);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [userInDb] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));
    if (!userInDb) {
      console.error(
        `User with clerkUserId ${clerkUserId} not found in the database.`
      );
      return new NextResponse("User not synchronized in the database.", {
        status: 404,
      });
    }

    const userCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userInDb.clerkUserId))
      .orderBy(asc(categories.name));

    return NextResponse.json(userCategories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validationResult = categorySchema.safeParse(body);

    if (!validationResult.success || !validationResult.data.id) {
      console.error(
        "Validation error (PUT category):",
        validationResult.error?.errors || "Category ID missing."
      );
      return new NextResponse("Invalid data or Category ID missing.", {
        status: 400,
      });
    }

    const { id: categoryId, name } = validationResult.data;

    // Ensure user exists in DB
    const [userInDb] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));
    if (!userInDb) {
      return new NextResponse("User not synchronized in the database.", {
        status: 404,
      });
    }

    console.log("category id -> ", categoryId);

    // Check if category exists and belongs to the user (or is a global category which cannot be updated by user)
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, parseInt(categoryId)),
          eq(categories.userId, userInDb.clerkUserId), // Must belong to the user
          eq(categories.isCustom, true) // Only allow updating custom categories
        )
      );

    console.log("existing", existingCategory);

    if (!existingCategory) {
      return new NextResponse(
        "Category not found, does not belong to the user, or is not a custom category.",
        { status: 404 }
      );
    }

    const [duplicateNameCategory] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.name, name),
          eq(categories.userId, userInDb.clerkUserId),
          eq(categories.isCustom, true),
          eq(categories.id, parseInt(categoryId))
            ? undefined
            : eq(categories.name, name)
        )
      );

    if (
      duplicateNameCategory &&
      duplicateNameCategory.id !== parseInt(categoryId)
    ) {
      return new NextResponse(
        "Another category with this name already exists for this user.",
        { status: 409 }
      );
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: name,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, parseInt(categoryId)))
      .returning();

    console.log("Category updated:", updatedCategory);
    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      console.error("Validation error (DELETE category): Category ID missing.");
      return new NextResponse("Category ID is required.", { status: 400 });
    }

    // Ensure user exists in DB
    const [userInDb] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));
    if (!userInDb) {
      return new NextResponse("User not synchronized in the database.", {
        status: 404,
      });
    }

    // Check if category exists, belongs to the user, and is a custom category
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, parseInt(categoryId)),
          eq(categories.userId, userInDb.clerkUserId), // Must belong to the user
          eq(categories.isCustom, true) // Only allow deleting custom categories
        )
      );

    if (!existingCategory) {
      return new NextResponse(
        "Category not found, does not belong to the user, or is not a custom category.",
        { status: 404 }
      );
    }

    // Delete the category
    await db.delete(categories).where(eq(categories.id, parseInt(categoryId)));

    console.log(`Category with ID ${categoryId} deleted.`);
    return new NextResponse("Category deleted successfully.", { status: 200 });
  } catch (error) {
    console.error("Error deleting category:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
