This will start downloading and uploading the coding blocks episodes from the (hard-coded) feed. Note: It does not currently check youtube - only local file system - to know which files to upload. So, if you run it right now..it will double up all the videos. :)

So, first TODO is to first check YouTube for the title.
Then, it would be nice to do some cleanup and parameterize at some point.

0. Requires ffmpeg to make the movies
````
brew install ffmpeg
````

1. Requires Ruby, and the following gems:
````
gem install nokogiri
gem install open-uri
````

2. And NodeJs...
````
npm install
````
3. Then you need to copy client_secrets.json.sample to client_secrets.json and fill in the id and secret


Then, just run the script like...
ruby download_and_upload.rb

  