import conf from "@/conf";
import { PrismaClient } from "@/generated/prisma/client";
const prisma = new PrismaClient({ adapter: conf.PRISMA_ADAPTER });

export default prisma;