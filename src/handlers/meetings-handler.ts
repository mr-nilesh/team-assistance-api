import Models, { IMeeting } from '@models';
import Handlers from '@handlers';

async function DiarizeAudio(speechToTextObj: any) {
  console.log('Calling speaker diarization API...');
  return Handlers.SpeechRecognizationHandlers.SpeechToText(speechToTextObj)
    .then((data: any) => {
      if(data.statusCode && data.statusCode === 400) {
        console.log('Speaker diarization API bad request:', data.error);
        return data.error;
      } else {
        console.log('Speaker diarization API response:', data);
        return data;
      }
    }, (err: any) => {
      console.log('Speaker diarization API failed:', err);
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

async function UpdateMeeting(id: string, meetingObj: any) {
  return Models.Meeting.findOneAndUpdate({_id: id}, meetingObj)
}

async function GetMeeting(id: string) {
  return Models.Meeting.findOne({_id: id})
}

async function AllMeeting() {
  return Models.Meeting.find({});
}

export default {
  DiarizeAudio,
  CreateMeeting,
  GetMeeting,
  UpdateMeeting,
  AllMeeting
};