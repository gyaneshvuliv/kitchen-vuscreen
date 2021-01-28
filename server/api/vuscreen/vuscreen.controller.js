'use strict';

var _ = require('lodash');
var db = require('../../config/mysql')
var moment = require('moment');
var request = require('request');
var io = require('socket.io').listen(3200);

exports.IFE_registration = function (req, res) {
  const { name, mobile_no, device_id } = req.body
  let query = "Insert INTO"
    + " vuscreen_ife_registration "
    + " (name, date, mobile_no, device_id)"
    + " VALUES ('" + name + "','" + moment(new Date()).format("YYYY-MM-DD") + "','" + mobile_no
    + "','" + device_id + "')";
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    else {
      return res.status(200).json({
        "status": 200,
        "message": "Success.",
        "result": { "name": name, "mobile_no": mobile_no, "device_id": device_id }
      });
    }
  })
}


exports.IFE_upload = function (req, res) {
  const { name , mobile_no, f_type, start_date, base_station, from, to, fno, ftime, airCrafType, host1, host2, rem } = req.body
  let query = "Insert INTO"
    + " vuscreen_ife_data "
    + " (name, mobile_no, f_type, date, base_station, source, destination, f_no, air_craft_type, host1, host2, remote,sync_datetime,ftime)"
    + " VALUES ('" + name + "','" + mobile_no + "','" + f_type + "','" + moment(start_date).format("YYYY-MM-DD") + "','" + base_station
    + "','" + from + "','" + to + "','" + fno + "','" + airCrafType + "'," + host1 + "," + host2 + "," + rem +  ",'" + moment(start_date).format('YYYY-MM-DD HH:mm') +"','" + moment(ftime).format('HH:mm') +"')";
    db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    else {
      return res.status(200).json(doc);
    }
  })
}

// send sms
exports.send_sms = function (req, res) {
  let number = req.query.number;
  generateSecureVal(function (secureVal) {
    console.log(secureVal)
    let message = 'https://api.infobip.com/sms/1/text/query?username=Mobiserve&password=SpicEN@2018&from=SpicEN&to=$$91' + number + '$$&text=Dear Recipients,\nYour OTP for IFE registraion is - ' + secureVal
    // var message = 'http://www.myvaluefirst.com/smpp/sendsms?username=Mobiservehttp1&password=mobi1234&to=' + number + '&from=VUINFO&text=Dear Recipients,\nYour OTP is -' + secureVal
    request(message, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("OTP has been sent.") // Show the HTML for the Google homepage.
        insertOtp(number, secureVal)
        return res.status(200).send({ "status": 200, "message": "OTP has been sent", "secureVal": secureVal });
      } else {
        return handleError(res, err);
      }
    })
  })
}


const insertOtp = function (number, secureVal) {
  let query = "Update "
    + " vuscreen_ife_registration "
    + " SET "
    + " otp = " + secureVal
    + " where mobile_no = " + number;
  console.log(query)
  db.get().query(query, function (err, doc) {
    if (err) { console.log("err"); }
    else {
      console.log("Success")
    }
  })
}

exports.varify_otp = function (req, res) {
  const { mobile_no, otp } = req.body
  let query = "select *  from vuscreen_ife_registration where mobile_no = " + mobile_no
  db.get().query(query, function (err, doc) {
    if (err) { return handleError(res, err); }
    else {
      console.log(doc[0].otp , otp)
      console.log(typeof(doc[0].otp) , typeof(otp))
      if (doc[0].otp == otp) {
        let query = "Update "
          + " vuscreen_ife_registration "
          + " SET "
          + " isVarified = 1"
          + " where mobile_no = " + mobile_no;
        console.log(query)
        db.get().query(query, function (err, doc) {
          if (err) { console.log(err); }
          else {
            return res.status(200).json({ "status": 200, "message": "Successfully Varified." });
          }
        })
      }else {
        return res.status(200).json({ "status": 200, "message": "Wrong OTP."});
      }
    }
  })
  // let query = "Insert INTO"
  //   + " vuscreen_ife_data "
  //   + " (f_type, date, base_station, source, destination, f_no, host1, host2, remote)"
  //   + " VALUES ('" + f_type + "','" + moment(start_date).format("YYYY-MM-DD") + "','" + base_station
  //   + "','" + from + "','" + to + "','" + fno + "'," + host1 + "," + host2 + "," + rem + ")";
  //   db.get().query(query, function (err, doc) {
  //   if (err) { return handleError(res, err); }
  //   else {
  //     return res.status(200).json(doc);
  //   }
  // })
}

const crypto = require('crypto');
let secureVal = 0;

function generateSecureVal(cb) {
  crypto.randomBytes(3, function (err, buffer) {
    secureVal = parseInt(buffer.toString('hex'), 16);
    if (secureVal > 999999 || secureVal < 100000) {
      generateSecureVal(cb);
    } else {
      cb(secureVal);
    }
  });
}

function handleError(res, err) {
  return res.status(500).send(err);
}


