import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';

const WithdrawalRequest = ({ balance, bankInfo, onBankInfoTabClick, onWithdrawalSuccess }) => {
  const { userData, userToken } = useContext(AuthContext);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [withdrawTitle, setWithdrawTitle] = useState('Yêu cầu rút tiền');
  const [withdrawDescription, setWithdrawDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [userData]);

  const fetchWithdrawalRequests = async () => {
    if (!userData || !userData.sub) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://workhive.info.vn:8443/users/customerwithdrawalrequests/${userData.sub}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.data && response.data.customerWithdrawalRequests) {
        const sortedRequests = [...response.data.customerWithdrawalRequests].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setWithdrawalRequests(sortedRequests);
      }
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử yêu cầu rút tiền');
    } finally {
      setLoading(false);
    }
  };

  // Check if user has an active handling request within the last 24 hours
  const hasActiveHandlingRequest = () => {
    if (!withdrawalRequests.length) return false;
    
    const handlingRequests = withdrawalRequests.filter(
      (request) => request.status === 'Handling'
    );

    if (handlingRequests.length === 0) return false;
    
    const now = new Date();
    return handlingRequests.some((request) => {
      const createdAt = new Date(request.createdAt);
      const hoursDifference = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      return hoursDifference < 24;
    });
  };

  const handleWithdraw = () => {
    if (Number(balance) <= 0) {
      Alert.alert('Lỗi', 'Số dư của bạn phải lớn hơn 0 để có thể rút tiền');
      return;
    }

    if (!bankInfo || !bankInfo.bankName || !bankInfo.bankNumber || !bankInfo.bankAccountName) {
      Alert.alert(
        'Thông tin ngân hàng chưa đầy đủ', 
        'Vui lòng cập nhật thông tin ngân hàng trước khi rút tiền',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Cập nhật', onPress: onBankInfoTabClick }
        ]
      );
      return;
    }

    if (hasActiveHandlingRequest()) {
      Alert.alert(
        'Yêu cầu đang xử lý', 
        'Bạn đã có một yêu cầu rút tiền đang xử lý. Vui lòng chờ sau 24 giờ hoặc đợi yêu cầu hiện tại được hoàn thành'
      );
      return;
    }

    setIsModalVisible(true);
  };

  const confirmWithdraw = async () => {
    if (!userData || !userData.sub) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        'https://workhive.info.vn:8443/customer-withdrawal-requests',
        {
          title: withdrawTitle,
          description: withdrawDescription || 'Yêu cầu rút tiền',
          customerId: userData.sub,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        Alert.alert('Thành công', 'Yêu cầu rút tiền đã được gửi thành công');
        setIsModalVisible(false);
        fetchWithdrawalRequests();
        
        // Additional check to see if wallet was locked after the withdrawal request
        try {
          const walletResponse = await axios.get(
            `https://workhive.info.vn:8443/users/wallet/getcustomerwalletinformation/${userData.sub}`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );
          
          // If the wallet is now locked, show an additional notification
          if (walletResponse.data && walletResponse.data.isLock === 1) {
            setTimeout(() => {
              Alert.alert(
                'Thông báo',
                'Ví của bạn đã bị khóa tạm thời trong thời gian xử lý rút tiền.'
              );
            }, 500);
          }
        } catch (error) {
          console.error('Error checking wallet lock status:', error);
        }
        
        if (onWithdrawalSuccess) {
          onWithdrawalSuccess();
        }
      } else {
        throw new Error('Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi yêu cầu rút tiền');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Handling': return 'Đang xử lý';
      case 'Success': return 'Đã hoàn thành';
      case 'Fail': return 'Đã từ chối';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Handling': return '#F59E0B';
      case 'Success': return '#10B981';
      case 'Fail': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.requestDescription}>{item.description}</Text>
      <Text style={styles.requestDate}>Ngày tạo: {formatDate(item.createdAt)}</Text>
      
      {item.managerResponse && item.managerResponse !== 'N/A' && item.status === 'Fail' && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Phản hồi:</Text>
          <Text style={styles.responseText}>{item.managerResponse}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  // No bank information
  if (!bankInfo || !bankInfo.bankName) {
    return (
      <View style={styles.noBankContainer}>
        <View style={styles.noBankIconContainer}>
          <Ionicons name="card-outline" size={40} color="#aaa" />
        </View>
        <Text style={styles.noBankTitle}>Chưa có thông tin ngân hàng</Text>
        <Text style={styles.noBankText}>
          Vui lòng cập nhật thông tin ngân hàng trước khi rút tiền
        </Text>
        <TouchableOpacity style={styles.noBankButton} onPress={onBankInfoTabClick}>
          <Text style={styles.noBankButtonText}>Cập nhật thông tin ngân hàng</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Has withdrawal requests
  if (withdrawalRequests.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Yêu cầu rút tiền</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleWithdraw}>
            <Ionicons name="cash-outline" size={16} color="#fff" style={styles.createButtonIcon} />
            <Text style={styles.createButtonText}>Tạo yêu cầu mới</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={withdrawalRequests}
          keyExtractor={(item, index) => `request-${item.id || index}`}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
        
        <WithdrawalModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          withdrawTitle={withdrawTitle}
          setWithdrawTitle={setWithdrawTitle}
          withdrawDescription={withdrawDescription}
          setWithdrawDescription={setWithdrawDescription}
          isSubmitting={isSubmitting}
          onConfirm={confirmWithdraw}
          balance={balance}
          formatCurrency={formatCurrency}
          bankInfo={bankInfo}
        />
      </View>
    );
  }

  // No withdrawal requests yet
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={styles.infoIconContainer}>
          <Ionicons name="cash-outline" size={24} color="#fff" />
        </View>
        <View>
          <Text style={styles.infoTitle}>Thông tin rút tiền</Text>
          <Text style={styles.infoText}>
            Tạo yêu cầu rút tiền để chuyển tiền từ ví WorkHive về tài khoản ngân hàng của bạn. {"\n"}
            Yêu cầu sẽ được xử lý trong vòng 24 giờ làm việc.
          </Text>
        </View>
      </View>
      
      <View style={styles.centerButtonContainer}>
        <TouchableOpacity style={styles.createWithdrawalButton} onPress={handleWithdraw}>
          <Ionicons name="cash-outline" size={24} color="#fff" style={styles.createWithdrawalIcon} />
          <Text style={styles.createWithdrawalText}>Tạo yêu cầu rút tiền</Text>
        </TouchableOpacity>
      </View>
      
      {bankInfo && (
        <View style={styles.bankInfoContainer}>
          <Text style={styles.bankInfoTitle}>Thông tin tài khoản:</Text>
          <View style={styles.bankInfoGrid}>
            <View style={styles.bankInfoItem}>
              <Text style={styles.bankInfoLabel}>Ngân hàng:</Text>
              <Text style={styles.bankInfoValue}>{bankInfo.bankName}</Text>
            </View>
            <View style={styles.bankInfoItem}>
              <Text style={styles.bankInfoLabel}>Số tài khoản:</Text>
              <Text style={styles.bankInfoValue}>{bankInfo.bankNumber}</Text>
            </View>
          </View>
          <View style={styles.bankInfoItem}>
            <Text style={styles.bankInfoLabel}>Chủ tài khoản:</Text>
            <Text style={styles.bankInfoValue}>{bankInfo.bankAccountName}</Text>
          </View>
        </View>
      )}
      
      <WithdrawalModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        withdrawTitle={withdrawTitle}
        setWithdrawTitle={setWithdrawTitle}
        withdrawDescription={withdrawDescription}
        setWithdrawDescription={setWithdrawDescription}
        isSubmitting={isSubmitting}
        onConfirm={confirmWithdraw}
        balance={balance}
        formatCurrency={formatCurrency}
        bankInfo={bankInfo}
      />
    </View>
  );
};

