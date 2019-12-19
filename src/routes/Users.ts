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
  console.log('Adding new user.');
  Handlers.UserHandlers.CreateUser({
    fullName: req.body.fullName,
    mobile: req.body.mobile,
    speechRecognizationID: '',
    enrollmentStatus: 'Pending',
    enrollmentAudio: req.body.enrollmentAudio
  }).then((data) => {
    if(data.enrollmentStatus === 'Success') {
      console.log('Updating user with enrollment status success.');
      Handlers.UserHandlers.UpdateUser(
        data._id,
        {
          enrollmentStatus: data.enrollmentStatus,
          speechRecognizationID: data._id,
          noOfTimes: 1
        },
        {}
      ).then((updatedUser) => {
        console.log('User updated successfully with enrolment status success.', updatedUser);
        res.status(200).send(updatedUser);
      }).catch((err) => {
        res.status(500).send(err);
      });
    } else {
      console.log("User enrollment failed :: ", data);
      // if (data.enrollmentStatus !== 'Pending') {
      //   res.status(400).send(data);
      // } else {
        res.status(200).send(data);
      // }
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
  return res.status(200).send({user});
});

export default router;