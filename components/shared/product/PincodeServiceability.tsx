import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, AlertCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface PincodeServiceabilityProps {
  className?: string;
  onPincodeChange?: (pincode: string) => void;
}

interface ServiceabilityResult {
  serviceability: boolean;
  message: string;
  delivery_codes?: string[];
  dev_mode?: boolean;
}

export function PincodeServiceability({ className, onPincodeChange }: PincodeServiceabilityProps) {
  const [pincode, setPincode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<ServiceabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkServiceability = async () => {
    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setIsChecking(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/delivery/check-pincode?pincode=${pincode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check pincode serviceability');
      }

      setResult(data);
      
      if (data.serviceability) {
        toast.success('Delivery available for this pincode!');
        // Call the callback with the valid pincode
        if (onPincodeChange) {
          onPincodeChange(pincode);
        }
      } else {
        toast.error('Sorry, delivery is not available for this pincode');
      }
    } catch (err: any) {
      console.error('Error checking pincode serviceability:', err);
      setError(err.message || 'Failed to check delivery availability. Please try again.');
      toast.error('Failed to check delivery availability');
    } finally {
      setIsChecking(false);
    }
  };

  const handlePincodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 6) {
      setPincode(numericValue);
      setError(null);
      setResult(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkServiceability();
    }
  };

  return (
    <div className={`space-y-4 border rounded-lg p-4 bg-gray-50/30 ${className || ''}`}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <MapPin className="h-4 w-4" />
        <span>Check Delivery Availability</span>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter 6-digit pincode"
          value={pincode}
          onChange={(e) => handlePincodeChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 text-center font-mono tracking-wider"
          maxLength={6}
          disabled={isChecking}
        />
        <Button 
          onClick={checkServiceability}
          disabled={!pincode || pincode.length !== 6 || isChecking}
          variant="outline"
          size="default"
          className="px-6 hover:bg-gray-100 hover:text-gray-900"
        >
          {isChecking ? 'Checking...' : 'Check'}
        </Button>
      </div>

      {/* Results Display */}
      {(result || error) && (
        <div className="mt-3">
          {error ? (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-yellow-800">{error}</span>
            </div>
          ) : result?.serviceability ? (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <div className="font-medium">✓ Delivery Available</div>
                <div className="text-green-700 mt-1">
                  Your order can be delivered to pincode {pincode}
                  {result.dev_mode && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded ml-2">
                      DEV MODE
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <div className="font-medium">✗ Delivery Not Available</div>
                <div className="text-red-700 mt-1">
                  {result.message || `Sorry, we don't deliver to pincode ${pincode} yet`}
                  {result.dev_mode && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded ml-2">
                      DEV MODE
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Info text */}
      <div className="text-xs text-gray-500 mt-2">
        Enter your pincode to check if we can deliver to your location
      </div>
    </div>
  );
}
