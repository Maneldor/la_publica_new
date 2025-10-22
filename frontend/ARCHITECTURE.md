# 🏗️ La Pública Architecture Documentation

> **⚠️ CRITICAL SYSTEM ARCHITECTURE - PROTECTED COMPONENTS**

This document outlines the core architecture components that form the foundation of the La Pública platform. These components are **PROTECTED** and should not be modified without careful consideration.

## 🔒 Protected Core Components

### 1. Dashboard Layout (`app/dashboard/layout.tsx`)
**Status: PROTECTED**

The main application structure providing:
- Fixed sidebar navigation with 3 sections (Comunitat, Serveis, Accions Ràpides)
- Fixed header spanning full width with logo, search, and user actions
- Responsive layout with proper spacing and positioning

**Critical Elements:**
- Sidebar dimensions: 280px width
- Header height: 64px
- Main content area margins: 280px left, 64px top
- Color scheme consistency
- Navigation item structure

**⚠️ Do NOT modify:**
- Layout positioning (fixed/absolute)
- Sidebar and header dimensions
- Navigation structure
- Color scheme (#3b82f6, #f8f9fa, etc.)

### 2. Universal Card Component (`components/ui/UniversalCard.tsx`)
**Status: PROTECTED**

Flexible 3-zone card system for consistent UI across the platform.

**Three-Zone Architecture:**
- **Top Zone**: Visual area (gradient, image, icon, solid color)
- **Middle Zone**: Content area (title, description, metadata, stats)
- **Bottom Zone**: Action area (buttons, secondary stats)

**Critical Configurations:**
- Compact variant height: **60px** (for statistics)
- Default variant height: **320px** (for content)
- Width controls and overflow management
- Responsive behavior

**⚠️ Do NOT modify:**
- Height values without testing ALL implementations
- Three-zone structure
- Overflow and width control logic
- Core styling system

### 3. Page Template (`components/ui/PageTemplate.tsx`)
**Status: PROTECTED**

Standardized layout for all dashboard pages.

**Structure:**
- Page Header: Title and subtitle section
- Statistics Grid: 4-column grid of compact UniversalCards
- Content Area: Children content with consistent background

**Critical Elements:**
- Statistics grid: 4 columns, 20px gap
- Background color: #f8f9fa
- Typography and spacing system

**⚠️ Do NOT modify:**
- Grid structure (4 columns)
- Spacing/padding values
- Background color
- Integration with UniversalCard

## 📊 Current Implementation Status

### Dashboard Pages (14 total - ALL IMPLEMENTED)
All pages use the PageTemplate component for consistency:

1. **Tauler** (`/dashboard`) - Main dashboard
2. **Perfil** (`/dashboard/perfil`) - User profile
3. **Membres** (`/dashboard/membres`) - Community members
4. **Grups** (`/dashboard/grups`) - Groups
5. **Missatges** (`/dashboard/missatges`) - Messages
6. **Forums** (`/dashboard/forums`) - Forums
7. **Blogs** (`/dashboard/blogs`) - Blog posts
8. **Anuncis** (`/dashboard/anuncis`) - Announcements
9. **Empreses** (`/dashboard/empreses`) - Companies
10. **Ofertes** (`/dashboard/ofertes`) - Job offers
11. **Assessorament** (`/dashboard/assessorament`) - Consulting
12. **Enllaços** (`/dashboard/enllacos`) - Links
13. **Formació** (`/dashboard/formacio`) - Training
14. **Recursos** (`/dashboard/recursos`) - Resources

## 🛡️ Protection System

### Backup System
- Architecture backups created: `backup_architecture_20251007_*.tar.gz`
- Contains all essential components and structure
- Restore point available if modifications cause issues

### Code-Level Protection
- **Protective comments** added to all core components
- Clear modification guidelines in each file
- Warning headers indicating protected status
- Version tracking and last modified dates

### Documentation Protection
- This ARCHITECTURE.md file serves as the definitive reference
- CLAUDE.md contains AI assistant guidelines
- All protected elements clearly documented

## 🚨 Modification Guidelines

### BEFORE Making Changes:
1. **Read this documentation completely**
2. **Check the protective comments in the target file**
3. **Understand the impact on all dependent components**
4. **Create a backup if modifying core architecture**

### ALLOWED Modifications:
- Adding new navigation items (with user approval)
- Adding new props to components (if needed by ALL pages)
- Color scheme updates (apply consistently)
- New page content (following PageTemplate structure)

### FORBIDDEN Modifications:
- Changing layout dimensions or positioning
- Modifying the three-zone card structure
- Altering grid systems or spacing
- Removing overflow controls
- Breaking component interfaces

### Testing Requirements:
- Test ALL 14 dashboard pages after changes
- Verify statistics display correctly
- Check responsive behavior
- Ensure no layout breaks or overflows

## 🔧 Development Workflow

### When Adding New Pages:
1. Use the PageTemplate component
2. Follow existing page structure
3. Provide appropriate statistics data
4. Test with different content lengths

### When Modifying Core Components:
1. Consult this documentation
2. Read protective comments in the file
3. Test across all implementations
4. Update documentation if needed

## 📝 Version History

- **Version 1.0** (2025-10-07): Initial protected architecture
  - Dashboard layout implemented
  - Universal card system created
  - Page template standardized
  - All 14 pages implemented
  - Protection system activated

## ⚡ Emergency Procedures

### If Architecture Breaks:
1. **STOP** further modifications immediately
2. Restore from backup: `backup_architecture_20251007_*.tar.gz`
3. Review this documentation
4. Identify what caused the break
5. Test thoroughly before proceeding

### Contact Information:
- Consult CLAUDE.md for AI assistant guidelines
- Reference this document for all architectural decisions
- Create new backups before major changes

---

**Remember: The architecture is the foundation. Protect it at all costs.**

*Last updated: 2025-10-07 | Version: 1.0 | Status: ACTIVE*