'use client';


import { DirectionAwareTabs } from "@/components/ui/direction-aware-tabs"
import Send from "@/components/send"
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ComputeBudgetProgram, TransactionMessage, VersionedTransaction, PublicKey } from '@solana/web3.js';
import {
  LightSystemProgram,
  bn,
  buildTx,
  defaultTestStateTreeAccounts,
  selectMinCompressedSolAccountsForTransfer,
  createRpc,
} from '@lightprotocol/stateless.js';

// Use Helius endpoint
const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=89acb127-21f1-48fd-a752-77abb2a7fd78';

const DirectionAwareTabsDemo = ({}) => {
    const { publicKey, sendTransaction } = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [privateBalance, setPrivateBalance] = useState(null);
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [unshieldAmount, setUnshieldAmount] = useState('');
  
    const checkPrivateBalance = useCallback(async (address) => {
      if (!address) return null;
      try {
        const connection = await createRpc(RPC_URL);
        const compressedAccounts = await connection.getCompressedAccountsByOwner(new PublicKey(address));
        const totalLamports = compressedAccounts.items.reduce((sum, account) => 
          BigInt(sum) + BigInt(account.lamports || 0), BigInt(0));
        // Convert lamports to SOL with proper decimal handling
        const solBalance = Number(totalLamports) / 1e9;
        return solBalance.toFixed(4);
      } catch (err) {
        console.error('Error checking private balance:', err);
        return null;
      }
    }, []);
  
    // Effect to load private balance when wallet connects
    useEffect(() => {
      if (publicKey) {
        checkPrivateBalance(publicKey.toString()).then(balance => {
          setPrivateBalance(balance);
        });
      }
    }, [publicKey, checkPrivateBalance]);
  
    const handleTransfer = useCallback(async () => {
      if (!publicKey) {
        setError('Please connect your wallet');
        return;
      }
  
      setLoading(true);
      setError('');
      setStatus('Initializing transfer...');
  
      try {
        const connection = await createRpc(RPC_URL);
        const recipientPubKey = new PublicKey(recipient);
        const lamportsAmount = parseFloat(amount) * 1e9;
  
        setStatus('Compressing SOL...');
        const compressInstruction = await LightSystemProgram.compress({
          payer: publicKey,
          toAddress: publicKey,
          lamports: lamportsAmount,
          outputStateTree: defaultTestStateTreeAccounts().merkleTree,
        });
  
        const compressInstructions = [
          ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
          compressInstruction,
        ];
  
        setStatus('Getting blockhash...');
        const { context: { slot: minContextSlot }, value: blockhashCtx } = 
          await connection.getLatestBlockhashAndContext();
  
        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: blockhashCtx.blockhash,
          instructions: compressInstructions,
        }).compileToV0Message();
  
        const transaction = new VersionedTransaction(messageV0);
  
        setStatus('Sending compression transaction...');
        const signature = await sendTransaction(transaction, connection, {
          minContextSlot,
        });
  
        await connection.confirmTransaction({
          signature,
          ...blockhashCtx
        });
  
        setStatus('Getting compressed accounts...');
        const accounts = await connection.getCompressedAccountsByOwner(publicKey);
  
        const [selectedAccounts, _] = selectMinCompressedSolAccountsForTransfer(
          accounts.items,
          lamportsAmount
        );
  
        setStatus('Getting validity proof...');
        const { compressedProof, rootIndices } = await connection.getValidityProof(
          selectedAccounts.map(account => bn(account.hash))
        );
  
        setStatus('Creating private transfer...');
        const sendInstruction = await LightSystemProgram.transfer({
          payer: publicKey,
          toAddress: recipientPubKey,
          lamports: lamportsAmount,
          inputCompressedAccounts: selectedAccounts,
          outputStateTrees: [defaultTestStateTreeAccounts().merkleTree],
          recentValidityProof: compressedProof,
          recentInputStateRootIndices: rootIndices,
        });
  
        const sendInstructions = [
          ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
          sendInstruction,
        ];
  
        const { context: { slot: minContextSlotSend }, value: blockhashSend } = 
          await connection.getLatestBlockhashAndContext();
  
        const messageV0Send = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: blockhashSend.blockhash,
          instructions: sendInstructions,
        }).compileToV0Message();
  
        const transactionSend = new VersionedTransaction(messageV0Send);
  
        setStatus('Sending private transfer...');
        const signatureSend = await sendTransaction(transactionSend, connection, {
          minContextSlot: minContextSlotSend,
        });
  
        await connection.confirmTransaction({
          signature: signatureSend,
          ...blockhashSend
        });
  
        // Check recipient's private balance after transfer
        const recipientPrivateBalance = await checkPrivateBalance(recipient);
        setStatus(`Transfer complete!\nSignature: ${signatureSend}\nRecipient's private balance: ${recipientPrivateBalance || 'Unknown'} SOL`);
        
        // Update sender's private balance
        const newBalance = await checkPrivateBalance(publicKey.toString());
        setPrivateBalance(newBalance);
  
        console.log(`Sent ${amount} SOL to ${recipient}!\nTxId: https://explorer.solana.com/tx/${signatureSend}?cluster=mainnet`);
      } catch (err) {
        console.error('Transfer error:', err);
        setError(err.message || 'Failed to process transaction');
      } finally {
        setLoading(false);
      }
    }, [publicKey, sendTransaction, amount, recipient, checkPrivateBalance]);
  
    const handleUnshield = useCallback(async () => {
      if (!publicKey) {
        setError('Please connect your wallet');
        return;
      }
  
      setLoading(true);
      setError('');
      setStatus('Initializing unshield...');
  
      try {
        const connection = await createRpc(RPC_URL);
        const lamportsAmount = parseFloat(unshieldAmount) * 1e9;
  
        setStatus('Getting compressed accounts...');
        const accounts = await connection.getCompressedAccountsByOwner(publicKey);
  
        const [selectedAccounts, _] = selectMinCompressedSolAccountsForTransfer(
          accounts.items,
          lamportsAmount
        );
  
        setStatus('Getting validity proof...');
        const { compressedProof, rootIndices } = await connection.getValidityProof(
          selectedAccounts.map(account => bn(account.hash))
        );
  
        setStatus('Creating unshield transaction...');
        const unshieldInstruction = await LightSystemProgram.decompress({
          payer: publicKey,
          toAddress: publicKey,
          lamports: lamportsAmount,
          inputCompressedAccounts: selectedAccounts,
          recentValidityProof: compressedProof,
          recentInputStateRootIndices: rootIndices,
        });
  
        const unshieldInstructions = [
          ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
          unshieldInstruction,
        ];
  
        const { context: { slot: minContextSlot }, value: blockhashCtx } = 
          await connection.getLatestBlockhashAndContext();
  
        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: blockhashCtx.blockhash,
          instructions: unshieldInstructions,
        }).compileToV0Message();
  
        const transaction = new VersionedTransaction(messageV0);
  
        setStatus('Sending unshield transaction...');
        const signature = await sendTransaction(transaction, connection, {
          minContextSlot,
        });
  
        await connection.confirmTransaction({
          signature,
          ...blockhashCtx
        });
  
        // Update private balance
        const newPrivateBalance = await checkPrivateBalance(publicKey.toString());
        setPrivateBalance(newPrivateBalance);
        
        setStatus(`Unshield complete!\nSignature: ${signature}\nRemaining private balance: ${newPrivateBalance || 'Unknown'} SOL`);
        console.log(`Unshielded ${unshieldAmount} SOL!\nTxId: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      } catch (err) {
        console.error('Unshield error:', err);
        setError(err.message || 'Failed to unshield SOL');
      } finally {
        setLoading(false);
      }
    }, [publicKey, sendTransaction, unshieldAmount, checkPrivateBalance]);

  const tabs = [
    {
      id: 0,
      label: "send",
      content: (
        <div className="flex flex-col items-center justify-center">
        <div className="bg-zinc-400/15 text-white/80 w-full flex flex-col items-center justify-center p-4 rounded-t-3xl gap-3 outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px] shadow-sm h-48">
        <div>
            <span className="text-gray/80 text-sm font-medium absolute top-4 left-5">
                You're sending
            </span>
        </div>
            <Input
              type="decimal"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              className="w-full h-full dark:focus-visible:ring-none active:ring-none focus:ring-none focus-visible:ring-none text-9xl md:text-8xl file:text-8xl focus-visible:text-8xl disabled:text-8xl border-none placeholder:text-8xl flex text-center items-center justify-center"
              onChange={(e) => setAmount(e.target.value)}
              spellCheck="false"
              pattern="^[0-9]*[.,]?[0-9]*$"
              autoComplete="off"
              autoCorrect="off"
              min="0"
              step="0.1"
              disabled={loading}
            />
        </div>
        <div className="bg-zinc-400/15 mt-0.5 text-white/80 w-full flex flex-col items-center p-4 rounded-b-3xl gap-3 outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px] shadow-sm h-20 border-t-3 border-zinc-950">
          
        </div>
        <div className="bg-zinc-400/15 mt-1 text-white/80 w-full flex flex-col items-center p-4 rounded-3xl gap-3 outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px] shadow-sm h-20 border-t-3 border-zinc-950">
        <Input
              placeholder="wallet address or SNS name"
              value={recipient}
              className="w-full h-full file:text-base placeholder:text-base text-base focus-visible:text-base disabled:text-base focus:text-base font-medium file:font-medium placeholder:font-medium disabled:font-medium focus-visible:font-medium focus:font-medium"
              onChange={(e) => setRecipient(e.target.value)}
              disabled={loading}
            />
        </div>
        <Button 
        onClick={handleTransfer}
        disabled={loading || !publicKey}
        className="bg-bitcoin/15 hover:bg-bitcoin/25 active:bg-bitcoin/35 mt-1 text-bitcoin font-medium text-xl w-full flex flex-col items-center p-4 rounded-2xl gap-3 outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px] shadow-sm h-14 border-t-3 border-zinc-950 transition-all duration-300 ease-in-out">
          {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {status || 'Processing'}
                </>
              ) : (
                'Send Private Transaction'
              )}
        </Button>
        </div>
      ),
    },
    {
      id: 1,
      label: "shield",
      content: (
        <div className="flex flex-col items-center justify-center">
        <div className="bg-zinc-400/15 text-white/80 w-full flex flex-col items-center p-4 rounded-3xl gap-3 outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px] shadow-sm h-64">
        <div>
            <span className="text-gray/80 text-sm font-medium absolute top-4 left-5">
                Amount to Unshield
            </span>
        </div>
            <Input
              type="decimal"
              inputMode="decimal"
              placeholder="Amount to Unshield"
              value={unshieldAmount}
              className="w-full h-full dark:focus-visible:ring-none active:ring-none focus:ring-none focus-visible:ring-none text-9xl md:text-8xl file:text-8xl focus-visible:text-8xl disabled:text-8xl border-none placeholder:text-4xl flex text-center items-center justify-center"
              onChange={(e) => setUnshieldAmount(e.target.value)}
              min="0"
              step="0.1"
              disabled={loading}
            />
            {publicKey && (
                <div className="text-gray/80 text-sm font-medium flex flex-col items-center justify-center absolute top-4 right-4">
              
                  Available private balance: {loading ? 'Loading...' : privateBalance || '0'} SOL
                
              </div>
            )}
        </div>
        <Button 
              onClick={handleUnshield}
              disabled={loading || !publicKey}
              className="w-full bg-bitcoin/15 hover:bg-bitcoin/25 active:bg-bitcoin/35 mt-1 text-bitcoin font-medium text-xl flex flex-col items-center p-4 rounded-2xl gap-3 outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px] shadow-sm h-14 border-t-3 border-zinc-950 transition-all duration-300 ease-in-out"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {status || 'Processing'}
                </>
              ) : (
                'Unshield SOL'
              )}
            </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-w-[45ch] max-w-[45ch]">
      <DirectionAwareTabs tabs={tabs} />
    </div>
  )
}

export { DirectionAwareTabsDemo }