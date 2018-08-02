'use strict'
var express = require('express');
var request = require('request');
var app = express();
var logger = require('morgan');
var bodyParser = require('body-parser');
var path = require("path");
var fs = require("fs");
var ursa = require('ursa');
const uuidv1 = require('uuid/v1');
const crypto = require('crypto');
const constants = require('constants');
const padding = constants.RSA_PKCS1_PADDING;

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


var encryptStringWithRsaPublicKey = function(toEncrypt) {
    var publicKey = fs.readFileSync('momo_pub.pem', "utf8");	// rsa_4096_pub.pem, momo_pub.pem
    var buffer = new Buffer(toEncrypt);
    var encrypted = crypto.publicEncrypt( {key: publicKey, padding: padding}, buffer);
    return encrypted.toString("base64");
};

var decryptStringWithRsaPrivateKey = function(toDecrypt) {
    var privateKey = fs.readFileSync('rsa_4096_priv.pem', "utf8");
    var buffer = new Buffer(toDecrypt, "base64");
    var decrypted = crypto.privateDecrypt({key: privateKey, padding: padding}, buffer);
    return decrypted.toString("utf8");
};

var signatureCreate = function(toEncrypt){
	var signature = crypto.createHmac('sha256', momo_key)
                   .update(toEncrypt)
                   .digest('hex');
    return signature
}

var run_decrypt = false;

var pubKeyB64 = '-----BEGIN PUBLIC KEY-----\n' +
'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAiBIo9EMTElPppPejirL1\n' +
'cdgCuZUoBzGZF3SyrTp+xdMnIXSOiFYG+zHmI1lFzoEbEd1JwXAUV52gn/oAkUo+\n' +
'2qwuqZAPdkm714tiyjvxXE/0WYLl8X1K8uCSK47u26CnOLgNB6iW1m9jog00i9XV\n' +
'/AmKI1U8OioLFSp1BwMf3O+jA9uuRfj1Lv5Q0Q7RMtk4tgV924+D8mY/y3otBp5b\n' +
'+zX0NrWkRqwgPly6NeXN5LwqRj0LwAEVVwGbpl6V2cztYv94ZHjGzNziFJli2D0V\n' +
'pb/HRPP6ibXvllgbL4UXU4Izqhxml8gwd74jXaNaEgNJGhjjeUXR1sAm7Mpjqqgy\n' +
'xpx6B2+GpjWtEwvbJuO8DsmQNsm+bJZhw46uf9AuY5VSYy2cAF1XMXSAPNLqYEE8\n' +
'oVUki4IWYOEWSNXcQwikJC25rAErbyst/0i8RN4yqgiO/xVA1J1vdmRQTvGMXPGb\n' +
'DFpVca4MkHHLrkdC3Z3CzgMkbIqnpaDYoIHZywraHWA7Zh5fDt/t7FzX69nbGg8i\n' +
'4QFLzIm/2RDPePJTY2R24w1iVO5RhEbKEaTBMuibp4UJH+nEQ1p6CNdHvGvWz8S0\n' +
'izfiZmYIddaPatQTxYRq4rSsE/+2L+9RE9HMqAhQVvehRGWWiGSY1U4lWVeTGq2s\n' +
'uCNcMZdgDMbbIaSEJJRQTksCAwEAAQ==\n'+
'-----END PUBLIC KEY-----';

var key = ursa.createPrivateKey(fs.readFileSync('rsa_4096_priv.pem'));
var crt = ursa.createPublicKey(fs.readFileSync('rsa_4096_pub.pem'));
var momo_key = ursa.createPublicKey(fs.readFileSync('momo_pub.pem'));
var momo_key2 = ursa.createPublicKey(pubKeyB64);

// var msg = crt.encrypt("Everything is going to be 200 OK", 'utf8', 'base64');
// console.log('Encrypt with Public: ', msg, '\n');

// msg = key.decrypt(msg, 'base64', 'utf8');
// console.log('Decrypt with Private: ', msg, '\n');

var encrypt = function(stringToEncript) {
	// return momo_key2.encrypt(stringToEncript, 'utf8', 'base64', padding);
	return momo_key.encrypt(stringToEncript, 'utf8', 'base64', padding);
	// return encryptStringWithRsaPublicKey(stringToEncript);
};

var decrypt = function(stringToDecript) {
	return decryptStringWithRsaPrivateKey(stringToDecript);
}

/*var aaa = "hello hello";

var encyptString = encrypt(aaa);
console.log("encyptString ======> ", encyptString);

if(run_decrypt){
	var decryptedString = decrypt(encyptString);
	console.log("decryptedString ======> ", decryptedString);
}*/

app.use('/momo_test', function(req, res, next){

	console.log("\n==========req.body================");
	console.log(req.body);

	var partnerCode = "MOMOV2OF20180515";
	var partnerRefId = uuidv1();

	var appData = req.body.appData;
	var phone_number = req.body.phone_number;
	var amount = 500000; //eq.body.amount;

	var hashData = {
		"partnerCode": partnerCode,
		"partnerRefId": partnerRefId,
		"amount": amount,
		"partnerTransId": partnerRefId
	}

	console.log("\n==========Hash Data================");
	console.log("\n==> Before encrypt: ", hashData);
	var hash = encrypt(JSON.stringify(hashData));
	console.log("\n==> After encrypt: ", hash);

	var reqBody = {
		"customerNumber": phone_number,
		"partnerCode": partnerCode,
		"partnerRefId": partnerRefId,
		"amount": amount,
		"appData": appData,
		"hash": hash,
		"description": "Topup to Nkid Family account 1073851623",
		"version": 2
	}
	console.log("\n==========reqBody================");
	console.log(reqBody);
	var reqOptions = {
		'baseUrl': 'https://test-payment.momo.vn',
		'uri': '/pay/app',
		'method': 'POST',
		'json': true,
		'body': reqBody
	}

	console.log("\n==========reqOptions================");
	console.log(reqOptions);

	request(reqOptions, function(err, resData, body) {
		if (err) {
			return next(err);
		}
		console.log("==========Response================");
		console.log(body);
		res.json(body);
	});
	
})
;

console.log("\nReady");
app.listen(7777);


