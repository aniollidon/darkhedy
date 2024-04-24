function check_access(access_code){
    // todo: millorar
    return access_code === "1234";
}

let access_code = localStorage.getItem('access_code');

if(!check_access(access_code)) {
    access_code = prompt("Introdueix el teu codi d'accés", "")
}

if(check_access(access_code)){
    localStorage.setItem('access_code', access_code);
}
else {
    document.body.innerHTML = "Accés denegat, recarrega la pàgina i torna-ho a intentar.";
}

document.getElementById('htest_submit').addEventListener('click', function() {
    let code = hedyApp.getEditorContents();
    let test = document.getElementById('htest_problem').value;
    fetch('/api/hedy/testing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            test_file: test,
            code: code
        })}).then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('htest_result').innerHTML = '';

            let title = document.createElement('h3');
            title.innerHTML = 'Test Results';
            document.getElementById('htest_result').appendChild(title);
            let p = document.createElement('p');
            p.innerHTML = `Test file: ${test}`;
            document.getElementById('htest_result').appendChild(p);
            //const pre = document.createElement('pre');
            //pre.innerHTML = `Code: ${code}`;
            //document.getElementById('htest_result').appendChild(pre);
            p = document.createElement('p');
            p.innerHTML = `Tests passed: ${data.tests_passed} of ${data.total_tests}`;
            document.getElementById('htest_result').appendChild(p);
            p = document.createElement('p');
            p.innerHTML = `Test results:`;
            document.getElementById('htest_result').appendChild(p);
            let ul = document.createElement('ul');
            for (const failed_test of data.tests_failed) {
                let li = document.createElement('li');
                li.innerHTML = `<div class="test-description"> ${failed_test.description} </div>`;

                if(failed_test.inputs && failed_test.type === 'output_error'){
                    let inputs = document.createElement('div');
                    inputs.className = 'test-inputs';
                    inputs.innerHTML = `Inputs: ${failed_test.inputs}`;
                    li.appendChild(inputs);
                }

                li.innerHTML += `<div class="test-error"> Fallada: ${failed_test.error} </div>`

                if(failed_test.type === 'output_error'){
                    const compare = document.createElement('pre');
                    const diff = Diff.diffWords(failed_test.received,failed_test.desired);
                    const fragment = document.createDocumentFragment();

                    diff.forEach(function(part){
                      // green for additions, red for deletions
                      // grey for common parts
                      color = part.added ? 'red' :
                        part.removed ? 'orange' : 'green';
                      span = document.createElement('span');
                      span.style.color = color;
                      span.appendChild(document
                        .createTextNode(part.value));
                      fragment.appendChild(span);
                    });

                    compare.appendChild(fragment);
                    li.appendChild(compare);
                    ul.appendChild(li);
                }
                ul.appendChild(li);
            }
            document.getElementById('htest_result').appendChild(ul);

        });
});

function putProblem(problem){
     fetch(`/api/problems/${problem}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('statement').innerHTML = `<h3>${data.title}</h3>${data.statement}`;
        });
}
document.getElementById('htest_problem').addEventListener('change', function() {
    let problem = document.getElementById('htest_problem').value;
    putProblem(problem);
});

// INIT
fetch("/api/problems")
    .then(response => response.json())
    .then(data => {
        let select = document.getElementById('htest_problem');
        let first = true;
        for (const test of data) {
            let option = document.createElement('option');
            option.value = test;
            option.innerHTML = test;
            select.appendChild(option);

            if(first){
                putProblem(test);
                first = false;
            }
        }
    });

