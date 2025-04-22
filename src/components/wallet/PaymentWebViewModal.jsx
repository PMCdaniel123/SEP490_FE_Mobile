import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const PaymentWebViewModal = ({
  isVisible,
  onClose,
  paymentUrl,
  loading,
  setLoading,
  customerWalletId,
  orderCode,
  onWebViewNavigationStateChange
}) => {
  const navigation = useNavigation();
  
  const handleBackPress = () => {
    Alert.alert(
      'Xác nhận hủy',
      'Bạn có chắc chắn muốn hủy giao dịch này?',
      [
        { text: 'Không', style: 'cancel' },
        { 
          text: 'Có', 
          onPress: () => {
            onClose();
            navigation.navigate("Trang chủ", {
              screen: "FailPage",
              params: {
                source: 'wallet',
                customerWalletId,
                orderCode
              }
            });
          }
        },
      ]
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={handleBackPress}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={{ width: 40 }} />
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#835101" />
            <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
          </View>
        )}
        
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={onWebViewNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          originWhitelist={['*', 'http://*', 'https://*', 'mobile://*']}
          onShouldStartLoadWithRequest={(request) => {
            // Handle mobile:// schemes explicitly
            if (request.url.startsWith('mobile://')) {
              // Return false to prevent WebView from trying to load this URL
              return false;
            }
            // Allow all other URLs to load
            return true;
          }}
          injectedJavaScript={`
            (function() {
              // Intercept all link clicks to handle mobile:// schemes
              document.addEventListener('click', function(e) {
                const anchor = e.target.closest('a');
                if (anchor && anchor.href && anchor.href.startsWith('mobile://')) {
                  e.preventDefault();
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'url_scheme',
                    url: anchor.href
                  }));
                  return false;
                }
              }, true);

              // Override window.open for mobile:// URLs
              (function() {
                const originalOpen = window.open;
                window.open = function(url) {
                  if (url && url.startsWith('mobile://')) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'url_scheme',
                      url: url
                    }));
                    return true;
                  }
                  return originalOpen.apply(this, arguments);
                };
              })();
            })();
          `}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'url_scheme' && data.url) {
                // Process the URL as a deep link
                onWebViewNavigationStateChange({ url: data.url });
              }
            } catch (error) {
              console.error('WebView message parse error:', error);
            }
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  }
});

export default PaymentWebViewModal;