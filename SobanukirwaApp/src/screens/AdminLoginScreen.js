import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Animated,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const ADMIN_PASSWORD = 'Kamanzi@123';

export default function AdminLoginScreen({ navigation }) {
  const { COLORS } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  function shakeInput() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  function handleLogin() {
    if (!password.trim()) {
      setError('Please enter the admin password');
      shakeInput();
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setError('');
        navigation.replace('AdminDashboard');
      } else {
        setError('Invalid password. Access denied.');
        shakeInput();
        setLoading(false);
      }
    }, 500);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Back button */}
          <TouchableOpacity style={[styles.backBtn, { borderColor: COLORS.border }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Shield Icon */}
          <View style={[styles.iconWrap, { borderColor: COLORS.secondary }]}>
            <View style={[styles.iconInner, { backgroundColor: 'rgba(15,118,110,0.12)' }]}>
              <Ionicons name="shield-checkmark" size={48} color={COLORS.secondary} />
            </View>
          </View>

          <Text style={[styles.title, { color: COLORS.secondary }]}>Admin Access</Text>
          <Text style={[styles.subtitle, { color: COLORS.textMuted }]}>
            Enter the admin password to manage content
          </Text>

          {/* Password Input */}
          <Animated.View style={[styles.inputWrap, { borderColor: error ? '#EF4444' : COLORS.border, transform: [{ translateX: shakeAnim }] }]}>
            <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: COLORS.text }]}
              placeholder="Enter admin password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </Animated.View>

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: loading ? COLORS.secondaryDark : COLORS.secondary }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Ionicons name="sync" size={20} color={COLORS.primaryDark} />
            ) : (
              <>
                <Ionicons name="log-in" size={20} color={COLORS.primaryDark} />
                <Text style={[styles.loginBtnText, { color: COLORS.primaryDark }]}>Enter Admin Panel</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View style={[styles.infoCard, { backgroundColor: 'rgba(15,118,110,0.06)', borderColor: 'rgba(15,118,110,0.2)' }]}>
            <Ionicons name="information-circle" size={16} color={COLORS.secondary} />
            <Text style={[styles.infoText, { color: COLORS.textMuted }]}>
              Admin access allows you to manage tracks, videos, books, categories, adhkar, and more.
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  backBtn: {
    position: 'absolute', top: 16, left: 24,
    width: 40, height: 40, borderRadius: 20, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(229,231,235,0.5)',
  },
  iconWrap: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 3,
    alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0F766E', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  iconInner: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', fontFamily: 'serif' },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 16,
    paddingHorizontal: 16, backgroundColor: 'rgba(229,231,235,0.5)', height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  eyeBtn: { padding: 4 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  errorText: { fontSize: 13, color: '#EF4444', fontWeight: '500' },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16, borderRadius: 16, marginTop: 8,
    shadowColor: '#0F766E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  loginBtnText: { fontSize: 16, fontWeight: '700' },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 12,
  },
  infoText: { fontSize: 12, flex: 1, lineHeight: 18 },
});
