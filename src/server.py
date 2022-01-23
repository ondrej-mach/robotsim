#!/usr/bin/python3

from flask import Flask, request, jsonify, render_template, send_from_directory
import os

app = Flask(__name__)

class DataStore():
    data = None

@app.route('/json', methods=['POST'])
def postJSON():
    received = request.json

    if received is None:
        return 'No data'

    print(received)
    DataStore.data = received
    return 'Received'


@app.route('/json', methods=['GET'])
def getJSON():
    return jsonify(DataStore.data)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/files', methods=['GET'])
def get_files():
    path = 'fs' + request.args.get('path')
    files = []
    dirs = []
    for item in os.listdir(path):
        if os.path.isdir(os.path.join(path, item)):
            dirs.append({'name': item, 'type': 'folder'})
        else:
            files.append({'name': item, 'type': 'file'})
    print(dirs + files)

    return jsonify(dirs + files)


@app.route('/fs/<path:path>', methods=['GET'])
def send_file(path):
    return send_from_directory('fs', path)


@app.route('/fs/<path:path>', methods=['DELETE'])
def delete_file(path):
    print(path)
    os.remove('fs/' + path)
    return 'Received'


@app.route('/fs/<path:path>', methods=['POST'])
def upload_file(path):
    file = request.files['file']
    file.save('fs/' + path)
    return 'Received'


if __name__ == '__main__':
    app.run(host= '0.0.0.0', debug=True)
