import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const WorkspaceDetail = ({ route, navigation }) => {
  const { workspace } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* Workspace Image */}
      <Image source={{ uri: workspace.images[0]?.imgUrl }} style={styles.image} />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Workspace Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{workspace.name}</Text>
        <View style={styles.locationContainer}>
          <Icon name="location-on" size={16} color="#666" />
          <Text style={styles.location}>{workspace.address}</Text>
        </View>
        <Text style={styles.description}>{workspace.description}</Text>

        {/* Prices */}
        <Text style={styles.sectionTitle}>Giá</Text>
        {workspace.prices.map((price) => (
          <Text key={price.id} style={styles.price}>
            {price.category}: {price.price}đ
          </Text>
        ))}

        {/* Facilities */}
        <Text style={styles.sectionTitle}>Tiện ích</Text>
        {workspace.facilities.map((facility) => (
          <Text key={facility.id} style={styles.facility}>
            - {facility.facilityName}
          </Text>
        ))}

        {/* Policies */}
        <Text style={styles.sectionTitle}>Chính sách</Text>
        {workspace.policies.map((policy) => (
          <Text key={policy.id} style={styles.policy}>
            - {policy.policyName}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  facility: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  policy: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
});

export default WorkspaceDetail;