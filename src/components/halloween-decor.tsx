// Purely decorative, maximum-cheese Halloween junk: cobwebbed corners, bats
// flapping across the screen, and a couple of drifting ghosts. Only ever
// rendered when the Halloween skin is active (see isHalloweenActive()).
export function HalloweenDecor() {
  return (
    <div className="hw-decor" aria-hidden="true">
      <div className="hw-cobweb hw-cobweb-tl" />
      <div className="hw-cobweb hw-cobweb-tr" />
      <span className="hw-bat hw-bat-1">&#x1F987;</span>
      <span className="hw-bat hw-bat-2">&#x1F987;</span>
      <span className="hw-bat hw-bat-3">&#x1F987;</span>
      <span className="hw-ghost hw-ghost-1">&#x1F47B;</span>
      <span className="hw-ghost hw-ghost-2">&#x1F47B;</span>
    </div>
  );
}
