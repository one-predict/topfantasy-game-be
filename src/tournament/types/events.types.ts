import { Event } from '@events/types';
import { TournamentParticipationsEventType } from '@tournament';

export interface TournamentParticipationCreatedEventData {
  object: {
    id: string;
    selectedFantasyTargetIds: string[];
    tournamentId: string;
    userId: string;
    fantasyPoints: number;
  };
}

export type TournamentParticipationCreatedEvent = Event<
  TournamentParticipationsEventType.TournamentParticipationCreated,
  TournamentParticipationCreatedEventData
>;