// Withdrawal Modal Component
const WithdrawalModal = ({ 
  isVisible, 
  onClose, 
  withdrawTitle, 
  setWithdrawTitle, 
  withdrawDescription, 
  setWithdrawDescription,
  isSubmitting,
  onConfirm,
  balance,
  formatCurrency,
  bankInfo
}) => (
  <Modal
    visible={isVisible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Ionicons name="arrow-down" size={20} color="#835101" />
          <Text style={styles.modalTitle}>Yêu cầu rút tiền</Text>
          <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>
            Số dư hiện tại: <Text style={styles.balanceAmount}>{formatCurrency(Number(balance))}</Text>
          </Text>
        </View>
        
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Tiêu đề</Text>
          <TextInput
            style={styles.input}
            value={withdrawTitle}
            onChangeText={setWithdrawTitle}
            placeholder="Tiêu đề yêu cầu rút tiền"
          />
        </View>
        
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Mô tả (không bắt buộc)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={withdrawDescription}
            onChangeText={setWithdrawDescription}
            placeholder="Mô tả chi tiết (nếu cần)"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.bankInfoSection}>
          <Text style={styles.bankInfoSectionTitle}>Thông tin ngân hàng:</Text>
          <View style={styles.bankInfoCard}>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoModalLabel}>Ngân hàng:</Text>
              <Text style={styles.bankInfoModalValue}>{bankInfo?.bankName}</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoModalLabel}>Số tài khoản:</Text>
              <Text style={styles.bankInfoModalValue}>{bankInfo?.bankNumber}</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoModalLabel}>Chủ tài khoản:</Text>
              <Text style={styles.bankInfoModalValue}>{bankInfo?.bankAccountName}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.noticeContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#B45309" />
          <Text style={styles.noticeText}>
            Yêu cầu rút tiền của bạn sẽ được xử lý trong vòng 24 giờ làm việc
          </Text>
        </View>
        
        <View style={styles.modalButtonsContainer}>
          <TouchableOpacity 
            style={styles.cancelModalButton} 
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelModalButtonText}>Hủy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.confirmModalButton}
            onPress={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.confirmModalButtonText}>Gửi yêu cầu rút tiền</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noBankContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noBankIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  noBankTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  noBankText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  noBankButton: {
    backgroundColor: '#835101',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  noBankButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#835101',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonIcon: {
    marginRight: 4,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requestDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  requestDate: {
    fontSize: 12,
    color: '#888',
  },
  responseContainer: {
    marginTop: 8,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  responseLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#835101',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingRight: 50
  },
  centerButtonContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  createWithdrawalButton: {
    backgroundColor: '#835101',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  createWithdrawalIcon: {
    marginRight: 8,
  },
  createWithdrawalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bankInfoContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bankInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  bankInfoGrid: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bankInfoItem: {
    flex: 1,
    marginBottom: 8,
  },
  bankInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bankInfoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#835101',
    flex: 1,
    marginLeft: 8,
  },
  balanceContainer: {
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 16,
    textAlign: 'center',
  },
  balanceAmount: {
    fontWeight: 'bold',
    color: '#835101',
  },
  inputSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
  },
  bankInfoSection: {
    marginTop: 16,
    marginHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bankInfoSectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bankInfoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  bankInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bankInfoModalLabel: {
    fontSize: 14,
    color: '#666',
    width: '40%',
  },
  bankInfoModalValue: {
    fontSize: 14,
    fontWeight: '500',
    width: '60%',
    textAlign: 'right',
    flexShrink: 1,
  },
  noticeContainer: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 12,
    color: '#B45309',
    marginLeft: 8,
    flex: 1,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelModalButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmModalButton: {
    flex: 1,
    backgroundColor: '#835101',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmModalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default WithdrawalRequest;