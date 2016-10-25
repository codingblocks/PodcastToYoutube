#!/usr/bin/ruby

require 'rubygems'
require 'nokogiri'
require 'open-uri'

def download_files mp3_files, images, dir, movie_file_name
  Dir.mkdir dir

  puts "Download Mp3"
  mp3_url = mp3_files[i - 1]["url"]
  mp3_file_name = mp3_url.match(/[^\/]*\.mp3$/)
  system "curl -L #{mp3_url} --output #{dir}/#{mp3_file_name}"

  puts "Download Image"
  image_url = images[i - 1].to_s.match(/([^\"]*\.\w+)/).to_s
  image_file_name = image_url.match(/[^\/]*\.\w+$/)
  system "curl -L #{image_url} --output #{dir}/#{image_file_name} -A \"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36\""

  puts "Create movie"
  system "ffmpeg -loop 1 -r 2 -i #{dir}/#{image_file_name} -i #{dir}/#{mp3_file_name} -vf \"scale=640:480\" -c:v libx264 -preset slow -tune stillimage -crf 18 -c:a copy -shortest -pix_fmt yuv420p -threads 0 #{movie_file_name}"
end

file_path = File.expand_path "./files"
doc = Nokogiri::XML(open("http://feeds.podtrac.com/c8yBGHRafqhz"))
mp3_files = doc.xpath("//enclosure")
images = doc.xpath("//item/description")
titles = doc.xpath("//item/title")
episode_count = mp3_files.length

Dir.mkdir file_path if !File.directory?(file_path)
File.delete "./tokens.json" if File.exists? "./tokens.json"

if images.length != episode_count or episode_count != titles.length
  throw "Found #{episode_count} mp3 files, but #{images.length} images and #{titles.length} titles...not sure what to do"
end

puts "Found #{episode_count} episodes"

episode_count.downto(1) do |i|
  
  ## Generate files (if necessary)
  episode_number = (episode_count - i + 1)
  formatted_episode_number = "%03d" % episode_number
  dir = file_path + "/" + formatted_episode_number
  movie_file_path = "#{dir}/coding-blocks-episode-#{formatted_episode_number}.mkv"
  generate_files mp3_files, images, dir, movie_file_path if !File.directory? dir
  
  # TODO: Should check youtube to make sure it's not already there'
  puts "Upload to youtube"
  title = titles[i - 1].content
  description = "Full show notes, including a ton of links, are available at http://www.codingblocks.net/episode#{episode_number}

You can subscribe to the Coding Blocks podcast on iTunes, Stitcher, Google Play, or anywhere else podcasts are found.

Follow @codingblocks on twitter for the latest programming news and jokes"
  system "node upload-to-youtube.js \"#{movie_file_path}\" \"#{title}\" \"#{description}\""
end

File.delete "./tokens.json" if File.exists? "./tokens.json"