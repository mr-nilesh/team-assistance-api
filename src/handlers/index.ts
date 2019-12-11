export * from './users-handler';
export * from './speech-recognization-handler';
export * from './meetings-handler';
import UserHandlers from './users-handler';
import SpeechRecognizationHandlers from './speech-recognization-handler';
import MeetingHandlers from './meetings-handler';
export default {
  UserHandlers,
  SpeechRecognizationHandlers,
  MeetingHandlers,
}