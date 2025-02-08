// app/api/private-send/route.ts
import { NextResponse } from 'next/server';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { NextRequest } from 'next/server';
import { Elusiv } from '@elusiv/sdk';
import nodeFetch from 'node-fetch';
import https from 'https';
import { Response as WebResponse } from 'node-fetch';

export const runtime = 'nodejs';

const CLUSTER = 'devnet';
const RPC_URL = process.env.HELIUS_RPC_URL || 'https://rpc-devnet.helius.xyz/?api-key=YOUR_API_KEY';
const WARDEN_URL = 'https://warden.devnet.elusiv.io';

// Create agent for SSL handling
const agent = new https.Agent({
  rejectUnauthorized: false
});

const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<WebResponse> => {
  let url = input.toString();
  if (!url.startsWith('http')) {
    url = url.startsWith('/warden') ? `${WARDEN_URL}${url}` : `${RPC_URL}${url}`;
  }

  return nodeFetch(url, {
    ...init,
    agent,
    headers: {
      ...init?.headers,
      'x-warden-url': WARDEN_URL
    }
  });
};

// Cast to any to avoid type conflicts
global.fetch = customFetch as any;

export async function POST(request: NextRequest) {
  try {
    const { amount, recipient, signature, publicKey } = await request.json();

    if (!amount || !recipient || !signature || !publicKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Configuring connection...');
    const connection = new Connection(RPC_URL, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000
    });

    // Test connection
    console.log('Testing connection...');
    try {
      const blockhash = await connection.getLatestBlockhash();
      console.log('Connection successful, blockhash:', blockhash.blockhash);
    } catch (connError) {
      console.error('Connection test failed:', connError);
      return NextResponse.json({ error: 'Failed to connect to Solana network' }, { status: 500 });
    }

    console.log('Creating Elusiv instance...');
    const elusiv = await Elusiv.getElusivInstance(
      Uint8Array.from(signature),
      new PublicKey(publicKey),
      connection,
      CLUSTER,
      {
        disableLogging: false,
        warnOnUnsupportedProgram: true
      }
    );

    console.log('Getting initial balance...');
    const initialBalance = await elusiv.getLatestPrivateBalance('LAMPORTS');
    console.log('Initial private balance:', initialBalance.toString());

    const amountLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    const recipientPubKey = new PublicKey(recipient);

    console.log('Building top-up transaction...');
    const topUpTx = await elusiv.buildTopUpTx(amountLamports, 'LAMPORTS');
    console.log('Sending top-up transaction...');
    const topUpResult = await elusiv.sendElusivTx(topUpTx);
    console.log('Top-up sent:', topUpResult.signature);

    // Wait for confirmation
    console.log('Confirming top-up...');
    await connection.confirmTransaction(topUpResult.signature);
    console.log('Top-up confirmed');

    // Check updated balance
    const updatedBalance = await elusiv.getLatestPrivateBalance('LAMPORTS');
    console.log('Updated private balance:', updatedBalance.toString());

    console.log('Building send transaction...');
    const sendTx = await elusiv.buildSendTx(amountLamports, recipientPubKey, 'LAMPORTS');
    console.log('Sending private transaction...');
    const sendResult = await elusiv.sendElusivTx(sendTx);
    console.log('Send complete:', sendResult.signature);

    return NextResponse.json({
      success: true,
      topUpSignature: topUpResult.signature,
      sendSignature: sendResult.signature,
      initialBalance: initialBalance.toString(),
      finalBalance: updatedBalance.toString()
    });

  } catch (error: any) {
    console.error('API error:', {
      message: error?.message,
      name: error?.name,
      code: error?.code
    });
    
    return NextResponse.json({
      error: 'Transaction failed',
      details: error.message
    }, { status: 500 });
  }
}