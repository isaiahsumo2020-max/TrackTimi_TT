import { useConfirmDialog } from '@/composables/useConfirmDialog'

/**
 * Show an alert dialog
 * @param {string} message - The message to display
 * @param {string} type - Optional type (success, warning, danger, info)
 * @param {string} title - Optional title
 */
export async function showAlert(message, type = 'info', title = null) {
  const { openDialog } = useConfirmDialog()
  
  const titleMap = {
    success: 'Success',
    warning: 'Warning',
    danger: 'Error',
    info: 'Notice'
  }
  
  return openDialog({
    title: title || titleMap[type] || 'Alert',
    message,
    type,
    confirmText: 'OK',
    cancelText: null,
    duration: 'short'
  })
}

/**
 * Show a confirmation dialog
 * @param {string | Object} options - Message string or options object
 * @param {Function} onConfirm - Callback on confirm
 * @returns {Promise<boolean>} - True if confirmed, false if cancelled
 */
export async function showConfirm(options = {}, onConfirm = null) {
  const { openDialog } = useConfirmDialog()
  
  // Handle backward compatibility - allow passing message as first arg
  let dialogOptions = {}
  if (typeof options === 'string') {
    dialogOptions = {
      title: 'Confirm Action',
      message: options
    }
  } else {
    dialogOptions = options
  }

  return openDialog({
    title: dialogOptions.title || 'Confirm Action',
    message: dialogOptions.message || '',
    type: dialogOptions.type || 'question',
    confirmText: dialogOptions.confirmText || 'Confirm',
    cancelText: dialogOptions.cancelText || 'Cancel',
    onConfirm: onConfirm || dialogOptions.onConfirm
  })
}

/**
 * Show a success message
 */
export async function showSuccess(message, title = 'Success') {
  return showAlert(message, 'success', title)
}

/**
 * Show a warning message
 */
export async function showWarning(message, title = 'Warning') {
  return showAlert(message, 'warning', title)
}

/**
 * Show an error message
 */
export async function showError(message, title = 'Error') {
  return showAlert(message, 'danger', title)
}

/**
 * Show a delete confirmation
 */
export async function showDeleteConfirm(itemName = 'this item', onConfirm = null) {
  return showConfirm({
    title: 'Delete ' + itemName + '?',
    message: `Are you absolutely certain you want to permanently delete ${itemName}? This cannot be undone.`,
    type: 'danger',
    confirmText: 'Yes, Delete',
    cancelText: 'Cancel',
    onConfirm
  })
}
