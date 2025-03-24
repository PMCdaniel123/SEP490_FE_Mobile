import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const HighRatedSpaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the API using Axios
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await axios.get('https://localhost:5050/users/searchbyrate');
        setWorkspaces(response.data.workspaces);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#470101" />
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Không gian được đánh giá cao</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {workspaces.map((workspace) => (
          <TouchableOpacity key={workspace.id} style={styles.spaceCard}>
            <Image source={{ uri: workspace.images[0]?.imgUrl }} style={styles.spaceImage} />
            <TouchableOpacity style={styles.favoriteButton}>
              <Icon name="favorite-border" size={20} color="#FF5A5F" />
            </TouchableOpacity>
            <View style={styles.spaceInfo}>
              <Text style={styles.spaceName}>{workspace.name}</Text>
              <Text style={styles.spaceLocation}>{workspace.address}</Text>
              <View style={styles.priceRatingContainer}>
                <Text style={styles.spacePrice}>
                  {workspace.prices[0]?.price}k/{workspace.prices[0]?.category}
                </Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{workspace.rate}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#B25F00',
    fontWeight: '500',
  },
  spaceCard: {
    width: 250,
    marginLeft: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  spaceImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
  },
  spaceInfo: {
    padding: 12,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  spaceLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacePrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HighRatedSpaces;