const express = require("express");
const router = express.Router();
const config = require("../config/config");
const util = require('util')
const colors = require('colors')
const jwt = require("jsonwebtoken");
const agencyModel = require("../models/agencyModel");


router.post("/", (req, res) => {
  const {
    name,
    email,
    address1,
    address2,
    state,
    city,
    phone
  } = req.body;

  if (!name || !email || !address1 || !state || !city || !phone) {
    const message = `Below Fields Are Required: 'name email address1 state city phone'`;
    return res.status(400).json({
      message
    });
  }

  agencyModel.findOne({
      email
    })
    .then(agency => {


      if (agency) return res.status(400).json({
        message: "agency Already Exists"

      });

      const newAgency = new agencyModel({
        name,
        email,
        address1,
        address2,
        state,
        city,
        phone
      });
      newAgency
        .save()
        .then(agency => {
          jwt.sign({
              id: agency.id
            },
            config.jwtSecret, {
              expiresIn: 1036800
            },
            (error, token) => {
              if (error) throw error;
              res.json({
                token,
                agency: {
                  id: agency.id,
                  name: agency.name,
                  email: agency.email
                }
              });
            }
          );
        })
    })
    .catch(error => {
      util.log(colors.red(error))
    })
});


router.get('/getAllAgencies', (req, res) => {
  agencyModel.aggregate([{
        $match: {}
      },
      {
        $lookup: {
          from: 'client',
          localField: '_id',
          foreignField: 'agencyId',
          as: 'client',
        },
      },
      {
        $unwind: {
          path: "$client",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          "client.totalBill": -1
        }
      },
      {
        $group: {
          "_id": "$_id",
          "name": {
            $first: "$name"
          },
          "client": {
            $first: "$client"
          }
        }
      },
      {
        $project: {
          "_id": 0,
          "AgencyName": "$name",
          "ClientName": "$client.name",
          "TotalBill": "$client.totalBill"
        }
      }
    ])
    .then(Agencies => {
      res.status(200).type('json').send(JSON.stringify({
        Agencies
      }, null, 2));
    })
    .catch(error => {
      util.log(colors.red(error))
    })
})

module.exports = router;