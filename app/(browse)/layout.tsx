import React from 'react'
import NavBar from '@/components/navBar';

const BrowseLayout = ({ 
    children, 
}: {
    children: React.ReactNode;
}) => {
  return (
    <>
    <NavBar />
        <div className="transition-all hidden-scrollbar h-[calc(100%-40px)]">
                {children}
        </div>
    </>
  )
}

export default BrowseLayout