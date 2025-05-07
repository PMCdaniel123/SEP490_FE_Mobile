import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, CommonActions } from '@react-navigation/native';

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
  const webViewRef = useRef(null);
  
  // Handle back button press on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isVisible) {
        handleBackPress();
        return true;
      }
      return false;
    });
    
    return () => backHandler.remove();
  }, [isVisible]);
  
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
            // Use CommonActions.reset to ensure clean navigation state
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  { 
                    name: "Trang chủ",
                    state: {
                      routes: [
                        { 
                          name: "FailPage", 
                          params: {
                            source: 'wallet',
                            customerWalletId,
                            orderCode
                          }
                        }
                      ],
                      index: 0
                    }
                  }
                ],
              })
            );
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
      transparent={false}
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
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onNavigationStateChange={onWebViewNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          originWhitelist={['*', 'http://*', 'https://*', 'mobile://*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          onShouldStartLoadWithRequest={(request) => {
            console.log("Loading URL:", request.url);
            
            if (request.url.startsWith('mobile://')) {
              console.log("Mobile URL detected:", request.url);
              
              if (request.url.includes('mobile://cancel')) {
                onClose();
                navigation.navigate("Trang chủ", {
                  screen: "FailPage",
                  params: {
                    source: 'wallet',
                    customerWalletId,
                    orderCode
                  }
                });
                return false;
              }
              
              if (request.url.includes('mobile://success')) {
                console.log("Success URL detected");
                onWebViewNavigationStateChange({ url: request.url });
                return false;
              }
              
              return false;
            }
            
            // Allow PayOS domains
            if (request.url.includes('payos.vn') || 
                request.url.includes('workhive.info.vn')) {
              return true;
            }
            
            // Allow all other URLs to load
            return true;
          }}
          injectedJavaScript={`
            (function() {
              // Log navigation events for debugging
              console.log = function(message) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'console_log',
                  message: message
                }));
              };
              
              // Intercept all link clicks to handle mobile:// schemes
              document.addEventListener('click', function(e) {
                const anchor = e.target.closest('a');
                if (anchor && anchor.href) {
                  console.log('Link clicked: ' + anchor.href);
                  if (anchor.href.startsWith('mobile://')) {
                    e.preventDefault();
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'url_scheme',
                      url: anchor.href
                    }));
                    return false;
                  }
                }
              }, true);

              // Override window.open for mobile:// URLs
              (function() {
                const originalOpen = window.open;
                window.open = function(url) {
                  console.log('Window.open called with: ' + url);
                  if (url && url.startsWith('mobile://')) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'url_scheme',
                      url: url
                    }));
                    return true;
                  }
                  
                  // Check for success or cancel URLs in regular navigation
                  if (url && (url.includes('success=true') || url.includes('status=success'))) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'payment_success'
                    }));
                    return true;
                  }
                  
                  if (url && (url.includes('cancel=true') || url.includes('status=cancel') || url.includes('status=failed'))) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'payment_cancel'
                    }));
                    return true;
                  }
                  
                  return originalOpen.apply(this, arguments);
                };
              })();
              
              // Monitor PayOS payment form state
              function monitorPayOSForm() {
                // Check for PayOS payment form
                const paymentForm = document.querySelector('.payos-payment-form');
                if (paymentForm) {
                  console.log('PayOS payment form detected');
                  
                  // Look for success or cancel messages
                  const observer = new MutationObserver(function(mutations) {
                    // Check for success message
                    const successMessage = document.querySelector('.payment-success');
                    if (successMessage) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'payment_success'
                      }));
                    }
                    
                    // Check for cancel/error message
                    const errorMessage = document.querySelector('.payment-error');
                    if (errorMessage) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'payment_cancel'
                      }));
                    }
                  });
                  
                  observer.observe(document.body, { 
                    childList: true, 
                    subtree: true,
                    attributes: true,
                    characterData: true
                  });
                }
              }
              
              // Run the monitor after the page loads
              if (document.readyState === 'complete') {
                monitorPayOSForm();
              } else {
                window.addEventListener('load', monitorPayOSForm);
              }
              
              // Also periodically check for the form (it might be loaded dynamically)
              setInterval(monitorPayOSForm, 1000);
            })();
          `}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              
              if (data.type === 'console_log') {
                console.log('WebView log:', data.message);
                return;
              }
              
              if (data.type === 'url_scheme' && data.url) {
                console.log('URL scheme detected:', data.url);
                onWebViewNavigationStateChange({ url: data.url });
                return;
              }
              
              // Handle payment success
              if (data.type === 'payment_success') {
                console.log('Payment success detected');
                onClose();
                navigation.navigate("Tài khoản", {
                  screen: "Wallet",
                  params: { refresh: true }
                });
                return;
              }
              
              // Handle payment cancel
              if (data.type === 'payment_cancel') {
                console.log('Payment cancel detected');
                onClose();
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      { 
                        name: "Trang chủ",
                        state: {
                          routes: [
                            { 
                              name: "FailPage", 
                              params: {
                                source: 'wallet',
                                customerWalletId,
                                orderCode
                              }
                            }
                          ],
                          index: 0
                        }
                      }
                    ],
                  })
                );
                return;
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