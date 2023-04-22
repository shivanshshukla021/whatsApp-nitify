require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//APP config
const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

//DB config

mongoose.connect("mongodb://localhost:27017/myapp", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
const reminderSchema = new mongoose.Schema({
  reminderMsg: String,
  remindAt: String,
  isReminded: Boolean,
});
const Reminder = new mongoose.model("reminder", reminderSchema);

//Whatsapp reminding functionality

setInterval(() => {
  Reminder.find({}, (err, reminderList) => {
    if (err) {
      console.log(err);
    }
    if (reminderList) {
      reminderList.forEach((reminder) => {
        if (!reminder.isReminded) {
          const now = new Date();
          if (new Date(reminder.remindAt) - now < 0) {
            Reminder.findByIdAndUpdate(
              reminder._id,
              { isReminded: true },
              (err, remindObj) => {
                if (err) {
                  console.log(err);
                }
                const accountSid = "AC7219593d55f934ecf64084206fef4d31";
                const authToken = "bad5726beea0afe5edc3f1e3dbe72a7c";
                const client = require("twilio")(accountSid, authToken);

                client.messages
                  .create({
                    body: "Your appointment is coming up on July 21 at 3PM",
                    from: "whatsapp:+14155238886",
                    to: "whatsapp:+918305635770",
                  })
                  .then((message) => console.log(message.sid))
                  .done();
              }
            );
          }
        }
      });
    }
  });
}, 1000);

//API routes
app.get("/getAllReminder", (req, res) => {
  Reminder.find({}, (err, reminderList) => {
    if (err) {
      console.log(err);
    }
    if (reminderList) {
      res.send(reminderList);
    }
  });
});
app.post("/addReminder", (req, res) => {
  const { reminderMsg, remindAt } = req.body;
  const reminder = new Reminder({
    reminderMsg,
    remindAt,
    isReminded: false,
  });
  reminder.save((err) => {
    if (err) {
      console.log(err);
    }
    Reminder.find({}, (err, reminderList) => {
      if (err) {
        console.log(err);
      }
      if (reminderList) {
        res.send(reminderList);
      }
    });//DONE
  });
});
app.post("/deleteReminder", (req, res) => {
  Reminder.deleteOne({ _id: req.body.id }, () => {
    Reminder.find({}, (err, reminderList) => {
      if (err) {
        console.log(err);
      }
      if (reminderList) {
        res.send(reminderList);
      }
    });
  });
});

app.listen(9000, () => console.log("Be started"));
