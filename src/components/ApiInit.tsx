"use client";

import { useEffect } from "react";
import { useApiStore } from "@/lib/api";

export function ApiInit() {
  const init = useApiStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return null;
}
