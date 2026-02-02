import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, PlayCircle, LayoutDashboard } from 'lucide-react';
import Button from '../../components/common/Button';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  const type = searchParams.get('type') || 'cart';
  const isSubscription = type === 'subscription';

  useEffect(() => {
    // Redirect to dashboard automatically after 10 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      navigate('/student/dashboard');
    }

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full text-center space-y-8 p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-50">
        
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-green-100 opacity-75"></div>
            <CheckCircle2 className="relative w-20 h-20 text-green-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-gray-900">Payment Successful!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your {isSubscription ? 'subscription is now active' : 'courses have been added to your library'}.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">What's next?</p>
          <p>You can now access all your content from your student dashboard.</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            variant="primary" 
            className="w-full py-4 flex items-center justify-center gap-2 rounded-xl"
            onClick={() => navigate('/student/dashboard')}
          >
            <LayoutDashboard className="w-5 h-5" />
            Go to My Dashboard
          </Button>
          
          <Link 
            to="/courses" 
            className="text-sm font-bold text-gray-500 hover:text-primary flex items-center justify-center gap-1 transition-colors"
          >
            Browse more courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Countdown Footer */}
        <p className="text-xs text-gray-400 pt-4">
          Redirecting to dashboard in {countdown} seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;