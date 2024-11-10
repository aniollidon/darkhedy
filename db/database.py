from tinydb import TinyDB, Query
from datetime import datetime
import os

users = TinyDB('db/users.json')
intents = TinyDB('db/intents.json')
historic = TinyDB('db/historic.json')


def count_users():
    return len(users)


def add_user(user_id, nom, imatge, color):
    User = Query()
    if len(users.search(User.user == user_id)) == 0:
        users.insert({'user': user_id, 'nom': nom, 'imatge': imatge, 'color': color, 'puntuacio': 0, 'problems': {}})


def user_exists(user_id):
    User = Query()
    return len(users.search(User.user == user_id)) > 0


def update_puntuacio(user, problem_name, problem_status, suma_punts):
    User = Query()

    problems = users.search(User.user == user)[0]['problems']
    problems.update(
        {problem_name: {
            'problem_status': problem_status,
            'punts': suma_punts,
            'timestamp': datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
        }})

    users.update({
        'puntuacio': users.search(User.user == user)[0]['puntuacio'] + suma_punts,
        'problems': problems},
        User.user == user)


def get_intents(user, problem):
    if user is None:
        return 0

    Intent = Query()
    return len(intents.search((Intent.user == user) & (Intent.problem == problem)))


def add_intent(user, problem_name, tests_passed, total_tests, test_results, tests_failed):
    now = datetime.now()  # current date and time
    date_time = now.strftime("%m/%d/%Y, %H:%M:%S")

    intents.insert({'user': user, 'problem': problem_name, 'tests_passed': tests_passed, 'total_tests': total_tests,
                    'test_results': test_results, 'tests_failed': tests_failed, 'timestamp': date_time})


def get_last_hdtemps():
    return len(historic)


def store_success(user, problem_name, punts):
    historic.insert({'user': user,
                     'problem': problem_name,
                     'puntuacio': punts,
                     'timestamp': datetime.now().strftime("%m/%d/%Y, %H:%M:%S")})


def get_puntuacio(user, problem):
    User = Query()
    search = users.search(User.user == user)

    if len(search) == 0:
        return {"total_punts": 0, "total_users": 0,
                "problema": {'problem_status': 'unsolved', 'punts': 0, 'timestamp': '-', 'intents': 0}}

    dbusr = search[0]
    dbproblems = dbusr['problems']
    total = dbusr['puntuacio']

    # Calcula les mitjanes
    average_punts = 0
    max_punts = 0
    sum_intents = 0
    max_intents = 0
    count_u = 1
    count_u_success = 0
    for u in users.all():
        success = problem in u['problems']
        ints = 0
        if success:
            punts = u['problems'][problem]['punts']
            average_punts += punts
            count_u_success += 1
            if punts > max_punts:
                max_punts = punts
            ints = -1  # estat success (-1)

        ints += get_intents(u['user'], problem)
        sum_intents += ints
        if ints > max_intents:
            max_intents = ints
        count_u += 1
    average_punts = average_punts / count_u_success if count_u_success > 0 else 0
    average_intents = sum_intents / count_u if count_u > 0 else 0

    if problem in dbproblems:
        probs = dbproblems[problem]
        probs['intents'] = get_intents(user, problem) - 1  # estat success
    else:
        probs = {'problem_status': 'unsolved', 'punts': 0, 'timestamp': '-', 'intents': get_intents(user, problem)}

    probs['average_punts'] = average_punts
    probs['average_intents'] = average_intents
    probs['max_punts'] = max_punts
    probs['max_intents'] = max_intents
    probs['success_users'] = count_u_success

    return {"total_punts": total,
            "total_users": count_u,
            "problema": probs}


def retorna_historic_acumulat():
    # Retorna un array de diccionaris amb el següent format [{ name: 'USERNAME', data: [0,1,1,1,2,2,2,3,3,3] }, ...]
    # on cada element de data és una posició de hdtemps (històric de temps)
    # i cada element de name és el nom de l'usuari
    out = {u['user']: {"name": u['nom'], "color": u['color'], "data": [0]} for u in users.all()}

    if len(historic) == 0:
        return out

    # Crea un diccionari amb els usuaris i les seves puntuacions acumulades al temps
    for h in historic.all():
        user = h['user']
        for u in out:
            last_puntuacio = out[u]['data'][-1]
            if u == user:
                nova_puntuacio = last_puntuacio + h['puntuacio']
                out[user]['data'].append(nova_puntuacio)
            else:
                out[u]['data'].append(last_puntuacio)
    return out


def ranquing():
    # Crea un diccionari amb els usuaris i les seves puntuacions acumulades al temps

    conta_problemes = float(len(os.listdir("problems")))
    out = {u['user']: {"name": u['nom'], 'imatge': u['imatge'], "punts": 0, "temps_acumulat": 0, "assolits": 0,
                       "execucions_fallides": 0, 'percent_assolits': 0} for u in users.all()}

    if len(historic) == 0:
        return out

    temps_inicial = historic.all()[0]['timestamp']
    for h in historic.all():
        temps = (datetime.strptime(h['timestamp'], "%m/%d/%Y, %H:%M:%S")
                 - datetime.strptime(temps_inicial, "%m/%d/%Y, %H:%M:%S"))
        temps_s = temps.total_seconds()
        problem = h['problem']
        user = h['user']
        out[user]['execucions_fallides'] += get_intents(user, problem) - 1
        out[user]['punts'] += h['puntuacio']
        out[user]['temps_acumulat'] += temps_s
        out[user]['assolits'] += 1
        out[user]['percent_assolits'] = float(out[user]['assolits']) / conta_problemes * 100

    # sort by punts
    return sorted(out.values(), key=lambda x: x['punts'], reverse=True)
