const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth')
const clientModel = require("../models/clientModel");

router.post("/", auth, (req, res) => {
    const {
        name,
        email,
        phone,
        totalBill
    } = req.body;

    let agencyId = req.agency.id;

    if (!name || !email || !phone) {
        const message = "Below Fields Are Required: name email phone";
        return res.status(400).json({
            message
        });
    }

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

    clientModel.findOne({
            email
        })
        .then(client => {
            if (client) return res.status(400).json({
                message: "client Already Exists"
            });

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
                        client
                    });
                })
                .catch(err => res.status(400));
        });
})

router.put("/", auth, (req, res) => {
    const {
        email,
        phone,
        name,
        totalBill
    } = req.body;

    let agencyId = req.agency.id;

    if (!email || !totalBill) {
        const message = `Following Fields Are Required: ${!email ? 'email ' : ''}${!totalBill ? 'totalBill' : ''}`;
        return res.status(400).json({
            message
        });
    }
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
    let params = {
        $inc: {
            totalBill
        },
        $push: {
            actions
        }
    };
    if (phone)
        params.phone = phone;

    if (name)
        params.name = name;

    actions.amount = totalBill
    clientModel.updateOne({
            email,
            agencyId
        }, {
            ...params
        })
        .then(response => {
            if (response && !response.n) {
                return res.status(404).json({
                    message: `No client Found With Email ID: ${email}`
                });
            }
            res.json({
                response
            })
        })

})


router.delete("/", auth, (req, res) => {
    const {
        email,
    } = req.body;

    let agencyId = req.agency.id;

    if (!email) {
        const message = `Email Field is Required`;
        return res.status(400).json({
            message
        });
    }

    clientModel.deleteOne({
            email,
            agencyId
        })
        .then(response => {
            if (response && !response.deletedCount) {
                return res.status(404).json({
                    message: `No client Found With Email ID: ${email}`
                });
            }
            res.json({
                response
            })
        })
})


module.exports = router;