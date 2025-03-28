import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const EditReviewModal = ({
  visible,
  onClose,
  review,
  updatedRate,
  updatedComment,
  updatedImages,
  onRateChange,
  onCommentChange,
  onImagesChange,
  onSave,
}) => {
  const renderStars = (selectedRate) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRateChange(star)}
          >
            <Ionicons
              name={star <= selectedRate ? "star" : "star-outline"}
              size={32}
              color={star <= selectedRate ? "#FFD700" : "#666"}
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const pickImage = async () => {
    if (updatedImages.length >= 5) {
      Alert.alert("Thông báo", "Bạn chỉ có thể tải lên tối đa 5 ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      onImagesChange([...updatedImages, { url: result.assets[0].uri }]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...updatedImages];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.modalBlurContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chỉnh sửa đánh giá</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="#835101" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
              {renderStars(updatedRate)}
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.sectionTitle}>Bình luận</Text>
              <TextInput
                style={styles.commentInput}
                multiline
                numberOfLines={4}
                value={updatedComment}
                onChangeText={onCommentChange}
                placeholder="Nhập bình luận của bạn..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.imageSection}>
              <View style={styles.imageSectionHeader}>
                <Text style={styles.sectionTitle}>Hình ảnh</Text>
                {updatedImages.length < 5 && (
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={pickImage}
                  >
                    <Ionicons name="add-circle" size={24} color="#835101" />
                    <Text style={styles.addImageText}>Thêm ảnh</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageList}
              >
                {updatedImages.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{ uri: image.url }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF0000" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSave}
            >
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBlurContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalBody: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  ratingSection: {
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#333',
  },
  imageSection: {
    marginBottom: 24,
  },
  imageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addImageText: {
    color: '#835101',
    fontSize: 14,
    fontWeight: '500',
  },
  imageList: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: '#835101',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditReviewModal;
