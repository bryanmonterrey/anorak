import React, { useEffect, useState } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

// Configure sha512 for ed25519
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

interface ElusivWrapperProps {
  recipient: string;
  amount: string;
  onSuccess: (signature: string) => void;
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

const ElusivWrapper = ({ recipient, amount, onSuccess, onError, onLoading }: ElusivWrapperProps) => {
  const [elusiv, setElusiv] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadElusiv = async () => {
      try {
        if (typeof window !== 'undefined') {
          const { Elusiv } = await import('@elusiv/sdk');
          setElusiv({ 
            Elusiv,
            SEED_MESSAGE: 'The message that should be signed by a wallet to generate a deterministic seed.'
          });
        }
      } catch (err) {
        console.error('Failed to load Elusiv:', err);
        onError('Failed to initialize Elusiv');
      }
    };

    loadElusiv();
  }, [onError]);

  const handleTransaction = async () => {
    if (!elusiv) {
      onError('Elusiv not initialized');
      return;
    }

    setIsLoading(true);
    onLoading(true);

    try {
      if (!recipient || !amount) {
        throw new Error('Please fill in all fields');
      }

      const recipientPubKey = new PublicKey(recipient);
      const amountLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      const connection = new Connection('https://api.devnet.solana.com');
      
      // Generate keypair for demo (replace with wallet in production)
      const keyPair = Keypair.generate();
      
      // Generate seed using ed25519
      const seed = ed.sign(
        Buffer.from(elusiv.SEED_MESSAGE, 'utf-8'),
        keyPair.secretKey.slice(0, 32)
      );

      const elusivInstance = await elusiv.Elusiv.getElusivInstance(
        seed,
        keyPair.publicKey,
        connection,
        'devnet'
      );

      const privateBalance = await elusivInstance.getLatestPrivateBalance('LAMPORTS');

      if (privateBalance < BigInt(amountLamports)) {
        const topUpTx = await elusivInstance.buildTopUpTx(amountLamports, 'LAMPORTS');
        topUpTx.tx.partialSign(keyPair);
        await elusivInstance.sendElusivTx(topUpTx);
      }

      const privateTx = await elusivInstance.buildSendTx(
        amountLamports,
        recipientPubKey,
        'LAMPORTS'
      );
      const signature = await elusivInstance.sendElusivTx(privateTx);

      onSuccess(signature.signature);
    } catch (err: any) {
      console.error('Transaction error:', err);
      onError(err.message || 'Failed to send private transaction');
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleTransaction}
      className="w-full"
      disabled={!elusiv || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing
        </>
      ) : !elusiv ? (
        'Initializing...'
      ) : (
        'Send Private Transaction'
      )}
    </Button>
  );
};

export default ElusivWrapper;