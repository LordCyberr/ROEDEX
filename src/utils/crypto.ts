export async function fetchEthPriceUsd(): Promise<number | null> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await res.json();
    return data?.ethereum?.usd || null;
  } catch (error) {
    console.error('Failed to fetch ETH price:', error);
    return null;
  }
}
