import { Router } from 'express';
import Handlers from '@handlers';
import fs from 'fs';
import Models from '@models';
import async = require("async");
const { exec } = require('child_process');
const _ = require('lodash');
let userData: any = {};

// Init shared
const router = Router();

router.post('/', async (req, res) => {
  const meetingObj = {
    meetingName: req.body.meetingName,
    startedBy: req.body.startedBy,
    createdAt: new Date()
  };
  Handlers.MeetingHandlers.CreateMeeting(meetingObj)
    .then((meeting) => {
      return res.status(200).send(meeting);
    }, (err) => {
      return res.status(500).send(err);
    });
});

router.put('/:meetingId', async (req, res) => {
  // const speechToTextObj = {
  //   encoding: 'FLAC',
  //   languageCode: 'en-US',
  //   content: req.body.meetingAudio,
  //   sampleRate: 8000,
  //   enableSpeakerDiarization: true,
  //   enablePunctuation: true,
  //   audioType: "callcenter"
  // };
  Models.User.find({})
  .then((users) => {
    if(users && users.length > 0) {
      let userIDs: any = [];
      users.forEach(user => {
        userIDs.push(user.id);
        userData[user.id] = user.fullName;
      });
      const speechToTextObj = {
        sampleRate: 8000,
        encoding: "MP3",
        languageCode: "en-US",
        speakerIds: userIDs,
        content: req.body.meetingAudio
      }
      Handlers.MeetingHandlers.ConvertSpeechToText(speechToTextObj)
      .then((data) => {
        if(data.segments) {
          ProcessAudioFile(req.body.meetingAudio, data.segments);
          return res.status(200).send({data: 'Processing audio file.'});
        }
      }, (err) => {
        return res.status(500).send(err);
      });
    } else {
      res.status(204).send('No users found.');
    }
  });
});

function ProcessAudioFile(base64Audio: any, segments: any[]) {
  console.log('Processing audio file. Removing previous audio files.');
  exec(`rm -rf sample-audio-*.mp3 speech-output.txt`, (err: any) => {
    fs.writeFile(
      'sample-audio.mp3',
      base64Audio,
      {
        encoding: 'base64'
      },
      (err) => {
        fs.appendFile('speech-output.txt', '', (err: any) => {});
        generateAudioChunks(segments, async (segment: any, index: number) => {
          exec(`ffmpeg -i sample-audio.mp3 -ss ${segment.start} -to ${segment.end} -c copy sample-audio-${index}.mp3`, (err: any, stdout: any, stderr: any) => {
            console.log(`Generated sample-audio-${index}.mp3 file.`);
            setTimeout(() => {
              Handlers.SpeechRecognizationHandlers.ConvertAudioToTextSync(`sample-audio-${index}.mp3`)
                .then((data: any) => {
                  if(data && data.length > 0) {
                    fs.appendFile('speech-output.txt',`
                      ${userData[segment.speaker_id]} said: ${data}
                    `, (err: any) => {});
                  }
                }, (err: any) => {
                  console.log('ERROR', err);
                });
            }, 1000);
          });
        });
      }
    );
  });
}

async function generateAudioChunks(segments: any, callback: any) {
  for(let index=0; index < segments.length; index++) {
    await callback(segments[index], index, segments);
  }
}

export default router;