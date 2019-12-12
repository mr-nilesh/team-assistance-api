import { Router } from 'express';
import UserRouter from './Users';
import MeetingRouter from './Meetings';
import SlackRouter from './Slack';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/meetings', MeetingRouter);
router.use('/slack', SlackRouter);

// Export the base-router
export default router;
