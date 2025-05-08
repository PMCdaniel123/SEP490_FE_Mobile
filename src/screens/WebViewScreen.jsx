import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, Linking, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WebViewScreen = ({ route }) => {
  const { url, title, source = 'general', transactionId } = route.params;
  const navigation = useNavigation();
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Load the stored wallet information
  const [customerWalletId, setCustomerWalletId] = useState(null);
  const [orderCode, setOrderCode] = useState(null);

  // Subscribe to URL open events (for handling mobile:// scheme)
  useEffect(() => {
    // This registers a listener for when URLs with certain schemes try to open
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => {
      subscription.remove();
    };
  }, []);

  // Navigate to the FailScreen correctly across different stacks
  const navigateToFailScreen = (params) => {
    // Use CommonActions.navigate with reset to ensure clean stack
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { 
            name: "Trang chủ",
            state: {
              routes: [
                { name: "FailPage", params: params }
              ],
              index: 0
            }
          }
        ],
      })
    );
  };

  // Handle deep link URLs (like mobile://cancel)
  const handleDeepLink = async (event) => {
    const { url: deepLinkUrl } = event;
    console.log("Deep link detected:", deepLinkUrl);
    
    if (deepLinkUrl.includes('mobile://cancel') || 
        deepLinkUrl.includes('status=cancel') || 
        deepLinkUrl.includes('cancel=true')) {
      
      // For wallet deposit flows
      if (source === 'wallet') {
        try {
          const storedCustomerWalletId = await AsyncStorage.getItem("customerWalletId");
          const storedOrderCode = await AsyncStorage.getItem("orderCode");
          
          navigateToFailScreen({
            source: 'wallet',
            customerWalletId: storedCustomerWalletId,
            orderCode: storedOrderCode
          });
        } catch (error) {
          console.error("Error handling cancel deeplink:", error);
          navigation.goBack();
        }
      } else {
        // For other payment flows
        navigation.goBack();
      }
    }
    
    if (deepLinkUrl.includes('mobile://success') || 
        deepLinkUrl.includes('status=success')) {
      
      if (source === 'wallet') {
        // Handle successful wallet deposit
        try {
          await AsyncStorage.setItem("depositSuccess", "true");
          await handleDepositSuccess();
        } catch (error) {
          console.error("Error handling success deeplink:", error);
        }
      } else {
        // For other payment flows, handle in their respective screens
        navigation.goBack();
      }
    }
  };

  // Handle deposit success and navigate back
  const handleDepositSuccess = async () => {
    // For wallet deposits, refresh and show success
    try {
      // Load customerWalletId and orderCode from AsyncStorage
      const storedAmount = await AsyncStorage.getItem("amount");
      
      // Navigate to ProfileMain first, then to Wallet
      // This ensures proper tab navigation later
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { 
              name: 'Tài khoản',
              params: { 
                screen: 'ProfileMain'
              }
            }
          ],
        })
      );
      
      // After a short delay, navigate to the wallet screen
      setTimeout(() => {
        navigation.navigate('Tài khoản', {
          screen: 'Wallet',
          params: { refresh: true }
        });
        
        // Show success alert after navigation
        setTimeout(() => {
          Alert.alert(
            "Nạp tiền thành công",
            `Bạn đã nạp thành công ${storedAmount} vào ví WorkHive`
          );
        }, 300);
      }, 100);
      
      // Clear stored data
      await AsyncStorage.removeItem("customerWalletId");
      await AsyncStorage.removeItem("orderCode");
      await AsyncStorage.removeItem("amount");
    } catch (error) {
      console.error("Error handling deposit success:", error);
    }
  };

  useEffect(() => {
    const loadWalletInfo = async () => {
      if (source === 'wallet') {
        try {
          const storedCustomerWalletId = await AsyncStorage.getItem("customerWalletId");
          const storedOrderCode = await AsyncStorage.getItem("orderCode");
          
          setCustomerWalletId(storedCustomerWalletId);
          setOrderCode(storedOrderCode);
        } catch (error) {
          console.error("Error loading wallet info:", error);
        }
      }
    };

    loadWalletInfo();
    
    // Add a navigation listener to handle back button behavior
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // If we're on a payment screen and trying to go back
      if (url.includes('checkout') || url.includes('payment')) {
        // Prevent default behavior
        e.preventDefault();
        
        // Show confirmation dialog
        Alert.alert(
          'Xác nhận hủy',
          'Bạn có chắc chắn muốn hủy giao dịch này?',
          [
            {
              text: 'Không',
              style: 'cancel',
            },
            {
              text: 'Có',
              onPress: () => {
                if (source === 'wallet') {
                  navigateToFailScreen({
                    source: 'wallet',
                    customerWalletId,
                    orderCode
                  });
                } else {
                  // Allow the navigation to proceed
                  navigation.dispatch(e.data.action);
                }
              },
            },
          ]
        );
      }
    });
    
    return unsubscribe;
  }, [source, navigation, url, customerWalletId, orderCode, navigateToFailScreen]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (url.includes('checkout') || url.includes('payment')) {
        Alert.alert(
          'Xác nhận hủy',
          'Bạn có chắc chắn muốn hủy giao dịch này?',
          [
            {
              text: 'Không',
              style: 'cancel',
            },
            {
              text: 'Có',
              onPress: () => {
                if (source === 'wallet') {
                  navigateToFailScreen({
                    source: 'wallet',
                    customerWalletId,
                    orderCode
                  });
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
        return true; // Prevent default back button behavior
      }
      return false;
    });

    return () => backHandler.remove();
  }, [navigation, url, source, customerWalletId, orderCode]);

  // Listen for WebView state changes
  const handleNavigationStateChange = async (navState) => {
    const currentUrl = navState.url.toLowerCase();
    console.log("Navigation state change:", currentUrl);

    // Handle mobile:// URLs that might not trigger the Linking event
    if (currentUrl.startsWith('mobile://')) {
      // Fallback for handling mobile:// URLs
      handleDeepLink({ url: currentUrl });
      return;
    }

    // Success cases
    if (
      currentUrl.includes('success=true') ||
      currentUrl.includes('status=success') ||
      currentUrl.includes('status=paid') ||
      currentUrl.includes('result=success') ||
      currentUrl.includes('result=paid')
    ) {
      // Try to extract parameters from URL if present
      const urlParts = currentUrl.split('?');
      let orderCode = null;
      let bookingId = null;
      let status = 'PAID';
      
      if (urlParts.length > 1) {
        const urlParams = new URLSearchParams(urlParts[1]);
        orderCode = urlParams.get('ordercode') || urlParams.get('orderCode');
        bookingId = urlParams.get('bookingid') || urlParams.get('bookingId');
        status = urlParams.get('status') || 'PAID';
      }
      
      if (source === 'wallet') {
        // Mark deposit as successful and trigger success flow
        await AsyncStorage.setItem("depositSuccess", "true");
        await handleDepositSuccess();
      } else {
        // For non-wallet transactions, navigate to success page
        navigation.navigate("SuccessPage", {
          OrderCode: orderCode,
          BookingId: bookingId,
          status: status,
          cancel: false,
        });
      }
      return;
    }

    // Failure/cancel cases
    if (
      currentUrl.includes('cancel') ||
      currentUrl.includes('status=cancel') ||
      currentUrl.includes('fail') ||
      currentUrl.includes('status=failed')
    ) {
      if (source === 'wallet') {
        // Navigate to failure page with wallet-specific parameters
        navigateToFailScreen({
          source: 'wallet',
          customerWalletId,
          orderCode
        });
      } else {
        // Use the existing Alert for other types of payments
        Alert.alert(
          'Giao dịch thất bại',
          'Giao dịch đã bị hủy hoặc xảy ra lỗi. Vui lòng thử lại sau.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
      return;
    }
  };

  // Handle WebView messages
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'payment_cancel') {
        if (source === 'wallet') {
          // Navigate to failure page with wallet-specific parameters
          navigateToFailScreen({
            source: 'wallet',
            customerWalletId,
            orderCode
          });
        } else {
          // Use the existing Alert for other types of payments
          Alert.alert(
            'Giao dịch thất bại',
            'Bạn đã hủy giao dịch này.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }
      
      if (data.type === 'payment_success') {
        if (source === 'wallet') {
          handleDepositSuccess();
        } else {
          // For non-wallet transactions, navigate to success page
          navigation.navigate("SuccessPage", {
            OrderCode: data.orderCode || orderCode,
            BookingId: data.bookingId,
            status: data.status || 'PAID',
            cancel: false,
          });
        }
      }
      
      if (data.type === 'console_log') {
        console.log('WebView:', data.message);
      }
      
      if (data.type === 'url_scheme' && data.url) {
        handleDeepLink({ url: data.url });
      }
    } catch (error) {
      console.error('WebView message parse error:', error);
    }
  };

  // Clean up focus effect
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Check if deposit was successful when leaving the screen
        const checkDepositSuccess = async () => {
          if (source === 'wallet') {
            try {
              const depositSuccess = await AsyncStorage.getItem("depositSuccess");
              if (depositSuccess === "true") {
                // Clear deposit success flag
                await AsyncStorage.setItem("depositSuccess", "false");
                
                // Refresh wallet data (this would happen in WalletScreen's useEffect hooks)
              }
            } catch (error) {
              console.error("Error checking deposit success:", error);
            }
          }
        };
        
        checkDepositSuccess();
      };
    }, [source])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            Alert.alert(
              'Xác nhận hủy',
              'Bạn có chắc chắn muốn hủy giao dịch này?',
              [
                {
                  text: 'Không',
                  style: 'cancel',
                },
                {
                  text: 'Có',
                  onPress: () => {
                    if (source === 'wallet') {
                      navigateToFailScreen({
                        source: 'wallet',
                        customerWalletId,
                        orderCode
                      });
                    } else {
                      navigation.goBack();
                    }
                  },
                },
              ]
            );
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#835101" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || 'Thanh toán'}</Text>
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
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        originWhitelist={['*', 'http://*', 'https://*', 'mobile://*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onShouldStartLoadWithRequest={(request) => {
          // Log all URLs for debugging
          console.log("Request URL detected:", request.url);
          
          // Handle mobile:// schemes explicitly
          if (request.url.startsWith('mobile://')) {
            const url = request.url.toLowerCase();
            console.log("Processing mobile:// URL:", url);
            
            // ✅ Handle cancel from mobile://cancel?... response
            if (url.includes('mobile://cancel')) {
              console.log("mobile://cancel detected, navigating to fail page");
              if (source === 'wallet') {
                navigateToFailScreen({
                  source: 'wallet',
                  customerWalletId,
                  orderCode
                });
              } else {
                navigation.goBack();
              }
              return false;
            }
            
            // ✅ Handle pending status in mobile:// URLs
            if (url.includes('status=pending') || url.includes('status=processing')) {
              console.log("Mobile URL with pending status detected, waiting for final status...");
              // Don't navigate away for pending status - let transaction complete
              return false;
            }
            
            // ✅ Handle success from mobile://success?... response
            if (url.includes('mobile://success')) {
              console.log("mobile://success detected, navigating to success page");
              
              // Extract parameters from URL if present
              const urlParams = new URLSearchParams(url.split('?')[1]);
              const orderCode = urlParams.get('ordercode') || orderCode;
              const status = urlParams.get('status') || 'PAID';
              const bookingId = urlParams.get('bookingid');
              
              if (source === 'wallet') {
                handleDepositSuccess();
              } else {
                // For non-wallet payments, navigate to SuccessPage
                navigation.navigate("SuccessPage", {
                  OrderCode: orderCode,
                  BookingId: bookingId,
                  status: status,
                  cancel: false,
                });
              }
              return false;
            }
            
            // Process any other mobile:// URLs
            handleDeepLink({ url: request.url });
            // Return false to prevent WebView from trying to load this URL
            return false;
          }
          
          // Allow PayOS domains and your own domain
          if (request.url.includes('payos.vn') || 
              request.url.includes('zalopay.vn') || 
              request.url.includes('workhive.info.vn')) {
            return true;
          }
          
          // Allow all other URLs to load
          return true;
        }}
        injectedJavaScript={`
          (function() {
            // Log console messages to React Native
            console.originalLog = console.log;
            console.log = function(message) {
              console.originalLog(message);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'console_log',
                message: message
              }));
            };
            
            function sendCancelMessage() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment_cancel',
                reason: 'User confirmed cancel'
              }));
            }
            
            function sendSuccessMessage() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment_success'
              }));
            }
        
            function observeAndBindCancelButton() {
              const observer = new MutationObserver(() => {
                // Find the modal by checking for the "HỦY THANH TOÁN" title
                const cancelModal = Array.from(document.querySelectorAll("div"))
                  .find(div => div.innerText && div.innerText.includes("HỦY THANH TOÁN"));
        
                if (cancelModal) {
                  const confirmBtn = Array.from(cancelModal.querySelectorAll("button"))
                    .find(btn => btn.innerText && btn.innerText.includes("ĐỒNG Ý"));
                  
                  if (confirmBtn && !confirmBtn.dataset.boundCancelEvent) {
                    confirmBtn.dataset.boundCancelEvent = 'true';
                    confirmBtn.addEventListener('click', sendCancelMessage);
                  }
                }
              });
        
              observer.observe(document.body, { childList: true, subtree: true });
            }
        
            observeAndBindCancelButton();

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
            
            // Monitor PayOS payment form
            function monitorPayOSElements() {
              // Check for PayOS elements that indicate payment status
              
              // Look for success indicators
              const successElements = document.querySelectorAll('.transaction-success, .payment-success, .success-status');
              if (successElements.length > 0) {
                console.log('Payment success elements detected');
                sendSuccessMessage();
                return;
              }
              
              // Look for failure indicators
              const failureElements = document.querySelectorAll('.transaction-failed, .payment-error, .error-status');
              if (failureElements.length > 0) {
                console.log('Payment failure elements detected');
                sendCancelMessage();
                return;
              }
            }
            
            // Set up observers to watch for PayOS elements
            function setupPayOSObserver() {
              const observer = new MutationObserver(function(mutations) {
                monitorPayOSElements();
              });
              
              observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true
              });
              
              // Check immediately in case elements are already present
              monitorPayOSElements();
            }
            
            // Run when DOM is loaded
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', setupPayOSObserver);
            } else {
              setupPayOSObserver();
            }
            
            // Also periodically check for changes
            setInterval(monitorPayOSElements, 1000);
          })();
        `}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default WebViewScreen;