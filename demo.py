from flask import Flask, request, render_template, send_from_directory, jsonify
import json
import gcm
import os
import redis
import thread
import time

redis_client = redis.StrictRedis()

COUNT_KEY = 'push_sent'

app = Flask(__name__, static_url_path='')

try:
    GCM_TOKEN = os.environ['GCM_TOKEN']
except KeyError:
    raise Exception('GCM_TOKEN environment variable not set')

def send_message(token, text, after, remove):
    time.sleep(after)
    # Save data to redis
    data = {
        'text': text,
        'remove': remove
    }
    redis_client.set(token, json.dumps(data))
    gcm_client = gcm.GCM(GCM_TOKEN)
    print gcm_client.json_request(registration_ids=[token], data={})
    redis_client.incr(COUNT_KEY)

@app.route("/")
def home():
    return render_template('home.html', count=redis_client.get(COUNT_KEY), user_agent=request.user_agent)

@app.route('/details', methods=['GET'])
def details():
    token = request.args.get('token')
    data = redis_client.get(token)
    if not data:
        data = {
            'text': 'Error: unable to find your message'
        }
    else:
        data = json.loads(data)

    return jsonify(**data)

@app.route('/send', methods=['POST'])
def send():
    data = request.get_json()

    token = data['token']
    try:
        delay = int(data['sendAfter'])
    # For once just catch anything
    except:
        delay = 0

    remove = data.get('removeAfter')
    if remove is not None:
        try:
            remove = int(remove)
        except:
            remove = None
    text = data['text']
    if not text:
        text = 'Y U NO say something'

    # Do the actual send in a separate thread
    thread.start_new_thread(send_message, (token, text, delay, remove))

    return 'Ok'

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == "__main__":
    app.run(port=os.environ.get('FLASK_PORT', 8888), debug=os.environ.get('FLASK_DEBUG', False))
