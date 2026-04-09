import API from './axios';

// Initiate payment — COD or ONLINE
export async function initiatePayment(addressId, paymentMode) {
  const res = await API.post('/api/payment/initiate', { addressId, paymentMode });
  return res.data;
}

// Verify Razorpay payment after popup success
export async function verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature, addressId) {
  const res = await API.post(`/api/payment/verify?addressId=${addressId}`, {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
  return res.data;
}