const Slack = require('node-slack');
import request = require('request-promise');
import config from '../config/development';

async function GetSlackChannels() {
  const requestOptions = {
    method: 'GET',
    uri: `https://slack.com/api/channels.list?token=${config.slackAPIToken}`,
    json: true
  };
  return request.post(requestOptions)
    .then((data: any) => {
      return data;
    }, (err: any) => {
      return err;
    });
}

async function PostMessageToChannel(messageObj: any) {
  const requestOptions = {
    method: 'GET',
    uri: `https://slack.com/api/chat.postMessage`,
    headers:
    {
        Authorization: `Bearer ${config.slackAPIToken}`,
        'Content-Type': 'application/json'
    },
    body: messageObj,
    json: true
  };
  return request.post(requestOptions)
    .then((data: any) => {
      return data;
    }, (err: any) => {
      return err;
    });
}

async function UploadFileToChannel(messageObj: any) {
  const requestOptions = {
    method: 'POST',
    uri: `https://slack.com/api/files.upload?token=${config.slackAPIToken}`,
    // headers:
    // {
    //     Authorization: `Bearer ${config.slackAPIToken}`,
    //     'Content-Type': 'application/json'
    // },
    formData: messageObj,
    json: true
  };
  return request.post(requestOptions)
    .then((data: any) => {
      return data;
    }, (err: any) => {
      return err;
    });
}

export default {
  GetSlackChannels,
  PostMessageToChannel,
  UploadFileToChannel
};