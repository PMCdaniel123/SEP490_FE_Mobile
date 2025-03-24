import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const ProfileDetail = ({ route, navigation }) => {
  const { user: initialUser } = route.params;
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Todo
    setIsEditing(false);
    Alert.alert('Thành công', 'Thông tin của bạn đã được cập nhật');
  };

  const handleChange = (key, value) => {
    setUser(prevUser => ({ ...prevUser, [key]: value }));
  };

  const pickImage = async () => {
    if (!isEditing) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép ứng dụng truy cập thư viện ảnh của bạn.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      handleChange('avatar', result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#835101" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(!isEditing)}>
          <Ionicons name={isEditing ? "checkmark" : "create"} size={24} color="#835101" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          {isEditing && (
            <View style={styles.changePhotoButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={user.name}
            onChangeText={(text) => handleChange('name', text)}
          />
        ) : (
          <Text style={styles.name}>{user.name}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <InfoItem
          icon="mail"
          label="Email"
          value={user.email}
          isEditing={isEditing}
          onChangeText={(text) => handleChange('email', text)}
        />
        <InfoItem
          icon="call"
          label="Điện thoại"
          value={user.phone}
          isEditing={isEditing}
          onChangeText={(text) => handleChange('phone', text)}
        />
        <InfoItem
          icon="location"
          label="Địa chỉ"
          value={user.location}
          isEditing={isEditing}
          onChangeText={(text) => handleChange('location', text)}
        />
        <InfoItem
          icon="calendar"
          label="Ngày sinh"
          value={user.dateOfBirth}
          isEditing={isEditing}
          onChangeText={(text) => handleChange('dateOfBirth', text)}
        />
        <InfoItem
          icon="person"
          label="Giới tính"
          value={user.sex}
          isEditing={isEditing}
          onChangeText={(text) => handleChange('sex', text)}
        />
      </View>
      {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const InfoItem = ({ icon, label, value, isEditing, onChangeText }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={24} color="#835101" style={styles.infoIcon} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.infoInput}
          value={value}
          onChangeText={onChangeText}
        />
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  editButton: {
    padding: 10,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoButton: {
    position: 'absolute',
    right: 0,
    bottom: 10,
    backgroundColor: '#835101',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#835101',
    paddingBottom: 5,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoInput: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#835101',
    paddingBottom: 5,
  },
  saveButton: {
    backgroundColor: '#835101',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileDetail;
