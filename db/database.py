from tinydb import TinyDB, Query
from datetime import datetime

users = TinyDB('db/users.json')
intents = TinyDB('db/intents.json')
ranking = TinyDB('db/ranking.json')


def count_users():
    return len(users)


def add_user(user_id, nom):
    User = Query()
    if len(users.search(User.user == user_id)) == 0:
        users.insert({'user': user_id, 'nom': nom, 'puntuacio': 0, 'problems': {}})


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


def add_to_ranking(user, problem_name):
    Problem = Query()

    if problem_name not in ranking:
        ranking.insert({'problem': problem_name, 'users': []})

    users = ranking.search(Problem.problem == problem_name)[0]['users']

    if user not in users:
        ranking.update({'problem': problem_name, 'users': users + [user]})

    # return position
    return ranking.search(Problem.problem == problem_name)[0]['users'].index(user) + 1


def get_position_in_ranking(user, problem_name):
    Problem = Query()

    if problem_name not in ranking:
        return -1

    return ranking.search(Problem.problem == problem_name)[0]['users'].index(user) + 1


def get_puntuacio(user, problem):
    User = Query()
    dbusr = users.search(User.user == user)[0]
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
