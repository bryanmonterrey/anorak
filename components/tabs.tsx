"use client"


import { DirectionAwareTabs } from "@/components/ui/direction-aware-tabs"
import Send from "@/components/send"
import { div } from "motion/react-client"

const DirectionAwareTabsDemo = ({}) => {
  const tabs = [
    {
      id: 0,
      label: "send",
      content: (
        <div className="flex flex-col items-center justify-center">
        <div className="bg-zinc-400/10 text-white/80 w-full flex flex-col items-center p-4 rounded-t-3xl gap-3 outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px] shadow-sm h-48">
          <Send />
        </div>
        <div className="bg-zinc-400/10 mt-0.5 text-white/80 w-full flex flex-col items-center p-4 rounded-b-3xl gap-3 outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px] shadow-sm h-20 border-t-3 border-zinc-950">
          
        </div>
        <div className="bg-zinc-400/10 mt-1 text-white/80 w-full flex flex-col items-center p-4 rounded-3xl gap-3 outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px] shadow-sm h-20 border-t-3 border-zinc-950">
          
        </div>
        <div className="bg-bitcoin/90 mt-1 text-zinc-950 font-medium text-xl w-full flex flex-col items-center p-4 rounded-2xl gap-3 outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px] shadow-sm h-14 border-t-3 border-zinc-950">
          
        </div>
        </div>
      ),
    },
    {
      id: 1,
      label: "gift",
      content: (
        <div className="bg-zinc-400/10 text-white/80 w-full flex flex-col items-center p-4 rounded-3xl gap-3 outline outline-1 outline-[rgb(132,151,197,0.01)] outline-offset-[-1px] shadow-sm h-64">
          hi3
        </div>
      ),
    },
  ]

  return (
    <div className="">
      <DirectionAwareTabs tabs={tabs} />
    </div>
  )
}

export { DirectionAwareTabsDemo }