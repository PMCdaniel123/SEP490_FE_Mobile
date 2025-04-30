import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LocationBanner = () => {
  return (
    <TouchableOpacity style={styles.locationBanner}>
      <Icon name="location-on" size={24} color="#000" style={styles.locationIcon} />
      <Text style={styles.locationText}>
        Bạn hãy cho phép truy cập vị trị để có thể tìm kiếm địa điểm gần nhất nhé!
        <Text style={{ fontWeight: 'bold' }}> (Bật GPS)</Text>
      </Text>
      <Icon name="chevron-right" size={24} color="#000" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6D5B8',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
});

export default LocationBanner;