const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const router = require('express').Router()

const pool = require('../connectdb')
const helpers = require('../helpers/helpers')
const auth = require('../middleware/auth')

const hostURL = process.env.HOST_URL
const nodeEnv = process.env.NODE_ENV

/* CREATE GROUP -- TESTS DONE */


/* GET A USER'S GROUP -- TESTS DONE */


/* GET ALL GROUPS -- SEARCH TESTS DONE */


/* REQUEST TO JOIN GROUP */


/* GET GROUP JOIN REQUESTS */


/* ACCEPT/DECLINE GROUP JOIN REQUESTS */


/* LEAVE GROUP */


/* REMOVE FROM GROUP */