import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';

const BankInfoForm = ({ onBankInfoUpdated, isEditMode, setIsEditMode }) => {
  const { userData, userToken } = useContext(AuthContext);
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    bankNumber: '',
    bankAccountName: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banks, setBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [bankSearchValue, setBankSearchValue] = useState('');
  const [banksFetching, setBanksFetching] = useState(false);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  useEffect(() => {
    fetchBankInfo();
    fetchBanks();
  }, []);

  useEffect(() => {
    if (bankSearchValue.trim() === '') {
      setFilteredBanks(banks);
    } else {
      const searchTerm = bankSearchValue.toLowerCase().trim();
      const filtered = banks.filter(
        (bank) =>
          bank.name.toLowerCase().includes(searchTerm) ||
          bank.shortName.toLowerCase().includes(searchTerm) ||
          (bank.code && bank.code.toLowerCase().includes(searchTerm))
      );
      setFilteredBanks(filtered);
    }
  }, [bankSearchValue, banks]);

  const fetchBanks = async () => {
    setBanksFetching(true);
    try {
      const response = await axios.get('https://api.vietqr.io/v2/banks');
      if (response.data && response.data.data) {
        setBanks(response.data.data);
        setFilteredBanks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải danh sách ngân hàng');
    } finally {
      setBanksFetching(false);
    }
  };

  const fetchBankInfo = async () => {
    if (!userData || !userData.sub) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://workhive.info.vn:8443/users/wallet/getcustomerwalletinformation/${userData.sub}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.data) {
        setBankInfo({
          bankName: response.data.bankName || '',
          bankNumber: response.data.bankNumber || '',
          bankAccountName: response.data.bankAccountName || ''
        });
        
        // Find selected bank in banks list
        if (response.data.bankName && banks.length > 0) {
          const bank = banks.find(b => b.name === response.data.bankName);
          setSelectedBank(bank || null);
        }
      }
    } catch (error) {
      // 404 means no bank info yet, which is ok
      if (error.response && error.response.status !== 404) {
        console.error('Error fetching bank info:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    if (name === 'bankAccountName') {
      setBankInfo(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else {
      setBankInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setBankInfo(prev => ({
      ...prev,
      bankName: bank.name
    }));
    setShowBankSelector(false);
  };

  const handleSubmit = async () => {
    if (!userData || !userData.sub) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để cập nhật thông tin ngân hàng');
      return;
    }

    // Validation
    if (!bankInfo.bankName || !bankInfo.bankNumber || !bankInfo.bankAccountName) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.patch(
        'https://workhive.info.vn:8443/users/wallet/updatecustomerwalletinformation',
        {
          customerId: userData.sub,
          bankName: bankInfo.bankName,
          bankNumber: bankInfo.bankNumber,
          bankAccountName: bankInfo.bankAccountName
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`
          }
        }
      );

      if (response.status >= 200 && response.status < 300) {
        Alert.alert('Thành công', 'Cập nhật thông tin ngân hàng thành công');
        setIsEditMode(false);
        if (onBankInfoUpdated) {
          onBankInfoUpdated(bankInfo);
        }
      } else {
        throw new Error('Failed to update bank information');
      }
    } catch (error) {
      console.error('Error updating bank info:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin ngân hàng');
    } finally {
      setSaving(false);
    }
  };

  const renderBankItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.bankItem}
        onPress={() => handleBankSelect(item)}
      >
        <View style={styles.bankItemContent}>
          {item.logo ? (
            <Image
              source={{ uri: item.logo }}
              style={styles.bankLogo}
              defaultSource={require('../../../assets/icon.png')}
            />
          ) : (
            <View style={styles.bankLogoPlaceholder}>
              <Text style={styles.bankLogoPlaceholderText}>
                {item.shortName?.charAt(0) || item.name.charAt(0)}
              </Text>
            </View>
          )}
          <View style={styles.bankTextContainer}>
            <Text style={styles.bankName}>{item.name}</Text>
            {item.code && (
              <Text style={styles.bankCode}>({item.code})</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#835101" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  // View mode
  if (!isEditMode && bankInfo.bankName && bankInfo.bankNumber) {
    // Find the selected bank to display its logo
    const displayBank = banks.find(b => b.name === bankInfo.bankName);
    
    return (
      <View style={styles.container}>
        <View style={styles.infoCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Thông tin ngân hàng</Text>
            <TouchableOpacity 
              onPress={() => setIsEditMode(true)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.label}>Tên ngân hàng</Text>
            <View style={styles.bankInfoRow}>
              {displayBank?.logo && (
                <Image
                  source={{ uri: displayBank.logo }}
                  style={styles.bankInfoLogo}
                  defaultSource={require('../../../assets/icon.png')}
                />
              )}
              <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
                {bankInfo.bankName}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.label}>Số tài khoản</Text>
            <Text style={styles.value}>{bankInfo.bankNumber}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.label}>Tên chủ tài khoản</Text>
            <Text style={styles.value}>{bankInfo.bankAccountName}</Text>
          </View>
        </View>
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
          <View style={styles.infoBoxTextContainer}>
            <Text style={styles.infoBoxTitle}>Thông tin quan trọng</Text>
            <Text style={styles.infoBoxText}>
              Thông tin ngân hàng của bạn sẽ được sử dụng trong các trường hợp rút tiền về tài khoản ngân hàng. 
              Vui lòng đảm bảo thông tin chính xác.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Edit mode
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tên ngân hàng</Text>
          {banksFetching ? (
            <View style={styles.loadingBanksContainer}>
              <ActivityIndicator size="small" color="#835101" />
              <Text style={styles.loadingBanksText}>Đang tải danh sách ngân hàng...</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.bankSelector}
              onPress={() => setShowBankSelector(true)}
            >
              {selectedBank ? (
                <View style={styles.selectedBankContainer}>
                  {selectedBank.logo ? (
                    <Image
                      source={{ uri: selectedBank.logo }}
                      style={styles.selectedBankLogo}
                      defaultSource={require('../../../assets/icon.png')}
                    />
                  ) : (
                    <View style={styles.bankLogoPlaceholder}>
                      <Text style={styles.bankLogoPlaceholderText}>
                        {selectedBank.shortName?.charAt(0) || selectedBank.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.selectedBankText} numberOfLines={1} ellipsizeMode="tail">
                    {selectedBank.name}
                  </Text>
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderText}>Chọn ngân hàng</Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Số tài khoản</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số tài khoản"
            value={bankInfo.bankNumber}
            onChangeText={(text) => handleInputChange('bankNumber', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tên chủ tài khoản</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên chủ tài khoản"
            value={bankInfo.bankAccountName}
            onChangeText={(text) => handleInputChange('bankAccountName', text)}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => {
              setIsEditMode(false);
              fetchBankInfo();
            }}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
          <View style={styles.infoBoxTextContainer}>
            <Text style={styles.infoBoxTitle}>Thông tin quan trọng</Text>
            <Text style={styles.infoBoxText}>
              Thông tin ngân hàng của bạn sẽ được sử dụng trong các trường hợp rút tiền về tài khoản ngân hàng. 
              Vui lòng đảm bảo thông tin chính xác.
            </Text>
          </View>
        </View>
      </View>

      {/* Bank Selection Modal */}
      <Modal
        visible={showBankSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBankSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngân hàng</Text>
              <TouchableOpacity onPress={() => setShowBankSelector(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm ngân hàng"
                value={bankSearchValue}
                onChangeText={setBankSearchValue}
              />
              {bankSearchValue.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearSearch}
                  onPress={() => setBankSearchValue('')}
                >
                  <Ionicons name="close-circle" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            
            <FlatList
              data={filteredBanks}
              renderItem={renderBankItem}
              keyExtractor={item => item.id || item.bin}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListText}>Không tìm thấy ngân hàng phù hợp</Text>
                </View>
              }
              style={styles.bankList}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#835101',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#835101',
  },
  editButton: {
    padding: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    color: '#666',
  },
  infoItem: {
    marginBottom: 12,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
    padding: 8,
  },
  infoBox: {
    backgroundColor: '#835101',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBoxTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  bankSelector: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedBankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedBankLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  selectedBankText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
    maxHeight: '90%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },
  clearSearch: {
    padding: 4,
  },
  bankList: {
    maxHeight: 500,
  },
  bankItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bankItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLogo: {
    width: 32,
    height: 32,
    marginRight: 12,
    resizeMode: 'contain',
  },
  bankLogoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankLogoPlaceholderText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  bankTextContainer: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    color: '#333',
  },
  bankCode: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  emptyList: {
    padding: 32,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadingBanksContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  loadingBanksText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  bankInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bankInfoLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
});

export default BankInfoForm;