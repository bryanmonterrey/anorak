import { TextLoop } from '@/components/ui/text-loop';
import { DirectionAwareTabsDemo } from '@/components/tabs';

export default function Home() {
  return (
    <div className="flex flex-col items-start justify-center bg-zinc-950 h-screen w-screen min-w-screen max-w-screen min-h-screen max-h-screen font-[family-name:var(--font-geist-sans)] space-y-1">
      <div className="flex justify-center items-start w-screen text-center">
        <div>
          <h1 className="text-5xl font-geist text-center font-semibold text-gray -mt-20"><span className='text-bitcoin'>**</span>{' '}<TextLoop
        className='overflow-y-clip'
      >
        <span>swap</span>
        <span>send</span>
        <span>gift</span>
      </TextLoop><span className="text-amber-50"> privately</span> on Solana<span className="text-bitcoin">.&nbsp;</span>
          </h1>
        </div>
      </div>
      <div className="flex justify-center items-start w-screen text-center z-50">
        <div className='inline-block'>
        <DirectionAwareTabsDemo />
        </div>
      </div>
    </div>
  );
}
