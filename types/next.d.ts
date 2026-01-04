// types/next.d.ts
import type { Metadata } from 'next';

declare module 'next' {
  export interface PageProps {
    params?: Promise<Record<string, string>> | Record<string, string>;
    searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
  }
}