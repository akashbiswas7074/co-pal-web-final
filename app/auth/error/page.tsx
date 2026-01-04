'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useWebsiteLogo } from '@/hooks/use-website-logo';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams?.get('error') || null;
    const { logo, isLoading: logoLoading } = useWebsiteLogo();

    const getErrorMessage = (errorCode: string | null): string => {
        switch (errorCode) {
            case 'Configuration':
                return 'There is a problem with the server configuration.';
            case 'AccessDenied':
                return 'You do not have permission to sign in.';
            case 'Verification':
                return 'The sign-in link is no longer valid. It may have expired or already been used.';
            case 'UseGoogleLogin':
                return 'This email is registered with Google. Please use the Google sign-in option instead.';
            case 'UsePhoneLogin':
                return 'This account uses phone authentication. Please use the Phone sign-in option instead.';
            case 'OAuthSignin':
            case 'OAuthCallback':
            case 'OAuthCreateAccount':
            case 'EmailCreateAccount':
            case 'Callback':
                return 'There was an error during the sign-in process. Please try again.';
            case 'OAuthAccountNotLinked':
                return 'This email is already linked with another provider. Try signing in with that provider.';
            case 'EmailSignin':
                return 'Failed to send the sign-in email. Please try again.';
            case 'CredentialsSignin':
                return 'Sign in failed. Check the details you provided are correct.';
            case 'SessionRequired':
                return 'Please sign in to access this page.';
            case 'Invalid or expired verification link':
                return 'The email verification link is invalid or has expired.';
            case 'Verification token missing':
                return 'The email verification link is incomplete.';
            case 'Verification failed':
                return 'An error occurred during email verification.';
            default:
                return 'An unexpected error occurred during authentication.';
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
                    Authentication Error
                  </h1>
                  <p className="text-lg xl:text-xl opacity-95 leading-relaxed font-light">
                    We encountered an issue with your authentication request. Let's get you back on track.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column - Content section */}
            <div className="w-full lg:w-1/2 lg:flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 lg:py-16 relative z-10 bg-white dark:bg-gray-900" style={{ minHeight: '100vh' }}>
                <div className="w-full max-w-lg">
                    <div className="text-center mb-6 sm:mb-8 lg:hidden">
                        <Image 
                            src={logo?.logoUrl || "/logo.png"} 
                            alt={logo?.altText || "Company Logo"} 
                            width={160} 
                            height={50}
                            className="mx-auto mb-3 sm:mb-4 drop-shadow-md w-auto h-auto max-w-[140px] sm:max-w-[160px]"
                        />
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Authentication Error</h1>
                    </div>
                    
                    <Card className="border-0 shadow-xl sm:shadow-2xl bg-white dark:bg-gray-800 relative overflow-hidden">
                        <CardHeader className="text-center space-y-2 sm:space-y-3 pb-6 sm:pb-8 pt-6 sm:pt-8 lg:pt-10 px-4 sm:px-6 lg:px-8">
                            <div className="mx-auto bg-red-100 rounded-full p-3 sm:p-4 w-fit mb-3 sm:mb-4 shadow-lg dark:bg-red-900/30">
                                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Authentication Error
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-normal">
                                {getErrorMessage(error)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4 px-4 sm:px-6 lg:px-8">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                This may be due to an expired session, invalid credentials, or a system issue.
                            </p>
                            <div className="flex flex-col space-y-2 sm:space-y-3">
                                <Button 
                                  asChild
                                  className="w-full h-12 sm:h-14 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
                                >
                                    <Link href="/auth/signin">Return to Sign In</Link>
                                </Button>
                                <Button 
                                  asChild 
                                  variant="outline"
                                  className="w-full h-12 sm:h-14 border-2 border-gray-200 hover:border-gray-300 font-semibold text-sm sm:text-base rounded-xl transition-all duration-200"
                                >
                                    <Link href="/">Go to Homepage</Link>
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                                Need help? <Link href="/contact" className="font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors hover:underline">Contact Support</Link>
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
            </div>
        }>
            <ErrorContent />
        </Suspense>
    );
}
