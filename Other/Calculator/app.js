const yourNameHtml = document.querySelector('#yourName');
const partnerName = document.querySelector('#partnerName');
const btnSubmit = document.querySelector('#btnSubmit');
const btnMutualLove = document.querySelector('#btnMutualLove');
const section1 = document.querySelector('#section1');
const section2 = document.querySelector('#section2');
const yourCounter = document.querySelector('#yourCounter');
const partnerCounter = document.querySelector('#partnerCounter');
const mutualCounter = document.querySelector('#mutualCounter');
const status1 = document.querySelector('#yourStatus');
const status2 = document.querySelector('#partnerStatus');
const status3 = document.querySelector('#mutualStatus');

const nameToLove = "hande"
const nameToHate = "emirhan"
const yourName = "semih"

function calculateStatus(status, value) {

    if (value < 10) {
        status.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
        status.innerHTML = `Durum: İmkansız`;
    } else if (value < 25) {
        status.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
        status.innerHTML = `Durum: Tehklikede`;
    } else if (value >= 25 && value < 40) {
        status.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark';
        status.innerHTML = `Durum: Çok zayıf`;
    } else if (value >= 40 && value < 50) {
        status.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning';
        status.innerHTML = `Durum: Zayıf`;
    } else if (value >= 50 && value < 60) {
        status.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary';
        status.innerHTML = `Durum: Normal`;
    } else if (value >= 60 && value < 80) {
        status.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info';
        status.innerHTML = `Durum: İyi`;
    } else {
        if (value > 800) {
            status.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success';
            status.innerHTML = `Durum: Sırılsıklam aşık`;
        }
        else {
            status.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success';
            status.innerHTML = `Durum: Gerçek aşk`;
        }
    }
}

function calculateResult(str1, str2) {

    str1L = str1.toLowerCase();
    str2L = str2.toLowerCase();

    console.log(str1L);
    console.log(str2L);


    if ((str1L == nameToLove) && (str2L == yourName)) {
        section1.style.display = 'block';
        yourCounter.textContent = `${800}%`;
        partnerCounter.textContent = `${999}%`;
        mutualCounter.textContent = `${900}%`;
        calculateStatus(status1, 800);
        calculateStatus(status2, 999);
        calculateStatus(status3, 900);
    }
    else if ((str2L == nameToLove) && (str1L == yourName)) {
        section1.style.display = 'block';
        yourCounter.textContent = `${999}%`;
        partnerCounter.textContent = `${800}%`;
        mutualCounter.textContent = `${900}%`;
        calculateStatus(status1, 999);
        calculateStatus(status2, 800);
        calculateStatus(status3, 900);
    }
    else if ((str1L == nameToLove) && (str2L == nameToHate)) {
        section1.style.display = 'block';
        yourCounter.textContent = `${1}%`;
        partnerCounter.textContent = `${10}%`;
        mutualCounter.textContent = `${2}%`;
        calculateStatus(status1, 2);
        calculateStatus(status2, 10);
        calculateStatus(status3, 2);
    }
    else if ((str2L == nameToLove) && (str1L == nameToHate)) {
        section1.style.display = 'block';
        yourCounter.textContent = `${10}%`;
        partnerCounter.textContent = `${1}%`;
        mutualCounter.textContent = `${2}%`;
        calculateStatus(status1, 10);
        calculateStatus(status2, 2);
        calculateStatus(status3, 2);
    }
    else {
        let randomValue1 = Math.floor(Math.random() * 79);
        let randomValue2 = Math.floor(Math.random() * 79);
        let mutualAverage = Math.ceil((randomValue1 + randomValue2) / 2);
        section1.style.display = 'block';
        yourCounter.textContent = `${randomValue1}%`;
        partnerCounter.textContent = `${randomValue2}%`;
        mutualCounter.textContent = `${mutualAverage}%`;

        calculateStatus(status1, randomValue1);
        calculateStatus(status2, randomValue2);
        calculateStatus(status3, mutualAverage);
    }

    btnMutualLove.addEventListener('click', function () {
        btnMutualLove.style.display = 'none';
        section2.style.display = 'block';
    })
}

btnSubmit.onclick = function () {
    let str1 = yourName.value;
    let str2 = partnerName.value;
    str1 = str1.toLowerCase();
    str1 = str1.split(' ').join('');
    str2 = str2.toLowerCase();
    str2 = str2.split(' ').join('');
    let temp = 0;

    for (let i = 0; i < str1.length; i++) {
        if (str1[i] >= 'a' && str1 <= 'z') {
            temp = 0;
        } else {
            temp = 1;
            break;
        }
    }

    if (temp == 0) {
        for (let i = 0; i < str2.length; i++) {
            if (str2[i] >= 'a' && str2 <= 'z') {
                temp = 0;
            } else {
                temp = 2;
                break;
            }
        }
    }
    if (yourNameHtml.value === '' || partnerName.value === '') {
        alert('Lütfen hem kendi hem partnerinin adını yaz');
        window.location.reload();
    } else if (str1.length < 3 || str2.length < 3) {
        alert('İki kısma da gerçek birer isim giriniz');
        window.location.reload();
    } else if (temp == 1) {
        alert('isim kısmına [a-z] ve [A-Z] karakterlerini kullanarak giriş yap.');
        window.location.reload();
    } else if (temp == 2) {
        alert(`isim kısmına [a-z] ve [A-Z] karakterlerini kullanarak giriş yap.`);
        window.location.reload();
    } else {
        calculateResult(str1, str2);
    }
}
