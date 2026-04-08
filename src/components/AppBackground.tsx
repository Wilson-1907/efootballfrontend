export function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="pitch-bg absolute inset-0" />
      <div className="pitch-vignette absolute inset-0" />
    </div>
  );
}

