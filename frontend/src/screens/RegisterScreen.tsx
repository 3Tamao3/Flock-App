import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { register } from '../api/auth';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/themes';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await register(username, email, password);
      Alert.alert('Success', 'Account created! Please log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e: any) {
      const msg = e.response?.data?.message;
      Alert.alert('Registration failed', Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Something went wrong'));
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Create Account</Text>
      <TextInput
        style={s.input}
        placeholder="Username"
        placeholderTextColor={theme.placeholder}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
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
      <TouchableOpacity style={s.button} onPress={handleRegister}>
        <Text style={s.buttonText}>Register</Text>
      </TouchableOpacity>
      <Text style={s.link} onPress={() => navigation.navigate('Login')}>
        Login here!
      </Text>
    </View>
  );
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.background },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: theme.text },
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
