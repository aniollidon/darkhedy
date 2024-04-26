import sys
import time
import json

sys.path.append('hedy/')
import hedy
from prefixes.normal import *


class Testing:
    def __init__(self):
        self.inputs = []
        self.index = 0
        self.outputs = []

    def init_input(self, inputs):
        self.inputs = inputs
        self.index = 0

    def c_input(self, question):
        self.c_print(question)

        if self.index >= len(self.inputs):
            response = "blablabla"
        else:
            response = self.inputs[self.index]
            self.index += 1

        return response

    def c_print(self, output):
        self.outputs.append(output)

    def output_string(self, separator=None):
        if separator:
            return str(separator).join(self.outputs)
        else:
            return "\n".join(self.outputs)


def execute_hedy(hedy_code, level, testing=None):
    print(hedy_code)
    try:
        hcode = hedy.transpile(hedy_code, level)
    except Exception as e:
        print("Aquest codi Hedy no funciona: Error:", e)
        raise e

    python_code = hcode.code

    if testing:
        python_code = python_code.replace("input", "testing.c_input")
        python_code = python_code.replace("print", "testing.c_print")

    exec(python_code)


def execute_hedy_str(hedy_code, level, inputs=None):
    testing = Testing()
    if inputs:
        testing.init_input(inputs)
    execute_hedy(hedy_code, level, testing)
    return testing.output_string()


def hedy_testing(hedy_code, test_object):
    level = int(test_object['level'])
    tests_passed = 0
    total_tests = 0
    tests = []
    tests_failed = []

    if 'tests' in test_object:
        total_tests += len(test_object['tests'])
        for t in test_object['tests']:
            testing = Testing()
            input_test = None
            test_description = "Execució del programa"
            tests.append({"description": test_description, "inputs": None,
                          "result": "success"})
            if 'inputs' in t:
                testing.init_input(t['inputs'])
                test_description = "Comparació amb entrada determinada"
                tests[-1]["inputs"] = t['inputs']
                tests[-1]["description"] = test_description
            try:
                execute_hedy(hedy_code, level, testing)
            except Exception as e:
                tests_failed.append({
                    "description": test_description,
                    "inputs": t['inputs'] if 'inputs' in t else None,
                    "type": "execution_error",
                    "error": "Error en l'execució de l'Hedy",
                    "details": str(e)
                })
                tests[-1]["result"] = "execution_error"
                break

            if 'output' in t:
                tests[-1]["output"] = t['output']
                if testing.output_string() == t['output']:
                    tests_passed += 1
                else:
                    tests_failed.append({
                        "description": test_description,
                        "type": "output_error",
                        "inputs": t['inputs'] if 'inputs' in t else None,
                        "error": "La sortida no és la que s'esperava",
                        "desired": t['output'],
                        "received": testing.output_string()
                    })
                    tests[-1]["result"] = "failed"

    if 'expected' in test_object:
        total_tests += len(test_object['expected'])
        for expected in test_object['expected']:
            test_description = "Cerca &quot;" + expected['word'] + "&quot;"
            tests.append({"description": test_description, "result": "success"})
            if 'count' in expected:
                if hedy_code.count(expected['word']) == expected['count']:
                    tests_passed += 1
                else:
                    tests_failed.append({
                        "description": test_description,
                        "type": "count_error",
                        "error": "S'esperava trobar &quot;" + expected['word'] + "&quot; " + str(expected['count']) +
                                 " vegades però s'ha trobat " + str(hedy_code.count(expected['word'])) + " vegades",
                        "expected": expected['count'],
                        "found": hedy_code.count(expected['word'])
                    })
                    tests[-1]["result"] = "failed"
            else:
                if hedy_code.find(expected['word']) != -1:
                    tests_passed += 1
                else:
                    tests_failed.append({
                        "description": test_description,
                        "type": "count_error",
                        "error": "S'esperava trobar &quot;" + expected['word'] + "&quot; i no s'ha trobat",
                        "expected": "*",
                        "found": "0"
                    })
                    tests[-1]["result"] = "failed"

    return tests_passed, total_tests, tests, tests_failed


if __name__ == '__main__':
    # Test 1
    f = open('problems/e2.test.json', encoding='utf-8')
    test = json.load(f)

    hedyCode = '''
animals = "gos","gat", "cavall"
a= animals at random
print a
    '''

    tests_passed, total_tests, tests_failed = hedy_testing(hedyCode, test)
    print("Tests passed:", tests_passed, "/", total_tests)
    if tests_failed:
        print("Failed tests:")
        for ft in tests_failed:
            print(ft)

    # print(execute_hedy_str(hedyCode, 12))
