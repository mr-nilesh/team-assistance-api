import request = require('request-promise');
import config from '../config/development';
import fs from 'fs';
import Handlers from '@handlers';

const { exec } = require('child_process');

async function EnrollUser(enrollObj: any) {
  const requestOptions = {
    method: 'POST',
    uri: `https://proxy.api.deepaffects.com/audio/generic/api/v2/sync/diarization/enroll?apikey=${config.deepAffectsAPIKey}`,
    body: enrollObj,
    json: true,
    headers: {
      'apikey': config.deepAffectsAPIKey
    }
  };
  return request.post(requestOptions)
    .then((data: any) => {
      return data;
    }, (err: any) => {
      return err;
    });
}

async function SpeechToText(postObj: any) {
  const requestOptions = {
    method: 'POST',
    uri: `https://proxy.api.deepaffects.com/audio/generic/api/v2/sync/diarization/identify?apikey=${config.deepAffectsAPIKey}`,
    // uri: `https://proxy.api.deepaffects.com/audio/generic/api/v1/async/asr?apikey=${config.deepAffectsAPIKey}&webhook=https://webhook.site/ef5fa8db-b831-4017-b123-08f11a9e60d0`,
    body: postObj,
    json: true,
    headers: {
      'apikey': config.deepAffectsAPIKey
    }
  };

  return request.post(requestOptions)
    .then((data: any) => {
      return data;
    }, (err: any) => {
      return err;
    });
}

async function ConvertAudioToText(filePath: any) {
  console.log(`Converting ${filePath} audio to text file.`);
  const speech = require('@google-cloud/speech');
  const CloudStorage = require('@google-cloud/storage');
  const path = require('path');
  const _ = require('lodash');
  const bucketName = 'team-assistance';
  const speechClient = new speech.SpeechClient();
  const file = fs.readFileSync(filePath);
  const audioBytes = file.toString('base64');
  const uploadToGcs = async () => {
    const storage = new CloudStorage.Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
  
    const bucket = storage.bucket(bucketName);
    const fileName = path.basename(filePath);
  
    await bucket.upload(filePath);
 
    return `gs://${bucketName}/${fileName}`;
  };
  
  // Upload to Cloud Storage first, then detects speech in the audio file
  return uploadToGcs()
    .then(async (gcsUri) => {
      const audio = {
        uri: gcsUri,
      };
  
      const config = {
        encoding: 'FLAC',
        sampleRateHertz: 8000,
        languageCode: 'en-US',
      };
  
      const request = {
        audio,
        config,
      };
  
      return speechClient.longRunningRecognize(request)
        .then((data: any) => {
          const operation = data[0];
  
          // The following Promise represents the final result of the job
          return operation.promise();
        })
        .then((data: any) => {
          const results = _.get(data[0], 'results', []);
          const transcription = results
            .map((result: any) => result.alternatives[0].transcript)
            .join('\n');
          console.log(`Transcription: ${transcription}`);
          return transcription;
        })
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

async function ConvertAudioToTextSync(filePath: any) {
  console.log(`Converting audio to text for ${filePath}`);
  const _ = require('lodash');
  const speech = require('@google-cloud/speech');
  const fs = require('fs');
  
  // Creates a client
  const speechClient = new speech.SpeechClient();
  
  
  // Reads a local audio file and converts it to base64
  const file = fs.readFileSync(filePath);
  const audioBytes = file.toString('base64');
  const audio = {
    content: audioBytes,
  };
  
  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const config = {
    encoding: 'MP3',
    sampleRateHertz: 44100,
    languageCode: 'en-US',
  };
  
  const request = {
    audio,
    config,
  };
 
  // Detects speech in the audio file
  return speechClient
    .recognize(request)
    .then((data: any) => {
      const results = _.get(data[0], 'results', []);
      const transcription = results
        .map((result: any) => result.alternatives[0].transcript)
        .join('\n');
      console.log(`Got text for ${filePath}, text is: ${transcription}`);
      return transcription;
    })
    .catch((err: any) => {
      console.error('ERROR:', err);
      return err;
    });
}

async function ProcessAudioFile(base64Audio: any, segments: any[], slackChannel: string, meetingData: any, userData: any, meetingId: string) {
  console.log('Processing audio file. Removing previous audio files.');
  exec(`rm -rf sample-audio-*.mp3 speech-output.txt`, (err: any) => {
    fs.writeFile(
      'sample-audio.mp3',
      base64Audio,
      {
        encoding: 'base64'
      },
      async (err) => {
        fs.appendFile('speech-output.txt', '', (err: any) => {});
        let previousSpeaker: string = '';
        await generateAudioChunks(segments, async (segment: any, index: number) => {
          return new Promise((resolve: any, reject: any) => {
            exec(`ffmpeg -i sample-audio.mp3 -ss ${segment.start} -to ${segment.end} -c copy sample-audio-${index}.mp3`, (err: any, stdout: any, stderr: any) => {
              console.log(`Generated sample-audio-${index}.mp3 file.`);
              setTimeout(() => {
                Handlers.SpeechRecognizationHandlers.ConvertAudioToTextSync(`sample-audio-${index}.mp3`)
                  .then((data: any) => {
                    if(data && data.length > 0) {
                      const speackerName = userData[segment.speaker_id] || 'Someone';
                      let speakerSaidStr: string = ''; 
                      if(speackerName !== previousSpeaker) {
                        speakerSaidStr = `${speackerName} said:`;
                      }
                      previousSpeaker = speackerName;
                      fs.appendFile('speech-output.txt',`${speakerSaidStr} ${data}\n`, (err: any) => {});
                      resolve(data);
                    } else {
                      resolve(data);
                    }
                  }, (err: any) => {
                    console.log('ERROR', err);
                    reject(err);
                  });
              }, 1000);
            });
          });
        });
        const fileData = fs.readFileSync('speech-output.txt');
        const base64FileString = fileData.toString('base64');

        const updateUserObj: any = {
          meetingText: Buffer.from(base64FileString, 'base64'),
          meetingAudio: Buffer.from(base64Audio, 'base64')
        };
        Handlers.MeetingHandlers.UpdateMeeting(meetingId, updateUserObj)
          .then((data: any) => {
            console.log('Meeting note added to collection successfully.');
          })
        console.log('Finished converting audio to speech.');
        if(slackChannel) {
          console.log('Posting result to slack.');
          sendMessageToChannel(slackChannel, meetingData.meetingName, 'speech-output.txt')
          .then((data: any) => {
            console.log('Upload file to slack channel response: ', data);
          }, (err: any) => {
            console.log('Error while uploading file to slack channel: ', err);
          });
        }
      }
    );
  });
}

async function generateAudioChunks(segments: any, callback: any) {
  console.log('Before for loop.');
  for(let index=0; index < segments.length; index++) {
    console.log('await index:', index);
    await callback(segments[index], index, segments);
    console.log('finished index:', index);
  }
  console.log('After for loop.');

}

async function sendMessageToChannel(channelId: string, meetingName: string, textFile: string) {
  const formData = {
    file: fs.createReadStream(textFile),
    filename: meetingName,
    channels: channelId
  };
  return Handlers.SlackHandlers.UploadFileToChannel(formData)
}

export default {
  EnrollUser,
  SpeechToText,
  ConvertAudioToText,
  ConvertAudioToTextSync,
  ProcessAudioFile
};