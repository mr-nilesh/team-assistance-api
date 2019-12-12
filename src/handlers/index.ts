export * from './users-handler';
export * from './speech-recognization-handler';
export * from './meetings-handler';
export * from './slack-handlers';
import UserHandlers from './users-handler';
import SpeechRecognizationHandlers from './speech-recognization-handler';
import MeetingHandlers from './meetings-handler';
import SlackHandlers from './slack-handlers';
export default {
  UserHandlers,
  SpeechRecognizationHandlers,
  MeetingHandlers,
  SlackHandlers
}