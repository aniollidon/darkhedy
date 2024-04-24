from flask import Flask, request, jsonify, send_from_directory
from hedy_basic import execute_hedy_str, hedy_testing
import os
import json

app = Flask(__name__)


@app.route('/api/hedy', methods=['POST'])
def hedy():
    if not request.json or not 'level' in request.json or not 'code' in request.json:
        return jsonify({'error': 'Els camps level i code són obligatoris.'}), 400

    nivell = int(request.json['level'])
    codi = request.json['code']
    inputs = []

    if 'inputs' in request.json:
        inputs = request.json['inputs']

    try:
        resultat = execute_hedy_str(codi, nivell, inputs)
    except Exception as e:
        return jsonify({'Hedy Error': str(e)}), 500

    return jsonify({'resultat': resultat}), 200


@app.route('/api/hedy/testing', methods=['POST'])
def hedy_run_test():
    if not request.json or not 'code' in request.json:
        return jsonify({'error': 'Els camps code és obligatori.'}), 400

    if 'test' in request.json:
        test = request.json['test']
    elif 'test_file' in request.json:
        f = open(os.path.join("problems", request.json['test_file'] + ".json"), encoding='utf-8')
        test = json.load(f)
    else:
        return jsonify({'error': 'Has d\'especificar un test o un fitxer de test.'}), 400

    codi = request.json['code']

    try:
        tests_passed, total_tests, tests_failed = hedy_testing(codi, test)
        return jsonify({'tests_passed': tests_passed, 'total_tests': total_tests, 'tests_failed': tests_failed}), 200
    except Exception as e:
        # raise e
        return jsonify({'Hedy Error': str(e)}), 500



@app.route('/')
def serve_index():
    return send_from_directory('public', 'index.html')


@app.route('/<path:path>')
def serve_resources(path):
    return send_from_directory('public', path)


@app.route('/activity',  methods=['POST'])
def foo_activity():
    # return empty json
    return jsonify({})


@app.route('/api/problems')
def get_tests():
    files = os.listdir("problems")
    files = [f.replace(".json", "") for f in files]
    return jsonify(files)


@app.route('/api/problems/<path:path>')
def get_test(path):
    f = open(os.path.join("problems", path + ".json"), encoding='utf-8')
    prob = json.load(f)
    return jsonify(prob)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
