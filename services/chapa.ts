import { getApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export interface ChapaInitResult {
  checkoutUrl: string;
  txRef: string;
}

export interface ChapaPaymentParams {
  amount: number;
  currency: 'ETB';
  email: string;
  firstName: string;
  lastName: string;
  title: string; // e.g. "Tithe - TOPIC Digital"
  donationId: string;
  callbackPath: string; // deep link path for return, e.g. '/giving'
}

// Calls Cloud Function to initialize a Chapa payment
export async function initializeChapaPayment(
  params: ChapaPaymentParams
): Promise<ChapaInitResult> {
  const functions = getFunctions(getApp());
  const initPayment = httpsCallable<ChapaPaymentParams, ChapaInitResult>(
    functions,
    'initializeChapaPayment'
  );
  const result = await initPayment(params);
  return result.data;
}

// Opens the Chapa checkout in the browser
// Returns true if payment was likely completed (URL contains success indicator)
export async function openChapaCheckout(checkoutUrl: string): Promise<'completed' | 'cancelled' | 'unknown'> {
  const result = await WebBrowser.openAuthSessionAsync(
    checkoutUrl,
    Linking.createURL('/giving')
  );

  if (result.type === 'success') {
    const url = result.url ?? '';
    if (url.includes('status=success') || url.includes('payment=success')) {
      return 'completed';
    }
    return 'unknown';
  }
  if (result.type === 'cancel' || result.type === 'dismiss') {
    return 'cancelled';
  }
  return 'unknown';
}
