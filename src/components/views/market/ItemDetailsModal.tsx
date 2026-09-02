import React, { useMemo } from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { X } from 'lucide-react';

interface ItemDetailsModalProps {
  itemId: string;
  onClose: () => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ itemId, onClose }) => {
  const { marketListings, marketSales } = useTrackerStore();

  const { itemDetails, orderBook, recentSales } = useMemo(() => {
    const listings = Object.values(marketListings)
      .filter(l => l.itemId === itemId && l.isActive)
      .sort((a, b) => Number(BigInt(a.priceWei) - BigInt(b.priceWei)));

    const sales = marketSales
      .filter(s => s.itemId === itemId)
      .sort((a, b) => b.seenAt - a.seenAt); // Newest first

    const itemName = listings[0]?.itemName || sales[0]?.itemName || 'Unknown Item';
    const floorPrice = listings.length > 0 ? listings[0].priceWei : '0';
    const totalListed = listings.reduce((acc, l) => acc + l.qtyRemaining, 0);

    // Calculate 24h metrics
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    // Find average price in last 24h vs previous 24h to calculate change
    const sales24h = sales.filter(s => now - s.seenAt <= ONE_DAY);
    const salesPrev24h = sales.filter(s => now - s.seenAt > ONE_DAY && now - s.seenAt <= ONE_DAY * 2);

    const avg24h = sales24h.length ? sales24h.reduce((acc, s) => acc + Number(s.priceWei), 0) / sales24h.length : 0;
    const avgPrev24h = salesPrev24h.length ? salesPrev24h.reduce((acc, s) => acc + Number(s.priceWei), 0) / salesPrev24h.length : 0;
    
    const change24h = avgPrev24h === 0 ? 0 : ((avg24h - avgPrev24h) / avgPrev24h) * 100;
    
    // 7d metrics (mocked if not enough data)
    const sales7d = sales.filter(s => now - s.seenAt <= ONE_DAY * 7);
    const volume7d = sales7d.reduce((acc, s) => acc + Number(s.totalWei), 0);

    return {
      itemDetails: {
        itemName,
        floorPrice,
        totalListed,
        change24h,
        volume7d,
        hasData24h: salesPrev24h.length > 0
      },
      orderBook: listings,
      recentSales: sales
    };
  }, [marketListings, marketSales, itemId]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[var(--bg-base)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-panel-secondary)]">
        <h2 className="text-xl font-black text-white">{itemDetails.itemName}</h2>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Floor Price</span>
          <span className="text-lg font-mono font-bold text-emerald-400">{Number(itemDetails.floorPrice).toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Total Listed</span>
          <span className="text-lg font-mono font-bold text-white">{itemDetails.totalListed.toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">24H Change</span>
          <span className={`text-lg font-bold ${itemDetails.hasData24h ? (itemDetails.change24h >= 0 ? 'text-green-400' : 'text-red-400') : 'text-[var(--text-muted)]'}`}>
            {itemDetails.hasData24h ? `${itemDetails.change24h > 0 ? '+' : ''}${itemDetails.change24h.toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">7D Volume</span>
          <span className="text-lg font-mono font-bold text-white">{itemDetails.volume7d.toLocaleString()}</span>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Order Book */}
        <div className="flex-1 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-panel-secondary)]/50">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Order Book (Listings)</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase text-[var(--text-muted)]">
                <tr>
                  <th className="pb-2 font-bold">Price</th>
                  <th className="pb-2 font-bold">Qty</th>
                  <th className="pb-2 font-bold text-right">Seller</th>
                </tr>
              </thead>
              <tbody>
                {orderBook.map(l => (
                  <tr key={l.id} className="border-t border-[var(--border-subtle)]/30 hover:bg-white/5">
                    <td className="py-2 font-mono text-emerald-400">{Number(l.priceWei).toLocaleString()}</td>
                    <td className="py-2 font-mono text-white">{l.qtyRemaining.toLocaleString()}</td>
                    <td className="py-2 text-right text-[var(--text-muted)] truncate max-w-[100px]">{l.seller}</td>
                  </tr>
                ))}
                {orderBook.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-center text-[var(--text-muted)] italic">No active listings.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* History */}
        <div className="flex-1 flex flex-col bg-[var(--bg-base)]">
          <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-panel-secondary)]/50">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">History (Sales)</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase text-[var(--text-muted)]">
                <tr>
                  <th className="pb-2 font-bold">Price</th>
                  <th className="pb-2 font-bold">Qty</th>
                  <th className="pb-2 font-bold text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(s => (
                  <tr key={s.id} className="border-t border-[var(--border-subtle)]/30 hover:bg-white/5">
                    <td className="py-2 font-mono text-emerald-400">{Number(s.priceWei).toLocaleString()}</td>
                    <td className="py-2 font-mono text-white">{s.qty.toLocaleString()}</td>
                    <td className="py-2 text-right text-[var(--text-muted)] text-[10px]">{new Date(s.seenAt).toLocaleString()}</td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-center text-[var(--text-muted)] italic">No sales history yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
