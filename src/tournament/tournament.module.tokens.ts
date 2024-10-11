const TournamentModuleTokens = {
  Services: {
    TournamentService: Symbol('TournamentService'),
    TournamentParticipationService: Symbol('TournamentParticipationService'),
    TournamentDeckService: Symbol('TournamentDeckService'),
    TournamentQuestActionsDetectionService: Symbol('TournamentQuestActionsDetectionService'),
  },
  Repositories: {
    TournamentRepository: Symbol('TournamentRepository'),
    TournamentParticipationRepository: Symbol('TournamentParticipationRepository'),
    TournamentDeckRepository: Symbol('TournamentDeckRepository'),
  },
};

export default TournamentModuleTokens;
