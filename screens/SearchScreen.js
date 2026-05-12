import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator,
  Modal, FlatList, Dimensions
} from 'react-native';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';

const { width } = Dimensions.get('window');
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'A1B+', 'AB-', 'A1B-'];

let socket = null;

export default function SearchScreen({ navigation }) {
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    socket = io(BASE_URL);
    AsyncStorage.getItem('donorInfo').then(data => {
      if (data) setCurrentUser(JSON.parse(data));
    });
    return () => socket.disconnect();
  }, []);

  const handleSearch = async () => {
    if (!bloodGroup) {
      Alert.alert('Selection Required', 'Please choose a blood group first.');
      return;
    }
    setLoading(true);
    try {
      let url = `${BASE_URL}/api/donors/search?bloodGroup=${bloodGroup}`;
      if (city) url += `&city=${city}`;
      if (zipCode) url += `&zipCode=${zipCode}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setDonors(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to connect to server.');
    }
    setLoading(false);
  };

  const initiateCall = (targetDonor) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'You must be logged in to request blood.');
      return;
    }

    Alert.alert(
      'Confirm Request',
      `Send an urgent blood request to ${targetDonor.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Request', 
          onPress: () => {
            socket.emit('startCall', {
              to: targetDonor.phone,
              callerName: currentUser.fullName,
              callerPhone: currentUser.phone
            });
            Alert.alert('Request Sent', 'Waiting for donor to respond...');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Premium Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Find Donors</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Search Card */}
        <View style={s.searchCard}>
          <Text style={s.searchLabel}>Select Blood Type</Text>
          <TouchableOpacity style={s.pickerTrigger} onPress={() => setShowPicker(true)}>
            <Text style={bloodGroup ? s.pickerText : s.pickerPlaceholder}>
              {bloodGroup || 'Select Group'}
            </Text>
            <Text style={s.pickerArrow}>▼</Text>
          </TouchableOpacity>

          <Text style={[s.searchLabel, { marginTop: 15 }]}>Enter City (Optional)</Text>
          <TextInput 
            style={s.input} 
            placeholder="e.g. Chennai" 
            value={city} 
            onChangeText={setCity} 
          />

          <Text style={[s.searchLabel, { marginTop: 15 }]}>Enter Zip Code (Optional)</Text>
          <TextInput 
            style={s.input} 
            placeholder="e.g. 600001" 
            keyboardType="number-pad"
            value={zipCode} 
            onChangeText={setZipCode} 
            maxLength={6}
          />

          <TouchableOpacity style={s.searchBtn} onPress={handleSearch} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.searchBtnText}>Search Heroes</Text>}
          </TouchableOpacity>
        </View>

        {/* Results Feed */}
        <View style={s.resultsHeader}>
           <Text style={s.resultsTitle}>{donors.length > 0 ? 'Nearby Donors' : 'Search results will appear here'}</Text>
        </View>

        {donors.map((donor, idx) => (
          <View key={idx} style={s.donorCard}>
            <View style={s.donorInfo}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{donor.fullName[0]}</Text>
              </View>
              <View style={{ marginLeft: 15 }}>
                <Text style={s.donorName}>{donor.fullName}</Text>
                <Text style={s.donorLoc}>📍 {donor.city}</Text>
              </View>
              <View style={s.bloodBadge}>
                <Text style={s.bloodText}>{donor.bloodGroup}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={s.callBtn} onPress={() => initiateCall(donor)}>
               <Text style={s.callBtnText}>📞 Call Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Blood Group Picker Modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Choose Blood Group</Text>
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
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  backText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },

  content: { padding: 20 },
  searchCard: { backgroundColor: '#f9f9f9', padding: 20, borderRadius: 25, borderWidth: 1, borderColor: '#f0f0f0' },
  searchLabel: { fontSize: 12, fontWeight: 'bold', color: '#888', marginBottom: 8, marginLeft: 5 },
  pickerTrigger: { backgroundColor: '#fff', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  pickerText: { fontWeight: 'bold', color: '#cc0000' },
  pickerPlaceholder: { color: '#ccc' },
  pickerArrow: { fontSize: 10, color: '#aaa' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#eee', fontWeight: 'bold' },
  searchBtn: { backgroundColor: '#cc0000', padding: 18, borderRadius: 15, marginTop: 20, alignItems: 'center', elevation: 5 },
  searchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  resultsHeader: { marginTop: 30, marginBottom: 15 },
  resultsTitle: { fontSize: 16, fontWeight: 'bold', color: '#555' },

  donorCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#f4f4f4', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  donorInfo: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ffebee', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#cc0000', fontWeight: 'bold', fontSize: 18 },
  donorName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  donorLoc: { fontSize: 12, color: '#aaa', marginTop: 2 },
  bloodBadge: { position: 'absolute', right: 0, top: 5, backgroundColor: '#cc0000', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  bloodText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  callBtn: { backgroundColor: '#28a745', padding: 12, borderRadius: 12, marginTop: 15, alignItems: 'center' },
  callBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, maxHeight: 400 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  groupItem: { flex: 1, margin: 5, paddingVertical: 15, backgroundColor: '#f5f5f5', borderRadius: 15, alignItems: 'center' },
  groupItemActive: { backgroundColor: '#cc0000' },
  groupText: { fontWeight: 'bold', color: '#333' },
  groupTextActive: { color: '#fff' },
});
