import { ref, reactive } from 'vue'

// Global dialog state
const dialogState = reactive({
  isOpen: false,
  title: 'Confirm Action',
  message: '',
  type: 'question',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  isLoading: false,
  onConfirm: null,
  onCancel: null
})

export function useConfirmDialog() {
  const isLoading = ref(false)

  /**
   * Show a confirmation dialog
   * @param {Object} options - Dialog options
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Dialog message
   * @param {string} options.confirmText - Confirm button text
   * @param {string} options.cancelText - Cancel button text
   * @param {string} options.type - Dialog type (info, success, warning, danger, question)
   * @param {Function} options.onConfirm - Callback when confirmed
   * @param {Function} options.onCancel - Callback when cancelled
   * @returns {Promise} - Resolves when dialog is closed
   */
  const openDialog = (options) => {
    return new Promise((resolve, reject) => {
      dialogState.isOpen = true
      dialogState.title = options.title || 'Confirm Action'
      dialogState.message = options.message || ''
      dialogState.type = options.type || 'question'
      dialogState.confirmText = options.confirmText || 'Confirm'
      dialogState.cancelText = options.cancelText || 'Cancel'
      dialogState.isLoading = false

      dialogState.onConfirm = async () => {
        if (options.onConfirm) {
          try {
            dialogState.isLoading = true
            await options.onConfirm()
            resolve(true)
          } catch (error) {
            reject(error)
          } finally {
            closeDialog()
            dialogState.isLoading = false
          }
        } else {
          resolve(true)
          closeDialog()
        }
      }

      dialogState.onCancel = () => {
        if (options.onCancel) {
          options.onCancel()
        }
        resolve(false)
        closeDialog()
      }
    })
  }

  const closeDialog = () => {
    dialogState.isOpen = false
    dialogState.onConfirm = null
    dialogState.onCancel = null
  }

  const handleConfirm = () => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm()
    }
  }

  const handleCancel = () => {
    if (dialogState.onCancel) {
      dialogState.onCancel()
    } else {
      closeDialog()
    }
  }

  return {
    dialogState,
    openDialog,
    closeDialog,
    handleConfirm,
    handleCancel
  }
}
