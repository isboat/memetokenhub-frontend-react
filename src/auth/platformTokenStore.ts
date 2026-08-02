// The platform JWT intentionally lives only in module memory. A page refresh
// obtains a fresh Privy access token and repeats the secure backend exchange.
let platformJwt: string | null = null;

export function getPlatformJwt() {
  return platformJwt;
}

export function setPlatformJwt(jwtToken: string) {
  platformJwt = jwtToken;
}

export function clearPlatformJwt() {
  platformJwt = null;
}
