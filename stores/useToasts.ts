import { defineStore } from 'pinia'

type ToastType = 'info' | 'success' | 'error'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

export const useToasts = defineStore('toasts', {
  state: () => ({
    items: [] as ToastItem[],
  }),
  actions: {
    show(message: string, type: ToastType = 'info', options: { duration?: number } = {}) {
      const id = this.createId()
      this.items.push({ id, message, type })
      const timeout = options.duration ?? 4000
      if (timeout > 0) {
        setTimeout(() => this.dismiss(id), timeout)
      }
      return id
    },
    info(message: string, options?: { duration?: number }) {
      return this.show(message, 'info', options)
    },
    success(message: string, options?: { duration?: number }) {
      return this.show(message, 'success', options)
    },
    error(message: string, options?: { duration?: number }) {
      return this.show(message, 'error', options)
    },
    dismiss(id: string) {
      this.items = this.items.filter((toast) => toast.id !== id)
    },
    createId() {
      if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID()
      }
      return Math.random().toString(36).slice(2)
    },
  },
})
