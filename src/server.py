#!/usr/bin/python3

from flask import Flask, request, jsonify, render_template
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


if __name__ == '__main__':
    app.run(host= '0.0.0.0', debug=True)
