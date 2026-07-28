import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

/**
 * Delete confirmation dialog using SweetAlert2
 */
export async function confirmDelete(title: string = 'Delete', message: string = 'Are you sure?'): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    allowOutsideClick: false,
    allowEscapeKey: true,
  });
  return result.isConfirmed;
}

/**
 * Confirmation dialog for any action
 */
export async function confirm(title: string, message: string, confirmText: string = 'Confirm'): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    allowOutsideClick: false,
    allowEscapeKey: true,
  });
  return result.isConfirmed;
}

/**
 * Success notification
 */
export function notifySuccess(message: string = 'Success!', options?: any) {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    ...options,
  });
}

/**
 * Error notification
 */
export function notifyError(message: string = 'Something went wrong', options?: any) {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    ...options,
  });
}

/**
 * Info notification
 */
export function notifyInfo(message: string = 'Info', options?: any) {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    ...options,
  });
}

/**
 * Loading toast
 */
export function notifyLoading(message: string = 'Loading...') {
  return toast.loading(message, {
    position: 'top-right',
  });
}

/**
 * Update existing toast
 */
export function updateToast(toastId: string, message: string, type: 'success' | 'error' | 'info' = 'success') {
  if (type === 'success') {
    toast.success(message, { id: toastId });
  } else if (type === 'error') {
    toast.error(message, { id: toastId });
  } else {
    toast(message, { id: toastId });
  }
}

/**
 * Success alert with action
 */
export async function successAlert(title: string = 'Success!', message?: string) {
  return Swal.fire({
    title,
    text: message,
    icon: 'success',
    confirmButtonColor: '#10b981',
    confirmButtonText: 'OK',
    allowOutsideClick: false,
    timer: 2000,
    timerProgressBar: true,
  });
}

/**
 * Error alert with action
 */
export async function errorAlert(title: string = 'Error', message?: string) {
  return Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'OK',
    allowOutsideClick: false,
  });
}
