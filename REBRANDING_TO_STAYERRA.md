# 🎨 Rebranding: Nestora → Stayerra

**New Brand**: Stayerra  
**Tagline**: Modern Living, Grounded Search  
**Logo**: Compass with "S" design  
**Status**: In Progress

---

## 📝 Files to Update

### 1. Core Configuration Files
- [x] `package.json` - name, description
- [x] `app/layout.tsx` - metadata, titles, descriptions
- [x] `app/manifest.ts` - PWA name
- [x] `README.md` - project name
- [x] `.env.example` - URLs and references

### 2. Component Files
- [ ] `components/layout/Navbar.tsx` - logo and name
- [ ] `components/layout/Footer.tsx` - branding
- [ ] `app/page.tsx` - hero text and descriptions
- [ ] All component files with "Nestora" references

### 3. Documentation Files
- [ ] All `.md` files in root
- [ ] All spec files in `.kiro/specs/`
- [ ] `AUDIT_REPORT.md`
- [ ] `FEATURES_IMPLEMENTED.md`

### 4. API & Backend
- [ ] Email templates in `lib/mailer.ts`
- [ ] Admin panel references
- [ ] Queue worker messages

### 5. Assets
- [ ] Replace logo files
- [ ] Update favicon
- [ ] Update OG images

---

## 🔄 Search & Replace Commands

```bash
# Find all occurrences
grep -r "Nestora" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git

# Replace in all files (use with caution)
find . -type f -name "*.tsx" -o -name "*.ts" -o -name "*.md" | xargs sed -i 's/Nestora/Stayerra/g'
find . -type f -name "*.tsx" -o -name "*.ts" -o -name "*.md" | xargs sed -i 's/nestora/stayerra/g'
find . -type f -name "*.tsx" -o -name "*.ts" -o -name "*.md" | xargs sed -i 's/NESTORA/STAYERRA/g'
```

---

## 🎯 Priority Updates

### High Priority (User-Facing)
1. App title and metadata
2. Navbar logo and name
3. Footer branding
4. Home page hero
5. Email templates

### Medium Priority
6. Documentation files
7. Admin panel
8. API responses
9. Error messages

### Low Priority
10. Code comments
11. Internal documentation
12. Spec files

