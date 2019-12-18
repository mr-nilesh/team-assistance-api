import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  meetingName: string;
  startedBy: string;
  createdAt: string;
  meetingAudio: string;
  meetingText: string;
  updatedMeetingText?: string;
}

const MeetingSchema: Schema = new Schema({
  meetingName        : { type: String, required: true },
  startedBy          : { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt          : { type : Date, default: Date.now },
  meetingAudio       : { type: Buffer },
  meetingText        : { type: Buffer },
  updatedMeetingText : { type: Buffer }
});

export default mongoose.model<IMeeting>('Meeting', MeetingSchema);