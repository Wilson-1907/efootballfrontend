/** Response from GET /api/public/meta (pre-login screen only). */
export type PublicMeta = {
  tournamentName: string;
  tournamentStopped: boolean;
  registrationOpen: boolean;
  registrationNotStarted: boolean;
  registrationStartsAt: string;
  registrationEndsAt: string;
  finalsBookingOpen: boolean;
  publicEventDateTime: string | null;
  publicVenue: string;
};
