/**
 * Toast Notification System
 *
 * Provides a centralized toast notification system for success/error/info/warning messages.
 * Supports undo actions and auto-dismiss.
 */

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
  action?: {
    label: string
    callback: () => void
  }
}

const toasts = ref<Toast[]>([])
let toastId = 0

export const useToast = () => {
  const add = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastId}`
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration ?? 5000,
    }

    toasts.value.push(newToast)

    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, newToast.duration)
    }

    return id
  }

  const remove = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => {
    return add({ type: 'success', message, duration })
  }

  const error = (message: string, duration?: number) => {
    return add({ type: 'error', message, duration: duration ?? 7000 })
  }

  const info = (message: string, duration?: number) => {
    return add({ type: 'info', message, duration })
  }

  const warning = (message: string, duration?: number) => {
    return add({ type: 'warning', message, duration: duration ?? 6000 })
  }

  const withUndo = (message: string, undoCallback: () => void, duration?: number) => {
    return add({
      type: 'info',
      message,
      duration: duration ?? 10000,
      action: {
        label: 'Undo',
        callback: undoCallback,
      },
    })
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    add,
    remove,
    success,
    error,
    info,
    warning,
    withUndo,
    clear,
  }
}
