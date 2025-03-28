import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReviewItem = ({ item, onEdit, onDelete, onImagePress, fadeAnim }) => {
  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={16}
            color={star <= rating ? "#FFD700" : "#666"}
            style={styles.starIcon}
          />
        ))}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.reviewItem,
        {
          opacity: fadeAnim,
          transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
        },
      ]}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.reviewHeaderLeft}>
          <Text style={styles.workspaceName}>{item.workspace_Name}</Text>
          <Text style={styles.ownerName}>{item.owner_Name}</Text>
          <View style={styles.ratingContainer}>
            {renderStars(item.rate)}
            <Text style={styles.ratingDate}>
              {new Date(item.created_At).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
        <View style={styles.reviewActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(item)}
          >
            <Ionicons name="pencil" size={20} color="#835101" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(item.ratingId)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF0000" />
          </TouchableOpacity>
        </View>
      </View>

      {item.comment ? (
        <Text style={styles.reviewComment}>{item.comment}</Text>
      ) : (
        <Text style={styles.noComment}>Chưa có bình luận</Text>
      )}

      {item.images && item.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
          {item.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onImagePress(image.url)}
            >
              <Image
                source={{ uri: image.url }}
                style={styles.reviewImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  reviewItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewHeaderLeft: {
    flex: 1,
  },
  workspaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  reviewComment: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  noComment: {
    fontStyle: 'italic',
    color: '#666',
    marginVertical: 8,
    fontSize: 14,
  },
  imageScrollView: {
    marginTop: 8,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
});

export default ReviewItem;
