import { TextLoop } from '@/components/ui/text-loop';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-items-center justify-center bg-zinc-950 h-screen w-screen min-w-screen max-w-screen min-h-screen max-h-screen font-[family-name:var(--font-geist-sans)]  space-y-12">
      <div className="flex justify-center items-center w-screen text-center">
        <div>
          <h1 className="text-5xl font-geist text-center font-semibold text-gray mb-5"><span className='text-bitcoin'>**</span>{' '}<TextLoop
        className='overflow-y-clip'
      >
        <span>swap</span>
        <span>send</span>
        <span>gift</span>
      </TextLoop><span className="text-amber-50"> privately</span> on Solana<span className="text-bitcoin">.&nbsp;</span>
          </h1>
        </div>
      </div>
      <div className="flex justify-center items-center w-screen text-center z-50">
        <div className="bg-zinc-950/75 h-full w-fit shadow-sm rounded-3xl p-4 block items-center justify-center outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px] space-y-3 ">
          <div className="bg-zinc-800/10 h-32 w-96 shadow-sm rounded-3xl outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px]">
          </div>
          <div className="bg-zinc-800/10 h-32 w-96 shadow-sm rounded-3xl outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px]">
          </div>
        </div>
      </div>
    </div>
  );
}
