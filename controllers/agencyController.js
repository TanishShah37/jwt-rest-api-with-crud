const express = require("express");
const router = express.Router();
const config = require("../config/config");
const util = require('util')
const colors = require('colors')
const jwt = require("jsonwebtoken");
const agencyModel = require("../models/agencyModel");
const clientModel = require("../models/clientModel");
const auth = require('../middleware/auth')

router.post("/", (req, res) => {
  let {
    name,
    email,
    address1,
    address2,
    state,
    city,
    phone
  } = req.body.agencyDetails;

  let clientEmail = req.body.clientDetails.email;

  function createClientWithAgency(agency) {
    let agencyId = agency.id;
    let {
      name,
      email,
      phone,
      totalBill
    } = req.body.clientDetails;

    if (isNaN(totalBill)) {
      return res.status(400).json({
        message: `${totalBill} is not a valid number`
      });
    }

    let actions = {};
    if (totalBill >= 0) {
      actions.type = 'add'
    } else {
      actions.type = 'subtract'
    }
    actions.amount = totalBill

    const newClient = new clientModel({
      agencyId,
      name,
      email,
      phone,
      totalBill,
      actions: [actions]
    });
    newClient
      .save()
      .then(client => {
        res.json({
          agency,
          client,
        });
      })

  }

  clientModel.findOne({
      email: clientEmail
    })
    .then(client => {
      if (client) return res.status(400).json({
        message: "client Already Exists"
      });
      agencyModel.findOne({
          email
        })
        .then(agency => {
          if (agency) {
            createClientWithAgency(agency)
          };

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

                  createClientWithAgency(agency)
                }
              );
            })
        })
        .catch(error => {
          util.log(colors.red(error))
        })
    });

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