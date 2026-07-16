import React, { useState, Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import { ToastProvider } from './src/components/Toast';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/screens/LoadingScreen';

try {
  const Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{this.state.error?.message || 'Unknown error'}</Text>
          <Text style={styles.errorText}>{this.state.error?.stack || ''}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F8FAFC" />
      <ErrorBoundary>
        <AppProvider>
          <ToastProvider>
            <NavigationContainer>
              {!loading && <AppNavigator />}
              {loading && <LoadingScreen onFinish={() => setLoading(false)} />}
            </NavigationContainer>
          </ToastProvider>
        </AppProvider>
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
});
