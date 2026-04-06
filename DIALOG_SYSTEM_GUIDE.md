# Global Dialog System - Quick Reference

## Overview
All platform confirmations, alerts, and notifications now use a centralized, beautifully styled modal dialog instead of browser `alert()` and `confirm()`.

## Setup
The `ConfirmDialog` component and `useConfirmDialog` composable are automatically available globally in your App.vue.

## Usage Examples

### 1. **Simple Alert** (Replaces `alert(message)`)
```javascript
import { showAlert } from '@/utils/dialog'

// Basic alert
await showAlert('Operation completed')

// Alert with type
await showAlert('Success message', 'success', 'All Done')
await showAlert('Warning!', 'warning', 'Caution')
await showAlert('An error occurred', 'danger', 'Error')
```

### 2. **Confirmation Dialog** (Replaces `confirm()`)
```javascript
import { showConfirm, showDeleteConfirm } from '@/utils/dialog'

// Basic confirmation
const result = await showConfirm({
  title: 'Delete Organization?',
  message: 'Are you absolutely certain you want to permanently delete this organization? This cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  type: 'danger'
})

if (result) {
  // User clicked confirm
  await deleteOrganization()
}

// Pre-built delete confirmation
const deleteConfirmed = await showDeleteConfirm('Organization', async () => {
  await deleteOrganization()
})
```

### 3. **Success/Warning/Error Messages**
```javascript
import { showSuccess, showWarning, showError } from '@/utils/dialog'

await showSuccess('Employee added successfully')
await showWarning('This action will affect 5 employees')
await showError('Failed to save changes', 'Save Error')
```

### 4. **Confirmation with Action**
```javascript
import { showConfirm } from '@/utils/dialog'

const confirmed = await showConfirm({
  title: 'Activate Selected?',
  message: `This will activate ${count} selected items`,
  type: 'info',
  confirmText: 'Activate',
  cancelText: 'Cancel',
  onConfirm: async () => {
    await activateItems(selectedIds)
    await showSuccess('Items activated')
  }
})
```

## Dialog Types
- **info** - Information (blue)
- **success** - Success (green)
- **warning** - Warning (yellow)
- **danger** - Danger/Delete (red)
- **question** - Question/Confirmation (gray)

## Replacing Existing Code

### Before (Old Way)
```javascript
// In Organizations.vue
if (!confirm('Delete this organization?')) return
try {
  await deleteOrganization(orgId)
  alert('Organization deleted')
} catch (err) {
  alert('Failed: ' + err.message)
}
```

### After (New Way)
```javascript
// In Organizations.vue
import { showDeleteConfirm, showSuccess, showError } from '@/utils/dialog'

const confirmed = await showDeleteConfirm('Organization', async () => {
  await deleteOrganization(orgId)
})

if (confirmed) {
  await showSuccess('Organization deleted successfully')
}
```

## Files to Update

Key files with many `alert()` and `confirm()` calls that should be updated:

1. `frontend/src/components/dashboard/Organizations.vue`
2. `frontend/src/views/admin/EmployeeManagement.vue`
3. `frontend/src/views/tenant/Checkin.vue`
4. `frontend/src/views/superadmin/FeedbackManagement.vue`
5. `frontend/src/views/admin/AdminSchedule.vue`
6. `frontend/src/views/tenant/Settings.vue`
7. `frontend/src/views/tenant/UserDashboard.vue`
8. `frontend/src/views/tenant/Users.vue`
9. `frontend/src/views/tenant/Feedback.vue`
10. `frontend/src/views/admin/OrgSettings.vue`

## Integration Steps

For each file:
1. Add import at top: `import { showAlert, showConfirm, showSuccess, showError, showDeleteConfirm } from '@/utils/dialog'`
2. Replace `alert()` calls with appropriate dialog functions
3. Replace `confirm()` calls with `showConfirm()` or `showDeleteConfirm()`
4. Handle the returned Promise (await or .then())

## Styling Features

The dialog includes:
- ✅ Smooth animations (fade-in, scale)
- ✅ Backdrop blur effect
- ✅ Loading state with spinner
- ✅ Custom icons for each type
- ✅ Responsive design
- ✅ Accessible buttons
- ✅ Shadow effects

## Coming Soon
- [ ] Toast notifications (for quick messages)
- [ ] Custom content slots
- [ ] Progress dialog (for long operations)
