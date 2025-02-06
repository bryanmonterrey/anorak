'use client';

import Menu from "./browseMenu"
import Logo from "./logo"
import { Button } from "./ui/button"
import { GlowEffect } from './ui/glow-effect';
import WalletConnectButton from "@/components/walletConnectButton";

const NavBar: React.FC = () => {
   
    return (
        <div className="fixed top-0 w-full h-16 z-[1000] bg-transparent pr-3 pl-2 flex justify-between items-center">
            <div className="inline-flex space-x-6 items-center justify-center">
                <Logo />
                <Menu />
            </div>
            <div className="relative inline-flex space-x-4 justify-center items-center">
                <div className="relative">
                    <Button className="relative bg-[#09090b] active:bg-zinc-800 hover:bg-zinc-900 rounded-full px-4 hover:text-white transition-all ease-in-out duration-300 border border-zinc-800/75">
                        <div className="flex items-center justify-center text-inherit">
                            <p className="text-sm font-geist font-medium text-white/90">
                                get the app
                            </p>
                        </div>
                    </Button>
                </div>
                <div className="relative">
                    <WalletConnectButton />
                </div>
            </div>
        </div>
    )
}

export default NavBar