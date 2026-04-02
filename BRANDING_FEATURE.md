# Organization Branding and Logo Feature

## Overview
Organizations can now customize their branding by selecting a **primary theme color** and uploading a **logo** during registration. These branding elements are saved to the database and can be retrieved/updated later.

## Features Implemented

### 1. **Default Color Assignment**
- When an organization registers, if no color is explicitly selected, a random color from a curated palette is automatically assigned
- User can also click the 🎨 **Random** button to generate a new random color
- Colors are from a professional palette: `#FF6B6B`, `#4ECDC4`, `#45B7D1`, `#FFA07A`, `#98D8C8`, `#F7DC6F`, `#BB8FCE`, `#85C1E2`, etc.

### 2. **Logo Upload**
- During registration, organizations can upload a logo image (PNG, JPG, GIF)
- Maximum file size: 2MB
- Logo is converted to Base64 and stored in the database
- Supports image preview during upload
- Users can remove the logo before submission

### 3. **Color Customization**
- Color picker UI with both visual picker and hex input field
- Pre-populated with a random default color
- Users can manually enter hex color codes
- Validates hex color format

## Database Schema

### Organization Table - New Columns

```sql
-- Added columns to Organization table
ALTER TABLE Organization ADD COLUMN Theme_Color TEXT DEFAULT '#ff6600';
ALTER TABLE Organization ADD COLUMN Logo_Path TEXT;
ALTER TABLE Organization ADD COLUMN Logo_MIME_Type TEXT DEFAULT 'image/png';
```

## API Endpoints

### POST `/api/auth/register-org`
Register a new organization with branding

**Request Body:**
```json
{
  "orgName": "Acme Corporation",
  "orgDomain": "acme.tracktimi.com",
  "orgSlug": "acme-corporation",
  "adminName": "John Doe",
  "adminEmail": "admin@acme.com",
  "adminPassword": "SecurePassword123",
  "theme": {
    "primary": "#FF6B6B"
  },
  "logo": "base64_encoded_image_string",
  "logoType": "image/png",
  "regionId": 1,
  "orgTypeId": 1
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "userId": 1,
    "orgId": 1,
    "orgSlug": "acme-corporation",
    "orgName": "Acme Corporation",
    "name": "John Doe",
    "email": "admin@acme.com",
    "role": "OrgAdmin",
    "themeColor": "#FF6B6B",
    "logo": "base64_encoded_image_string"
  }
}
```

### GET `/api/org/branding`
Retrieve organization branding details

**Auth Required:** Yes (Bearer token)

**Response:**
```json
{
  "orgId": 1,
  "orgName": "Acme Corporation",
  "themeColor": "#FF6B6B",
  "logo": "base64_encoded_image_string",
  "logoMimeType": "image/png"
}
```

### PUT `/api/org/branding`
Update organization branding details

**Auth Required:** Yes (Bearer token)

**Request Body:**
```json
{
  "themeColor": "#4ECDC4",
  "logo": "base64_encoded_image_string",
  "logoMimeType": "image/png"
}
```

**Response:**
```json
{
  "message": "✅ Branding updated successfully",
  "themeColor": "#4ECDC4",
  "logo": "base64_encoded_image_string",
  "logoMimeType": "image/png"
}
```

## Frontend Implementation

### Registration Form (OrgRegister.vue)

#### Color Selection
```vue
<!-- Theme Color Section -->
<div>
  <label class="block text-sm font-medium text-slate-700 mb-1.5">Primary Theme Color</label>
  <div class="flex gap-3 items-center">
    <!-- Color Picker -->
    <input type="color" v-model="form.theme.primary" />
    
    <!-- Hex Input -->
    <input v-model="form.theme.primary" type="text" placeholder="#ff6600" maxlength="7" />
    
    <!-- Random Color Generator -->
    <button type="button" @click="generateRandomColor" class="px-4 py-3 bg-orange-50">
      🎨 Random
    </button>
  </div>
</div>
```

#### Logo Upload
```vue
<!-- Logo Upload Section -->
<div>
  <label for="logo" class="block text-sm font-medium text-slate-700 mb-1.5">
    Organization Logo (Optional)
  </label>
  <div class="space-y-3">
    <!-- Logo Preview -->
    <div v-if="logoPreview" class="w-20 h-20 rounded-lg border-2 border-orange-400">
      <img :src="logoPreview" :alt="form.orgName" class="w-full h-full object-cover" />
    </div>
    
    <!-- File Input -->
    <input id="logo" type="file" accept="image/*" @change="handleLogoUpload" />
    
    <!-- Remove Button -->
    <button v-if="logoPreview" type="button" @click="clearLogo">
      ❌ Remove logo
    </button>
  </div>
</div>
```

