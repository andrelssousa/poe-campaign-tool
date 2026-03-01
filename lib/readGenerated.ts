// lib/readGenerated.ts
/**
 * Client-safe stub.
 * If you need generated data on the client, pass it from a Server Component as props.
 */
export function readGenerated<T = any>(_fileName: string): T {
  throw new Error(
    "readGenerated() is server-only. Import from '@/lib/readGenerated.server' in Server Components and pass data as props to Client Components."
  );
}