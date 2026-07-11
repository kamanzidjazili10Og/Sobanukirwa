import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { Animated, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ToastContext = createContext();

let toastRef = { show: () => {} };

export function useToast() {
  return toastRef;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const show = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev.slice(-2), { id, message, type, anim: new Animated.Value(0) }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, hideAnim: new Animated.Value(1) } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
    }, duration);
  }, []);

  useEffect(() => { toastRef = { show }; }, [show]);

  const icons = { success: 'checkmark-circle', error: 'alert-circle', info: 'information-circle' };
  const colors = { success: '#27ae60', error: '#e74c3c', info: '#d4af37' };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map(toast => (
          <Animated.View
            key={toast.id}
            style={[styles.toast, { borderLeftColor: colors[toast.type] || colors.info },
              { opacity: toast.hideAnim || new Animated.Value(1) }
            ]}
          >
            <Ionicons name={icons[toast.type] || icons.info} size={20} color={colors[toast.type]} />
            <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 60, left: 16, right: 16, zIndex: 10000, gap: 8 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(11,26,42,0.95)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  message: { flex: 1, color: '#f0f4fa', fontSize: 13, fontWeight: '500' },
});
