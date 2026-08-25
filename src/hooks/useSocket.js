import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
}

export function useSocket(token, onNotification) {
  const socketRef = useRef(null);
  const callbacksRef = useRef(onNotification);

  useEffect(() => {
    callbacksRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!token) return;

    const sock = getSocket();
    socketRef.current = sock;

    const handleConnect = () => {
      sock.auth = { token };
      sock.connect();
    };

    const handleConnectError = (err) => {
      console.error('[Socket] Connection error:', err.message);
    };

    const handleDisconnect = (reason) => {
      console.log('[Socket] Disconnected:', reason);
    };

    const handleNotification = (event, data) => {
      if (callbacksRef.current) {
        callbacksRef.current(event, data);
      }
    };

    sock.on('connect', handleConnect);
    sock.on('connect_error', handleConnectError);
    sock.on('disconnect', handleDisconnect);

    sock.on('new_order', (data) => handleNotification('new_order', data));
    sock.on('payment_success', (data) => handleNotification('payment_success', data));
    sock.on('payment_failed', (data) => handleNotification('payment_failed', data));
    sock.on('payment_pending', (data) => handleNotification('payment_pending', data));
    sock.on('email_dispatched', (data) => handleNotification('email_dispatched', data));
    sock.on('batch_email_dispatched', (data) => handleNotification('batch_email_dispatched', data));
    sock.on('new_subscriber', (data) => handleNotification('new_subscriber', data));
    sock.on('subscriber_resubscribed', (data) => handleNotification('subscriber_resubscribed', data));
    sock.on('subscriber_removed', (data) => handleNotification('subscriber_removed', data));
    sock.on('new_contact', (data) => handleNotification('new_contact', data));
    sock.on('product_created', (data) => handleNotification('product_created', data));
    sock.on('product_updated', (data) => handleNotification('product_updated', data));
    sock.on('product_deleted', (data) => handleNotification('product_deleted', data));
    sock.on('product_featured_toggled', (data) => handleNotification('product_featured_toggled', data));
    sock.on('category_created', (data) => handleNotification('category_created', data));
    sock.on('category_updated', (data) => handleNotification('category_updated', data));
    sock.on('category_deleted', (data) => handleNotification('category_deleted', data));
    sock.on('portfolio_created', (data) => handleNotification('portfolio_created', data));
    sock.on('portfolio_updated', (data) => handleNotification('portfolio_updated', data));
    sock.on('portfolio_deleted', (data) => handleNotification('portfolio_deleted', data));
    sock.on('content_updated', (data) => handleNotification('content_updated', data));
    sock.on('content_deleted', (data) => handleNotification('content_deleted', data));
    sock.on('stats_updated', (data) => handleNotification('stats_updated', data));

    return () => {
      sock.off('connect', handleConnect);
      sock.off('connect_error', handleConnectError);
      sock.off('disconnect', handleDisconnect);
      sock.off('new_order');
      sock.off('payment_success');
      sock.off('payment_failed');
      sock.off('payment_pending');
      sock.off('email_dispatched');
      sock.off('batch_email_dispatched');
      sock.off('new_subscriber');
      sock.off('subscriber_resubscribed');
      sock.off('subscriber_removed');
      sock.off('new_contact');
      sock.off('product_created');
      sock.off('product_updated');
      sock.off('product_deleted');
      sock.off('product_featured_toggled');
      sock.off('category_created');
      sock.off('category_updated');
      sock.off('category_deleted');
      sock.off('portfolio_created');
      sock.off('portfolio_updated');
      sock.off('portfolio_deleted');
      sock.off('content_updated');
      sock.off('content_deleted');
      sock.off('stats_updated');
      sock.disconnect();
    };
  }, [token]);

  return socketRef.current;
}
