import { request } from '@stacks/connect'
import type { ClarityValue } from '@stacks/transactions'
import { NETWORK } from '../config/stacks'

export async function callContract(
  contractId: `${string}.${string}`,
  functionName: string,
  functionArgs: ClarityValue[],
): Promise<Awaited<ReturnType<typeof request>>> {
  return request('stx_callContract', {
    contract: contractId,
    functionName,
    functionArgs,
    network: NETWORK,
    postConditionMode: 'deny',
    sponsored: false,
  })
}
