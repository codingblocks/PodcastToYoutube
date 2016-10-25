var fileName = process.argv[2],
    title = process.argv[3],
    description = process.argv[4];

const Youtube = require("youtube-api")
    , fs = require("fs")
    , readJson = require("r-json")
    , Lien = require("lien")
    , Logger = require("bug-killer")
    , opn = require("opn")
    , prettyBytes = require("pretty-bytes");

const CREDENTIALS = readJson(`${__dirname}/client_secrets.json`);


var upload = function(tokens) {
    var req = Youtube.videos.insert({
        resource: {
            // Video title and description
            snippet: {
                title: title,
                description: description,
                tags: ['Podcast', 'Coding', 'Programming', 'Podcast', 'Coding Blocks', 'CodingBlocks.net', 'Programming Podcast', 'Software Engineering Podcast']
            }
            // I don't want to spam my subscribers
            , status: {
                privacyStatus: "public"
            }
        }
        // This is for the callback function
        , part: "snippet,status"

        // Create the readable stream to upload the video
        , media: {
            body: fs.createReadStream(fileName)
        }

        , notifySubscribers : 'false'
    }, (err, data) => {
        console.log("Done.");
        process.exit();
    });

    setInterval(function () {
        Logger.log(`${prettyBytes(req.req.connection._bytesDispatched)} bytes uploaded.`);
    }, 250);
};

fs.exists('./tokens.json', (exists) => {
    if(exists) {
        fs.readFile('./tokens.json', function(err,data) {
            var tokens = JSON.parse(data);
            let oauth = Youtube.authenticate({
                type: "oauth"
            , client_id: CREDENTIALS.web.client_id
            , client_secret: CREDENTIALS.web.client_secret
            , redirect_url: CREDENTIALS.web.redirect_uris[0]
            , refresh_token: tokens.refresh_token
            });
            oauth.setCredentials(tokens);
            console.log('Using cached tokens');
            upload(tokens);
        });
    } else {
        // Init lien server
        let server = new Lien({ host: "localhost" , port: 5000 });

        // Authenticate
        // You can access the Youtube resources via OAuth2 only.
        // https://developers.google.com/youtube/v3/guides/moving_to_oauth#service_accounts
        let oauth = Youtube.authenticate({
            type: "oauth"
        , client_id: CREDENTIALS.web.client_id
        , client_secret: CREDENTIALS.web.client_secret
        , redirect_url: CREDENTIALS.web.redirect_uris[0]
        , 
        });

        opn(oauth.generateAuthUrl({
            access_type: "offline"
        , scope: ["https://www.googleapis.com/auth/youtube.upload"]
        }));

        console.log('Attempting to fetch tokens');
        // Handle oauth2 callback
        server.addPage("/oauth2callback", lien => {
            Logger.log("Trying to get the token using the following code: " + lien.query.code);
            oauth.getToken(lien.query.code, (err, tokens) => {

                if (err) {
                    lien.lien(err, 400);
                    return Logger.log(err);
                }

                Logger.log("Got the tokens.");

                oauth.setCredentials(tokens);
                fs.writeFile("./tokens.json", JSON.stringify(tokens));
                lien.end("The video is being uploaded. Check out the logs in the terminal.");
                upload(tokens);
            });
        });
    }
});