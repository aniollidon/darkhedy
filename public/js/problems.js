function check_access(access_code) {
    // todo: millorar
    return access_code === "1234";
}

let access_code = localStorage.getItem('access_code');

if (!check_access(access_code)) {
    access_code = prompt("Introdueix el teu codi d'accés", "")
}

if (check_access(access_code)) {
    localStorage.setItem('access_code', access_code);
} else {
    document.body.innerHTML = "Accés denegat, recarrega la pàgina i torna-ho a intentar.";
}

document.getElementById('htest_submit').addEventListener('click', function () {
    const code = hedyApp.getEditorContents();
    const test = document.getElementById('htest_problem').value;
    const out = document.getElementById('htest_result');
    const auxContainer = document.getElementById('test-aux-info');
    const aux = document.getElementById('test-aux-info-content');
    fetch('/api/hedy/testing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            test_file: test,
            code: code
        })
    }).then(response => response.json())
        .then(data => {
            console.log(data);
            out.innerHTML = '';
            aux.innerHTML = '';
            let title = document.createElement('p');
            title.className = 'card-description';
            title.innerHTML = 'Resultats del test <code style="background-color: #00000000 !important;">' + test + '</code>';
            document.getElementById('htest_result').appendChild(title);
            let p = document.createElement('p');
            p.innerHTML = `Tests aprovats: ${data.tests_passed} de ${data.total_tests}`;
            document.getElementById('htest_result').appendChild(p);
            // Taula de resultats
            let table = document.createElement('table');
            table.className = 'table';
            let thead = document.createElement('thead');
            let tr = document.createElement('tr');
            let th = document.createElement('th');
            th.innerHTML = 'Test';
            tr.appendChild(th);
            th = document.createElement('th');
            th.innerHTML = 'Resultat';
            tr.appendChild(th);
            thead.appendChild(tr);
            table.appendChild(thead);
            let tbody = document.createElement('tbody');
            for (const test of data.tests) {
                tr = document.createElement('tr');
                let td = document.createElement('td');
                td.innerHTML = test.description;
                tr.appendChild(td);
                td = document.createElement('td');
                if (test.result === 'success')
                    td.innerHTML = '<span class="badge badge-success">Success</span>';
                else
                    td.innerHTML = '<span class="badge badge-danger">Failed</span>';
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            out.appendChild(table);

            if (data.tests_failed.length === 0) {
                auxContainer.style.display = 'none';
            } else {
                auxContainer.style.display = '';

                const table = document.createElement('table');
                table.className = 'table';
                const thead = document.createElement('thead');
                const tr = document.createElement('tr');
                let th = document.createElement('th');
                th.innerHTML = 'Tests';
                tr.appendChild(th);
                th = document.createElement('th');
                th.innerHTML = 'Error';
                tr.appendChild(th);
                th = document.createElement('th');
                th.innerHTML = 'Entrada (ask)';
                tr.appendChild(th);
                th = document.createElement('th');
                th.innerHTML = 'Sortida';
                tr.appendChild(th);
                th = document.createElement('th');
                th.innerHTML = 'Detalls';
                tr.appendChild(th);
                thead.appendChild(tr);
                table.appendChild(thead);

                const tbody = document.createElement('tbody');
                for (const failed_test of data.tests_failed) {
                    const tr = document.createElement('tr');
                    let td = document.createElement('td');
                    td.innerHTML = failed_test.description;
                    tr.appendChild(td);
                    td = document.createElement('td');
                    if(failed_test.type === 'execution_error')
                        td.innerHTML = `<span class="badge badge-danger">${failed_test.type}</span>`;
                    else
                        td.innerHTML = `<span class="badge badge-warning">${failed_test.type}</span>`;
                    tr.appendChild(td);
                    td = document.createElement('td');
                    td.innerHTML = failed_test.inputs? failed_test.inputs : '-';
                    tr.appendChild(td);
                    td = document.createElement('td');
                    td.innerHTML = failed_test.received !== undefined ? '<button type="button" class="btn-link">Mostra</button>' : '-';
                    tr.appendChild(td);
                    td = document.createElement('td');
                    td.innerHTML = failed_test.error;
                    tr.appendChild(td);
                    tbody.appendChild(tr);
                }

                table.appendChild(tbody);
                aux.appendChild(table);




                /*
                let ul = document.createElement('ul');
                for (const failed_test of data.tests_failed) {

                    let li = document.createElement('li');
                    li.innerHTML = `<div class="test-description"> ${failed_test.description} </div>`;

                    if (failed_test.inputs && failed_test.type === 'output_error') {
                        let inputs = document.createElement('div');
                        inputs.className = 'test-inputs';
                        inputs.innerHTML = `Inputs: ${failed_test.inputs}`;
                        li.appendChild(inputs);
                    }

                    li.innerHTML += `<div class="test-error"> Fallada: ${failed_test.error} </div>`

                    if (failed_test.type === 'output_error') {
                        const compare = document.createElement('pre');
                        const diff = Diff.diffWords(failed_test.received, failed_test.desired);
                        const fragment = document.createDocumentFragment();

                        diff.forEach(function (part) {
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
                aux.appendChild(ul);
                */

            }

        });
});

function putProblem(problem) {
    fetch(`/api/problems/${problem}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('statement-title').innerHTML = data.title;
            document.getElementById('statement').innerHTML = data.statement;
        });
}

document.getElementById('htest_problem').addEventListener('change', function () {
    let problem = document.getElementById('htest_problem').value;
    putProblem(problem);
});

// INIT
fetch("/api/problems")
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('htest_problem');
        const tabs = document.getElementById('tabs-problems');
        let first = true;
        for (const test of data) {
            let option = document.createElement('option');
            option.value = test;
            option.innerHTML = test;
            select.appendChild(option);

            let tab = document.createElement('li');
            tab.className = 'nav-item';
            tab.role = 'presentation';
            let a = document.createElement('a');
            a.className = 'nav-link';
            a.id = `tab-${test}`;
            a.role = 'tab';
            a.href = `#${test}`;
            let badge = document.createElement('span');
            if(true){
                badge.className = 'test-badge badge badge-danger';
                badge.innerHTML = "4";
            }else{
                badge.className = 'test-badge badge badge-success';
                badge.innerHTML = "✓";
            }
            a.onclick = function () {
                putProblem(test);
                 document.getElementById('htest_problem').value = test;

                 // remove active from other tabs
                    const tabs = document.getElementById('tabs-problems');
                    for (const tab of tabs.children) {
                        tab.children[0].classList.remove('active');
                    }
                    a.classList.add('active');
            }

            a.appendChild(new Text(test + " "));
            a.appendChild(badge);
            tab.appendChild(a);
            tabs.appendChild(tab);

            if (first) {
                putProblem(test);
                a.classList.add('active');
                first = false;
            }
        }
    });

