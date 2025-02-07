import React, { useState } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { User, Provider as LightProvider, TestRelayer } from '@lightprotocol/zk.js';
import { BN } from '@coral-xyz/anchor';

interface LightWrapperProps {
  recipient: string;
  amount: string;
  onSuccess: (txHash: string) => void;
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

const LightWrapper = ({ recipient, amount, onSuccess, onError, onLoading }: LightWrapperProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTransaction = async () => {
    setIsLoading(true);
    onLoading(true);

    try {
      if (!recipient || !amount) {
        throw new Error('Please fill in all fields');
      }

      // Initialize wallet
      const solanaWallet = Keypair.generate();
      const connection = new Connection('http://127.0.0.1:8899');

      // Setup test relayer
      const testRelayer = new TestRelayer({
        relayerPubkey: solanaWallet.publicKey,
        relayerRecipientSol: solanaWallet.publicKey,
        relayerFee: new BN(100_000),
        payer: solanaWallet,
      });

      // Initialize Light provider
      const lightProvider = await LightProvider.init({
        wallet: solanaWallet,
        relayer: testRelayer,
      });

      // Initialize Light user
      const user = await User.init({ provider: lightProvider });

      // Shield SOL
      await user.shield({
        publicAmountSol: "1.1",
        token: "SOL",
      });

      // Execute private transfer
      const response = await user.transfer({
        amountSol: amount,
        token: "SOL",
        recipient: recipient,
      });

      onSuccess(response.txHash);
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
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing
        </>
      ) : (
        'Send Private Transaction'
      )}
    </Button>
  );
};

export default LightWrapper;