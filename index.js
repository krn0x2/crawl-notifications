var Crawler = require("crawler");
const AWS = require('aws-sdk');
var ses = new AWS.SES();
const {
    crawlUrl,
    priceReq,
    roomReq
} = process.env;
module.exports = {
    handler: function (event, context, cb) {
        var c = new Crawler({
            maxConnections: 10,
            callback: function (error, res, done) {
                if (error) {
                    console.log(error);
                } else {
                    const $ = res.$;
                    // $ is Cheerio by default
                    //a lean implementation of core jQuery designed specifically for the server
                    const available_to_book = $(".resi-box");
                    const interesting = available_to_book.map((i, el) => {
                        // console.log(el);
                        const price = Number($(el).find(".price-1").text().split(" ", 1)[0].replace(/[^0-9.-]+/g, ""));
                        const rooms = Number($(el).find(".rb_bottom > .rb-left:nth-child(2) > p:nth-child(2)").text().split(" ")[1]);
                        return {
                            price,
                            rooms
                        };
                    }).get().filter(o => {
                        console.log(o.price, o.rooms);
                        if (o.price <= parseInt(priceReq) && o.rooms >= parseInt(roomReq)) {
                            return true;
                        }
                        return false;
                    });
                    console.log(interesting);
                    if (interesting.length > 0) {
                        /* The following example sends a formatted email: */

                        var params = {
                            Destination: {
                                BccAddresses: [],
                                CcAddresses: [],
                                ToAddresses: ['krn0x2@gmail.com']
                            },
                            Message: {
                                Body: {
                                    Html: {
                                        Charset: "UTF-8",
                                        Data: `We found new apartments for you!. Check them out here <br /> <a class=\"ulink\" href=\"${crawlUrl}\" target=\"_blank\">Holland2Stay</a>.`
                                    }
                                },
                                Subject: {
                                    Charset: "UTF-8",
                                    Data: `${interesting.length} interesting apartments found`
                                }
                            },
                            ReplyToAddresses: [],
                            Source: "krn0x2@gmail.com",
                        };
                        ses.sendEmail(params, function (err, data) {
                            if (err) {
                                console.log(err, err.stack); // an error occurred
                                cb("error");
                            } else {
                                console.log(data); // successful response
                                done();
                                cb(null, "message");
                            }
                        });
                    }
                }

            }
        });
        c.queue(crawlUrl);
    }
}

// module.exports.handler(null, null, () => {})