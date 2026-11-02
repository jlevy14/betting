// Purely decorative, maximum-cheese Thanksgiving junk: drifting autumn
// leaves and a few gobbling turkeys strutting across the screen. Only ever
// rendered when the Thanksgiving skin is active (see isThanksgivingActive()).
export function ThanksgivingDecor() {
  return (
    <div className="tg-decor" aria-hidden="true">
      <span className="tg-leaf tg-leaf-1">&#x1F342;</span>
      <span className="tg-leaf tg-leaf-2">&#x1F341;</span>
      <span className="tg-leaf tg-leaf-3">&#x1F342;</span>
      <span className="tg-leaf tg-leaf-4">&#x1F341;</span>
      <span className="tg-turkey tg-turkey-1">&#x1F983;</span>
      <span className="tg-turkey tg-turkey-2">&#x1F983;</span>
    </div>
  );
}
