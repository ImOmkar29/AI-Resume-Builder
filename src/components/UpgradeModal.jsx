import React, { useState } from 'react';
import { X, Crown, Check, IndianRupee, Zap, Infinity, Sparkles } from 'lucide-react';

const UpgradeModal = ({ isOpen, onClose, userId, email, onUpgradeSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;


  const RAZORPAY_TEST_KEY = 'rzp_test_SQTND31YQYXcSY';

  const plans = {
    monthly: {
      id: 'monthly',
      name: 'Monthly',
      price: '399',
      amount: 39900, // in paise (399 * 100)
      period: 'month',
      features: [
        'Unlimited resumes',
        'All templates',
        'AI summary generation',
        'ATS score analysis',
        'Priority support'
      ],
      icon: <Zap className="text-blue-500" size={20} />
    },
    yearly: {
      id: 'yearly',
      name: 'Yearly',
      price: '2,999',
      amount: 299900,
      period: 'year',
      features: [
        'Everything in Monthly',
        'Save ₹1,189 (2 months free)',
        'Early access to templates',
        'Export to multiple formats'
      ],
      popular: true,
      savings: 'Save 37%',
      icon: <Sparkles className="text-purple-500" size={20} />
    },
    lifetime: {
      id: 'lifetime',
      name: 'Lifetime',
      price: '5,999',
      amount: 599900,
      period: 'one-time',
      features: [
        'Everything in Yearly',
        'No recurring fees',
        'Lifetime updates',
        'Future premium features',
        'Premium support'
      ],
      icon: <Infinity className="text-green-500" size={20} />
    }
  };

  const handlePayment = () => {
    setLoading(true);

    const options = {
      key: RAZORPAY_TEST_KEY,
      amount: plans[selectedPlan].amount,
      currency: 'INR',
      name: 'AI Resume Builder',
      description: `${plans[selectedPlan].name} Plan`,
      image: '/logo.png', // Optional: Add your logo
      handler: function(response) {
        // Payment successful
        onUpgradeSuccess({
          paymentId: response.razorpay_payment_id,
          amount: plans[selectedPlan].amount,
          plan: selectedPlan
        });
        onClose();
        setLoading(false);
      },
      prefill: {
        email: email,
        contact: ''
      },
      notes: {
        userId: userId,
        plan: selectedPlan
      },
      theme: {
        color: '#2563eb'
      },
      modal: {
        ondismiss: function() {
          setLoading(false);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl max-w-5xl w-full shadow-2xl my-8">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
            <Crown className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Upgrade to Premium</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Test Mode Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm font-medium mb-1">🔧 Test Mode Active</p>
            <p className="text-yellow-700 text-xs">
              Use test card: <span className="font-mono bg-yellow-100 px-2 py-1 rounded">4111 1111 1111 1111</span> | 
              Expiry: 12/25 | CVV: 123
            </p>
          </div>

          {/* Limit reached message */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800 text-center font-medium">
              🎯 You've reached the free limit (1 resume). Upgrade to unlock unlimited resumes!
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`border rounded-xl p-6 cursor-pointer transition-all ${
                  selectedPlan === key
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300'
                } ${plan.popular ? 'relative' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    BEST VALUE
                  </span>
                )}

                <div className="flex items-center gap-2 mb-3">
                  {plan.icon}
                  <h3 className="text-lg font-semibold text-gray-800">{plan.name}</h3>
                </div>

                <div className="mb-4">
                  <div className="flex items-center">
                    <IndianRupee size={20} className="text-gray-600" />
                    <span className="text-3xl font-bold">₹{plan.price}</span>
                  </div>
                  <p className="text-sm text-gray-500">/{plan.period}</p>
                  {plan.savings && (
                    <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Processing...
                </>
              ) : (
                <>
                  <IndianRupee size={16} />
                  Pay ₹{plans[selectedPlan].price}
                </>
              )}
            </button>
          </div>

          {/* Payment Methods */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              Test Mode: Use card 4111 1111 1111 1111 • UPI • Cards • NetBanking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;