export type StandingsRow = {
  rank: number;
  playerId: string;
  playerName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type PublicMatch = {
  id: string;
  round: number;
  homeId: string;
  awayId: string;
  homeScore: number | null;
  awayScore: number | null;
  scheduledAt: string | null;
  status: string;
  home: { id: string; name: string };
  away: { id: string; name: string };
};

export type PublicTournamentState = {
  tournamentName: string;
  tournamentStopped: boolean;
  registrationOpen: boolean;
  registrationNotStarted: boolean;
  registrationStartsAt: string;
  registrationEndsAt: string;
  fixturesGenerated: boolean;
  tournamentStartsAt: string;
  tournamentEndsAt: string;
  matchDurationMinutes: number;
  breakMinutes: number;
  rulesMarkdown: string;
  matches: PublicMatch[];
  standings: StandingsRow[];
  confirmedCount: number;
  totalRegistered: number;
};
