import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Missing Info', 'Please enter both phone and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(BASE_URL + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const result = await res.json();
      if (result.success) {
        await AsyncStorage.setItem('donorInfo', JSON.stringify(result.donor));
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Login Failed', 'Invalid credentials.');
      }
    } catch (err) {
      Alert.alert('Connection Error', 'Check your network and server.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>

          <View style={s.headerWrap}>
            <Text style={s.welcomeText}>Welcome back</Text>
            <Text style={s.title}>Sign in to STF</Text>
          </View>

          <View style={s.form}>
            <View style={s.inputBox}>
              <Text style={s.label}>PHONE NUMBER</Text>
              <TextInput 
                style={s.input} 
                placeholder="10-digit number" 
                keyboardType="phone-pad" 
                value={phone} 
                onChangeText={setPhone} 
                maxLength={10} 
              />
            </View>

            <View style={[s.inputBox, { marginTop: 20 }]}>
              <Text style={s.label}>PASSWORD</Text>
              <TextInput 
                style={s.input} 
                placeholder="Your secure password" 
                secureTextEntry 
                value={password} 
                onChangeText={setPassword} 
              />
            </View>

            <TouchableOpacity style={s.loginBtn} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>Continue →</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={s.regLink} onPress={() => navigation.navigate('Register')}>
              <Text style={s.regLinkText}>New here? <Text style={s.regLinkBold}>Create an account</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 30, flexGrow: 1, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 20, fontWeight: 'bold' },
  headerWrap: { marginBottom: 40 },
  welcomeText: { fontSize: 16, color: '#aaa', fontWeight: '600' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a', marginTop: 5 },
  form: { width: '100%' },
  inputBox: { borderBottomWidth: 2, borderBottomColor: '#f0f0f0', paddingBottom: 10 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#cc0000', letterSpacing: 1 },
  input: { fontSize: 16, marginTop: 10, fontWeight: '600', color: '#333' },
  loginBtn: { backgroundColor: '#cc0000', padding: 20, borderRadius: 20, marginTop: 40, alignItems: 'center', elevation: 8 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  regLink: { marginTop: 25, alignItems: 'center' },
  regLinkText: { color: '#aaa', fontSize: 13 },
  regLinkBold: { color: '#cc0000', fontWeight: 'bold' },
});
