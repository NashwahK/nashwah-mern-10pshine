import { useNotification } from '../contexts/NotificationContext.jsx';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function Snackbar() {
  const { notifications, removeNotification } = useNotification();

  const getTypeStyles = (type) => {
    const styles = {
      success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
      error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
    };
    return styles[type] || styles.info;
  };

  const getIcon = (type) => {
    const iconProps = { size: 20 };
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <AlertCircle {...iconProps} />;
      case 'warning':
        return <AlertCircle {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg border animate-slideIn shadow-lg backdrop-blur-sm ${getTypeStyles(
            notification.type
          )}`}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 text-current hover:opacity-75 transition-opacity"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
