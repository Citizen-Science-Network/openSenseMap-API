// Strict mode is invoked for the entire script
'use strict';

const nodemailer = require('nodemailer');

let mailTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'dsmecuador2021@gmail.com',
		pass: 'owqnrjtejcbtgpot'
	}
});

let mailDetails = {
	from: 'dsmecuador2021@gmail.com',
	to: 'jmartin.unal@gmail.com, jmmartinl@unal.edu.co',
	subject: 'Campaign Opensensemap',
    text: 'Hello, Javier wants you to join a new campaign;) ',
    html: '<b>Clic here to join it! </b><br> Opensensemap link: <a href="https://opensensemap.org/">link text</a>'
};

mailTransporter.sendMail(mailDetails, function(err, data) {
	if(err) {
		console.log('Error Occurs');
	} else {
		console.log('Email sent successfully');
	}
});
