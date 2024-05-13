from flask import Flask, request, jsonify, send_from_directory, g
from hedy_basic import execute_hedy_str, hedy_testing
import os
import json
import build_front
import db.database as db
import sys
import jinja_partials
import datetime

""" Necessari per el funcionament de les funcions HEDY
"""

sys.path.append('hedy/')
from website.flask_helpers import render_template, proper_tojson, JinjaCompatibleJsonProvider
from website import querylog
from flask_babel import Babel

app = Flask(__name__)
app.url_map.strict_slashes = False  # Ignore trailing slashes in URLs
app.json = JinjaCompatibleJsonProvider(app)


def get_locale():
    return 'ca'


#app.config['SEND_FILE_MAX_AGE_DEFAULT'] = datetime.timedelta(minutes=5)

babel = Babel(app, locale_selector=get_locale)
jinja_partials.register_extensions(app)
app.template_filter('tojson')(proper_tojson)


@app.before_request
def before_request_begin_logging():
    """ Necessari per el funcionament de les funcions HEDY
    """
    path = (str(request.path) + '?' + request.query_string.decode('utf-8')
            ) if request.query_string else str(request.path)
    querylog.begin_global_log_record(
        path=path,
        method=request.method,
        remote_ip=request.headers.get('X-Forwarded-For', request.remote_addr),
        user_agent=request.headers.get('User-Agent'))


# ####################################################################################

db.add_user('1234', 'Aniol')
db.add_user('0000', 'Aniol2')


def calcular_punts(temps, execucions=0, warning=False):
    activitats = float(len(os.listdir("problems")))  # categories?
    jugadors = float(db.count_users())
    punitaria = 1000.
    tmax = activitats * jugadors
    emax = jugadors * punitaria / (activitats * (jugadors - 1)) - 1

    if execucions > 0:  # Penalització per execucions
        temps = temps + execucions

    if warning:  # Penalització per warnings
        temps = temps + 5

    temps = float(min(temps, tmax))

    return int(punitaria + emax * (1. - temps / tmax))


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
        return jsonify({'error': str(e)}), 500

    return jsonify({'resultat': resultat}), 200


@app.route('/api/hedy/testing', methods=['POST'])
def hedy_run_test():
    if not request.json or not 'code' in request.json or not 'user' in request.json:
        return jsonify({'error': 'Els camps code és obligatori.'}), 400

    problem_name = None
    intent = 0

    if 'test' in request.json:
        problem = request.json['test']

    elif 'test_file' in request.json:
        f = open(os.path.join("problems", request.json['test_file'] + ".json"), encoding='utf-8')
        problem = json.load(f)
        problem_name = request.json['test_file']
    else:
        return jsonify({'error': 'Has d\'especificar un test o un fitxer de test.'}), 400

    codi = request.json['code']
    user = request.json['user']

    print(codi, problem, user)

    try:
        tests_passed, total_tests, test_results, tests_failed = hedy_testing(codi, problem)
        if problem_name:
            db.add_intent(user, problem_name, tests_passed, total_tests, test_results, tests_failed)
            intent = db.get_intents(user, problem_name)

            if tests_passed == total_tests:
                position = db.add_to_ranking(user, problem_name)

                # busca warnings
                warning = len([t for t in test_results if t['result'] == 'execution_warning']) > 0
                puntuacio = calcular_punts(position, intent - 1, warning)
                print('Puntuació:', puntuacio)
                db.update_puntuacio(user, problem_name, 'passed', puntuacio)

        return jsonify({'tests_passed': tests_passed, 'total_tests': total_tests,
                        'tests': test_results, 'tests_failed': tests_failed, 'intent': intent}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/')
def serve_index():
    return build_front.base(build_front.problems_test())


@app.route('/<path:path>')
def serve_resources(path):
    return send_from_directory('public', path)


@app.route('/activity', methods=['POST'])
def foo_activity():
    # return empty json
    return jsonify({})


@app.route('/api/problems')
def get_tests():
    files = os.listdir("problems")
    files = [f.replace(".json", "") for f in files]
    return jsonify(files)


@app.route('/api/problems/<path:path>', methods=['POST'])
def get_test(path):
    user = request.json['user'] if 'user' in request.json else None

    f = open(os.path.join("problems", path + ".json"), encoding='utf-8')
    prob = json.load(f)

    prob["intents"] = db.get_intents(user, path)

    return jsonify(prob)


@app.route('/api/puntuacions')
def get_puntuacions():
    return jsonify(db.get_puntuacions())


@app.route('/api/users/<user>/problems/<problem>/puntuacio')
def get_puntuacio(user, problem):
    return jsonify(db.get_puntuacio(user, problem))


if __name__ == '__main__':
    app.run(debug=True, port=5000)
