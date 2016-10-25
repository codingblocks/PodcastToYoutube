This is a rough collection of scripts that will automatically

It will start downloading and uploading the coding blocks episodes from the (hard-coded) feed. Note: It does not currently check youtube - only local file system - to know which files to upload. So, if you run it right now..it will double up all the videos. :)

So, first TODO is to first check YouTube for the title.
Then, it would be nice to do some cleanup and parameterize at some point.

*Step 0:* Special Note: The image is currently pulled from the "featured image" - which is not a standard field. You can use a plugin like this to add it if you're using wordpress: https://wordpress.org/plugins/featured-image-in-rss-feed/

*Step 1:* Requires ffmpeg to make the movies
````
brew install ffmpeg
````

*Step 2:* Requires Ruby v2, and the following gems:
````
gem install nokogiri
gem install open-uri
````

*Step 3:* And NodeJs v6, run this to install the required packages
````
npm install
````

*Step 4:*  Next copy client_secrets.json.sample to client_secrets.json and fill in the id and secret. (OAuth 2.0) https://developers.google.com/identity/protocols/OAuth2

*Step 5:* Then, just run the script and it will pop up a browser pointing to localhost:5000 that will let you authenticate directly with google. 
````
ruby download_and_upload.rb
````