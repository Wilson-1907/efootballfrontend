export function FreeMovingBanner({
  enabled,
  message,
}: {
  enabled: boolean;
  message: string;
}) {
  if (!enabled) return null;

  // Duplicate the message so the marquee feels continuous.
  const repeated = `${message}  •  ${message}  •  ${message}  •  ${message}`;

  return (
    <div
      className="free-banner"
      role="status"
      aria-label="Announcement"
      title={message}
    >
      <div className="free-banner__viewport">
        <div className="free-banner__track">
          <span className="free-banner__text">{repeated}</span>
        </div>
      </div>
    </div>
  );
}

