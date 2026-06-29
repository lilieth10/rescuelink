-- CreateEnum
CREATE TYPE "EmergencyType" AS ENUM ('EARTHQUAKE', 'HURRICANE', 'FLOOD', 'LANDSLIDE', 'TSUNAMI', 'WILDFIRE', 'OTHER');

-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('ACTIVE', 'RECOVERING', 'CLOSED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'VOLUNTEER', 'RESCUER', 'HOSPITAL', 'SHELTER', 'NGO', 'ADMIN');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MissingPersonStatus" AS ENUM ('SEARCHING', 'POSSIBLE_MATCH', 'FOUND', 'REUNITED');

-- CreateEnum
CREATE TYPE "PhysicalState" AS ENUM ('STABLE', 'INJURED', 'CRITICAL', 'DECEASED');

-- CreateEnum
CREATE TYPE "EmotionalState" AS ENUM ('CALM', 'DISTRESSED', 'TRAUMATIZED', 'UNRESPONSIVE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('WATER', 'FOOD', 'MEDICINE', 'MILK', 'DIAPERS', 'ELECTRICITY', 'INTERNET', 'BATHROOMS', 'OTHER');

-- CreateEnum
CREATE TYPE "ResourcePriority" AS ENUM ('CRITICAL', 'URGENT', 'LOW_STOCK', 'OK');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('GOVERNMENT', 'RED_CROSS', 'NGO', 'HOSPITAL', 'CIVIL_PROTECTION', 'OTHER');

-- CreateEnum
CREATE TYPE "SyncOperation" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SYNCED', 'FAILED');

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(3) NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipalities" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "municipalityId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergencies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "type" "EmergencyType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "EmergencyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CITIZEN',
    "organizationId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missing_persons" (
    "id" TEXT NOT NULL,
    "emergencyId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "sex" "Sex" NOT NULL DEFAULT 'UNKNOWN',
    "nationality" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastKnownLocation" TEXT NOT NULL,
    "lastSeenLatitude" DOUBLE PRECISION,
    "lastSeenLongitude" DOUBLE PRECISION,
    "lastSeenAt" TIMESTAMP(3),
    "physicalDescription" TEXT,
    "clothing" TEXT,
    "medicalConditions" TEXT,
    "familyContact" TEXT,
    "status" "MissingPersonStatus" NOT NULL DEFAULT 'SEARCHING',
    "reportedById" TEXT,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missing_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "found_persons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "emergencyId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "approximateAge" INTEGER,
    "sex" "Sex" NOT NULL DEFAULT 'UNKNOWN',
    "physicalState" "PhysicalState" NOT NULL DEFAULT 'STABLE',
    "emotionalState" "EmotionalState" NOT NULL DEFAULT 'UNKNOWN',
    "canSpeak" BOOLEAN NOT NULL DEFAULT true,
    "canWalk" BOOLEAN NOT NULL DEFAULT true,
    "foundLocation" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "hospitalId" TEXT,
    "shelterId" TEXT,
    "notes" TEXT,
    "registeredById" TEXT,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "found_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protected_children" (
    "id" TEXT NOT NULL,
    "internalCode" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "emergencyId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "age" INTEGER,
    "name" TEXT,
    "foundLocation" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "medicalState" TEXT,
    "emotionalState" "EmotionalState" NOT NULL DEFAULT 'UNKNOWN',
    "temporaryGuardian" TEXT,
    "responsibleOrgId" TEXT NOT NULL,
    "foundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protected_children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelters" (
    "id" TEXT NOT NULL,
    "emergencyId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "hasWater" BOOLEAN NOT NULL DEFAULT false,
    "hasFood" BOOLEAN NOT NULL DEFAULT false,
    "hasMedicine" BOOLEAN NOT NULL DEFAULT false,
    "hasMilk" BOOLEAN NOT NULL DEFAULT false,
    "hasDiapers" BOOLEAN NOT NULL DEFAULT false,
    "hasElectricity" BOOLEAN NOT NULL DEFAULT false,
    "hasInternet" BOOLEAN NOT NULL DEFAULT false,
    "hasBathrooms" BOOLEAN NOT NULL DEFAULT false,
    "allowsPets" BOOLEAN NOT NULL DEFAULT false,
    "isAccessible" BOOLEAN NOT NULL DEFAULT false,
    "urgentNeeds" TEXT,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shelters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelter_resources" (
    "id" TEXT NOT NULL,
    "shelterId" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "priority" "ResourcePriority" NOT NULL DEFAULT 'OK',
    "quantity" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shelter_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" TEXT NOT NULL,
    "emergencyId" TEXT,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_queue" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "operation" "SyncOperation" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "sync_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "regions_countryId_code_key" ON "regions"("countryId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "municipalities_regionId_code_key" ON "municipalities"("regionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "missing_persons_emergencyId_status_idx" ON "missing_persons"("emergencyId", "status");

-- CreateIndex
CREATE INDEX "missing_persons_clientId_idx" ON "missing_persons"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "found_persons_code_key" ON "found_persons"("code");

-- CreateIndex
CREATE INDEX "found_persons_emergencyId_idx" ON "found_persons"("emergencyId");

-- CreateIndex
CREATE INDEX "found_persons_code_idx" ON "found_persons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "protected_children_internalCode_key" ON "protected_children"("internalCode");

-- CreateIndex
CREATE UNIQUE INDEX "protected_children_qrCode_key" ON "protected_children"("qrCode");

-- CreateIndex
CREATE INDEX "protected_children_emergencyId_idx" ON "protected_children"("emergencyId");

-- CreateIndex
CREATE INDEX "shelters_emergencyId_idx" ON "shelters"("emergencyId");

-- CreateIndex
CREATE UNIQUE INDEX "shelter_resources_shelterId_type_key" ON "shelter_resources"("shelterId", "type");

-- CreateIndex
CREATE INDEX "sync_queue_clientId_status_idx" ON "sync_queue"("clientId", "status");

-- CreateIndex
CREATE INDEX "sync_queue_status_createdAt_idx" ON "sync_queue"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "municipalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergencies" ADD CONSTRAINT "emergencies_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_persons" ADD CONSTRAINT "missing_persons_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "emergencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_persons" ADD CONSTRAINT "missing_persons_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_persons" ADD CONSTRAINT "found_persons_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "emergencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_persons" ADD CONSTRAINT "found_persons_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_persons" ADD CONSTRAINT "found_persons_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "shelters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_persons" ADD CONSTRAINT "found_persons_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protected_children" ADD CONSTRAINT "protected_children_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "emergencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protected_children" ADD CONSTRAINT "protected_children_responsibleOrgId_fkey" FOREIGN KEY ("responsibleOrgId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelters" ADD CONSTRAINT "shelters_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "emergencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelters" ADD CONSTRAINT "shelters_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelter_resources" ADD CONSTRAINT "shelter_resources_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "shelters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitals" ADD CONSTRAINT "hospitals_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "emergencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitals" ADD CONSTRAINT "hospitals_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