function insertSignup(data) {
  return new Promise(function (myResolve, myReject) {
    let query = "insert into tbl_user set ?";
    let post = {
      user_name: data.user_name,
      email: data.email,
      password: data.password,
      mobile_no: data.mobile_no,
      role: data.role,
      user_status: data.user_status
    }
    db.get().query(query, post, function (err, doc) {
      if (err) { myResolve(err) }
      else {
        myResolve("success");
      }
    })

  });

}

function getLogin(data) {
  return new Promise(function (myResolve, myReject) {
    let query = `select * from tbl_user where email='${data.email}' and password='${data.password}'`;
    db.get().query(query, function (err, doc) {
      if (err) { myResolve(err) }
      else {

        myResolve(doc);
      }
    })

  });

}

function verifyemail(data) {
  return new Promise(function (myResolve, myReject) {
    let query = `select * from tbl_user where email='${data.email}'`;
    db.get().query(query, function (err, doc) {
      if (err) { myResolve(err) }
      else {

        myResolve(doc);
      }
    })

  });

}
function insertItem(data) {
  return new Promise(function (myResolve, myReject) {
    console.log(data);
    let query = "insert into tbl_items set ?";
    let post = {
      item_name: data.item_name,
      item_desc: data.item_desc,
      item_status: data.item_status
    }
    db.get().query(query, post, function (err, doc) {
      if (err) { 
        console.log(err);
        myResolve(err) }
      else {
        myResolve("success");
      }
    })

  });

}

function getItem(data) {
  return new Promise(function (myResolve, myReject) {
    let query = `select * from tbl_items `;
    db.get().query(query, function (err, doc) {
      if (err) { myResolve(err) }
      else {

        myResolve(doc);
      }
    })

  });

}

function updateItem(data) {
  return new Promise(function (myResolve, myReject) {
    let query = `update tbl_items set ? where item_id=${data.item_id}`;
    let post = {
      item_name: data.item_name,
      item_desc: data.item_desc,
      item_status: data.item_status
    }
    db.get().query(query, post, function (err, doc) {
      if (err) { myResolve(err) }
      else {
        myResolve("success");
      }
    })

  });

}

function updateItemStatus(data) {
  return new Promise(function (myResolve, myReject) {
    let query = `update tbl_items set ? where item_id=${data.item_id}`;
    let post = {

      item_status: data.item_status
    }
    db.get().query(query, post, function (err, doc) {
      if (err) { myResolve(err) }
      else {
        myResolve("success");
      }
    })

  });

}

function insertOrder(data) {
  return new Promise(function (myResolve, myReject) {
    let query = "insert into tbl_orders set ? ";
    let post = {
      item_id:data.item_id,
      user_id:data.user_id,
      order_status:data.order_status,
      order_acceptance_status:data.order_acceptance_status
    }
    db.get().query(query, post, function (err, doc) {
      if (err) { myResolve(err) }
      else {
        io.emit('newOrder', 'new');
        myResolve("success");
      }
    })

  });

}

function updateOrderStatus(data) {
  return new Promise(function (myResolve, myReject) {
    let query = `update tbl_orders set ? where order_id=${data.order_id}`;
    let post = {

      order_status: data.order_status,
      order_acceptance_status:data.order_acceptance_status
    }
    db.get().query(query, post, function (err, doc) {
      if (err) { myResolve(err) }
      else {
        myResolve("success");
      }
    })

  });

}

function ordersocket(data) {
  return new Promise(function (myResolve, myReject) {
    let query = `select * from tbl_orders as a inner join tbl_items as b on a.item_id=b.item_id  where order_id=${data.order_id}`;
   
    db.get().query(query, function (err, doc) {
      if (err) { myResolve(err) }
      else {
        io.emit('order', doc);
        myResolve("success");
      }
    })

  });

}
function getActiveOrders(data) {
  return new Promise(function (myResolve, myReject) {
    let query = `select * from tbl_orders as a inner join tbl_user as b on a.user_id=b.id inner join tbl_items as c on a.item_id=c.item_id   where a.order_status="active" order by order_id desc `;
    db.get().query(query, function (err, doc) {
      if (err) { myResolve(err) }
      else {

        myResolve(doc);
      }
    })

  });

}

function getUserOrders(data) {
  return new Promise(function (myResolve, myReject) {
    let query = `select * from tbl_orders as a inner join tbl_user as b on a.user_id=b.id inner join tbl_items as c on a.item_id=c.item_id where a.user_id='${data.user_id}'  order by order_id desc  `;
    db.get().query(query, function (err, doc) {
      if (err) { myResolve(err) }
      else {

        myResolve(doc);
      }
    })

  });

}

module.exports={
  insertSignup:insertSignup,
  getLogin:getLogin,
  insertItem:insertItem,
  getItem:getItem,
  updateItem:updateItem,
  updateItemStatus:updateItemStatus,
  insertOrder:insertOrder,
  updateOrderStatus:updateOrderStatus,
  getActiveOrders:getActiveOrders,
  getUserOrders:getUserOrders,
  verifyemail:verifyemail,
  ordersocket:ordersocket
}