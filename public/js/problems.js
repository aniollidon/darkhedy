let current_tab = undefined;

function check_access(access_code) {
    // todo: millorar
    return access_code && access_code.length === 4 ; //access_code === "1234";
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


function init_editor(level, code=""){
    document.getElementById('editor-area').innerHTML = `
    <div data-devmodeheight="22rem,36rem" class="flex flex-col order-1 relative"
                                 id="code_editor"
                                 style="height: 22rem">
                                <!-- The actual editor -->
                                <div id="editor"
                                     style="background: #272822; font-size:0.95em; color: white; direction: ltr;"
                                     lang="en" blurred='false'
                                     class="w-full flex-1 text-lg rounded min-h-0 overflow-hidden fixed-editor-height"></div>
                            </div>`;
    hedyApp.initialize({
        lang: "ca",
        level: level,
        keyword_language: "en",

        javascriptPageOptions: {
            "page": "code",
            "lang": "es",
            "level": level,
            "adventures": [{
                "short_name": "start",
                "name": "start",
                "text": "start",
                "save_name": "start",
                "editor_contents": code,
                "is_teacher_adventure": false,
                "is_command_adventure": false,
                "extra_stories": [],
                "id": "",
                "author": ""
            }],
            "initial_tab": "start",
            "suppress_save_and_load_for_slides": true
        },
    });

    document.getElementById('htest_tohedy').onclick = ()=> {
       let code = hedyApp.get_active_and_trimmed_code();

       // open in new tab but if tab is opened change url
        window.open('https://hedy.org/render_code/'+level+'?code=' + encodeURIComponent(code), '_blank');
    }
}

function putProblem(problem) {
    onLoading();

    document.getElementById('htest_submit').disabled = false;
    document.getElementById('htest-final-message').innerHTML = '';

    fetch(`/api/problems/${problem}`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: localStorage.getItem('access_code')
        })})
        .then(response => response.json())
        .then(data => {
            document.getElementById('statement-title').innerHTML = data.title;
            document.getElementById('statement').innerHTML = data.statement;
            document.getElementById('level-indicator').innerHTML = data.level;

            init_editor(data.level, localStorage.getItem('code_' + problem));
        }
        ).finally(() => offLoading());

    if(localStorage.getItem('results_' + problem)) {
        put_results(JSON.parse(localStorage.getItem('results_' + problem)), problem);
    }
    else {
        document.getElementById('htest_result').innerHTML = '';
        document.getElementById('test-aux-info').style.display = 'none';
    }

    if(localStorage.getItem('count_executions_' + problem)) {
        document.getElementById('stats-execs-problem').innerHTML = localStorage.getItem('count_executions_' + problem);
    }
    else {
        document.getElementById('stats-execs-problem').innerHTML = '0';
    }

    getPuntuacions(problem);
}

