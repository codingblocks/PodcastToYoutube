require 'rubygems'
require 'nokogiri'
require 'open-uri'

file_path = File.expand_path "./files"
if !File.directory?(file_path)
  puts "Creating #{file_path}"
  Dir.mkdir file_path
end

doc = Nokogiri::XML(open("http://feeds.podtrac.com/c8yBGHRafqhz"))
mp3_files = doc.xpath("//enclosure")
images = doc.xpath("//item/description")
episode_count = mp3_files.length

if images.length != episode_count
  throw "Found #{episode_count} mp3 files, but #{images.length} images...not sure what to do"
end

puts "Found #{episode_count} episodes"

episode_count.downto(1) do |i|
  mp3_url = mp3_files[i - 1]["url"]
  mp3_file_name = mp3_url.match(/[^\/]*\.mp3$/)
  image_url = images[i - 1].to_s.match(/([^\"]*\.\w+)/).to_s
  image_file_name = image_url.match(/[^\/]*\.\w+$/)

  episode_number = "%03d" % (episode_count - i + 1)
  dir = file_path + "/" + episode_number
  if File.directory?(dir)
    puts "Skipping episode #{i}"
    next
  else
    Dir.mkdir dir
  end
  
  puts image_url

  system "curl -L #{mp3_url} --output #{dir}/#{mp3_file_name}"
  system "curl -L #{image_url} --output #{dir}/#{image_file_name} -A \"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36\""
  system "ffmpeg -loop 1 -r 2 -i #{dir}/#{image_file_name} -i #{dir}/#{mp3_file_name} -vf \"scale=320:trunc(ow/a/2)*2\" -c:v libx264 -preset slow -tune stillimage -crf 18 -c:a copy -shortest -pix_fmt yuv420p -threads 0 #{dir}/coding-blocks-episode-#{episode_number}.mkv"
  
  ## ffmpg
  puts "Finished with #{dir}"
  
  ## upload to youtube
end