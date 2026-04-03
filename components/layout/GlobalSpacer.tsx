"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function GlobalSpacer() {
    const pathname = usePathname();

    // Pages that HAVE a full-bleed Hero section and SHOULD NOT have top padding
    const isHeroPage =
        pathname === "/" ||
        pathname === "/about" ||
        pathname === "/support" ||
        pathname === "/products/order-samples" ||
        pathname?.startsWith("/auth");

    if (isHeroPage) return null;

    return <div className="w-full flex-shrink-0 h-[110px] sm:h-[130px] lg:h-[150px]" aria-hidden="true" />;
}
