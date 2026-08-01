import toast from 'react-hot-toast';

const successToast = (message, options = {}) => toast.success(message, options);
const errorToast = (message, options = {}) => toast.error(message, options);
const infoToast = (message, options = {}) => toast(message, { ...options, icon: options.icon });

export { successToast, errorToast, infoToast };
export default toast;
