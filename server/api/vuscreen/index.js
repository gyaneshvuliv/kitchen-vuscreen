'use strict';

const express = require('express');
const controller = require('./vuscreen.controller');
const router = express.Router();
// const fs = require('fs')

//////////////////////////////////////////////////

router.post('/signup', function (req, res, next) {
    async function app() {
      let check = await controller.verifyemail(req.body);
  if(check.length==0){
      let insert = await controller.insertSignup(req.body);
      let get = await controller.getLogin(req.body);
      res.status("200").json(get);
  }
  else{
    res.status("200").json("Email Already Exists");

  }
    }
    app();
  
  });
  
  router.post('/login', function (req, res, next) {
    async function app() {
  
      let get = await controller.getLogin(req.body);
      console.log(get);
      if (get.length > 0) {
  
        res.status("200").json(get);
      }
      else {
        res.status("200").json("NO User Found");
      }
  
    }
    app();
  
  });
  
  router.post('/add/item', function (req, res, next) {
    async function app() {
  
      let insert = await controller.insertItem(req.body);
      res.status("200").json(insert);
  
    }
    app();
  
  });
  
  router.get('/get/items', function (req, res, next) {
    async function app() {
  
      let get = await controller.getItem();
      res.status("200").json(get);
  
  
  
    }
    app();
  
  });
  
  router.post('/update/item', function (req, res, next) {
    async function app() {
  
      let insert = await controller.updateItem(req.body);
      res.status("200").json(insert);
  
    }
    app();
  
  });
  
  router.post('/update/item/status', function (req, res, next) {
    async function app() {
  
      let insert = await controller.updateItemStatus(req.body);
      res.status("200").json(insert);
  
    }
    app();
  
  });
  
  router.post('/add/order', function (req, res, next) {
    async function app() {
  
      let insert = await controller.insertOrder(req.body);
      res.status("200").json(insert);
  
    }
    app();
  
  });
  
  router.post('/update/order/status', function (req, res, next) {
    async function app() {
  
      let insert = await controller.updateOrderStatus(req.body);
      if(insert=="success"){
        let soc = await controller.ordersocket(req.body);

      }

      res.status("200").json(insert);
  
    }
    app();
  
  });
  
  router.get('/get/active/order', function (req, res, next) {
    async function app() {
  
      let insert = await controller.getActiveOrders(req.body);
      res.status("200").json(insert);
  
    }
    app();
  
  });


  router.post('/get/user/order', function (req, res, next) {
    async function app() {
  
      let insert = await controller.getUserOrders(req.body);
      res.status("200").json(insert);
  
    }
    app();
  
  });



module.exports = router;