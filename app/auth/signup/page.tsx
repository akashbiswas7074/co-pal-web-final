'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, User as UserIcon, Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useWebsiteLogo } from '@/hooks/use-website-logo';

export default function SignUpPage() {
  const router = useRouter();
  const { logo, isLoading: logoLoading } = useWebsiteLogo();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setError(null); // Clear error on input change
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        toast.error('Password must be at least 6 characters long.');
        return;
    }

    if (!firstName.trim() || !lastName.trim()) {
        setError('First name and last name are required.');
        toast.error('First name and last name are required.');
        return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        toast.error(data.message || 'Registration failed.');
      } else {
        toast.success('Registration successful! Please check your email to verify your account.');
        // Redirect to a page informing the user to check their email
        router.push('/auth/verify-email-notice');
      }
    } catch (err) {
      console.error('Registration exception:', err);
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
              Join {logo?.name || "VibeCart"} Today
            </h1>
            <p className="text-lg xl:text-xl opacity-95 leading-relaxed font-light">
              Create an account to enjoy personalized shopping experiences, order tracking, and exclusive offers.
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Join {logo?.name || "VibeCart"} Today!</h1>
          </div>
          
          <Card className="border-0 shadow-xl sm:shadow-2xl bg-white dark:bg-gray-800 relative overflow-hidden">
            <CardHeader className="space-y-2 sm:space-y-3 text-center pb-6 sm:pb-8 pt-6 sm:pt-8 lg:pt-10 px-4 sm:px-6 lg:px-8">
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Create Account
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-normal">
                Enter your details to get started
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
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">First Name</Label>
                      <div className="relative group">
                        <UserIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-gray-700 transition-colors z-10" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={handleInputChange(setFirstName)}
                          required
                          className="pl-10 sm:pl-12 pr-4 h-12 sm:h-14 border-2 border-gray-200 focus:border-gray-700 dark:border-gray-600 dark:focus:border-gray-500 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-20 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Last Name</Label>
                      <div className="relative group">
                        <UserIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-gray-700 transition-colors z-10" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={handleInputChange(setLastName)}
                          required
                          className="pl-10 sm:pl-12 pr-4 h-12 sm:h-14 border-2 border-gray-200 focus:border-gray-700 dark:border-gray-600 dark:focus:border-gray-500 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-20 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Username</Label>
                    <div className="relative group">
                      <UserIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-gray-700 transition-colors z-10" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        value={username}
                        onChange={handleInputChange(setUsername)}
                        required
                        className="pl-10 sm:pl-12 pr-4 h-12 sm:h-14 border-2 border-gray-200 focus:border-gray-700 dark:border-gray-600 dark:focus:border-gray-500 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-20 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Email Address</Label>
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
                    <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Password</Label>
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
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">Confirm Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-gray-700 transition-colors z-10" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={handleInputChange(setConfirmPassword)}
                        required
                        className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 border-2 border-gray-200 focus:border-gray-700 dark:border-gray-600 dark:focus:border-gray-500 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-20 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors z-10"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
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
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Create Account</span>
                      <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                Already have an account?{' '}
                <Link 
                  href="/auth/signin" 
                  className="font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </Card>
          
          <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-6 sm:mt-8 dark:text-gray-400 leading-relaxed px-4">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:underline">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
