import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { CreditCard, Lock, CheckCircle, Loader } from 'lucide-react';
import api from '../services/api';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ course, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, [course._id]);

  const createPaymentIntent = async () => {
    try {
      const response = await api.post('/api/payments/create-intent', {
        courseId: course._id
      });

      if (response.data.success) {
        setClientSecret(response.data.data.clientSecret);
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to initialize payment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: e.target.name.value,
            email: e.target.email.value
          }
        }
      });

      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful
        toast.success('Payment successful! Enrolling you in the course...');
        
        // Confirm enrollment on backend
        await api.post('/api/payments/confirm', {
          paymentIntentId: paymentIntent.id
        });

        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('An unexpected error occurred');
      toast.error('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#9e2146'
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Course Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Course Price</span>
          <span className="text-2xl font-bold text-blue-600">
            {course.price} {course.currency || 'LKR'}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="John Doe"
        />
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="john@example.com"
        />
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <CardElement options={cardElementOptions} />
        </div>
        <p className="text-xs text-gray-500 mt-1 flex items-center">
          <Lock className="w-3 h-3 mr-1" />
          Your payment information is secure and encrypted
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing || !clientSecret}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
      >
        {isProcessing ? (
          <>
            <Loader className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay {course.price} {course.currency || 'LKR'}
          </>
        )}
      </button>

      {/* Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isProcessing}
        className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Cancel
      </button>

      {/* Security Badge */}
      <div className="flex items-center justify-center text-gray-500 text-sm">
        <Lock className="w-4 h-4 mr-1" />
        Secured by Stripe
      </div>
    </form>
  );
};

const PaymentCheckout = ({ course, isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Checkout
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Checkout Form */}
        <div className="p-6">
          <Elements stripe={stripePromise}>
            <CheckoutForm
              course={course}
              onSuccess={onSuccess}
              onCancel={onClose}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

// Payment History Component
export const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const response = await api.get('/api/payments/history');
      if (response.data.success) {
        setPayments(response.data.data.history);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No payment history found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <p className="font-medium">{payment.courseTitle || 'Course Enrollment'}</p>
            <p className="text-sm text-gray-500">
              {new Date(payment.paidAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-blue-600">
              {payment.amount} {payment.currency?.toUpperCase()}
            </p>
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              {payment.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentCheckout;
