import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeName } from '../theme/themes';

type Profile = { username: string; email: string };

const THEME_OPTIONS: { name: ThemeName; label: string; color: string }[] = [
  { name: 'light', label: 'Light', color: '#FFFFFF' },
  { name: 'dark', label: 'Dark', color: '#1E1E1E' },
  { name: 'darkBlue', label: 'Dark Blue', color: '#1B2838' },
  { name: 'green', label: 'Green', color: '#22C55E' },
  { name: 'purple', label: 'Purple', color: '#A855F7' },
  { name: 'black_and_red', label: 'Black & Red', color: '#EF4444' },
  { name: 'black_and_yellow', label: 'Black & Yellow', color: '#EAB308' },
];

export default function ProfileScreen() {
  const { theme, themeName, setTheme } = useTheme();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    client.get('/users/me')
      .then((res) => {
        setProfile(res.data);
        setUsername(res.data.username);
        setEmail(res.data.email);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveChanges = async () => {
    const hasChanges =
      username !== profile?.username ||
      email !== profile?.email ||
      password.length > 0;

    if (!hasChanges) {
      Alert.alert('No changes', 'No changes to save');
      return;
    }

    setSaving(true);
    const body: Record<string, string> = {};
    if (username !== profile?.username) body.username = username;
    if (email !== profile?.email) body.email = email;
    if (password) body.password = password;

    try {
      const res = await client.patch('/users/me', body);
      setProfile(res.data);
      setPassword('');
      Alert.alert('Success', 'Profile updated!');
    } catch (e: any) {
      const msg = e.response?.data?.message;
      Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled">

        <View style={styles.avatar}>
          <Ionicons name="person-circle-outline" size={72} color={theme.primary} />
          <Text style={[styles.avatarName, { color: theme.text }]}>{profile?.username}</Text>
          <Text style={[styles.avatarEmail, { color: theme.subtext }]}>{profile?.email}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <TouchableOpacity style={styles.themeRow} onPress={() => setShowThemePicker(true)}>
            <Ionicons name="color-palette-outline" size={20} color={theme.primary} style={{ marginRight: 10 }} />
            <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 0, flex: 1 }]}>Theme</Text>
            <Text style={{ color: theme.subtext, fontSize: 13 }}>{THEME_OPTIONS.find(t => t.name === themeName)?.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.subtext} />
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Account Info</Text>

          <Text style={[styles.label, { color: theme.subtext }]}>USERNAME</Text>
          <TextInput
            style={[styles.fieldInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor={theme.placeholder}
          />

          <Text style={[styles.label, { color: theme.subtext }]}>EMAIL</Text>
          <TextInput
            style={[styles.fieldInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={theme.placeholder}
          />

          <Text style={[styles.label, { color: theme.subtext }]}>NEW PASSWORD</Text>
          <TextInput
            style={[styles.fieldInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Leave blank to keep current"
            placeholderTextColor={theme.placeholder}
          />

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            onPress={saveChanges}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Modal visible={showThemePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Theme</Text>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.name}
                style={styles.themeOption}
                onPress={() => { setTheme(opt.name); setShowThemePicker(false); }}
              >
                <View style={[styles.colorDot, { backgroundColor: opt.color, borderColor: theme.border }]} />
                <Text style={[styles.themeLabel, { color: theme.text }]}>{opt.label}</Text>
                {themeName === opt.name && <Ionicons name="checkmark" size={18} color={theme.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowThemePicker(false)}>
              <Text style={{ color: theme.subtext }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 48 },
  avatar: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatarName: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  avatarEmail: { fontSize: 14, marginTop: 2 },
  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  themeRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '600', marginBottom: 4, marginTop: 8, textTransform: 'uppercase' },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 4,
  },
  saveBtn: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  themeOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  colorDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, marginRight: 14 },
  themeLabel: { flex: 1, fontSize: 15 },
  closeBtn: { alignItems: 'center', marginTop: 16 },
});
