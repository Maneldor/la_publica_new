# 🤖 Claude Assistant Guidelines for La Pública Platform

> **Guidelines for AI development assistants working on the La Pública platform**

## 🔒 PROTECTED ARCHITECTURE - CRITICAL RULES

### ⚠️ MANDATORY: Read Before ANY Modifications

**ALWAYS** consult `ARCHITECTURE.md` before modifying ANY component. The platform has **PROTECTED CORE COMPONENTS** that maintain structural integrity.

### 🚨 ABSOLUTELY FORBIDDEN Actions:

1. **DO NOT** modify these files without explicit user approval:
   - `app/dashboard/layout.tsx` (Dashboard layout)
   - `components/ui/UniversalCard.tsx` (Universal card system)
   - `components/ui/PageTemplate.tsx` (Page template)

2. **DO NOT** change these critical values:
   - UniversalCard heights: 60px (compact), 320px (default)
   - Layout dimensions: 280px sidebar, 64px header
   - Grid structure: 4-column statistics grid
   - Background colors: #f8f9fa, #3b82f6

3. **DO NOT** break the three-zone card architecture
4. **DO NOT** remove overflow controls or width management
5. **DO NOT** alter the PageTemplate structure

### ✅ ALLOWED Modifications:

- Adding new pages using PageTemplate
- Adding new navigation items (with user approval)
- Modifying page content within existing structure
- Adding new props (if needed by ALL implementations)
- Color scheme updates (apply consistently)

## 🧩 Component Usage Guidelines

### Dashboard Layout
**Protected File**: `app/dashboard/layout.tsx`
- Fixed sidebar with 3 navigation sections
- Fixed header spanning full width
- DO NOT modify positioning or dimensions

### Universal Card
**Protected File**: `components/ui/UniversalCard.tsx`
- Three-zone architecture (Top/Middle/Bottom)
- Two main variants: compact (60px) and default (320px)
- Used for both statistics and content cards
- DO NOT change height values without testing ALL pages

### Page Template
**Protected File**: `components/ui/PageTemplate.tsx`
- Standardized layout for all dashboard pages
- 4-column statistics grid using compact UniversalCards
- Consistent header and content structure
- Currently implemented on ALL 14 dashboard pages

## 📋 Development Workflow

### For New Pages:
```typescript
// ALWAYS use this pattern for new dashboard pages
export default function NewPage() {
  const statsData = [
    { label: 'Stat 1', value: '123', trend: '+5%' },
    { label: 'Stat 2', value: '456', trend: '+2%' },
    // ... exactly 4 stats for grid consistency
  ];

  return (
    <PageTemplate
      title="Page Title"
      subtitle="Page description"
      statsData={statsData}
    >
      {/* Page-specific content here */}
    </PageTemplate>
  );
}
```

### For Content Cards:
```typescript
// Use UniversalCard for content display
<UniversalCard
  variant="default" // or "compact" for statistics
  topZone={{ type: 'gradient', value: 'linear-gradient(...)' }}
  middleZone={{ title: '...', description: '...' }}
  bottomZone={{ primaryAction: { text: '...', onClick: () => {} } }}
/>
```

## 🚦 Testing Requirements

**AFTER ANY MODIFICATION**, test these areas:

1. **All Dashboard Pages** (14 total):
   - Verify layout consistency
   - Check statistics grid display
   - Ensure no layout breaks

2. **Card Display**:
   - Statistics cards (compact, 60px height)
   - Content cards (default, 320px height)
   - Overflow and width behavior

3. **Responsive Behavior**:
   - Sidebar and header positioning
   - Grid layout adaptation
   - Card responsive variants

## 🔧 Problem-Solving Approach

### If Layout Breaks:
1. **STOP** further modifications
2. Check `ARCHITECTURE.md` for restoration guidelines
3. Use backup: `backup_architecture_20251007_*.tar.gz`
4. Review protective comments in affected files

### If Cards Don't Display Correctly:
1. Check UniversalCard height values (60px vs 320px)
2. Verify variant usage (compact vs default)
3. Check overflow and width controls
4. Test across all implementations

### If Grid Issues Occur:
1. Verify 4-column structure in PageTemplate
2. Check spacing values (20px gap)
3. Ensure statistics data has exactly 4 items
4. Test responsive behavior

## 📚 Reference Documentation

### Essential Files to Read:
- `ARCHITECTURE.md` - Complete architecture overview
- `app/dashboard/layout.tsx` - Layout implementation
- `components/ui/UniversalCard.tsx` - Card system
- `components/ui/PageTemplate.tsx` - Page structure

### Backup System:
- Architecture backups available: `backup_architecture_20251007_*.tar.gz`
- Restore if major issues occur
- Create new backups before significant changes

## 🎯 Common Tasks and Approaches

### Adding Navigation Items:
1. Modify `comunitatItems`, `serveisItems`, or `quickActions` arrays
2. Test navigation highlighting
3. Ensure consistent styling

### Creating New Card Variants:
1. Extend UniversalCard props interface
2. Add new variant handling in render functions
3. Test across all usage scenarios
4. Update documentation

### Modifying Statistics:
1. Update statsData in individual pages
2. Maintain 4-item arrays for grid consistency
3. Test display and overflow behavior

## ⚡ Emergency Protocols

### If Architecture Is Compromised:
1. **IMMEDIATELY** stop all modifications
2. Restore from backup
3. Review what caused the issue
4. Consult this documentation
5. Test thoroughly before proceeding

### Communication with User:
- Always explain what you're modifying and why
- Ask for approval before touching protected components
- Provide clear before/after explanations
- Report any issues immediately

---

## 🎖️ Best Practices Summary

1. **READ** `ARCHITECTURE.md` before ANY modification
2. **CHECK** protective comments in files
3. **TEST** across all 14 dashboard pages
4. **RESPECT** the protected architecture
5. **COMMUNICATE** changes clearly with user
6. **BACKUP** before major modifications
7. **RESTORE** if anything breaks

**Remember: The architecture is stable and tested. Preserve its integrity at all costs.**

*Last updated: 2025-10-07 | Version: 1.0 | Status: ACTIVE*