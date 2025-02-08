// app/api/elusiv/route.ts
import { NextResponse } from 'next/server';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { NextRequest } from 'next/server';
import { getElusivInstance } from '@/lib/elusiv-setup';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { amount, recipient, signature, publicKey } = await request.json();
    
    if (!amount || !recipient || !signature || !publicKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const elusiv = await getElusivInstance(signature, publicKey);

    console.log('Getting private balance...');
    const amountLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    const recipientPubKey = new PublicKey(recipient);
    const privateBalance = await elusiv.getLatestPrivateBalance('LAMPORTS');
    console.log('Current private balance:', privateBalance.toString());

    // Try to send transaction
    try {
      console.log('Creating send transaction...');
      const sendTx = await elusiv.buildSendTx(amountLamports, recipientPubKey, 'LAMPORTS');
      console.log('Sending transaction...');
      const sendResult = await elusiv.sendElusivTx(sendTx);
      console.log('Send complete:', sendResult.signature);

      return NextResponse.json({
        success: true,
        signature: sendResult.signature
      });
    } catch (sendError) {
      // If send fails, try top-up first
      console.log('Direct send failed, trying top-up...');
      const topUpTx = await elusiv.buildTopUpTx(amountLamports, 'LAMPORTS');
      const topUpResult = await elusiv.sendElusivTx(topUpTx);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const sendTx = await elusiv.buildSendTx(amountLamports, recipientPubKey, 'LAMPORTS');
      const sendResult = await elusiv.sendElusivTx(sendTx);

      return NextResponse.json({
        success: true,
        topUpSignature: topUpResult.signature,
        sendSignature: sendResult.signature
      });
    }

  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    return NextResponse.json({
      error: error.message,
      type: error.name,
      details: error.stack
    }, { status: 500 });
  }
}