export function formatShortAddress(address: string, opts?: { head?: number; tail?: number }): string {
  const head = opts?.head ?? 7
  const tail = opts?.tail ?? 6
  if (!address) return ''
  if (address.length <= head + tail + 3) return address
  return `${address.slice(0, head)}...${address.slice(-tail)}`
}
