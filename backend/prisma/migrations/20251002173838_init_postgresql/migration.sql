-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EMPLEADO_PUBLICO', 'ADMINISTRADOR_GRUPO', 'MODERADOR_GRUPO', 'GESTOR_CONTENIDO', 'GESTOR_EMPRESAS', 'GESTOR_ADMINISTRACIONES', 'EMPRESA', 'ADMINISTRACION_PUBLICA');

-- CreateEnum
CREATE TYPE "AdministrationType" AS ENUM ('LOCAL', 'AUTONOMICA', 'CENTRAL');

-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_PERMISSIONS', 'VIEW_ADMIN_DASHBOARD', 'MANAGE_SYSTEM_CONFIG', 'CREATE_CONTENT', 'EDIT_CONTENT', 'DELETE_CONTENT', 'PUBLISH_CONTENT', 'MODERATE_CONTENT', 'PIN_CONTENT', 'CREATE_POST', 'EDIT_POST', 'DELETE_POST', 'MODERATE_POST', 'PIN_POST', 'CREATE_COMMENT', 'EDIT_COMMENT', 'DELETE_COMMENT', 'MODERATE_COMMENT', 'CREATE_GROUP', 'EDIT_GROUP', 'DELETE_GROUP', 'MANAGE_GROUP_MEMBERS', 'MODERATE_GROUP_CONTENT', 'PIN_GROUP_CONTENT', 'CREATE_FORUM', 'EDIT_FORUM', 'DELETE_FORUM', 'CREATE_FORUM_TOPIC', 'EDIT_FORUM_TOPIC', 'DELETE_FORUM_TOPIC', 'MODERATE_FORUM', 'PIN_FORUM_TOPIC', 'LOCK_FORUM_TOPIC', 'CREATE_ANNOUNCEMENT', 'EDIT_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT', 'PUBLISH_ANNOUNCEMENT', 'PIN_ANNOUNCEMENT', 'MANAGE_COMPANIES', 'CREATE_COMPANY_PROFILE', 'EDIT_COMPANY_PROFILE', 'MANAGE_COMPANY_SERVICES', 'MANAGE_PUBLIC_ADMINISTRATIONS', 'CREATE_ADMIN_PROFILE', 'EDIT_ADMIN_PROFILE', 'VIEW_REPORTS', 'HANDLE_REPORTS', 'VIEW_MODERATION_STATS', 'BULK_MODERATE', 'IMPERSONATE_USER', 'VIEW_AUDIT_LOGS', 'MANAGE_TRANSLATIONS', 'MANAGE_COMMUNITIES');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'EMAIL', 'URL', 'SELECT', 'MULTISELECT', 'BOOLEAN', 'TEXTAREA', 'FILE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "primaryRole" "UserRole" NOT NULL DEFAULT 'EMPLEADO_PUBLICO',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "refreshToken" TEXT,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAdditionalRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "groupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "UserAdditionalRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "PermissionType" NOT NULL,
    "resource" TEXT,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nick" TEXT,
    "dni" TEXT,
    "jobTitle" TEXT,
    "department" TEXT,
    "organization" TEXT,
    "community" TEXT NOT NULL,
    "administrationType" "AdministrationType" NOT NULL,
    "province" TEXT,
    "city" TEXT,
    "avatar" TEXT,
    "generalInfo" TEXT,
    "skills" TEXT,
    "workExperience" TEXT,
    "socialNetworks" TEXT,
    "bio" TEXT,
    "privacySettings" TEXT,
    "canBeGroupAdmin" BOOLEAN NOT NULL DEFAULT false,
    "canBeGroupModerator" BOOLEAN NOT NULL DEFAULT false,
    "canBeContentManager" BOOLEAN NOT NULL DEFAULT false,
    "customFields" JSONB,
    "customFieldsPrivacy" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sector" TEXT NOT NULL,
    "size" TEXT NOT NULL DEFAULT 'pequeña',
    "cif" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "socialMedia" TEXT,
    "logo" TEXT,
    "certifications" TEXT,
    "foundedYear" INTEGER,
    "employeeCount" INTEGER,
    "annualRevenue" DOUBLE PRECISION,
    "configuration" TEXT,
    "customFields" JSONB,
    "customFieldsPrivacy" JSONB,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicAdministration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "administrationType" "AdministrationType" NOT NULL,
    "community" TEXT,
    "province" TEXT,
    "city" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "citizenServices" TEXT,
    "departments" TEXT,
    "publicHours" TEXT,
    "contactInfo" TEXT,
    "customFields" JSONB,
    "customFieldsPrivacy" JSONB,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicAdministration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContenidoMaestro" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tituloOriginal" TEXT NOT NULL,
    "contenidoOriginal" TEXT NOT NULL,
    "extracto" TEXT,
    "idiomaOrigen" TEXT NOT NULL DEFAULT 'es',
    "autorId" TEXT NOT NULL,
    "autorNombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "metadatos" TEXT,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContenidoMaestro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Traduccion" (
    "id" TEXT NOT NULL,
    "contenidoId" TEXT NOT NULL,
    "idiomaDestino" TEXT NOT NULL,
    "tituloTraducido" TEXT NOT NULL,
    "contenidoTraducido" TEXT NOT NULL,
    "extractoTraducido" TEXT,
    "metadatosTraducidos" TEXT,
    "estadoTraduccion" TEXT NOT NULL DEFAULT 'automatica',
    "traducidoPor" TEXT NOT NULL,
    "confianzaTraduccion" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "revisadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Traduccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicacionComunidad" (
    "id" TEXT NOT NULL,
    "contenidoId" TEXT NOT NULL,
    "traduccionId" TEXT,
    "comunidadSlug" TEXT NOT NULL,
    "idioma" TEXT NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "fechaPublicacion" TIMESTAMP(3),
    "slug" TEXT NOT NULL,
    "urlPublica" TEXT,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicacionComunidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComunidadConfig" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreLocal" TEXT,
    "idiomas" TEXT NOT NULL,
    "idiomaDefault" TEXT NOT NULL DEFAULT 'es',
    "dominioBase" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "configuracion" TEXT,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComunidadConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT,
    "type" TEXT NOT NULL DEFAULT 'texto',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "reported" BOOLEAN NOT NULL DEFAULT false,
    "comunidadSlug" TEXT,
    "idioma" TEXT NOT NULL DEFAULT 'es',
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "sharesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '👍',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostReport" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "configuration" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "creatorId" TEXT NOT NULL,
    "coverImage" TEXT,
    "comunidadSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'active',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupPost" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'texto',
    "tags" TEXT,
    "multimedia" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forum" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'publico',
    "order" INTEGER NOT NULL DEFAULT 0,
    "configuration" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "creatorId" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "comunidadSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumTopic" (
    "id" TEXT NOT NULL,
    "forumId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'discusion',
    "tags" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumReply" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "replyToId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'media',
    "scope" TEXT NOT NULL DEFAULT 'global',
    "targets" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "configuration" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "comunidadSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementRead" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumModerator" (
    "id" TEXT NOT NULL,
    "forumId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'moderador',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumModerator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyService" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "companyProfileId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "features" TEXT,
    "pricing" TEXT,
    "duration" TEXT,
    "modality" TEXT NOT NULL DEFAULT 'presencial',
    "availability" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "comunidadSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyProduct" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "companyProfileId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "features" TEXT,
    "images" TEXT,
    "stock" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "comunidadSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAdvisory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "companyProfileId" TEXT,
    "serviceId" TEXT,
    "clientId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'media',
    "estimatedBudget" DOUBLE PRECISION,
    "deadline" TIMESTAMP(3),
    "contact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendiente',
    "response" TEXT,
    "finalBudget" DOUBLE PRECISION,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseDate" TIMESTAMP(3),
    "comunidadSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAdvisory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyRating" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "serviceId" TEXT,
    "advisoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterestLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "comunidadSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterestLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InappropriateWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InappropriateWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostCommentReport" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostCommentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupPostReport" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupPostReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumTopicReport" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumTopicReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumReplyReport" (
    "id" TEXT NOT NULL,
    "replyId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumReplyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementReport" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnouncementReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomField" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fieldType" "CustomFieldType" NOT NULL,
    "userType" "UserRole" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "isPublicByDefault" BOOLEAN NOT NULL DEFAULT false,
    "allowUserPrivacy" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "validation" JSONB,
    "placeholder" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContentToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContentToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_primaryRole_idx" ON "User"("primaryRole");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "UserAdditionalRole_userId_idx" ON "UserAdditionalRole"("userId");

-- CreateIndex
CREATE INDEX "UserAdditionalRole_role_idx" ON "UserAdditionalRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserAdditionalRole_userId_role_groupId_key" ON "UserAdditionalRole"("userId", "role", "groupId");

-- CreateIndex
CREATE INDEX "UserPermission_userId_idx" ON "UserPermission"("userId");

-- CreateIndex
CREATE INDEX "UserPermission_permission_idx" ON "UserPermission"("permission");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_permission_resource_key" ON "UserPermission"("userId", "permission", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_dni_key" ON "Employee"("dni");

-- CreateIndex
CREATE INDEX "Employee_community_idx" ON "Employee"("community");

-- CreateIndex
CREATE INDEX "Employee_administrationType_idx" ON "Employee"("administrationType");

-- CreateIndex
CREATE UNIQUE INDEX "Company_userId_key" ON "Company"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_cif_key" ON "Company"("cif");

-- CreateIndex
CREATE INDEX "Company_sector_idx" ON "Company"("sector");

-- CreateIndex
CREATE INDEX "Company_size_idx" ON "Company"("size");

-- CreateIndex
CREATE INDEX "Company_isVerified_idx" ON "Company"("isVerified");

-- CreateIndex
CREATE INDEX "Company_isActive_idx" ON "Company"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PublicAdministration_userId_key" ON "PublicAdministration"("userId");

-- CreateIndex
CREATE INDEX "PublicAdministration_administrationType_idx" ON "PublicAdministration"("administrationType");

-- CreateIndex
CREATE INDEX "PublicAdministration_community_idx" ON "PublicAdministration"("community");

-- CreateIndex
CREATE INDEX "PublicAdministration_isVerified_idx" ON "PublicAdministration"("isVerified");

-- CreateIndex
CREATE INDEX "PublicAdministration_isActive_idx" ON "PublicAdministration"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "ContenidoMaestro_estado_idx" ON "ContenidoMaestro"("estado");

-- CreateIndex
CREATE INDEX "ContenidoMaestro_tipo_idx" ON "ContenidoMaestro"("tipo");

-- CreateIndex
CREATE INDEX "ContenidoMaestro_autorId_idx" ON "ContenidoMaestro"("autorId");

-- CreateIndex
CREATE INDEX "ContenidoMaestro_categoryId_idx" ON "ContenidoMaestro"("categoryId");

-- CreateIndex
CREATE INDEX "Traduccion_contenidoId_idx" ON "Traduccion"("contenidoId");

-- CreateIndex
CREATE INDEX "Traduccion_estadoTraduccion_idx" ON "Traduccion"("estadoTraduccion");

-- CreateIndex
CREATE UNIQUE INDEX "Traduccion_contenidoId_idiomaDestino_key" ON "Traduccion"("contenidoId", "idiomaDestino");

-- CreateIndex
CREATE INDEX "PublicacionComunidad_comunidadSlug_publicado_idx" ON "PublicacionComunidad"("comunidadSlug", "publicado");

-- CreateIndex
CREATE INDEX "PublicacionComunidad_contenidoId_idx" ON "PublicacionComunidad"("contenidoId");

-- CreateIndex
CREATE INDEX "PublicacionComunidad_slug_idx" ON "PublicacionComunidad"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PublicacionComunidad_contenidoId_comunidadSlug_idioma_key" ON "PublicacionComunidad"("contenidoId", "comunidadSlug", "idioma");

-- CreateIndex
CREATE UNIQUE INDEX "ComunidadConfig_slug_key" ON "ComunidadConfig"("slug");

-- CreateIndex
CREATE INDEX "ComunidadConfig_slug_idx" ON "ComunidadConfig"("slug");

-- CreateIndex
CREATE INDEX "ComunidadConfig_activa_idx" ON "ComunidadConfig"("activa");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_comunidadSlug_idx" ON "Post"("comunidadSlug");

-- CreateIndex
CREATE INDEX "Post_isPinned_idx" ON "Post"("isPinned");

-- CreateIndex
CREATE INDEX "Post_reported_idx" ON "Post"("reported");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON "PostLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "PostComment_postId_idx" ON "PostComment"("postId");

-- CreateIndex
CREATE INDEX "PostReport_postId_idx" ON "PostReport"("postId");

-- CreateIndex
CREATE INDEX "PostReport_reportedBy_idx" ON "PostReport"("reportedBy");

-- CreateIndex
CREATE INDEX "PostReport_status_idx" ON "PostReport"("status");

-- CreateIndex
CREATE INDEX "Group_type_idx" ON "Group"("type");

-- CreateIndex
CREATE INDEX "Group_comunidadSlug_idx" ON "Group"("comunidadSlug");

-- CreateIndex
CREATE INDEX "Group_category_idx" ON "Group"("category");

-- CreateIndex
CREATE INDEX "Group_isActive_idx" ON "Group"("isActive");

-- CreateIndex
CREATE INDEX "GroupMember_status_idx" ON "GroupMember"("status");

-- CreateIndex
CREATE INDEX "GroupMember_role_idx" ON "GroupMember"("role");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");

-- CreateIndex
CREATE INDEX "GroupPost_groupId_idx" ON "GroupPost"("groupId");

-- CreateIndex
CREATE INDEX "GroupPost_type_idx" ON "GroupPost"("type");

-- CreateIndex
CREATE INDEX "GroupPost_isPublished_idx" ON "GroupPost"("isPublished");

-- CreateIndex
CREATE INDEX "GroupPost_isActive_idx" ON "GroupPost"("isActive");

-- CreateIndex
CREATE INDEX "Forum_comunidadSlug_idx" ON "Forum"("comunidadSlug");

-- CreateIndex
CREATE INDEX "Forum_isPinned_idx" ON "Forum"("isPinned");

-- CreateIndex
CREATE INDEX "Forum_category_idx" ON "Forum"("category");

-- CreateIndex
CREATE INDEX "Forum_type_idx" ON "Forum"("type");

-- CreateIndex
CREATE INDEX "Forum_isActive_idx" ON "Forum"("isActive");

-- CreateIndex
CREATE INDEX "ForumTopic_forumId_idx" ON "ForumTopic"("forumId");

-- CreateIndex
CREATE INDEX "ForumTopic_type_idx" ON "ForumTopic"("type");

-- CreateIndex
CREATE INDEX "ForumTopic_isPinned_idx" ON "ForumTopic"("isPinned");

-- CreateIndex
CREATE INDEX "ForumTopic_isLocked_idx" ON "ForumTopic"("isLocked");

-- CreateIndex
CREATE INDEX "ForumTopic_isActive_idx" ON "ForumTopic"("isActive");

-- CreateIndex
CREATE INDEX "ForumTopic_lastActivity_idx" ON "ForumTopic"("lastActivity");

-- CreateIndex
CREATE INDEX "ForumReply_topicId_idx" ON "ForumReply"("topicId");

-- CreateIndex
CREATE INDEX "ForumReply_replyToId_idx" ON "ForumReply"("replyToId");

-- CreateIndex
CREATE INDEX "ForumReply_isActive_idx" ON "ForumReply"("isActive");

-- CreateIndex
CREATE INDEX "Announcement_comunidadSlug_idx" ON "Announcement"("comunidadSlug");

-- CreateIndex
CREATE INDEX "Announcement_isPinned_idx" ON "Announcement"("isPinned");

-- CreateIndex
CREATE INDEX "Announcement_expiresAt_idx" ON "Announcement"("expiresAt");

-- CreateIndex
CREATE INDEX "Announcement_priority_idx" ON "Announcement"("priority");

-- CreateIndex
CREATE INDEX "Announcement_scope_idx" ON "Announcement"("scope");

-- CreateIndex
CREATE INDEX "Announcement_isActive_idx" ON "Announcement"("isActive");

-- CreateIndex
CREATE INDEX "AnnouncementRead_announcementId_idx" ON "AnnouncementRead"("announcementId");

-- CreateIndex
CREATE INDEX "AnnouncementRead_userId_idx" ON "AnnouncementRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementRead_announcementId_userId_key" ON "AnnouncementRead"("announcementId", "userId");

-- CreateIndex
CREATE INDEX "ForumModerator_forumId_idx" ON "ForumModerator"("forumId");

-- CreateIndex
CREATE INDEX "ForumModerator_userId_idx" ON "ForumModerator"("userId");

-- CreateIndex
CREATE INDEX "ForumModerator_role_idx" ON "ForumModerator"("role");

-- CreateIndex
CREATE UNIQUE INDEX "ForumModerator_forumId_userId_key" ON "ForumModerator"("forumId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfile_companyId_key" ON "CompanyProfile"("companyId");

-- CreateIndex
CREATE INDEX "CompanyService_companyId_idx" ON "CompanyService"("companyId");

-- CreateIndex
CREATE INDEX "CompanyService_companyProfileId_idx" ON "CompanyService"("companyProfileId");

-- CreateIndex
CREATE INDEX "CompanyService_category_idx" ON "CompanyService"("category");

-- CreateIndex
CREATE INDEX "CompanyService_modality_idx" ON "CompanyService"("modality");

-- CreateIndex
CREATE INDEX "CompanyService_isActive_idx" ON "CompanyService"("isActive");

-- CreateIndex
CREATE INDEX "CompanyService_comunidadSlug_idx" ON "CompanyService"("comunidadSlug");

-- CreateIndex
CREATE INDEX "CompanyProduct_companyId_idx" ON "CompanyProduct"("companyId");

-- CreateIndex
CREATE INDEX "CompanyProduct_companyProfileId_idx" ON "CompanyProduct"("companyProfileId");

-- CreateIndex
CREATE INDEX "CompanyProduct_category_idx" ON "CompanyProduct"("category");

-- CreateIndex
CREATE INDEX "CompanyProduct_price_idx" ON "CompanyProduct"("price");

-- CreateIndex
CREATE INDEX "CompanyProduct_isAvailable_idx" ON "CompanyProduct"("isAvailable");

-- CreateIndex
CREATE INDEX "CompanyProduct_isActive_idx" ON "CompanyProduct"("isActive");

-- CreateIndex
CREATE INDEX "CompanyAdvisory_companyId_idx" ON "CompanyAdvisory"("companyId");

-- CreateIndex
CREATE INDEX "CompanyAdvisory_companyProfileId_idx" ON "CompanyAdvisory"("companyProfileId");

-- CreateIndex
CREATE INDEX "CompanyAdvisory_clientId_idx" ON "CompanyAdvisory"("clientId");

-- CreateIndex
CREATE INDEX "CompanyAdvisory_status_idx" ON "CompanyAdvisory"("status");

-- CreateIndex
CREATE INDEX "CompanyAdvisory_urgency_idx" ON "CompanyAdvisory"("urgency");

-- CreateIndex
CREATE INDEX "CompanyRating_companyId_idx" ON "CompanyRating"("companyId");

-- CreateIndex
CREATE INDEX "CompanyRating_userId_idx" ON "CompanyRating"("userId");

-- CreateIndex
CREATE INDEX "CompanyRating_rating_idx" ON "CompanyRating"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyRating_companyId_userId_key" ON "CompanyRating"("companyId", "userId");

-- CreateIndex
CREATE INDEX "InterestLink_comunidadSlug_idx" ON "InterestLink"("comunidadSlug");

-- CreateIndex
CREATE INDEX "InterestLink_category_idx" ON "InterestLink"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Content_slug_key" ON "Content"("slug");

-- CreateIndex
CREATE INDEX "Content_authorId_idx" ON "Content"("authorId");

-- CreateIndex
CREATE INDEX "Content_categoryId_idx" ON "Content"("categoryId");

-- CreateIndex
CREATE INDEX "Content_pinned_idx" ON "Content"("pinned");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Report_contentId_idx" ON "Report"("contentId");

-- CreateIndex
CREATE INDEX "Report_reportedBy_idx" ON "Report"("reportedBy");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InappropriateWord_word_key" ON "InappropriateWord"("word");

-- CreateIndex
CREATE INDEX "PostCommentReport_commentId_idx" ON "PostCommentReport"("commentId");

-- CreateIndex
CREATE INDEX "PostCommentReport_reportedBy_idx" ON "PostCommentReport"("reportedBy");

-- CreateIndex
CREATE INDEX "PostCommentReport_status_idx" ON "PostCommentReport"("status");

-- CreateIndex
CREATE INDEX "GroupPostReport_postId_idx" ON "GroupPostReport"("postId");

-- CreateIndex
CREATE INDEX "GroupPostReport_reportedBy_idx" ON "GroupPostReport"("reportedBy");

-- CreateIndex
CREATE INDEX "GroupPostReport_status_idx" ON "GroupPostReport"("status");

-- CreateIndex
CREATE INDEX "ForumTopicReport_topicId_idx" ON "ForumTopicReport"("topicId");

-- CreateIndex
CREATE INDEX "ForumTopicReport_reportedBy_idx" ON "ForumTopicReport"("reportedBy");

-- CreateIndex
CREATE INDEX "ForumTopicReport_status_idx" ON "ForumTopicReport"("status");

-- CreateIndex
CREATE INDEX "ForumReplyReport_replyId_idx" ON "ForumReplyReport"("replyId");

-- CreateIndex
CREATE INDEX "ForumReplyReport_reportedBy_idx" ON "ForumReplyReport"("reportedBy");

-- CreateIndex
CREATE INDEX "ForumReplyReport_status_idx" ON "ForumReplyReport"("status");

-- CreateIndex
CREATE INDEX "AnnouncementReport_announcementId_idx" ON "AnnouncementReport"("announcementId");

-- CreateIndex
CREATE INDEX "AnnouncementReport_reportedBy_idx" ON "AnnouncementReport"("reportedBy");

-- CreateIndex
CREATE INDEX "AnnouncementReport_status_idx" ON "AnnouncementReport"("status");

-- CreateIndex
CREATE INDEX "CustomField_userType_idx" ON "CustomField"("userType");

-- CreateIndex
CREATE INDEX "CustomField_isActive_idx" ON "CustomField"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CustomField_name_userType_key" ON "CustomField"("name", "userType");

-- CreateIndex
CREATE INDEX "_ContentToTag_B_index" ON "_ContentToTag"("B");

-- AddForeignKey
ALTER TABLE "UserAdditionalRole" ADD CONSTRAINT "UserAdditionalRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicAdministration" ADD CONSTRAINT "PublicAdministration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContenidoMaestro" ADD CONSTRAINT "ContenidoMaestro_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Traduccion" ADD CONSTRAINT "Traduccion_contenidoId_fkey" FOREIGN KEY ("contenidoId") REFERENCES "ContenidoMaestro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacionComunidad" ADD CONSTRAINT "PublicacionComunidad_contenidoId_fkey" FOREIGN KEY ("contenidoId") REFERENCES "ContenidoMaestro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PostComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReport" ADD CONSTRAINT "PostReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReport" ADD CONSTRAINT "PostReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPost" ADD CONSTRAINT "GroupPost_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumTopic" ADD CONSTRAINT "ForumTopic_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReply" ADD CONSTRAINT "ForumReply_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "ForumReply"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReply" ADD CONSTRAINT "ForumReply_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "ForumTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumModerator" ADD CONSTRAINT "ForumModerator_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyService" ADD CONSTRAINT "CompanyService_companyProfileId_fkey" FOREIGN KEY ("companyProfileId") REFERENCES "CompanyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyService" ADD CONSTRAINT "CompanyService_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyProduct" ADD CONSTRAINT "CompanyProduct_companyProfileId_fkey" FOREIGN KEY ("companyProfileId") REFERENCES "CompanyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyProduct" ADD CONSTRAINT "CompanyProduct_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAdvisory" ADD CONSTRAINT "CompanyAdvisory_companyProfileId_fkey" FOREIGN KEY ("companyProfileId") REFERENCES "CompanyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAdvisory" ADD CONSTRAINT "CompanyAdvisory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyRating" ADD CONSTRAINT "CompanyRating_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterestLink" ADD CONSTRAINT "InterestLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCommentReport" ADD CONSTRAINT "PostCommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCommentReport" ADD CONSTRAINT "PostCommentReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPostReport" ADD CONSTRAINT "GroupPostReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "GroupPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPostReport" ADD CONSTRAINT "GroupPostReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumTopicReport" ADD CONSTRAINT "ForumTopicReport_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "ForumTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumTopicReport" ADD CONSTRAINT "ForumTopicReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReplyReport" ADD CONSTRAINT "ForumReplyReport_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "ForumReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReplyReport" ADD CONSTRAINT "ForumReplyReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementReport" ADD CONSTRAINT "AnnouncementReport_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementReport" ADD CONSTRAINT "AnnouncementReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentToTag" ADD CONSTRAINT "_ContentToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentToTag" ADD CONSTRAINT "_ContentToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
