import React, { useState } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Elusiv with no SSR
const ElusivComponent = dynamic(() => import('./elusiv'), { 
  ssr: false,
  loading: () => <div>Loading...</div>
});

const PrivateTransactionComponent = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Send Private Transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Recipient Public Key"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Amount (SOL)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            min="0"
            step="0.1"
          />
        </div>

        <ElusivComponent 
          recipient={recipient}
          amount={amount}
          onSuccess={(sig) => setSuccess(`Transaction sent! Signature: ${sig}`)}
          onError={(err) => setError(err)}
          onLoading={(isLoading) => setLoading(isLoading)}
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PrivateTransactionComponent;