import { cvToJSON, hexToCV } from '@stacks/transactions'
import { CONTRACT_ADDRESS, CONTRACT_NAME, STACKS_API_BASE } from '../config/stacks'

export async function callReadOnly(
  functionName: string,
  args: string[],
  sender: string,
): Promise<ReturnType<typeof cvToJSON>> {
  const response = await fetch(
    `${STACKS_API_BASE}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/${functionName}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, arguments: args }),
    },
  )

  const data = await response.json()
  if (!data.okay) {
    throw new Error(data.cause || `Call failed: ${functionName}`)
  }

  return cvToJSON(hexToCV(data.result))
}
