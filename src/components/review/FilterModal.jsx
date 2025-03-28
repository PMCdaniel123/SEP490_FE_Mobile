import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const FilterModal = ({ visible, onClose, filters, onFiltersChange, onApply, onReset }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.modalBlurContainer}>
        <View style={styles.filterModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lọc đánh giá</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close-circle" size={28} color="#835101" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterModalBody}>
            <Text style={styles.filterLabel}>Sắp xếp theo</Text>
            <View style={styles.filterOptions}>
              {[
                { label: 'Mới nhất', value: 'newest' },
                { label: 'Cũ nhất', value: 'oldest' },
                { label: 'Đánh giá cao nhất', value: 'rating' }
              ].map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    filters.sortBy === option.value && styles.filterOptionActive
                  ]}
                  onPress={() => onFiltersChange({ ...filters, sortBy: option.value })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.sortBy === option.value && styles.filterOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Số sao</Text>
            <View style={styles.filterOptions}>
              {[0, 5, 4, 3, 2, 1].map(rating => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.filterOption,
                    filters.rating === rating && styles.filterOptionActive
                  ]}
                  onPress={() => onFiltersChange({ ...filters, rating })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.rating === rating && styles.filterOptionTextActive
                  ]}>
                    {rating === 0 ? 'Tất cả' : `${rating} sao`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Thời gian</Text>
            <View style={styles.filterOptions}>
              {[
                { label: 'Tất cả', value: 'all' },
                { label: 'Hôm nay', value: 'today' },
                { label: '7 ngày qua', value: 'week' },
                { label: '30 ngày qua', value: 'month' }
              ].map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    filters.timeRange === option.value && styles.filterOptionActive
                  ]}
                  onPress={() => onFiltersChange({ ...filters, timeRange: option.value })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.timeRange === option.value && styles.filterOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={onReset}
              >
                <Text style={styles.resetButtonText}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={onApply}
              >
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
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
  filterModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
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
  closeButton: {
    padding: 4,
  },
  filterModalBody: {
    padding: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  filterOptionActive: {
    backgroundColor: '#835101',
    borderColor: '#835101',
  },
  filterOptionText: {
    color: '#666',
    fontSize: 14,
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingHorizontal: 16,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#835101',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  resetButtonText: {
    color: '#835101',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#835101',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterModal;
