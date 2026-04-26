import { request } from '@stacks/connect'
import type { ClarityValue } from '@stacks/transactions'
import { NETWORK } from '../config/stacks'

type ContractCallResult = {
  txid: string
}

export async function callContract(
  contractId: `${string}.${string}`,
  functionName: string,
  functionArgs: ClarityValue[],
): Promise<ContractCallResult> {
  const result = await request('stx_callContract', {
    contract: contractId,
    functionName,
    functionArgs,
    network: NETWORK,
    postConditionMode: 'deny',
    sponsored: false,
  })
  return result as ContractCallResult
}
