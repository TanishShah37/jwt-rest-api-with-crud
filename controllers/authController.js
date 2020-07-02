const express = require('express');
const router = express.Router();
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const agencyModel = require('../models/agencyModel');


router.post('/', (req, res) => {
    const {
        email 
    } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is  Required" })
    }

    agencyModel.findOne({ email })
        .then(agency => {
            if (!agency) return res.status(400).json({ message: 'Agency Field Does Not Exists' })
            jwt.sign(
                { id: agency.id },
                config.jwtSecret,
                { expiresIn: 1036800 },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token,
                        id: agency.id,
                        fullName: agency.name,
                        email: agency.email
                    })
                }
            )
        })
        .catch(err => res.status(400))
}); 
 
module.exports = router;