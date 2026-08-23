/**
 * Flag 36: Razorpay Payment Integration
 *
 * Usage:
 *   const { initiatePayment } = useRazorpay();
 *   const result = await initiatePayment({ amount: 850, patientName: "Ramesh", purpose: "Consultation" });
 *   if (result.success) { /* payment confirmed, save to billing */ }
 */

export interface RazorpayPaymentParams {
  amount: number; // in INR (not paise)
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  purpose: string; // "Consultation Fee", "Lab Test", "Package Payment"
  orderId?: string; // your internal reference
  description?: string;
}

export interface RazorpayResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

// Razorpay key from environment
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

/**
 * Load Razorpay script dynamically (if not already loaded)
 */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay checkout and return payment result
 */
export async function initiateRazorpayPayment(params: RazorpayPaymentParams): Promise<RazorpayResult> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    return { success: false, error: "Failed to load payment gateway. Check internet connection." };
  }

  return new Promise((resolve) => {
    const options = {
      key: RAZORPAY_KEY,
      amount: Math.round(params.amount * 100), // Convert to paise
      currency: "INR",
      name: "Ayuzee Healthcare",
      description: params.description || params.purpose,
      image: "/favicon.ico",
      prefill: {
        name: params.patientName,
        email: params.patientEmail || "",
        contact: params.patientPhone || "",
      },
      notes: {
        purpose: params.purpose,
        order_id: params.orderId || "",
      },
      theme: { color: "#f97316" }, // Ayuzee orange
      handler: (response: any) => {
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          resolve({ success: false, error: "Payment cancelled by user" });
        },
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        resolve({
          success: false,
          error: response.error?.description || "Payment failed",
        });
      });
      rzp.open();
    } catch (e: any) {
      resolve({ success: false, error: e.message || "Payment gateway error" });
    }
  });
}

/**
 * Hook wrapper for components
 */
export function useRazorpay() {
  return { initiatePayment: initiateRazorpayPayment };
}
