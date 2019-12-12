import { Router } from 'express';
import Handlers from '@handlers';

// Init shared
const router = Router();

router.get('/channels', async (req, res) => {
  Handlers.SlackHandlers.GetSlackChannels()
    .then((data: any) => {
      res.status(200).send(data.channels);
    }, (err: any) => {
      res.status(500).send(err);
    });
});

export default router;