import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Modal, FlatList
} from 'react-native';
import BASE_URL from '../config';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'A1B+', 'AB-', 'A1B-'];

export default function RegisterScreen({ navigation }) {
  const [bloodGroup, setBloodGroup] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleRegister = async () => {
    if (!bloodGroup || !fullName || !phone || !password || !city || !state || !zipCode) {
      Alert.alert('Incomplete', 'Please fill in all details (including Zip Code) to proceed.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bloodGroup, fullName, phone, password, city, state, zipCode }),
      });
      if (res.ok) {
        Alert.alert('Welcome Hero! 🎉', 'Your registration is successful.', [
          { text: 'Login Now', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Registration Error', 'This phone number might already be registered.');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection failed.');
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
             <Text style={s.welcomeText}>Join the mission</Text>
             <Text style={s.title}>Create Account</Text>
          </View>

          <View style={s.form}>
            <View style={s.inputBox}>
              <Text style={s.label}>FULL NAME</Text>
              <TextInput style={s.input} placeholder="John Doe" value={fullName} onChangeText={setFullName} />
            </View>

            <View style={[s.inputBox, { marginTop: 20 }]}>
              <Text style={s.label}>BLOOD GROUP</Text>
              <TouchableOpacity onPress={() => setShowPicker(true)} style={s.pickerTrigger}>
                <Text style={bloodGroup ? s.pickerText : s.pickerPlaceholder}>
                  {bloodGroup || 'Select Blood Group'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[s.inputBox, { marginTop: 20 }]}>
              <Text style={s.label}>PHONE NUMBER</Text>
              <TextInput style={s.input} placeholder="10-digit number" keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} />
            </View>

            <View style={[s.inputBox, { marginTop: 20 }]}>
              <Text style={s.label}>PASSWORD</Text>
              <TextInput style={s.input} placeholder="Create secure password" secureTextEntry value={password} onChangeText={setPassword} />
            </View>

            <View style={s.row}>
               <View style={[s.inputBox, { flex: 1, marginRight: 10, marginTop: 20 }]}>
                 <Text style={s.label}>CITY</Text>
                 <TextInput style={s.input} placeholder="City" value={city} onChangeText={setCity} />
               </View>
               <View style={[s.inputBox, { flex: 1, marginLeft: 10, marginTop: 20 }]}>
                 <Text style={s.label}>STATE</Text>
                 <TextInput style={s.input} placeholder="State" value={state} onChangeText={setState} />
               </View>
            </View>

            <View style={[s.inputBox, { marginTop: 20 }]}>
              <Text style={s.label}>ZIP CODE (PINCODE)</Text>
              <TextInput style={s.input} placeholder="e.g. 600001" keyboardType="number-pad" value={zipCode} onChangeText={setZipCode} maxLength={6} />
            </View>

            <TouchableOpacity style={s.regBtn} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.regBtnText}>Create Account →</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={s.loginLink} onPress={() => navigation.navigate('Login')}>
              <Text style={s.loginLinkText}>Already have an account? <Text style={s.loginLinkBold}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Choose your blood type</Text>
            <FlatList
              data={BLOOD_GROUPS}
              numColumns={3}
              keyExtractor={i => i}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[s.groupItem, bloodGroup === item && s.groupItemActive]}
                  onPress={() => { setBloodGroup(item); setShowPicker(false); }}
                >
                  <Text style={[s.groupText, bloodGroup === item && s.groupTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 30, paddingBottom: 50 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 20, fontWeight: 'bold' },
  headerWrap: { marginBottom: 30 },
  welcomeText: { fontSize: 16, color: '#aaa', fontWeight: '600' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a', marginTop: 5 },
  form: { width: '100%' },
  inputBox: { borderBottomWidth: 2, borderBottomColor: '#f0f0f0', paddingBottom: 5 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#cc0000', letterSpacing: 1 },
  input: { fontSize: 16, marginTop: 10, fontWeight: '600', color: '#333' },
  pickerTrigger: { paddingVertical: 10 },
  pickerText: { fontSize: 16, fontWeight: 'bold', color: '#cc0000' },
  pickerPlaceholder: { fontSize: 16, color: '#ccc' },
  row: { flexDirection: 'row' },
  regBtn: { backgroundColor: '#cc0000', padding: 20, borderRadius: 20, marginTop: 40, alignItems: 'center', elevation: 8 },
  regBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loginLink: { marginTop: 25, alignItems: 'center' },
  loginLinkText: { color: '#aaa', fontSize: 13 },
  loginLinkBold: { color: '#cc0000', fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, maxHeight: 400 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  groupItem: { flex: 1, margin: 5, paddingVertical: 15, backgroundColor: '#f5f5f5', borderRadius: 15, alignItems: 'center' },
  groupItemActive: { backgroundColor: '#cc0000' },
  groupText: { fontWeight: 'bold', color: '#333' },
  groupTextActive: { color: '#fff' },
});
