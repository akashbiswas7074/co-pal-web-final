'use client';

import { useState, Suspense, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, LogIn, Mail, Lock, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhoneLoginForm from '@/components/shared/auth/PhoneLoginForm';
import { useWebsiteLogo } from '@/hooks/use-website-logo';

function SignInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const error = searchParams?.get('error');
  const trigger = searchParams?.get('trigger');
  const verified = searchParams?.get('verified');
  const initialEmail = searchParams?.get('email') || '';
  const initialTab = searchParams?.get('tab') || 'email';
  const { logo, isLoading: logoLoading } = useWebsiteLogo();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(error ? getErrorMessage(error) : null);
  const [successMessage, setSuccessMessage] = useState<string | null>(verified ? 'Email verified successfully! Please sign in.' : null);

  // Check for Google trigger parameter and redirect if present
  useEffect(() => {
    if (trigger === 'google') {
      toast.info('This account uses Google authentication. Redirecting to Google sign-in...');
      setTimeout(() => {
        signIn('google', { callbackUrl });
      }, 1000);
    }
  }, [trigger, callbackUrl]);

  // Clear messages when user starts typing
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setFormError(null);
    setSuccessMessage(null);
  };

  // Handle form submission with credentials
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const result = await signIn('credentials', {
        redirect: false, // Handle redirect manually
        email,
        password,
        callbackUrl,
      });

      if (result?.error) {
        console.error("Sign-in error:", result.error);
        
        // If error is UseGoogleLogin or OAuthAccountNotLinked, automatically redirect to Google signin
        if (result.error === "UseGoogleLogin" || result.error === "OAuthAccountNotLinked") {
          toast.info('Redirecting to Google login...');
          // Small delay to show the toast before redirecting
          setTimeout(() => {
            signIn('google', { callbackUrl });
          }, 500);
          return;
        }
        
        setFormError(getErrorMessage(result.error));
        toast.error(getErrorMessage(result.error)); // Show toast notification
      } else if (result?.ok && result.url) {
        toast.success('Signed in successfully!');
        router.push(result.url); // Redirect on success
      } else {
        // Handle unexpected cases
        setFormError('An unexpected error occurred. Please try again.');
        toast.error('An unexpected error occurred.');
      }
    } catch (error) {
      console.error("Sign-in exception:", error);
      setFormError('An error occurred during sign in. Please try again.');
      toast.error('Sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign-in with better error handling
  const handleGoogleSignIn = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      toast.info('Redirecting to Google sign-in...');
      await signIn('google', { 
        callbackUrl,
        redirect: false 
      });
      // Note: The actual redirect will be handled by NextAuth
    } catch (error) {
      console.error("Google sign-in error:", error);
      setFormError('Failed to initiate Google sign-in. Please try again.');
      toast.error('Google sign-in failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Left column - Professional Image Background section */}
      <div 
        className="hidden lg:flex relative overflow-hidden"
        style={{
          width: '50%',
          minHeight: '100vh',
        }}
      >
        {/* Fixed background image - sticks to left half of screen */}
        <div
          className="fixed inset-0"
          style={{
            width: '50vw',
            height: '100vh',
            left: 0,
            top: 0,
            backgroundImage: `url('https://res.cloudinary.com/dgfk4nqhf/image/upload/v1767465033/image_ty1t8h.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
          }}
        ></div>
        
        {/* Professional overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/75 z-10"></div>
        
        {/* Seamless blend attaching both sections - positioned at right edge */}
        <div 
          className="absolute top-0 bottom-0 right-0 pointer-events-none z-20"
          style={{
            width: '350px',
            background: 'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.02) 3%, rgba(255, 255, 255, 0.05) 8%, rgba(255, 255, 255, 0.1) 15%, rgba(255, 255, 255, 0.18) 25%, rgba(255, 255, 255, 0.3) 35%, rgba(255, 255, 255, 0.45) 45%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.75) 55%, rgba(255, 255, 255, 0.85) 65%, rgba(255, 255, 255, 0.92) 75%, rgba(255, 255, 255, 0.96) 85%, rgba(255, 255, 255, 0.98) 92%, rgba(255, 255, 255, 0.99) 96%, rgba(255, 255, 255, 1) 100%)',
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(5px)',
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-50 flex flex-col justify-center px-8 xl:px-16 py-12 xl:py-20 text-white h-full">
          <div className="max-w-lg">
            {/* Logo */}
            <div className="flex items-center mb-6 xl:mb-8">
              <Image 
                src={logo?.mobileLogoUrl || logo?.logoUrl || "/logo-white.png"} 
                alt={logo?.altText || "Company Logo"} 
                width={200} 
                height={60}
                className="drop-shadow-lg w-auto h-auto max-w-[180px] xl:max-w-[200px]"
              />
            </div>
            
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold mb-4 xl:mb-6 text-white tracking-tight">
              Welcome Back to {logo?.name || "VibeCart"}!
            </h1>
            <p className="text-lg xl:text-xl opacity-95 leading-relaxed font-light">
              Sign in to access your account and continue your shopping experience.
            </p>
          </div>
        </div>
      </div>

      {/* Right column - Professional Form section */}
      <div className="w-full lg:w-1/2 lg:flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 lg:py-16 relative z-10 bg-white dark:bg-gray-900" style={{ minHeight: '100vh' }}>
        <div className="w-full max-w-lg">
          {/* Mobile logo section */}
          <div className="text-center mb-6 sm:mb-8 lg:hidden">
            <Image 
              src={logo?.logoUrl || "/logo.png"} 
              alt={logo?.altText || "Company Logo"} 
              width={160} 
              height={50}
              className="mx-auto mb-3 sm:mb-4 drop-shadow-md w-auto h-auto max-w-[140px] sm:max-w-[160px]"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Welcome Back to {logo?.name || "VibeCart"}!</h1>
          </div>
          
          <Card className="border-0 shadow-xl sm:shadow-2xl bg-white dark:bg-gray-800 relative overflow-hidden">
            <CardHeader className="space-y-2 sm:space-y-3 text-center pb-6 sm:pb-8 pt-6 sm:pt-8 lg:pt-10 px-4 sm:px-6 lg:px-8">
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Sign In
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-normal">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-6 lg:px-8">
              <Tabs defaultValue={initialTab === 'phone' ? 'phone' : 'email'}>
                <TabsList className="grid grid-cols-2 mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                  <TabsTrigger value="email" className="flex items-center justify-center gap-1 sm:gap-2 rounded-lg transition-all duration-200 text-xs sm:text-sm">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium">Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center justify-center gap-1 sm:gap-2 rounded-lg transition-all duration-200 text-xs sm:text-sm">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium">Phone</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="space-y-4 sm:space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {formError && (
                      <div className="flex items-start sm:items-center p-3 sm:p-4 text-xs sm:text-sm text-red-700 bg-red-50 rounded-xl border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800 animate-shake">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span className="break-words">{formError}</span>
                      </div>
                    )}
                    {successMessage && (
                      <div className="flex items-start sm:items-center p-3 sm:p-4 text-xs sm:text-sm text-green-700 bg-green-50 rounded-xl border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800 animate-bounce">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span className="break-words">{successMessage}</span>
                      </div>
                    )}
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Email Address
                        </Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-gray-700 transition-colors z-10" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={handleInputChange(setEmail)}
                            required
                            className="pl-10 sm:pl-12 pr-4 h-12 sm:h-14 border-2 border-gray-200 focus:border-gray-700 dark:border-gray-600 dark:focus:border-gray-500 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-20 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Password
                          </Label>
                          <Link 
                            href="/auth/forgot-password" 
                            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          >
                            Forgot Password?
                          </Link>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-gray-700 transition-colors z-10" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={handleInputChange(setPassword)}
                            required
                            className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 border-2 border-gray-200 focus:border-gray-700 dark:border-gray-600 dark:focus:border-gray-500 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-20 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors z-10"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 sm:h-14 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Sign In</span>
                          <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                      )}
                    </Button>
                  </form>

                  <div className="relative my-6 sm:my-8">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200 dark:border-gray-700"></span>
                    </div>
                    <div className="relative flex justify-center text-xs sm:text-sm font-medium">
                      <span className="bg-white dark:bg-gray-800 px-3 sm:px-4 text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 sm:h-14 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm">{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                    </div>
                  </Button>
                </TabsContent>
                
                <TabsContent value="phone">
                  <PhoneLoginForm redirectUrl={callbackUrl} />
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                Don't have an account?{' '}
                <Link 
                  href="/auth/signup" 
                  className="font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </CardFooter>
          </Card>
          
          <p className="text-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-6 sm:mt-8 leading-relaxed px-4">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:underline">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to provide user-friendly error messages
function getErrorMessage(error: string): string {
  switch (error) {
    case 'CredentialsSignin':
      return 'Invalid email or password. Please try again.';
    case 'UseGoogleLogin':
      return 'This email is registered with Google. Please use the "Sign In with Google" button instead.';
    case 'UsePhoneLogin':
      return 'This email is associated with a phone login. Please use the Phone tab to sign in.';
    case 'OAuthAccountNotLinked':
      return 'This email is already associated with another sign-in method.';
    case 'EmailCreateAccount':
      return 'Could not create account. Please try again.';
    case 'Callback':
      return 'There was an issue during the sign-in process. Please try again.';
    default:
      return 'Sign in failed. Please check your credentials or try another method.';
  }
}

// Enhanced loading component
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <SignInFormContent />
    </Suspense>
  );
}
