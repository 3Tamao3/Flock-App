import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { login } from '../api/auth';
import { saveToken } from '../utils/storage';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/themes';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await login(email, password);
      await saveToken(res.data.access_token);
      navigation.replace('Main');
    } catch {
      Alert.alert('Login failed', 'Invalid email or password');
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Flock-App </Text>
      <Text style={s.subtitle}>Login</Text>
      <TextInput
        style={s.input}
        placeholder="Email"
        placeholderTextColor={theme.placeholder}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={s.input}
        placeholder="Password"
        placeholderTextColor={theme.placeholder}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={s.button} onPress={handleLogin}>
        <Text style={s.buttonText}>Login</Text>
      </TouchableOpacity>
      <Text style={s.link} onPress={() => navigation.navigate('Register')}>
        Register here!
      </Text>
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.background },
    title: { fontSize: 36, fontWeight: 'bold', marginBottom: 8, color: theme.primary, textAlign: 'center' },
    subtitle: { fontSize: 16, color: theme.subtext, marginBottom: 32, textAlign: 'center' },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      color: theme.text,
      backgroundColor: theme.inputBackground,
    },
    button: { backgroundColor: theme.primary, borderRadius: 8, padding: 14, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    link: { marginTop: 16, textAlign: 'center', color: theme.primary },
  });
}
