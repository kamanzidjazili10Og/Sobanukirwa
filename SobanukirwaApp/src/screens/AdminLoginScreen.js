import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Animated,
  KeyboardAvoidingView, Platform, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
        ])
      ),
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
    <ImageBackground source={require('../../assets/bg-home.jpg')} style={styles.bgImage} resizeMode="cover">
      <LinearGradient
        colors={['rgba(11,26,42,0.92)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            {/* Back button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Shield Icon with Glow */}
            <View style={styles.iconCenter}>
              <Animated.View style={[styles.iconGlow, { opacity: glowAnim }]} />
              <View style={styles.iconWrap}>
                <View style={styles.iconInner}>
                  <Ionicons name="shield-checkmark" size={48} color="#14B8A6" />
                </View>
              </View>
            </View>

            <Text style={styles.title}>Admin Access</Text>
            <Text style={styles.subtitle}>
              Enter the admin password to manage content
            </Text>

            {/* Decorative Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerDot} />
              <View style={styles.dividerLine} />
            </View>

            {/* Password Input */}
            <Animated.View style={[styles.inputWrap, { borderColor: error ? '#EF4444' : 'rgba(255,255,255,0.15)', transform: [{ translateX: shakeAnim }] }]}>
              <Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter admin password"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onSubmitEditing={handleLogin}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="rgba(255,255,255,0.4)" />
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
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#0D5C56', '#0F766E'] : ['#14B8A6', '#0F766E']}
                style={styles.loginBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <Ionicons name="sync" size={20} color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="log-in" size={20} color="#FFFFFF" />
                    <Text style={styles.loginBtnText}>Enter Admin Panel</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={18} color="#5EEAD4" />
              <Text style={styles.infoText}>
                Admin access allows you to manage tracks, videos, books, categories, adhkar, and more.
              </Text>
            </View>

            {/* Footer Branding */}
            <View style={styles.brandRow}>
              <View style={styles.brandLine} />
              <Text style={styles.brandText}>Sobanukirwa</Text>
              <View style={styles.brandLine} />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: { flex: 1, backgroundColor: 'transparent' },
  flex: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  backBtn: {
    position: 'absolute', top: 16, left: 24,
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconCenter: { alignItems: 'center', position: 'relative' },
  iconGlow: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(20,184,166,0.1)',
  },
  iconWrap: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 3,
    borderColor: '#14B8A6', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0F766E', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 12,
  },
  iconInner: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,118,110,0.15)' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', color: '#FFFFFF', fontFamily: 'serif' },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 4, color: 'rgba(255,255,255,0.5)' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  dividerLine: { width: 40, height: 1.5, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  dividerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#14B8A6' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 16,
    paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.06)', height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, color: '#FFFFFF' },
  eyeBtn: { padding: 4 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  errorText: { fontSize: 13, color: '#EF4444', fontWeight: '500' },
  loginBtn: {
    borderRadius: 16, overflow: 'hidden', marginTop: 8,
    shadowColor: '#0F766E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  loginBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16, borderRadius: 16,
  },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 14, borderRadius: 14, borderWidth: 1,
    backgroundColor: 'rgba(94,234,212,0.06)', borderColor: 'rgba(94,234,212,0.15)', marginTop: 12,
  },
  infoText: { fontSize: 12, flex: 1, lineHeight: 18, color: 'rgba(255,255,255,0.5)' },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20 },
  brandLine: { width: 30, height: 1.5, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  brandText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },
});
