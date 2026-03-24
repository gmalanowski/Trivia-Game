import { PrismaPg } from "@prisma/adapter-pg";
import { type Prisma, PrismaClient } from "../src/generated/prisma/client.js";

// Przykladowe dane zeby sprawdzic czy dziala

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
	adapter,
});

const userData: Prisma.UserCreateInput[] = [
	{
		name: "Alice",
		email: "alice@prisma.io",
		posts: {
			create: [
				{
					title: "Join the Prisma Discord",
					content: "https://pris.ly/discord",
					published: true,
				},
				{
					title: "Prisma on YouTube",
					content: "https://pris.ly/youtube",
				},
			],
		},
	},
	{
		name: "Bob",
		email: "bob@prisma.io",
		posts: {
			create: [
				{
					title: "Follow Prisma on Twitter",
					content: "https://www.twitter.com/prisma",
					published: true,
				},
			],
		},
	},
];

export async function main() {
	for (const u of userData) {
		await prisma.user.create({ data: u });
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
