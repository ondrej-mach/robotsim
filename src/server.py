#!/usr/bin/python3

from flask import Flask, request, jsonify, render_template

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


if __name__ == '__main__':
    app.run(host= '0.0.0.0', debug=True)
