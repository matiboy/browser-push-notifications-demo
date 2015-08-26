from flask import Flask, request, render_template, send_from_directory
import os
import redis

redis_client = redis.StrictRedis()

COUNT_KEY = 'push_sent'

app = Flask(__name__, static_url_path='')

try:
    GCM_TOKEN = os.environ['GCM_TOKEN']
except KeyError:
    raise Exception('GCM_TOKEN environment variable not set')

@app.route("/")
def home():
    return render_template('home.html', count=redis_client.get(COUNT_KEY), user_agent=request.user_agent)

@app.route('/send', methods=['POST'])
def send():
    data = request.get_json()

    token = data['token']
    delay = data['sendAfter']
    text = data['text']

    return 'Ok'

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == "__main__":
    app.run(port=os.environ.get('FLASK_PORT', 8888), debug=os.environ.get('FLASK_DEBUG', False))
