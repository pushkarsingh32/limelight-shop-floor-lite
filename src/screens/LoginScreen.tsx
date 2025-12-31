import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useStore } from '../store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Operator' | 'Supervisor'>('Operator');
  const login = useStore((state) => state.login);

  const handleLogin = () => {
    if (email.trim()) {
      login(email.trim(), role);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Text style={styles.title}>Shop Floor Lite</Text>
        <Text style={styles.subtitle}>Manufacturing Management</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Select Role</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'Operator' && styles.roleButtonActive,
              ]}
              onPress={() => setRole('Operator')}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === 'Operator' && styles.roleButtonTextActive,
                ]}
              >
                Operator
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'Supervisor' && styles.roleButtonActive,
              ]}
              onPress={() => setRole('Supervisor')}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  role === 'Supervisor' && styles.roleButtonTextActive,
                ]}
              >
                Supervisor
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, !email.trim() && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={!email.trim()}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 48,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#2196F3',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
