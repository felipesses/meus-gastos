import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db"; // Importa seu cliente Drizzle ORM
import { categories, users } from "@/lib/schema"; // Importa a tabela de usuários do seu esquema Drizzle
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Erro: Svix headers missing", { status: 400 });
  }

  const payload = await req.text();

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Erro: WEBHOOK_SECRET is not defined.");
    throw new Error("Please, add WEBHOOK_SECRET to the .env variable.");
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return new Response("Error verifying webhook", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook type: ${eventType} to user ID: ${id}`);

  try {
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      const fullName = [first_name, last_name].filter(Boolean).join(" ");

      const globalPredefinedCategories = [
        { name: "Salário" },
        { name: "Renda Extra" },
        { name: "Cartões" },
        { name: "Moradia" },
        { name: "Lazer" },
        { name: "Investimento" },
        { name: "Saúde" },
        { name: "Educação" },
      ];

      if (!email) {
        console.warn(
          `User ${id} created without email address. Ignoring DB Creation.`
        );
        return new Response("User created without email.", { status: 200 });
      }

      await db.insert(users).values({
        clerkUserId: id,
        email: email,
        name: fullName || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(categories).values(
        globalPredefinedCategories.map((cat) => ({
          name: cat.name,
          isCustom: false,
          userId: id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );

      console.log(`User ${id} created in DB.`);
    } else if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      const fullName = [first_name, last_name].filter(Boolean).join(" ");

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, id));

      if (!existingUser) {
        console.warn(
          `User ${id} updated in Clerk, but not found at DB. Trying to create.`
        );
        if (email) {
          await db.insert(users).values({
            clerkUserId: id,
            email: email,
            name: fullName || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          console.log(`User ${id} created after update event.`);
        } else {
          console.warn(`There is not email data for user ${id}.`);
        }
        return new Response(
          `User ${id} updated in Clerk, but not found at DB. Trying to create.`,
          { status: 200 }
        );
      }

      await db
        .update(users)
        .set({
          email: email || existingUser.email,
          name: fullName || existingUser.name,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId, id));

      console.log(`User ${id} updated.`);
    } else if (eventType === "user.deleted") {
      const { id } = evt.data;
      if (!id) {
        console.warn("Event user.deleted without user ID. Ignoring.");
        return new Response("Event user.deleted without user ID.", {
          status: 200,
        });
      }
      await db.delete(users).where(eq(users.clerkUserId, id));
      console.log(`User ${id} deleted.`);
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Internal server data", { status: 500 });
  }
}
