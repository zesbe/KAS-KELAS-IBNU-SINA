import axios from 'axios';
import { PakasirWebhookPayload } from '../types';

const PAKASIR_BASE_URL = 'https://pakasir.zone.id';
const PAKASIR_SLUG = process.env.REACT_APP_PAKASIR_SLUG!;
const PAKASIR_API_KEY = process.env.REACT_APP_PAKASIR_API_KEY!;

export const pakasirService = {
  generatePaymentUrl(orderId: string, amount: number): string {
    // Use current domain for redirect URL
    const currentDomain = window.location.origin;
    
    const params = new URLSearchParams({
      order_id: orderId,
      qris_only: '1',
      redirect: `${currentDomain}/payment-success`
    });
    
    return `${PAKASIR_BASE_URL}/pay/${PAKASIR_SLUG}/${amount}?${params.toString()}`;
  },

  async checkTransactionStatus(orderId: string, amount: number): Promise<PakasirWebhookPayload | null> {
    try {
      const params = new URLSearchParams({
        project: PAKASIR_SLUG,
        amount: amount.toString(),
        order_id: orderId,
        api_key: PAKASIR_API_KEY
      });

      const response = await axios.get(
        `${PAKASIR_BASE_URL}/api/transactiondetail?${params.toString()}`
      );

      if (response.data && response.data.transaction) {
        return response.data.transaction;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return null;
    }
  },

  validateWebhookPayload(payload: PakasirWebhookPayload, expectedAmount: number, expectedOrderId: string): boolean {
    return payload.amount === expectedAmount && 
           payload.order_id === expectedOrderId && 
           payload.project === PAKASIR_SLUG;
  }
};