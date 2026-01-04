'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, AlertCircle, CheckCircle, Send, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useWebsiteLogo } from '@/hooks/use-website-logo';

export default function ForgotPasswordPage() {
  const { logo, isLoading: logoLoading } = useWebsiteLogo();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send reset link. Please try again.');
        toast.error(data.message || 'Failed to send reset link.');
      } else {
        setSuccessMessage(data.message || 'If an account exists, a password reset link has been sent.');
        toast.success(data.message || 'Password reset link sent (if account exists).');
        setEmail(''); // Clear email field on success
      }
    } catch (err) {
      console.error('Forgot password exception:', err);
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred.');
    } finally {
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
              Reset Your Password
            </h1>
            <p className="text-lg xl:text-xl opacity-95 leading-relaxed font-light">
              Enter your email address and we'll send you a secure link to reset your password and get you back to shopping.
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Reset Your Password</h1>
          </div>

          <Card className="border-0 shadow-xl sm:shadow-2xl bg-white dark:bg-gray-800 relative overflow-hidden">
            <CardHeader className="space-y-2 sm:space-y-3 text-center pb-6 sm:pb-8 pt-6 sm:pt-8 lg:pt-10 px-4 sm:px-6 lg:px-8">
              <div className="mx-auto bg-gray-100 dark:bg-gray-700 rounded-full p-3 sm:p-4 w-fit mb-3 sm:mb-4 shadow-lg">
                <KeyRound className="w-8 h-8 sm:w-10 sm:h-10 sm:w-12 sm:h-12 text-gray-600 dark:text-gray-300" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Forgot Password
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-normal">
                Enter your email to receive a password reset link
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-6 lg:px-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {error && (
                  <div className="flex items-start sm:items-center p-3 sm:p-4 text-xs sm:text-sm text-red-700 bg-red-50 rounded-xl border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800 animate-shake">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="break-words">{error}</span>
                  </div>
                )}
                {successMessage && (
                  <div className="flex items-start sm:items-center p-3 sm:p-4 text-xs sm:text-sm text-green-700 bg-green-50 rounded-xl border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800 animate-bounce">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="break-words">{successMessage}</span>
                  </div>
                )}
                
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
                      onChange={handleInputChange}
                      required
                      className="pl-10 sm:pl-12 h-12 sm:h-14 border-2 border-gray-200 focus:border-gray-700 dark:border-gray-600 dark:focus:border-gray-500 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-20 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                      disabled={isLoading || !!successMessage}
                    />
                  </div>
                </div>
                
                {!successMessage ? (
                  <Button 
                    type="submit" 
                    className="w-full h-12 sm:h-14 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending Link...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Send Reset Link</span>
                        <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    )}
                  </Button>
                ) : (
                  <Button 
                    asChild 
                    className="w-full h-12 sm:h-14 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    <Link href="/auth/signin">Return to Sign In</Link>
                  </Button>
                )}
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                Remember your password?{' '}
                <Link href="/auth/signin" className="font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors hover:underline">
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </Card>

          <p className="text-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-6 sm:mt-8 leading-relaxed px-4">
            Need help? <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