function putPuntuacio(puntuacio) {
    console.log(puntuacio);
    const ptotal = puntuacio['total_punts'];
    const pproblema = puntuacio['problema']['punts'];
    const pmitjana = puntuacio['problema']['average_punts'];
    const pmax = puntuacio['problema']['max_punts'];
    const exproblema = puntuacio['problema']['intents'];
    const exmitjana = puntuacio['problema']['average_intents'];
    const exmax = puntuacio['problema']['max_intents'];
    const utotal = puntuacio['total_users'];
    const usuccess = puntuacio['success_users'];
    const pdiff = parseInt(-pmax + pproblema);
    const exdiff =  parseInt(-exmax + exproblema);


    document.getElementById('stats-punt-total').innerHTML = ptotal;
    document.getElementById('stats-punt-avg').innerHTML = pmax + " punts";
    document.getElementById('stats-punt-problem').innerHTML = pproblema + " punts";
    document.getElementById('stats-punt-problem-percent').innerHTML =
        pdiff===0? "": pdiff > 0? "+" + pdiff: pdiff + " lluny";
        document.getElementById('stats-punt-problem-arrow').innerHTML //= puntuacio.max_time;
    document.getElementById('stats-execs-problem').innerHTML = exproblema;
    document.getElementById('stats-execs-problem-percent').innerHTML =
        exdiff===0? "" : exdiff > 0? "+" + exdiff +" extra": exdiff + " menys";

    if(pdiff < 0){
        document.getElementById('stats-punt-problem-percent').classList.add('text-danger');
        document.getElementById('stats-punt-problem-percent').classList.remove('text-success');
        document.getElementById('stats-punt-problem-arrow').classList.add('icon-box-danger');
        document.getElementById('stats-punt-problem-arrow').classList.remove('icon-box-success');
        const e = document.getElementById('stats-punt-problem-arrow').getElementsByClassName('icon-item')[0];
        e.classList.add('mdi-arrow-bottom-left');
        e.classList.remove('mdi-arrow-top-right');
    }
    else{
        document.getElementById('stats-punt-problem-percent').classList.remove('text-danger');
        document.getElementById('stats-punt-problem-percent').classList.add('text-success');
        document.getElementById('stats-punt-problem-arrow').classList.add('icon-box-success');
        document.getElementById('stats-punt-problem-arrow').classList.remove('icon-box-danger');
        const e = document.getElementById('stats-punt-problem-arrow').getElementsByClassName('icon-item')[0];
        e.classList.add('mdi-arrow-top-right');
        e.classList.remove('mdi-arrow-bottom-left');
    }

    if(exdiff > 0){
        document.getElementById('stats-execs-problem-percent').classList.add('text-danger');
        document.getElementById('stats-execs-problem-percent').classList.remove('text-success');
        document.getElementById('stats-execs-problem-arrow').classList.add('icon-box-danger');
        document.getElementById('stats-execs-problem-arrow').classList.remove('icon-box-success');
        const e = document.getElementById('stats-execs-problem-arrow').getElementsByClassName('icon-item')[0];
        e.classList.add('mdi-arrow-bottom-left');
        e.classList.remove('mdi-arrow-top-right');
    }
    else{
        document.getElementById('stats-execs-problem-percent').classList.remove('text-danger');
        document.getElementById('stats-execs-problem-percent').classList.add('text-success');
        document.getElementById('stats-execs-problem-arrow').classList.add('icon-box-success');
        document.getElementById('stats-execs-problem-arrow').classList.remove('icon-box-danger');
        const e = document.getElementById('stats-execs-problem-arrow').getElementsByClassName('icon-item')[0];
        e.classList.add('mdi-arrow-top-right');
        e.classList.remove('mdi-arrow-bottom-left');
    }
    document.getElementById('stats-execs-problem-arrow').innerHTML //= puntuacio.actual_time;
}

function getPuntuacions(problem) {
    ///api/users/<user>/problems/<problem>/puntuacio
    fetch("/api/users/" + localStorage.getItem('access_code') + "/problems/" + problem + "/puntuacio")
        .then(response => response.json())
        .then(data => {
            putPuntuacio(data);
        });
}

function onLoading(){
    // Agafa totes els elements amb classe loadable i afegeix la classe loading
    let elements = document.getElementsByClassName('loadable');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.add('loading');
    }
}