#### JavaScript Handlers
```javascript
// Generate random color from palette
const generateRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
  form.theme.primary = colors[Math.floor(Math.random() * colors.length)]
}

// Handle logo file upload
const handleLogoUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = 'File too large (max 2MB)'
    return
  }

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please select an image file'
    return
  }

  form.logo = file
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Clear logo selection
const clearLogo = () => {
  logoPreview.value = null
  form.logo = null
  const fileInput = document.getElementById('logo')
  if (fileInput) fileInput.value = ''
}

// Submit registration with branding
const handleRegister = async () => {
  // Convert logo to base64
  let logoBase64 = null
  if (form.logo) {
    logoBase64 = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target.result.split(',')[1])
      }
      reader.readAsDataURL(form.logo)
    })
  }

  // Submit registration with logo and theme
  const result = await authStore.registerOrg({
    orgName: form.orgName,
    orgDomain: form.orgDomain,
    theme: form.theme,
    logo: logoBase64,
    logoType: form.logo?.type || 'image/png',
    // ... other fields
  })
}
```

## Usage in Dashboard

### Displaying Organization Branding
```vue
<template>
  <div :style="{ 'color': orgBranding.themeColor }">
    <!-- Logo Display -->
    <img v-if="orgBranding.logo" 
         :src="`data:${orgBranding.logoMimeType};base64,${orgBranding.logo}`"
         :alt="orgName"
         class="w-12 h-12 rounded-lg" />
    
    <!-- Theme Color Application -->
    <header :style="{ 'background-color': orgBranding.themeColor }">
      {{ orgName }} Dashboard
    </header>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const orgBranding = ref({})
const token = localStorage.getItem('token')

onMounted(async () => {
  try {
    const response = await axios.get('/api/org/branding', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    orgBranding.value = response.data
  } catch (error) {
    console.error('Failed to load branding:', error)
  }
})
</script>
```

## Running the Migration

To add the new columns to existing databases:

```bash
# Option 1: Run the setup script (will add columns if they don't exist)
cd backend
npm run setup-db

# Option 2: Manual SQL (in SQLite CLI)
sqlite3 data/tracktimi.db < sql/migration_add_branding.sql
```

## Default Color Palette

The system uses a carefully selected color palette for professional appearance:
- `#FF6B6B` - Coral Red
- `#4ECDC4` - Turquoise
- `#45B7D1` - Sky Blue
- `#FFA07A` - Light Salmon
- `#98D8C8` - Mint Green
- `#F7DC6F` - Golden Yellow
- `#BB8FCE` - Lavender
- `#85C1E2` - Light Blue
- `#F38181` - Salmon
- `#AA96DA` - Purple
- `#FCBAD3` - Pink
- `#FFFFD2` - Light Yellow
- `#A8E6CF` - Light Mint
- `#FFD3B6` - Peach
- `#FFAAA5` - Light Red

## Future Enhancements

1. **Organization Settings Page**
   - Allow organizations to update logo and color after registration
   - Preview changes before saving
   - Logo cropping tool
   - Multiple color schemes (primary, secondary, accent)

2. **Logo Optimization**
   - Automatic image compression
   - CDN storage for logos
   - Multiple logo sizes (32x32, 64x64, 128x128)

3. **Theme Customization**
   - Secondary colors
   - Dark mode variant colors
   - Font customization

4. **Admin Dashboard**
   - View organization branding across all organizations
   - Update branding for multiple organizations
   - Brand consistency checker

## Testing

### Test Case 1: Registration with Default Color
```json
// No theme provided - should auto-assign
POST /api/auth/register-org
{
  "orgName": "Test Org",
  "adminEmail": "test@example.com",
  "adminPassword": "password123",
  "adminName": "Test Admin"
  // No theme object
}
// Expected: Theme_Color set to random color
```

### Test Case 2: Registration with Custom Color
```json
// Custom color provided
POST /api/auth/register-org
{
  "orgName": "Test Org",
  "theme": { "primary": "#4ECDC4" },
  // ... other fields
}
// Expected: Theme_Color = "#4ECDC4"
```

### Test Case 3: Registration with Logo
```json
POST /api/auth/register-org
{
  "orgName": "Test Org",
  "logo": "iVBORw0KGgoAAAANS...",  // Base64 image
  "logoType": "image/png",
  // ... other fields
}
// Expected: Logo_Path and Logo_MIME_Type saved
```
