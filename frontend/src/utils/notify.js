// src/utils/notify.js
import { toast } from 'sonner';

/**
 * GlitzByLissah notification helper.
 * All toasts go through here so styling + behavior stay consistent.
 */
export const notify = {
  success: (msg, opts) =>
    toast.success(msg, { duration: 3000, ...opts }),

  error: (msg, opts) =>
    toast.error(msg, { duration: 4500, ...opts }),

  info: (msg, opts) =>
    toast(msg, { duration: 3000, ...opts }),

  warning: (msg, opts) =>
    toast.warning(msg, { duration: 4000, ...opts }),

  // For loading → success flows (e.g. "Sending code..." → "Code sent!")
  loading: (msg, opts) =>
    toast.loading(msg, { duration: Infinity, ...opts }),

  promise: (promise, { loading, success, error }, opts) =>
    toast.promise(promise, { loading, success, error, ...opts }),

  dismiss: (id) => toast.dismiss(id),
};