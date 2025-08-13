import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LoginCredentials {
  email: string;
  password: string;
  name?: string;
}

interface LoginScreenProps {
  onLogin?: (credentials: LoginCredentials) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin = () => {} }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [logoAnim] = useState(new Animated.Value(0));
  const [formAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));

  // Initialize animations
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  // Animate form transition
  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isSignUp ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [isSignUp]);

  const validateForm = (): boolean => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (isSignUp) {
      if (!name.trim()) {
        Alert.alert('Error', 'Please enter your name');
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const credentials: LoginCredentials = { 
        email, 
        password,
        ...(isSignUp && { name: name.trim() })
      };
      
      onLogin(credentials);
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github'): Promise<void> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockUser = {
        email: `user@${provider}.com`,
        password: 'oauth',
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`
      };
      
      onLogin(mockUser);
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      Alert.alert('Error', `Failed to sign in with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const FloatingParticle = ({ delay = 0 }) => {
    const [particleAnim] = useState(new Animated.Value(0));

    React.useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(particleAnim, {
            toValue: 1,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(particleAnim, {
            toValue: 0,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [delay]);

    return (
      <Animated.View
        style={[
          styles.floatingParticle,
          {
            opacity: particleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.6],
            }),
            transform: [
              {
                translateY: particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -50],
                }),
              },
              {
                translateX: particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.sin(delay) * 30],
                }),
              },
            ],
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#1a1a2e', '#16213e', '#0f1419']}
        style={styles.backgroundGradient}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" translucent />
        
        {/* Floating Particles Background */}
        {Array.from({ length: 8 }).map((_, index) => (
          <FloatingParticle key={index} delay={index * 500} />
        ))}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo Section */}
            <Animated.View style={[
              styles.logoContainer,
              {
                opacity: logoAnim,
                transform: [
                  {
                    translateY: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                  {
                    scale: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}>
              <Animated.View style={[
                styles.logoBackground,
                {
                  shadowOpacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 0.8],
                  }),
                }
              ]}>
                <LinearGradient
                  colors={['#667eea', '#764ba2', '#f093fb']}
                  style={styles.logoGradient}
                >
                  <Ionicons name="sparkles" size={40} color="white" />
                </LinearGradient>
              </Animated.View>
              <Animated.View style={{
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  })
                }]
              }}>
                <Text style={styles.welcomeTitle}>
                  {isSignUp ? 'Join Neural AI' : 'Welcome Back'}
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  {isSignUp 
                    ? 'Create your account and unlock AI potential' 
                    : 'Sign in to continue your AI journey'
                  }
                </Text>
              </Animated.View>
            </Animated.View>

            {/* Form Section */}
            <Animated.View style={[
              styles.formContainer,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.formGradient}
              >
                {/* Name Input (Sign Up only) */}
                {isSignUp && (
                  <Animated.View 
                    style={[
                      styles.inputGroup,
                      {
                        opacity: slideAnim,
                        height: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 90],
                        }),
                        marginBottom: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 20],
                        }),
                      }
                    ]}
                  >
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <LinearGradient
                      colors={name ? 
                        ['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)'] : 
                        ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                      }
                      style={[styles.inputContainer, name && styles.inputContainerFocused]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={22}
                        color={name ? "#667eea" : "#6b7280"}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your full name"
                        placeholderTextColor="#4b5563"
                        autoCapitalize="words"
                        autoCorrect={false}
                        editable={!isLoading}
                      />
                    </LinearGradient>
                  </Animated.View>
                )}

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <LinearGradient
                    colors={email ? 
                      ['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)'] : 
                      ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                    }
                    style={[styles.inputContainer, email && styles.inputContainerFocused]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={22}
                      color={email ? "#667eea" : "#6b7280"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="#4b5563"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </LinearGradient>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <LinearGradient
                    colors={password ? 
                      ['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)'] : 
                      ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                    }
                    style={[styles.inputContainer, password && styles.inputContainerFocused]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={22}
                      color={password ? "#667eea" : "#6b7280"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.textInput, styles.passwordInput]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="#4b5563"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </LinearGradient>
                </View>

                {/* Confirm Password Input (Sign Up only) */}
                {isSignUp && (
                  <Animated.View 
                    style={[
                      styles.inputGroup,
                      {
                        opacity: slideAnim,
                        height: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 90],
                        }),
                      }
                    ]}
                  >
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <LinearGradient
                      colors={confirmPassword ? 
                        ['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)'] : 
                        ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                      }
                      style={[styles.inputContainer, confirmPassword && styles.inputContainerFocused]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={22}
                        color={confirmPassword ? "#667eea" : "#6b7280"}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.textInput, styles.passwordInput]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm your password"
                        placeholderTextColor="#4b5563"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        <Ionicons
                          name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                          size={22}
                          color="#6b7280"
                        />
                      </TouchableOpacity>
                    </LinearGradient>
                  </Animated.View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={isLoading || !email || !password}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      (isLoading || !email || !password)
                        ? ['rgba(75, 85, 99, 0.5)', 'rgba(55, 65, 81, 0.5)']
                        : ['#667eea', '#764ba2', '#f093fb']
                    }
                    style={styles.submitButtonGradient}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={styles.submitButtonText}>
                          {isSignUp ? 'Creating Account...' : 'Signing In...'}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Toggle Auth Mode */}
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </Text>
                  <TouchableOpacity onPress={toggleAuthMode} disabled={isLoading}>
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.toggleLinkGradient}
                    >
                      <Text style={styles.toggleLink}>
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dividerLine}
              />
              <Text style={styles.dividerText}>or continue with</Text>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dividerLine}
              />
            </View>

            {/* OAuth Buttons */}
            <View style={styles.oauthContainer}>
              <TouchableOpacity
                style={styles.oauthButton}
                onPress={() => handleOAuthLogin('google')}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ea4335', '#d33b2c']}
                  style={styles.oauthButtonGradient}
                >
                  <Ionicons name="logo-google" size={22} color="white" />
                  <Text style={styles.oauthButtonText}>Google</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.oauthButton}
                onPress={() => handleOAuthLogin('github')}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#333333', '#1a1a1a']}
                  style={styles.oauthButtonGradient}
                >
                  <Ionicons name="logo-github" size={22} color="white" />
                  <Text style={styles.oauthButtonText}>GitHub</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Demo Message */}
            <View style={styles.demoContainer}>
              <LinearGradient
                colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
                style={styles.demoBadge}
              >
                <Ionicons name="information-circle-outline" size={16} color="#667eea" />
                <Text style={styles.demoText}>
                  Demo mode: Use any credentials to {isSignUp ? 'create account' : 'sign in'}
                </Text>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  backgroundGradient: {
    flex: 1,
  },
  floatingParticle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#667eea',
    borderRadius: 2,
    top: Math.random() * screenHeight,
    left: Math.random() * screenWidth,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoBackground: {
    borderRadius: 30,
    elevation: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    marginBottom: 32,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 32,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  formGradient: {
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  inputContainerFocused: {
    borderColor: '#667eea',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  inputIcon: {
    marginRight: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    padding: 8,
  },
  submitButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 24,
    elevation: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  submitButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  toggleLinkGradient: {
    paddingHorizontal: 2,
  },
  toggleLink: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    gap: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: '#a0a0a0',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  oauthContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  oauthButton: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  oauthButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  oauthButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  demoContainer: {
    alignItems: 'center',
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  demoText: {
    fontSize: 12,
    color: '#a0a0a0',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default LoginScreen;