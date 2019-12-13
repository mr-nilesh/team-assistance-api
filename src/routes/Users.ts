import { Router } from 'express';
import Handlers from '@handlers';

// Init shared
const router = Router();
router.use((req, res, next)  => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.post('/', async (req, res) => {
  Handlers.UserHandlers.CreateUser({
    fullName: req.body.fullName,
    mobile: req.body.mobile,
    speechRecognizationID: '',
    enrollmentStatus: 'Pending',
    enrollmentAudio: req.body.enrollmentAudio
  }).then((data) => {
    if(data.enrollmentStatus === 'Success') {
      Handlers.UserHandlers.UpdateUser(
        data.id,
        {
          enrollmentStatus: data.enrollmentStatus,
          speechRecognizationID: data.id
        }
      ).then(() => {
        res.status(200).send(data);
      });
    } else {
      res.status(200).send(data);
    }
  }, (err) => {
    res.status(500).send(err);
  });
});

router.get('/', async (req, res) => {
  const users = await Handlers.UserHandlers.GetUsers();
  return res.status(200).send({ users });
});

router.get('/:mobile', async (req, res) => {
  const user = await Handlers.UserHandlers.GetUser({
    mobile: req.params.mobile,
    updateObj: null,
    id: null
  });
  return res.status(200).send({ user });
});

router.put('/:id', async (req, res) => {
  const updateObj: any = {};
  if(req.body.fullName) {
    updateObj.fullName = req.body.fullName;
  }
  const user = await Handlers.UserHandlers.UpdateUser(
    req.params.id,
    updateObj,
    {
      enrollmentAudio: req.body.enrollmentAudio
    }
  );
  return res.status(200).send(user);
});

export default router;