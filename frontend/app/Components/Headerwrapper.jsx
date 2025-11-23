

"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const Headerwrapper = () => {
  
    const pathname = usePathname(); console.log(pathname)
    const hideheaderroutes = ["/room/"];


    
    const shouldHideHeader = hideheaderroutes.some(route =>
    pathname.startsWith(route)
  );
    // if (hideheaderroutes.includes(pathname)) {
    //     return null; // Do not render the Header on these routes
    // }
    if (shouldHideHeader) return null;
  
    return <Header/>

   
  
}

export default Headerwrapper
