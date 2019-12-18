import Models, { IUser } from '@models';
import Handlers from '@handlers';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

interface ICreateUserInput {
  fullName: IUser['fullName'];
  mobile: IUser['mobile'];
  speechRecognizationID: IUser['speechRecognizationID'];
  enrollmentStatus: IUser['enrollmentStatus'];
  enrollmentAudio: IUser['enrollmentAudio'];
}

interface IGetUserInput {
  mobile: IUser['mobile'];
  id: IUser['id'];
  updateObj: any
}

async function CreateUser({
  fullName,
  mobile,
  speechRecognizationID,
  enrollmentStatus,
  enrollmentAudio
}: ICreateUserInput): Promise<any> {
  return Models.User.findOne({mobile: mobile})
    .then((data: any) => {
      if(!data) {
        return Models.User.create({
          fullName,
          mobile,
          speechRecognizationID,
          enrollmentStatus,
          enrollmentAudio
        })
          .then((data: IUser) => {
            console.log('User added successfully.');
            const enrollObj = {
              content: enrollmentAudio,
              sampleRate: 44100,
              encoding: 'MP3',
              languageCode: 'en-US',
              speakerId: data.id
            };
            return Handlers.SpeechRecognizationHandlers.EnrollUser(enrollObj)
            .then((daResponse: any) => {
              if (daResponse.message === 'Success') {
                console.log(`User ${fullName} enrolled successfully.`);
              }
              const copyOfUser = JSON.parse(JSON.stringify(data));
              copyOfUser.enrollmentStatus = daResponse.message
              return copyOfUser;
            });
          })
          .catch((error: Error) => {
            throw error;
          });
      } else {
        return data;
      }
    });
}

async function GetUsers(): Promise<IUser[]> {
  return Models.User.find({})
    .then((data) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}

async function GetUser({
  mobile
}: IGetUserInput): Promise<IUser> {
  return Models.User.findOne({
    mobile
  })
    .then((data: any) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}

async function UpdateUser(id: string, updateObj: any, enrollmentObj?: any): Promise<IUser> {
  console.log('Finding and updating user...');
  return Models.User.findOneAndUpdate({_id: id}, updateObj, {new: true})
    .then((data: any) => {
      console.log('User updated successfully.');
      if(enrollmentObj.enrollmentAudio) {
        const enrollObj = {
          content: enrollmentObj.enrollmentAudio,
          sampleRate: 44100,
          encoding: 'MP3',
          languageCode: 'en-US',
          speakerId: id
        };
        console.log('Enrolling user...', enrollObj);
        return Handlers.SpeechRecognizationHandlers.EnrollUser(enrollObj)
        .then((daResponse: any) => {
          if (daResponse.message === 'Success') {
            console.log(`User ${data.fullName} enrolled successfully.`);
            let noOfTimes = data.noOfTimes;
            if(data.noOfTimes < 4) {
              noOfTimes++;
            }
            // If previous enrollment status is Pending make it Success. Also update no of times user enrolled.
            if(data.enrollmentStatus === 'Pending') {
              console.log('Current enrollment status is Pending so changing it to Success.');
              return Models.User.findOneAndUpdate({_id: id}, {enrollmentStatus: 'Success', noOfTimes: noOfTimes}, {new: true})
              .then((updateRes: any) => {
                console.log('After changing Pending status to Success the response is:', updateRes);
                return updateRes;
              });
            } else { // If already succeed only update no of times user enrolled.
              console.log('Current status is Success so only change noOfTimes.');
              return Models.User.findOneAndUpdate({_id: id}, {noOfTimes: noOfTimes}, {new: true})
              .then((updateRes: any) => {
                console.log('After updating noOfTimes the response is:', updateRes);
                return updateRes;
              });
            }
          } else {
            console.log('Error while enrolling user: ', daResponse);
            return data;
          }
        });
      } else {
        return data;
      }
    })
    .catch((error: Error) => {
      console.log('Error while updating user:', error);
      return 'No records found.';
    });
}

export default {
  CreateUser,
  GetUsers,
  GetUser,
  UpdateUser
};