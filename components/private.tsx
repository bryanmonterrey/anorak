'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function PrivateSend() {
  const { publicKey, signMessage } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleTransfer = async () => {
    if (!publicKey || !signMessage) {
      setError('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Preparing transaction...');

    try {
      const message = 'Sign this message to enable private transactions';
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);

      setStatus('Processing private transaction...');
      
      const requestData = {
        signature: Array.from(signature),
        publicKey: publicKey.toBase58(),
        amount,
        recipient
      };

      console.log('Sending request:', {
        ...requestData,
        signature: 'REDACTED' // Don't log the full signature
      });

      const response = await fetch('/api/private-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('Received response:', data);

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to process transaction');
      }

      if (data.topUpSignature) {
        setStatus(`Transaction complete!\nTop-up: ${data.topUpSignature}\nSend: ${data.sendSignature}`);
      } else {
        setStatus(`Transaction complete!\nSignature: ${data.signature}`);
      }
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Send Private SOL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Recipient Public Key"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={loading}
        />
        <Input
          type="number"
          placeholder="Amount SOL"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.1"
          disabled={loading}
        />
        <Button 
          onClick={handleTransfer}
          disabled={loading || !publicKey}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {status || 'Processing'}
            </>
          ) : (
            'Send Private Transaction'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription className="break-all">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {status && !error && (
          <Alert>
            <AlertDescription className="break-all whitespace-pre-line">
              {status}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}