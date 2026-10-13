-- CreateEnum
CREATE TYPE "Category" AS ENUM ('TOP', 'BOTTOM', 'DRESS', 'OUTERWEAR', 'SHOES', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "Style" AS ENUM ('CASUAL', 'SPORT', 'ELEGANT', 'STREETWEAR', 'COQUETTE');

-- CreateEnum
CREATE TYPE "Occasion" AS ENUM ('EVERYDAY', 'SCHOOL', 'DATE', 'PARTY', 'VACATION', 'WORK');

-- CreateEnum
CREATE TYPE "OutfitSource" AS ENUM ('MANUAL', 'TODAY', 'SURPRISE');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('JOINED', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mainStyle" "Style",
    "quizAnswers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "subtype" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "styles" "Style"[],
    "warmth" INTEGER NOT NULL,
    "waterproof" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WardrobeItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WardrobeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outfit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "occasion" "Occasion" NOT NULL DEFAULT 'EVERYDAY',
    "source" "OutfitSource" NOT NULL DEFAULT 'MANUAL',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Outfit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutfitItem" (
    "outfitId" TEXT NOT NULL,
    "wardrobeItemId" TEXT NOT NULL,

    CONSTRAINT "OutfitItem_pkey" PRIMARY KEY ("outfitId","wardrobeItemId")
);

-- CreateTable
CREATE TABLE "WearLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outfitId" TEXT NOT NULL,
    "wornOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WearLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChallenge" (
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'JOINED',
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserChallenge_pkey" PRIMARY KEY ("userId","challengeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "CatalogItem_category_idx" ON "CatalogItem"("category");

-- CreateIndex
CREATE UNIQUE INDEX "WardrobeItem_userId_catalogItemId_key" ON "WardrobeItem"("userId", "catalogItemId");

-- CreateIndex
CREATE INDEX "Outfit_userId_isFavorite_idx" ON "Outfit"("userId", "isFavorite");

-- CreateIndex
CREATE INDEX "WearLog_userId_wornOn_idx" ON "WearLog"("userId", "wornOn");

-- AddForeignKey
ALTER TABLE "WardrobeItem" ADD CONSTRAINT "WardrobeItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WardrobeItem" ADD CONSTRAINT "WardrobeItem_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outfit" ADD CONSTRAINT "Outfit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_wardrobeItemId_fkey" FOREIGN KEY ("wardrobeItemId") REFERENCES "WardrobeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WearLog" ADD CONSTRAINT "WearLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WearLog" ADD CONSTRAINT "WearLog_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenge" ADD CONSTRAINT "UserChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenge" ADD CONSTRAINT "UserChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
