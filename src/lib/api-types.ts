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
  phase: "league" | "knockout";
  stage: string;
  homeId: string;
  awayId: string;
  homeScore: number | null;
  awayScore: number | null;
  scheduledAt: string | null;
  status: string;
  home: { id: string; name: string };
  away: { id: string; name: string };
};

export type TournamentWrapUp = {
  champion: StandingsRow;
  runnerUp: StandingsRow | null;
  thirdPlace: StandingsRow | null;
  stats: {
    totalMatches: number;
    totalGoals: number;
    avgGoalsPerMatch: string;
    draws: number;
    biggestWin: {
      margin: number;
      scoreline: string;
      winnerName: string;
      loserName: string;
    } | null;
  };
  goldenBoot: { playerName: string; goals: number } | null;
  bestDefense: { playerName: string; goalsAgainst: number } | null;
  analysis: string[];
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
  /** True when every scheduled match has a recorded result */
  tournamentComplete?: boolean;
  tournamentWrapUp?: TournamentWrapUp | null;
};
