import { ParticipantType } from './participantType';

export interface ApplicationRequest {
  readonly contactEmail: string;
  readonly host: string;
  readonly id: number;
  readonly institutionId: number;
  readonly name: string;
  readonly participantStatus: string;
  readonly participantType: ParticipantType;
  readonly timestamp: string;
  readonly uniqueIdentifier: string;
}