import { getPublicKeyPayload } from '../commons'

export const getServerSidePayloadPublicKey = (publicKey: string): string => {
  if (!publicKey) {
    throw new Error('Public key is not defined')
  }

  if (!publicKey.startsWith('pk_')) {
    throw new Error('Invalid public key')
  }

  try {
    const payload = getPublicKeyPayload(publicKey)
    return JSON.stringify(payload)
  } catch (e) {
    throw new Error('Failed to parse public key')
  }
}