function offLoading(){
    // Agafa totes els elements amb classe loadable i treu la classe loading
    let elements = document.getElementsByClassName('loadable');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('loading');
    }
}
function put_results(data, test) {
    localStorage.setItem('results_' + test, JSON.stringify(data));

    // Busca errors d'execució i warnings
    let fatal = data.tests_failed.filter(test => test.type === 'execution_error');
    let warnings = data.tests_failed.filter(test => test.type === 'execution_warning');

    const out = document.getElementById('htest_result');
    const auxContainer = document.getElementById('test-aux-info');
    const aux = document.getElementById('test-aux-info-content');
    out.innerHTML = '';
    aux.innerHTML = '';
    let title = document.createElement('p');
    title.className = 'card-description';
    title.innerHTML = 'Execució ' +  data.intent +' del test <code style="background-color: #00000000 !important;">' + test + '</code>';
    document.getElementById('htest_result').appendChild(title);
    let p = document.createElement('p');

    if (fatal.length > 0) {
        let p = document.createElement('p');
        p.innerHTML = `Aquest codi conté errors d'execució.`;
        out.appendChild(p);

         // Taula de resultats
        let table = document.createElement('table');
        table.className = 'table';
        let thead = document.createElement('thead');
        let tr = document.createElement('tr');
        let th = document.createElement('th');
        th.innerHTML = 'Error';
        tr.appendChild(th);
        th = document.createElement('th');
        th.innerHTML = 'Detalls';
        tr.appendChild(th);
        thead.appendChild(tr);
        table.appendChild(thead);
        let tbody = document.createElement('tbody');
        for (const test of fatal) {
            tr = document.createElement('tr');
            let td = document.createElement('td');
            td.innerHTML = `<span class="badge badge-danger">${test.type}</span>`;
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerHTML = test.details;
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        out.appendChild(table);

        return;
    }

    p = document.createElement('p');
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
        else if(test.result === 'execution_warning')
            td.innerHTML = '<span class="badge badge-warning">Warning</span>';
        else
            td.innerHTML = '<span class="badge badge-danger">Failed</span>';
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    out.appendChild(table);

    // Warnings
    if (warnings.length > 0) {
        let p = document.createElement('p');
        p.innerHTML = `Vigila que aquest codi conté warnings d'execució. No podràs aconseguir la màxima puntuació.`;
        out.appendChild(p);
    }

    if (data.tests_failed.length === 0) {
        auxContainer.style.display = 'none';
    }
    else {
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
            if (failed_test.type === 'execution_warning')
                td.innerHTML = `<span class="badge badge-warning">${failed_test.type}</span>`;
            else
                td.innerHTML = `<span class="badge badge-danger">${failed_test.type}</span>`;

            tr.appendChild(td);
            td = document.createElement('td');
            td.innerHTML = failed_test.inputs ? failed_test.inputs : '-';
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerHTML = failed_test.received !== undefined ? '<button type="button" class="btn-link">Mostra</button>' : '-';
            tr.appendChild(td);
            td = document.createElement('td');
            td.innerHTML = failed_test.error;
            if(failed_test.details) td.innerHTML = failed_test.details;
            tr.appendChild(td);
            tbody.appendChild(tr);
        }

        table.appendChild(tbody);
        aux.appendChild(table);

    }

    // Comprova si s'ha superat el test
    if(data.tests_passed === data.total_tests){
        localStorage.setItem('status_' + test, "success");
        document.getElementById('htest_submit').disabled = true;
        document.getElementById('htest-final-message').innerHTML = 'Has superat aquest test!';
        document.getElementById('confetti').style.display = '';
        hedyApp.confetti_cannon();
        setTimeout(() => {
            document.getElementById('confetti').style.display = 'none';
        }, 2000);
        getPuntuacions(test);
    }

}

document.getElementById('htest_submit').addEventListener('click', function () {
    const code = hedyApp.get_active_and_trimmed_code();
    const full_code = hedyApp.getEditorContents();
    const test = document.getElementById('htest_problem').value;

    // Comenta el codi present a full_code però no a code
    let lines_active = code.split('\n');
    let lines_full = full_code.split('\n');
    let commented_code = '';
    for(let i = 0; i < lines_full.length; i++){
        if(lines_active[i] === lines_full[i]){
            commented_code += lines_active[i] + '\n';
        }
        else{
            commented_code += '# ' + lines_full[i] + '\n';
        }
    }
    localStorage.setItem('code_' + test, commented_code);

    fetch('/api/hedy/testing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            test_file: test,
            code: code,
            user: localStorage.getItem('access_code')
        })
    }).then(response => response.json())
        .then(data => {
            console.log(data);

            if(data.error){
                alert(data.error);
                return;
            }

            put_results(data, test)
            if(!localStorage.getItem('count_executions_' + test)){
                localStorage.setItem('count_executions_' + test, '0');
            }

            let count = parseInt(localStorage.getItem('count_executions_' + test));

            if(localStorage.getItem('status_' + test) !== "success") {
                if (data.tests_failed.length === 0) {
                    localStorage.setItem('status_' + test, "success");
                } else {
                    localStorage.setItem('status_' + test, "failed");
                    localStorage.setItem('count_executions_' + test, (count + 1).toString());
                }
            }

            document.getElementById('stats-execs-problem').innerHTML =
                localStorage.getItem('count_executions_' + test);
        });
});

document.getElementById('htest_problem').addEventListener('change', function () {
    let problem = document.getElementById('htest_problem').value;

    putProblem(problem);
});

// TODO RELOAD TABS INDICATOR

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
            if (localStorage.getItem('status_' + test) === "success") {
                 badge.className = 'test-badge badge badge-success';
                badge.innerHTML = "✓";
                a.title = "Ja l'has resolt";
            } else {
                badge.className = 'test-badge badge badge-info';
                badge.innerHTML = "4";
                a.title = "4 persones ja l'han resolt";
            }
            a.onclick = function () {
                if (current_tab === test) {
                    return;
                }

                putProblem(test);
                document.getElementById('htest_problem').value = test;

                // remove active from other tabs
                const tabs = document.getElementById('tabs-problems');
                for (const tab of tabs.children) {
                    tab.children[0].classList.remove('active');
                }
                a.classList.add('active');

                // store current tab
                current_tab = test;
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

