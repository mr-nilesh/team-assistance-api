import Models, { IMeeting } from '@models';
import Handlers from '@handlers';

async function ConvertSpeechToText(speechToTextObj: any) {
  console.log('Converting audio file in segments.');
  return Handlers.SpeechRecognizationHandlers.SpeechToText(speechToTextObj)
    .then((data: any) => {
      console.log('Speech to text API response', data);
      return data;
    }, (err: any) => {
      console.log('Got error in speech to text API', err);
      return err;
    });
}

async function CreateMeeting(meetingObj: any) {
  return Models.Meeting.create(meetingObj)
    .then((data) => {
      return data;
    }, (err) => {
      return err;
    });
}

export default {
  ConvertSpeechToText,
  CreateMeeting
};