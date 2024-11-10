fetch('/api/stats/ranquing').then(response => {
    return response.json();
}).then(data => {
    const tbody = document.getElementById('stats-ranking-tbody');
    tbody.innerHTML = '';
    for (const [userid, user] of Object.entries(data)){
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.className = 'py-1';
        const img = document.createElement('img');
        img.src = user['imatge'];
        img.alt = 'image';
        img.style.width = '30px';
        img.style.height = '30px';
        const span = document.createElement('span');
        span.style.marginLeft = '5px';
        span.innerHTML = user.name;
        td1.appendChild(img);
        td1.appendChild(span);
        tr.appendChild(td1);
        const td2 = document.createElement('td');
        const div = document.createElement('div');
        div.className = 'progress';
        const div2 = document.createElement('div');
        div2.className = 'progress-bar bg-success';
        div2.role = 'progressbar';
        div2.style.width = user.percent_assolits + '%';
        div2.ariaValuenow = '25';
        div2.ariaValuemin = '0';
        div2.ariaValuemax = '100';
        div.appendChild(div2);
        td2.appendChild(div);
        tr.appendChild(td2);
        const td3 = document.createElement('td');
        td3.innerHTML = user.punts + ' punts';
        tr.appendChild(td3);
        const td4 = document.createElement('td');
        td4.innerHTML = user.assolits;
        tr.appendChild(td4);
        const td5 = document.createElement('td');
        td5.innerHTML = user.execucions_fallides;
        tr.appendChild(td5);
        const td6 = document.createElement('td');
        td6.innerHTML = user.temps_acumulat + ' min';
        tr.appendChild(td6);
        tbody.appendChild(tr);
    }
});


fetch('/api/stats/acumulat').then(response => {
    return response.json();
}).then(data => {
    // dict to array, remove keys
    let data_array = [];
    let color_array = [];
    for (let key in data) {
        data_array.push(data[key]);
        color_array.push(data[key].color);
    }
    Highcharts.chart('container', {

    chart: {
        type: 'streamgraph',
        marginBottom: 30,
        zooming: {
            type: 'x'
        },
        backgroundColor: 'rgba(0,0,0,0)'
    },

    // Make sure connected countries have similar colors
    colors: color_array,

    title: {
        floating: true,
        align: 'left',
        text: 'Winter Olympic Medal Wins'
    },
    subtitle: {
        floating: true,
        align: 'left',
        y: 30,
        text: 'Source: <a href="https://www.sports-reference.com/olympics/winter/1924/">sports-reference.com</a>'
    },

    xAxis: {
        maxPadding: 0,
        type: 'category',
        crosshair: true,
        labels: {
            align: 'left',
            reserveSpace: false,
            rotation: 270
        },
        lineWidth: 0,
        margin: 20,
        tickWidth: 0
    },

    yAxis: {
        visible: false,
        startOnTick: false,
        endOnTick: false
    },

    legend: {
        enabled: false
    },

    plotOptions: {
        series: {
            label: {
                minFontSize: 5,
                maxFontSize: 15,
                style: {
                    color: 'rgba(255,255,255,0.75)'
                }
            },
            accessibility: {
                exposeAsGroupOnly: true
            }
        }
    },

    // Data parsed with olympic-medals.node.js
    series: data_array,

    exporting: {
        sourceWidth: 800,
        sourceHeight: 600
    }

});
})



