'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from 'qrcode.react';
import * as Dropdown from '@/components/ui/dropdown';
import { RiWalletLine, RiQrCodeLine, RiCloseLine } from '@remixicon/react';

const WalletConnectButton = () => {
  const { wallet, connect, connected, disconnect, select } = useWallet();
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generatePhantomDeepLink = () => {
    const encodedUrl = encodeURIComponent(window.location.href);
    const phantomUrl = `https://phantom.app/ul/v1/connect?app_url=${encodedUrl}&dapp_encryption_public_key=${encodedUrl}`;
    return phantomUrl;
  };

  const handlePhantomConnect = async () => {
    try {
      select('Phantom');
      await connect();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {!connected ? (
        <Dropdown.Root>
          <Dropdown.Trigger asChild>
            <Button className="relative bg-bitcoin/15 rounded-full px-4 hover:bg-bitcoin/25 hover:text-white active:bg-bitcoin/35 active:ring-0 active:ring-offset-0 active:ring-offset-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent transition-all ease-in-out duration-300">
              <div className="flex items-center justify-center text-inherit">
                <p className="text-sm font-geist font-medium text-bitcoin">
                  connect
                </p>
              </div>
            </Button>
          </Dropdown.Trigger>
          <Dropdown.Content className="w-[400px]">
            <div className="bg-zinc-950 flex items-start justify-between p-2 pl-3">
              <div className="text-amber-50 font-semibold">connect a wallet</div>
            </div>
            <Dropdown.Group className="flex flex-col items-center justify-center mb-3">
              <Dropdown.Item onSelect={handlePhantomConnect}>
                <div className="inline-flex items-center space-x-3 p-5 w-full text-white rounded-2xl bg-bitcoin/80 hover:bg-bitcoin justify-start transition-all duration-300 ease-in-out">
                <div className="h-9 w-9 bg-zinc-950 rounded-xl p-1.5">
                    <img src="/password.svg" alt="phantom" className="w-full h-full" />
                </div>
                <div className='text-sm font-medium text-blue-950'>
                    <p className='text-base font-semibold text-zinc-950'>phantom wallet</p>
                    <p className='text-xs font-medium text-blue-950'>phantom wallet</p>
                </div>
                </div>
              </Dropdown.Item>
              <Dropdown.Item onSelect={() => setShowQR(true)}>
              <div className="inline-flex items-center space-x-3 p-5 w-full text-white rounded-2xl bg-white/5 hover:bg-white/15 justify-start transition-all duration-300 ease-in-out">
                <div className="h-9 w-9 bg-zinc-950 rounded-xl p-1.5">
                    <img src="/password.svg" alt="phantom" className="w-full h-full" />
                </div>
                <div className='text-sm font-medium text-white'>
                    <p className='text-base font-medium text-white'>phantom wallet</p>
                    <p className='text-xs font-medium text-white/80'>phantom wallet</p>
                </div>
                </div>
              </Dropdown.Item>
            </Dropdown.Group>
            <div className="p-3 text-sm font-medium text-gray">
            by connecting a wallet, you agree to xxxxxx terms of service and consent to its privacy policy.
            </div>
          </Dropdown.Content>
        </Dropdown.Root>
      ) : (
        <Button 
          onClick={disconnect}
          className="relative bg-bitcoin/15 rounded-full px-4 hover:bg-bitcoin/25 hover:text-white active:bg-bitcoin/35 transition-all ease-in-out duration-300"
        >
          <div className="flex items-center justify-center text-inherit">
            <p className="text-sm font-geist text-bitcoin">
              disconnect
            </p>
          </div>
        </Button>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-white-0 p-6 rounded-2xl shadow-regular-md">
            <div className="flex justify-between items-center mb-4">
              <div className="text-label-sm text-text-strong-950">Scan with Phantom App</div>
              <Button 
                onClick={() => setShowQR(false)}
                className="p-1 hover:bg-bg-weak-50 rounded-lg transition-colors"
              >
                <RiCloseLine className="size-5 text-text-sub-600" />
              </Button>
            </div>
            <QRCodeSVG value={generatePhantomDeepLink()} size={256} />
            <p className="mt-4 text-paragraph-sm text-text-sub-600 text-center">
              Scan this QR code with your phone's camera
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletConnectButton;