"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck, CheckCircle, Lock, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useWebsiteLogo } from "@/hooks/use-website-logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  const { logo, isLoading: logoLoading } = useWebsiteLogo();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Automatically redirect after success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess) {
      timer = setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isSuccess, router]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      toast.success("Password reset successfully! Redirecting to sign in...");
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "An error occurred");
      toast.error(error.message || "An error occurred during password reset");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/75 z-10"></div>
          <div 
            className="absolute top-0 bottom-0 right-0 pointer-events-none z-20"
            style={{
              width: '350px',
              background: 'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.02) 3%, rgba(255, 255, 255, 0.05) 8%, rgba(255, 255, 255, 0.1) 15%, rgba(255, 255, 255, 0.18) 25%, rgba(255, 255, 255, 0.3) 35%, rgba(255, 255, 255, 0.45) 45%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.75) 55%, rgba(255, 255, 255, 0.85) 65%, rgba(255, 255, 255, 0.92) 75%, rgba(255, 255, 255, 0.96) 85%, rgba(255, 255, 255, 0.98) 92%, rgba(255, 255, 255, 0.99) 96%, rgba(255, 255, 255, 1) 100%)',
              backdropFilter: 'blur(1px)',
              WebkitBackdropFilter: 'blur(5px)',
            }}
          ></div>
          
          <div className="relative z-50 flex flex-col justify-center px-8 xl:px-16 py-12 xl:py-20 text-white h-full">
            <div className="max-w-lg">
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
                Password Updated!
              </h1>
              <p className="text-lg xl:text-xl opacity-95 leading-relaxed font-light">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>
          </div>
        </div>

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
            </div>
            
            <Card className="border-0 shadow-xl sm:shadow-2xl bg-white dark:bg-gray-800 relative overflow-hidden text-center">
              <CardHeader className="space-y-2 sm:space-y-3 pb-6 sm:pb-8 pt-6 sm:pt-8 lg:pt-10 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto bg-green-100 rounded-full p-3 sm:p-4 w-fit mb-3 sm:mb-4 shadow-lg dark:bg-green-900/30">
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Password Reset Successful
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-normal">
                  Your password has been updated.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 lg:px-8">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">You will be redirected to the sign-in page shortly...</p>
                <Button 
                  asChild 
                  className="w-full h-12 sm:h-14 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  <Link href="/auth/signin">Proceed to Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/75 z-10"></div>
        <div 
          className="absolute top-0 bottom-0 right-0 pointer-events-none z-20"
          style={{
            width: '350px',
            background: 'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.02) 3%, rgba(255, 255, 255, 0.05) 8%, rgba(255, 255, 255, 0.1) 15%, rgba(255, 255, 255, 0.18) 25%, rgba(255, 255, 255, 0.3) 35%, rgba(255, 255, 255, 0.45) 45%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.75) 55%, rgba(255, 255, 255, 0.85) 65%, rgba(255, 255, 255, 0.92) 75%, rgba(255, 255, 255, 0.96) 85%, rgba(255, 255, 255, 0.98) 92%, rgba(255, 255, 255, 0.99) 96%, rgba(255, 255, 255, 1) 100%)',
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(5px)',
          }}
        ></div>
        
        <div className="relative z-50 flex flex-col justify-center px-8 xl:px-16 py-12 xl:py-20 text-white h-full">
          <div className="max-w-lg">
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
              Create a new password for your {logo?.name || "VibeCart"} account to ensure your account remains secure.
            </p>
          </div>
        </div>
      </div>

      {/* Right column - Professional Form section */}
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Reset Your Password</h1>
          </div>
          
          <Card className="border-0 shadow-xl sm:shadow-2xl bg-white dark:bg-gray-800 relative overflow-hidden">
            <CardHeader className="space-y-2 sm:space-y-3 text-center pb-6 sm:pb-8 pt-6 sm:pt-8 lg:pt-10 px-4 sm:px-6 lg:px-8">
              <div className="mx-auto bg-gray-100 dark:bg-gray-700 rounded-full p-3 sm:p-4 w-fit mb-3 sm:mb-4 shadow-lg">
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 dark:text-gray-300" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Reset Your Password
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-normal">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-6 lg:px-8">
              {error && (
                <div className="flex items-start sm:items-center p-3 sm:p-4 text-xs sm:text-sm text-red-700 bg-red-50 rounded-xl border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800 mb-4 sm:mb-6">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="break-words">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100" htmlFor="password">
                    New Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-gray-700 transition-colors z-10" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your new password"
                      className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 border-2 border-gray-200 focus:border-gray-700 dark:border-gray-600 dark:focus:border-gray-500 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-20 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400" 
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors z-10"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100" htmlFor="confirmPassword">
                    Confirm New Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-gray-700 transition-colors z-10" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm your new password"
                      className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 border-2 border-gray-200 focus:border-gray-700 dark:border-gray-600 dark:focus:border-gray-500 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-gray-700 focus:ring-opacity-20 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors z-10"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 sm:h-14 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-2" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Resetting Password...</span>
                    </div>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Remembered your password?{" "}
                <Link href="/auth/signin" className="font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors hover:underline">
                  Sign in
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
