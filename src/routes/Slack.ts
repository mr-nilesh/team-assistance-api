import { Router } from 'express';
import Handlers from '@handlers';

// Init shared
const router = Router();
router.use((req, res, next)  => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.get('/channels', (req, res) => {
  Handlers.SlackHandlers.GetSlackChannels()
    .then((data: any) => {
      res.status(200).send(data.channels);
    }, (err: any) => {
      res.status(500).send(err);
    });
});

export default router;