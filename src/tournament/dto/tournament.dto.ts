import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { TournamentStatus } from '@tournament/enums';

export class ListLatestTournamentsDto {
  @IsOptional()
  @IsString()
  @IsIn(Object.values(TournamentStatus))
  status?: TournamentStatus;
}

export class CreateTournamentParticipationDto {
  @IsOptional()
  @IsString()
  walletAddress: string;

  @IsArray()
  @IsString({ each: true })
  selectedFantasyTargetIds: string[];
}
