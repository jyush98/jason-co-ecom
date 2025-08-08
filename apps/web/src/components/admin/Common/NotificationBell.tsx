"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  DollarSign,
  Users,
  X,
  Clock,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

// Types for notifications
export interface Notification {
  id: string;
  type: 'order' | 'inventory' | 'customer' | 'system' | 'revenue';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationBellProps {
  className?: string;
  maxVisible?: number;
  enableSound?: boolean;
  enableRealtime?: boolean;
}

export default function NotificationBell({
  className = "",
  maxVisible = 5,
  enableSound = true,
  enableRealtime = true
}: NotificationBellProps) {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Calculate unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Set up real-time notifications (WebSocket or polling)
  useEffect(() => {
    if (!enableRealtime) return;

    // For now, we'll use polling - in production you'd use WebSocket
    const interval = setInterval(() => {
      fetchNotifications(true); // Silent fetch for real-time updates
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [enableRealtime]);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async (silent = false) => {
    if (!silent) setIsLoading(true);

    try {
      const token = await getToken();
      const response = await fetch('/api/admin/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      const newNotifications = data.notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));

      // Check for new notifications to play sound
      if (silent && enableSound) {
        const oldIds = new Set(notifications.map(n => n.id));
        const hasNewNotifications = newNotifications.some((n: Notification) => !oldIds.has(n.id));
        
        if (hasNewNotifications && audioRef.current) {
          audioRef.current.play().catch(() => {
            // Sound play failed, ignore
          });
        }
      }

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = await getToken();
      await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await getToken();
      await fetch('/api/admin/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = await getToken();
      await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart size={16} className="text-blue-500" />;
      case 'inventory':
        return <Package size={16} className="text-orange-500" />;
      case 'customer':
        return <Users size={16} className="text-green-500" />;
      case 'revenue':
        return <DollarSign size={16} className="text-gold" />;
      case 'system':
      default:
        return <AlertTriangle size={16} className="text-red-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Group notifications by priority for display
  const sortedNotifications = [...notifications]
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    })
    .slice(0, maxVisible);

  return (
    <div ref={bellRef} className={`relative ${className}`}>
      {/* Notification Sound */}
      <audio
        ref={audioRef}
        preload="auto"
        src="/sounds/notification.mp3" // You'll need to add this sound file
      />

      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gold dark:hover:text-gold transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 5 }}
        >
          <Bell size={20} />
        </motion.div>

        {/* Unread Count Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-tight"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-black dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-gold hover:text-gold/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sortedNotifications.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.read 
                                ? 'text-black dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                              <Clock size={10} />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            
                            {notification.actionUrl && (
                              <span className="text-xs text-gold flex items-center gap-1">
                                View
                                <ChevronRight size={10} />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                  <Bell size={48} className="mb-4 opacity-50" />
                  <p className="text-sm text-center">
                    No notifications yet
                  </p>
                  <p className="text-xs text-center mt-1">
                    You'll see important updates here
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {sortedNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <button
                  onClick={() => {
                    window.location.href = '/admin/notifications';
                    setIsOpen(false);
                  }}
                  className="w-full text-sm text-gold hover:text-gold/80 transition-colors text-center"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for notification management
export function useNotifications() {
  const { getToken } = useAuth();

  const createNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...notification,
          timestamp: new Date().toISOString(),
          read: false
        }),
      });

      if (!response.ok) throw new Error('Failed to create notification');

      return await response.json();
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  };

  const getNotificationStats = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/admin/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch notification stats');

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
      throw error;
    }
  };

  return {
    createNotification,
    getNotificationStats
  };
}

// Notification priority helper
export const NotificationPriority = {
  CRITICAL: 'critical' as const,
  HIGH: 'high' as const,
  MEDIUM: 'medium' as const,
  LOW: 'low' as const,
};

// Notification type helper
export const NotificationType = {
  ORDER: 'order' as const,
  INVENTORY: 'inventory' as const,
  CUSTOMER: 'customer' as const,
  REVENUE: 'revenue' as const,
  SYSTEM: 'system' as const,
};

// TODO: Delete after
// Example notification creators
export const createOrderNotification = (orderNumber: string, customerName: string) => ({
  type: NotificationType.ORDER,
  title: 'New Order Received',
  message: `Order ${orderNumber} from ${customerName}`,
  priority: NotificationPriority.HIGH,
  actionUrl: `/admin/orders?search=${orderNumber}`,
  metadata: { orderNumber, customerName }
});

export const createLowStockNotification = (productName: string, currentStock: number) => ({
  type: NotificationType.INVENTORY,
  title: 'Low Stock Alert',
  message: `${productName} is running low (${currentStock} remaining)`,
  priority: NotificationPriority.MEDIUM,
  actionUrl: '/admin/inventory',
  metadata: { productName, currentStock }
});

export const createCustomerInquiry = (customerEmail: string, subject: string) => ({
  type: NotificationType.CUSTOMER,
  title: 'Customer Inquiry',
  message: `New message from ${customerEmail}: ${subject}`,
  priority: NotificationPriority.MEDIUM,
  actionUrl: `/admin/customers?search=${customerEmail}`,
  metadata: { customerEmail, subject }
});