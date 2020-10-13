import io
import picamera
import logging
import socketserver
from threading import Condition
from http import server
from shlex import split as shlex_split

from os import listdir, remove
from os.path import isfile, join, exists
from subprocess import CalledProcessError, check_output, STDOUT
import shutil
import _thread

mypath = "/home/pi/Desktop/output/"

PAGE="""\
<html>
<head>
<title>drone MJPEG streaming</title>
</head>
<body>
<h1>drone MJPEG Streaming</h1>
<img src="stream.mjpg" width="640" height="480" />
</body>
</html>
"""

out_file_type = "mp4"
length_of_filetype = len("."+out_file_type)

onlyfiles = sorted([int(f[:-length_of_filetype]) for f in listdir(mypath) if isfile(join(mypath, f))])
count = 0

class StreamingOutput(object):
    def __init__(self):
        self.frame = None
        self.buffer = io.BytesIO()
        self.condition = Condition()

    def write(self, buf):
        if buf.startswith(b'\xff\xd8'):
            # New frame, copy the existing buffer's content and notify all
            # clients it's available
            self.buffer.truncate()
            with self.condition:
                self.frame = self.buffer.getvalue()
                self.condition.notify_all()
            self.buffer.seek(0)
        return self.buffer.write(buf)

rec_toggle = False

def convert_to_mp4(count):
    #Conversion to usable file format
    print("{}.h264 ... Initiating conversion to mp4 ".format(str(count)))
    command = shlex_split("MP4Box -add {f_h264}.h264 {f_mp4}.mp4".format(f_h264=join(mypath,'temp_h264/'+str(count)), f_mp4=join(mypath,str(count))))
    try:
        output_subprocess = check_output(command, stderr=STDOUT)
        # print(output_subprocess)
        if(exists(join(mypath,'temp_h264/'+str(count)+'.h264'))):
            remove(join(mypath,'temp_h264/'+str(count)+'.h264'))
        print("{}.h264 ... Conversion done ".format(str(count)))
    except CalledProcessError as e:
        print('FAIL:\ncmd:{}\noutput:{}'.format(e.cmd, e.output))

class StreamingHandler(server.BaseHTTPRequestHandler):
    def do_GET(self):
        global onlyfiles, count
        if self.path == '/':
            self.send_response(301)
            self.send_header('Location', '/index.html')
            self.end_headers()
        elif self.path == '/index.html':
            content = PAGE.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', len(content))
            self.end_headers()
            self.wfile.write(content)
        elif self.path == '/stream.mjpg':
            self.send_response(200)
            self.send_header('Age', 0)
            self.send_header('Cache-Control', 'no-cache, private')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
            self.end_headers()
            try:
                while True:
                    with output.condition:
                        output.condition.wait()
                        frame = output.frame
                    self.wfile.write(b'--FRAME\r\n')
                    self.send_header('Content-Type', 'image/jpeg')
                    self.send_header('Content-Length', len(frame))
                    self.end_headers()
                    self.wfile.write(frame)
                    self.wfile.write(b'\r\n')
            except Exception as e:
                logging.warning(
                    'Removed streaming client %s: %s',
                    self.client_address, str(e))
        elif self.path == '/start_rec':
            self.send_response(204)
            self.send_header('Age', 0)
            self.send_header('Access-Control-Allow-Origin','*')
            self.send_header('Cache-Control', 'no-cache, private')
            self.send_header('Pragma', 'no-cache')
            self.end_headers()
            try:
                with output.condition:
                    output.condition.wait()
                    count = 0
                    onlyfiles = sorted([int(f[:-length_of_filetype]) for f in listdir(mypath) if isfile(join(mypath, f))])
                    for i in onlyfiles:
                        if (i==count):
                            count += 1
                        else:
                            break
                    print(join(mypath,str(count)+'.h264'))
                    camera.start_recording(join(mypath,'temp_h264/'+str(count)+'.h264'), splitter_port=2)


            except Exception as e:
                logging.warning(
                    'Removed streaming client %s: %s',
                    self.client_address, str(e))
        elif self.path == '/stop_rec':
            self.send_response(204)
            self.send_header('Age', 0)
            self.send_header('Access-Control-Allow-Origin','*')
            self.send_header('Cache-Control', 'no-cache, private')
            self.send_header('Pragma', 'no-cache')
            self.end_headers()
            try:
                with output.condition:
                    output.condition.wait()
                    camera.stop_recording(splitter_port=2)

                    try:
                        _thread.start_new_thread( convert_to_mp4, (count, ) )
                    except:
                       print("Error: unable to start thread at convert_to_mp4")
            except Exception as e:
                logging.warning(
                    'Removed streaming client %s: %s',
                    self.client_address, str(e))
        elif self.path == '/list':
            onlyfiles = sorted([int(f[:-length_of_filetype]) for f in listdir(mypath) if isfile(join(mypath, f))])
            list_vid = '<h2>The list of the downloadable mp4 of the majestic Dude!<br/></h2><ul>'
            for i in onlyfiles: list_vid += '<li>'+'<a href="/download/'+str(i)+'">drone_'+str(i)+' video</a>'+' <a href="/delete/'+str(i)+'"><button style="cursor: pointer">Delete</button></a></li><br/>'
            list_vid += '</ul>'
            content = list_vid.encode('utf-8')

            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', len(content))
            self.end_headers()
            self.wfile.write(content)
        else:
            for i in onlyfiles:
                if (self.path == join('/download',str(i))):
                    try :
                        self.send_response(200)
                        self.send_header('Access-Control-Allow-Origin','*')
                        self.send_header('Content-Type','video/'+out_file_type)
                        self.send_header('Content-Disposition', 'attachment;filename=drone_'+str(i)+'.'+out_file_type+';')
                        self.end_headers();
                        with open(mypath+str(i)+'.'+out_file_type,'rb') as f:
                            shutil.copyfileobj(f, self.wfile)
                        print('drone_'+str(i)+'.'+out_file_type+' copied')
                    except:
                        pass
                    return
                elif (self.path == join('/delete',str(i))):
                    self.send_response(302)
                    self.send_header('Age', 0)
                    self.send_header('Access-Control-Allow-Origin','*')
                    self.send_header('Cache-Control', 'no-cache, private')
                    self.send_header('Pragma', 'no-cache')
                    self.send_header('Location', '/list')
                    self.end_headers()
                    if(exists(mypath+str(i)+'.'+out_file_type)):
                        remove(mypath+str(i)+'.'+out_file_type)
                    print(mypath+str(i)+'.'+out_file_type+' deleted')
                    return

class StreamingServer(socketserver.ThreadingMixIn, server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True

with picamera.PiCamera(resolution='1280x720', framerate=40) as camera:
    output = StreamingOutput()
    camera.start_recording(output, format='mjpeg', resize=(64,36))
    try:
        address = ('', 8000)
        server = StreamingServer(address, StreamingHandler)
        server.serve_forever()
    finally:
        camera.stop_recording()
