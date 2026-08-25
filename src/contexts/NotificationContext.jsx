import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((event, data) => {
    const id = Date.now() + Math.random();
    let type = 'info';
    let title = 'Update';
    let message = '';

    switch (event) {
      case 'new_order':
        type = 'success';
        title = 'New Order';
        message = `Order ${data.orderId} placed by ${data.customer?.name || 'Customer'}`;
        break;
      case 'payment_success':
        type = 'success';
        title = 'Payment Successful';
        message = `Payment confirmed for order ${data.orderId}`;
        break;
      case 'payment_failed':
        type = 'error';
        title = 'Payment Failed';
        message = `Payment failed for order ${data.orderId}`;
        break;
      case 'payment_pending':
        type = 'warning';
        title = 'Payment Pending';
        message = `Payment verification pending for order ${data.orderId}`;
        break;
      case 'email_dispatched':
        type = 'success';
        title = 'Email Dispatched';
        message = `Delivery email sent to ${data.recipient} for order ${data.orderId}`;
        break;
      case 'batch_email_dispatched':
        type = 'success';
        title = 'Batch Email Dispatch';
        message = `${data.successCount} emails sent, ${data.failCount} failed`;
        break;
      case 'new_subscriber':
        type = 'success';
        title = 'New Subscriber';
        message = `${data.email} subscribed to newsletter`;
        break;
      case 'subscriber_resubscribed':
        type = 'info';
        title = 'Subscriber Resubscribed';
        message = `${data.email} resubscribed`;
        break;
      case 'subscriber_removed':
        type = 'warning';
        title = 'Subscriber Removed';
        message = `${data.email} removed (${data.total} remaining)`;
        break;
      case 'new_contact':
        type = 'info';
        title = `New ${data.type === 'maintenance' ? 'Maintenance' : 'Website'} Inquiry`;
        message = `From ${data.name} (${data.email})`;
        break;
      case 'product_created':
        type = 'success';
        title = 'Product Added';
        message = `${data.product?.name || 'New product'} added to store`;
        break;
      case 'product_updated':
        type = 'info';
        title = 'Product Updated';
        message = `${data.product?.name || 'Product'} updated`;
        break;
      case 'product_deleted':
        type = 'warning';
        title = 'Product Deleted';
        message = `${data.name || 'Product'} removed`;
        break;
      case 'category_created':
        type = 'success';
        title = 'Category Added';
        message = `${data.category?.name || 'New category'} created`;
        break;
      case 'category_updated':
        type = 'info';
        title = 'Category Updated';
        message = `${data.category?.name || 'Category'} updated`;
        break;
      case 'category_deleted':
        type = 'warning';
        title = 'Category Deleted';
        message = `${data.name || 'Category'} removed`;
        break;
      case 'portfolio_created':
        type = 'success';
        title = 'Portfolio Added';
        message = `New portfolio item added`;
        break;
      case 'portfolio_updated':
        type = 'info';
        title = 'Portfolio Updated';
        message = `Portfolio item updated`;
        break;
      case 'portfolio_deleted':
        type = 'warning';
        title = 'Portfolio Removed';
        message = `Portfolio item removed`;
        break;
      case 'content_updated':
        type = 'info';
        title = 'Content Updated';
        message = `Section "${data.section}" updated`;
        break;
      case 'content_deleted':
        type = 'warning';
        title = 'Content Cleared';
        message = `Section "${data.section}" cleared`;
        break;
      case 'stats_updated':
        type = 'info';
        title = 'Stats Updated';
        message = 'Homepage stats have been updated';
        break;
      default:
        message = JSON.stringify(data);
    }

    const notification = { id, event, type, title, message, data, timestamp: new Date() };
    setNotifications(prev => [notification, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);

    return notification;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
